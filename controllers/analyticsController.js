// =============================================================================
// controllers/analyticsController.js — LE FICHIER CLE DU PROJET
// -----------------------------------------------------------------------------
// Contient les 4 pipelines d'agregation MongoDB exiges par le cahier des
// charges + la mesure de performance via explain() + les 2 routes d'audit
// securite.
//
// Concept central : un "pipeline" est une SUITE D'ETAPES qui transforment
// progressivement les documents :
//   $match   = filtrer (equivalent SQL WHERE)
//   $group   = regrouper (equivalent SQL GROUP BY)
//   $project = selectionner / calculer des champs (equivalent SQL SELECT)
//   $sort    = trier (equivalent SQL ORDER BY)
//   $limit   = limiter (equivalent SQL LIMIT)
//   $match apres $group = equivalent SQL HAVING
// =============================================================================

const Log = require('../models/Log');
const Alerte = require('../models/Alerte');

// -----------------------------------------------------------------------------
// HELPER — Extrait le stage d'execution le plus profond du resultat explain()
// MongoDB renvoie un arbre imbrique : { stage: 'FETCH', inputStage: { stage: 'IXSCAN', ... } }
// On descend recursivement jusqu'au stage racine (IXSCAN ou COLLSCAN).
// -----------------------------------------------------------------------------
function extractStage(stage) {
  if (stage.inputStage) return extractStage(stage.inputStage);
  return stage.stage;
}

