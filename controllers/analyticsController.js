const Log = require('../models/Log');
const Alerte = require('../models/Alerte');

// Fonction pour extraire le stage le plus profond
function extractStage(stage) {
  if (stage.inputStage) return extractStage(stage.inputStage);
  return stage.stage;
}

// GET /api/analytics/performance — Stats explain()
exports.getPerformance = async (req, res) => {
  try {
    const statsLevel = await Log.find({ level: 'ERROR' })
      .explain('executionStats');

    const statsTimestamp = await Log.find({
      timestamp: { $gte: new Date(Date.now() - 86400000) }
    }).explain('executionStats');

    const stageLevel = statsLevel.executionStats.executionStages;
    const stageTimestamp = statsTimestamp.executionStats.executionStages;

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

// GET /api/analytics/error-rate — Pipeline 1 : Taux d'erreur par application
exports.getErrorRate = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$app_id',
          total: { $sum: 1 },
          erreurs: {
            $sum: {
              $cond: [{ $in: ['$level', ['ERROR', 'CRITICAL']] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          app_id: '$_id',
          total: 1,
          erreurs: 1,
          taux_erreur_pct: {
            $round: [
              { $multiply: [{ $divide: ['$erreurs', '$total'] }, 100] },
              2
            ]
          }
        }
      },
      { $sort: { taux_erreur_pct: -1 } }
    ];

    const resultats = await Log.aggregate(pipeline);
    res.json({ total_apps: resultats.length, resultats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics/top-errors — Pipeline 2 : Top 10 erreurs fréquentes
exports.getTopErrors = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: { level: { $in: ['ERROR', 'CRITICAL'] } }
      },
      {
        $group: {
          _id: '$message',
          nb_occurrences: { $sum: 1 },
          level: { $first: '$level' },
          app_id: { $first: '$app_id' },
          derniere_occurrence: { $max: '$timestamp' }
        }
      },
      { $sort: { nb_occurrences: -1 } },
      { $limit: 10 }
    ];

    const resultats = await Log.aggregate(pipeline);
    res.json({ total: resultats.length, resultats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

};

// GET /api/analytics/temporal — Pipeline 3 : Distribution temporelle
exports.getTemporal = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%dT%H', date: '$timestamp' } },
          total: { $sum: 1 },
          erreurs: {
            $sum: {
              $cond: [{ $in: ['$level', ['ERROR', 'CRITICAL']] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          heure: '$_id',
          total: 1,
          erreurs: 1,
          _id: 0
        }
      }
    ];

    const resultats = await Log.aggregate(pipeline);
    res.json({ total_tranches: resultats.length, resultats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics/anomalies — Pipeline 4 : Détection d'anomalies (HAVING)
exports.getAnomalies = async (req, res) => {
  try {
    const SEUIL = 50;
    const { app_id } = req.query;

    // Filtre de base — 30 derniers jours
    const matchBase = {
      timestamp: { $gte: new Date(Date.now() - 3600000 * 24 * 30) }
    };

    // Filtre optionnel par application
    if (app_id) matchBase.app_id = app_id;

    const pipeline = [
      { $match: matchBase },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%dT%H', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: SEUIL } }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          heure: '$_id',
          count: 1,
          _id: 0
        }
      }
    ];

    const resultats = await Log.aggregate(pipeline);

    // Créer une alerte automatique si anomalie détectée (sans doublon)
    if (resultats.length > 0) {
      const pic = resultats[0];
      const dejaExiste = await Alerte.findOne({
        type_alerte: 'VOLUME_ANOMALIE',
        description: `Pic détecté : ${pic.count} logs à ${pic.heure}`
      });

      if (!dejaExiste) {
        await Alerte.create({
          alerte_id: `alerte_auto_${Date.now()}`,
          app_id: app_id || 'system',
          timestamp: new Date(),
          type_alerte: 'VOLUME_ANOMALIE',
          description: `Pic détecté : ${pic.count} logs à ${pic.heure}`,
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

// GET /api/audit/top-ips — IPs suspectes
exports.getTopIps = async (req, res) => {
  try {
    const pipeline = [
      { $match: { user: { $exists: true }, succes: false } },
      { $group: { _id: '$ip_source', tentatives: { $sum: 1 } } },
      { $sort: { tentatives: -1 } },
      { $limit: 10 },
      { $project: { ip: '$_id', tentatives: 1, _id: 0 } }
    ];

    const resultats = await Log.aggregate(pipeline);
    res.json({ total: resultats.length, resultats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/audit/users — Utilisateurs suspects (tentatives > 5)
exports.getUsersSuspects = async (req, res) => {
  try {
    const pipeline = [
      { $match: { user: { $exists: true }, tentatives: { $gt: 5 } } },
      {
        $group: {
          _id: '$user',
          total_tentatives: { $sum: '$tentatives' },
          nb_echecs: { $sum: { $cond: ['$succes', 0, 1] } },
          derniere_tentative: { $max: '$timestamp' }
        }
      },
      { $sort: { total_tentatives: -1 } },
      { $project: { user: '$_id', total_tentatives: 1, nb_echecs: 1, derniere_tentative: 1, _id: 0 } }
    ];

    const resultats = await Log.aggregate(pipeline);
    res.json({ total: resultats.length, resultats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};