// -----------------------------------------------------------------------------
// GET /api/analytics/performance
// PROUVE que nos index sont bien utilises par MongoDB.
// explain('executionStats') renvoie les stats reelles d'execution d'une requete.
// On cherche "IXSCAN" (Index Scan = bon) plutot que "COLLSCAN" (Collection
// Scan = on lit tout, mauvais).
// -----------------------------------------------------------------------------
exports.getPerformance = async (req, res) => {
  try {
    // Test 1 : filtrage par level (utilise index { level: 1 })
    const statsLevel = await Log.find({ level: 'ERROR' })
      .explain('executionStats');

    // Test 2 : filtrage par timestamp (utilise index { timestamp: -1 })
    // Date.now() - 86400000 = il y a 24h (86400000 ms = 24 * 60 * 60 * 1000)
    const statsTimestamp = await Log.find({
      timestamp: { $gte: new Date(Date.now() - 86400000) }
    }).explain('executionStats');

    const stageLevel = statsLevel.executionStats.executionStages;
    const stageTimestamp = statsTimestamp.executionStats.executionStages;

    // On renvoie un resume lisible :
    //   - stage_parent  : etape racine (FETCH le plus souvent)
    //   - stage_index   : type de scan (IXSCAN si index utilise)
    //   - docsExamines  : nombre de docs lus (doit etre proche de docsRetournes)
    //   - docsRetournes : nombre de docs renvoyes
    //   - tempsMs       : duree d'execution en millisecondes
    res.json({
      filtre_level: {
        stage_parent: stageLevel.stage,
        stage_index: extractStage(stageLevel),
        docsExamines: statsLevel.executionStats.totalDocsExamined,
        docsRetournes: statsLevel.executionStats.totalDocsReturned,
        tempsMs: statsLevel.executionStats.executionTimeMillis
      },
      filtre_timestamp: {
        stage_parent: stageTimestamp.stage,
        stage_index: extractStage(stageTimestamp),
        docsExamines: statsTimestamp.executionStats.totalDocsExamined,
        docsRetournes: statsTimestamp.executionStats.totalDocsReturned,
        tempsMs: statsTimestamp.executionStats.executionTimeMillis
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// PIPELINE 1 — Taux d'erreur par application
// Question metier : "Quelle application est la plus instable ?"
// Logique : pour chaque app, compter le total et les erreurs, calculer le %.
// -----------------------------------------------------------------------------
exports.getErrorRate = async (req, res) => {
  try {
    const pipeline = [

      // Etape 1 : grouper par app_id
      {
        $group: {
          _id: '$app_id',                  // cle de groupement
          total: { $sum: 1 },              // total de logs (1 par doc)
          erreurs: {
            // $cond [condition, valeur_si_vrai, valeur_si_faux]
            // Compte 1 si level est ERROR ou CRITICAL, 0 sinon
            $sum: {
              $cond: [{ $in: ['$level', ['ERROR', 'CRITICAL']] }, 1, 0]
            }
          }
        }
      },

      // Etape 2 : reformatter et calculer le pourcentage
      {
        $project: {
          app_id: '$_id',                  // renommer _id -> app_id
          total: 1,                        // garder le champ total
          erreurs: 1,                      // garder le champ erreurs
          // (erreurs / total) * 100, arrondi a 2 decimales
          taux_erreur_pct: {
            $round: [
              { $multiply: [{ $divide: ['$erreurs', '$total'] }, 100] },
              2
            ]
          }
        }
      },

      // Etape 3 : tri du plus eleve au plus bas (les pires applis en haut)
      { $sort: { taux_erreur_pct: -1 } }
    ];

    const resultats = await Log.aggregate(pipeline);
    res.json({ total_apps: resultats.length, resultats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// PIPELINE 2 — Top 10 des erreurs les plus frequentes
// Question metier : "Quels sont les bugs qui reviennent le plus ?"
// -----------------------------------------------------------------------------
exports.getTopErrors = async (req, res) => {
  try {
    const pipeline = [

      // Etape 1 : ne garder QUE les logs en erreur (filtrage prealable)
      {
        $match: { level: { $in: ['ERROR', 'CRITICAL'] } }
      },

      // Etape 2 : grouper par message d'erreur
      {
        $group: {
          _id: '$message',                                 // cle = le message exact
          nb_occurrences: { $sum: 1 },                     // compteur
          level: { $first: '$level' },                     // premier level rencontre
          app_id: { $first: '$app_id' },                   // premiere appli concernee
          derniere_occurrence: { $max: '$timestamp' }      // date la plus recente
        }
      },

      // Etape 3 : trier par nombre d'occurrences decroissant
      { $sort: { nb_occurrences: -1 } },

      // Etape 4 : ne garder que les 10 premieres
      { $limit: 10 }
    ];

    const resultats = await Log.aggregate(pipeline);
    res.json({ total: resultats.length, resultats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// PIPELINE 3 — Distribution temporelle (par heure)
// Question metier : "A quelles heures de la journee ca plante le plus ?"
// -----------------------------------------------------------------------------
exports.getTemporal = async (req, res) => {
  try {
    const pipeline = [

      // Etape 1 : grouper par heure (format "2026-05-31T14")
      {
        $group: {
          _id: {
            // $dateToString convertit une Date en String selon un format.
            // %Y = annee, %m = mois, %d = jour, %H = heure
            $dateToString: { format: '%Y-%m-%dT%H', date: '$timestamp' }
          },
          total: { $sum: 1 },
          erreurs: {
            $sum: {
              $cond: [{ $in: ['$level', ['ERROR', 'CRITICAL']] }, 1, 0]
            }
          }
        }
      },

      // Etape 2 : trier par ordre chronologique
      { $sort: { _id: 1 } },

      // Etape 3 : renommer _id -> heure pour clarte
      {
        $project: {
          heure: '$_id',
          total: 1,
          erreurs: 1,
          _id: 0          // _id: 0 = ne pas renvoyer le champ _id
        }
      }
    ];

    const resultats = await Log.aggregate(pipeline);
    res.json({ total_tranches: resultats.length, resultats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// PIPELINE 4 — Detection d'anomalies (equivalent HAVING en SQL)
// Question metier : "Y a-t-il des pics anormaux d'activite ?"
// CLE : on fait un $match APRES le $group -> c'est exactement HAVING en SQL.
// En SQL : SELECT heure, COUNT(*) FROM logs GROUP BY heure HAVING COUNT(*) > 50
// -----------------------------------------------------------------------------
exports.getAnomalies = async (req, res) => {
  try {
    const SEUIL = 50;  // une heure avec > 50 logs est consideree anormale

    // Filtre optionnel par application via query string ?app_id=WEB
    const { app_id } = req.query;

    // --- Construction du filtre de base ---
    // On filtre les 30 derniers jours (3600000 ms * 24 * 30 = 30 jours)
    const matchBase = {
      timestamp: { $gte: new Date(Date.now() - 3600000 * 24 * 30) }
    };
    // Si l'utilisateur demande une appli precise, on ajoute la condition
    if (app_id) matchBase.app_id = app_id;

    const pipeline = [

      // Etape 1 : pre-filtre WHERE (30 derniers jours, eventuellement par app)
      { $match: matchBase },

      // Etape 2 : grouper par heure (comme pipeline 3)
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%dT%H', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },

      // Etape 3 : LE HAVING ! On filtre APRES le group sur le compteur calcule.
      // Impossible en simple WHERE car count n'existe pas avant le group.
      {
        $match: { count: { $gt: SEUIL } }
      },

      // Etape 4 : trier les pics les plus eleves en premier
      { $sort: { count: -1 } },

      // Etape 5 : renommer pour clarte
      {
        $project: {
          heure: '$_id',
          count: 1,
          _id: 0
        }
      }
    ];

    const resultats = await Log.aggregate(pipeline);

    // BONUS : si une anomalie est detectee, on cree automatiquement une alerte.
    // On verifie d'abord qu'elle n'existe pas deja pour eviter les doublons.
    if (resultats.length > 0) {
      const pic = resultats[0];
      const dejaExiste = await Alerte.findOne({
        type_alerte: 'VOLUME_ANOMALIE',
        description: `Pic detecte : ${pic.count} logs a ${pic.heure}`
      });

      if (!dejaExiste) {
        await Alerte.create({
          alerte_id: `alerte_auto_${Date.now()}`,   // Date.now() garantit l'unicite
          app_id: app_id || 'system',                // si app filtree, on l'utilise, sinon "system"
          timestamp: new Date(),
          type_alerte: 'VOLUME_ANOMALIE',
          description: `Pic detecte : ${pic.count} logs a ${pic.heure}`,
          seuil_declenche: SEUIL,
          valeur_observee: pic.count,
          resolue: false,
          assignee_uid: null
        });
      }
    }

    res.json({
      seuil: SEUIL,
      app_id: app_id || 'toutes',
      anomalies_detectees: resultats.length,
      resultats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/audit/top-ips — Top 10 IPs avec le plus d'echecs de connexion
// Pipeline d'audit securite.
// -----------------------------------------------------------------------------
exports.getTopIps = async (req, res) => {
  try {
    const pipeline = [
      // 1. Garder uniquement les logs securite ($exists: user) avec un echec
      { $match: { user: { $exists: true }, succes: false } },

      // 2. Grouper par IP, compter les tentatives
      { $group: { _id: '$ip_source', tentatives: { $sum: 1 } } },

      // 3. Trier (plus de tentatives = plus suspect)
      { $sort: { tentatives: -1 } },

      // 4. Top 10
      { $limit: 10 },

      // 5. Reformatter
      { $project: { ip: '$_id', tentatives: 1, _id: 0 } }
    ];

    const resultats = await Log.aggregate(pipeline);
    res.json({ total: resultats.length, resultats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/audit/users — Utilisateurs avec > 5 tentatives (potentielles cibles)
// -----------------------------------------------------------------------------
exports.getUsersSuspects = async (req, res) => {
  try {
    const pipeline = [

      // 1. Logs securite avec plus de 5 tentatives
      { $match: { user: { $exists: true }, tentatives: { $gt: 5 } } },

      // 2. Grouper par utilisateur
      {
        $group: {
          _id: '$user',
          total_tentatives: { $sum: '$tentatives' },              // somme cumulee
          // $cond : si succes=true compte 0, sinon compte 1 (echec)
          nb_echecs: { $sum: { $cond: ['$succes', 0, 1] } },
          derniere_tentative: { $max: '$timestamp' }
        }
      },

      // 3. Trier (le plus de tentatives en premier)
      { $sort: { total_tentatives: -1 } },

      // 4. Reformatter
      { $project: { user: '$_id', total_tentatives: 1, nb_echecs: 1, derniere_tentative: 1, _id: 0 } }
    ];

    const resultats = await Log.aggregate(pipeline);
    res.json({ total: resultats.length, resultats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
