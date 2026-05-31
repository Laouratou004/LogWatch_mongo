// =============================================================================
// controllers/logsController.js — Logique metier des routes /api/logs
// -----------------------------------------------------------------------------
// Chaque fonction "exports.xxx" correspond a une route definie dans routes/logs.js
// Toutes utilisent le pattern :
//   1. try   -> executer la requete Mongo
//   2. catch -> renvoyer une erreur 500 propre avec le message
// =============================================================================

const Log = require('../models/Log');
const mongoose = require('mongoose');
const Alerte = require('../models/Alerte');


// -----------------------------------------------------------------------------
// GET /api/logs — Liste paginee
// Query : ?page=1&limit=10
// -----------------------------------------------------------------------------
exports.getLogs = async (req, res) => {
  try {
    // Recupere les parametres ?page=X&limit=Y dans l'URL.
    // parseInt(...) || 1 = si pas fourni ou invalide, valeur par defaut.
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;  // Nombre de docs a sauter (page 3 avec limit 10 -> skip 20)

    // .find()    : selectionne tous les documents
    // .sort()    : du plus recent au plus ancien (utilise l'index timestamp:-1)
    // .skip()    : saute les pages precedentes
    // .limit()   : ne renvoie que N docs
    const logs = await Log.find().sort({ timestamp: -1 }).skip(skip).limit(limit);

    // Compte le total (pour calculer le nombre de pages cote frontend)
    const total = await Log.countDocuments();

    res.json({ total, page, limit, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/logs/:id — Detail d'un log par son ObjectId
// -----------------------------------------------------------------------------
exports.getLogById = async (req, res) => {
  try {
    const { id } = req.params;

    // Securite : on verifie que l'id ressemble bien a un ObjectId Mongo
    // (24 caracteres hexadecimaux). Sinon on rejette tout de suite.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    // On utilise la collection brute (pas le modele Mongoose) car notre
    // _id est de type String, pas ObjectId. On force la conversion ici.
    const log = await mongoose.connection.db
      .collection('logs')
      .findOne({ _id: new mongoose.Types.ObjectId(id) });

    if (!log) return res.status(404).json({ error: 'Log introuvable' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// POST /api/logs — Insertion temps reel (depuis le formulaire frontend)
// -----------------------------------------------------------------------------
exports.createLog = async (req, res) => {
  try {
    // req.body contient l'objet JSON envoye par le client.
    // Grace a strict: false dans le schema, tous les champs personnalises
    // (stack_trace, methode_http, user...) sont acceptes.
    const log = await Log.create(req.body);

    // --- Alerte automatique si log CRITICAL ---
    // Quand un log de gravite CRITICAL est cree, on declenche une alerte
    // automatique pour notifier l'equipe (sauf si une alerte non resolue existe deja).
    if (log.level === 'CRITICAL') {
      const dejaExiste = await Alerte.findOne({
        type_alerte: 'ERREUR_CRITIQUE',
        app_id: log.app_id,
        resolue: false
      });

      if (!dejaExiste) {
        await Alerte.create({
          alerte_id: `alerte_auto_${Date.now()}`,
          app_id: log.app_id,
          timestamp: new Date(),
          type_alerte: 'ERREUR_CRITIQUE',
          description: `Log CRITICAL détecté : ${log.message}`,
          seuil_declenche: 1,
          valeur_observee: 1,
          resolue: false,
          assignee_uid: null
        });
        console.log(`🚨 Alerte CRITICAL créée pour ${log.app_id}`);
      }
    }

    // 201 Created = standard REST pour une creation reussie
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// DELETE /api/logs/:id — Suppression d'un log
// -----------------------------------------------------------------------------
exports.deleteLog = async (req, res) => {
  try {
    // findByIdAndDelete = raccourci Mongoose qui trouve par _id et supprime
    const log = await Log.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log introuvable' });
    res.json({ message: 'Log supprime' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/logs/search — Recherche avancee
// Query : ?q=texte&level=ERROR,CRITICAL&app_id=WEB&dateDebut=...&dateFin=...
// Demontre les 3 operateurs Mongo exiges : $regex, $in, $gte/$lte
// -----------------------------------------------------------------------------
exports.searchLogs = async (req, res) => {
  try {
    const { q, level, app_id, dateDebut, dateFin } = req.query;

    // On construit l'objet de filtre dynamiquement selon les parametres fournis.
    const filtre = {};

    // $regex = recherche textuelle. $options: 'i' = insensible a la casse.
    // Exemple : q=Null trouvera "NullPointerException", "nullable"...
    if (q) filtre.message = { $regex: q, $options: 'i' };

    // $in = "appartient a la liste". On split la string CSV en tableau.
    // Exemple : level=ERROR,CRITICAL -> ['ERROR', 'CRITICAL']
    if (level) filtre.level = { $in: level.split(',') };
    if (app_id) filtre.app_id = { $in: app_id.split(',') };

    // Filtre de date avec $gte (greater than or equal) et $lte (less than or equal)
    if (dateDebut || dateFin) {
      filtre.timestamp = {};
      if (dateDebut) filtre.timestamp.$gte = new Date(dateDebut);
      if (dateFin) filtre.timestamp.$lte = new Date(dateFin);
    }

    // Limit a 100 pour eviter de renvoyer 2000 logs d'un coup.
    const logs = await Log.find(filtre).sort({ timestamp: -1 }).limit(100);
    res.json({ total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/logs/java-errors — Filtre par TYPE via $exists
// Renvoie uniquement les logs qui ont un champ "stack_trace" = logs Java.
// -----------------------------------------------------------------------------
exports.getJavaErrors = async (req, res) => {
  try {
    // $exists: true = le champ doit etre present dans le document.
    // C'est l'operateur cle qui montre l'interet du schema flexible.
    const logs = await Log.find({ stack_trace: { $exists: true } }).sort({ timestamp: -1 }).limit(50);
    res.json({ total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/logs/web — Logs web (champ methode_http present)
// -----------------------------------------------------------------------------
exports.getWebLogs = async (req, res) => {
  try {
    const logs = await Log.find({ methode_http: { $exists: true } }).sort({ timestamp: -1 }).limit(50);
    res.json({ total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/logs/security — Logs securite (champ user present)
// -----------------------------------------------------------------------------
exports.getSecurityLogs = async (req, res) => {
  try {
    const logs = await Log.find({ user: { $exists: true } }).sort({ timestamp: -1 }).limit(50);
    res.json({ total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/logs/slow-db — Logs DB lents (requete_sql existe ET duree > 1s)
// Combine $exists + $gt (greater than) sur deux champs differents.
// -----------------------------------------------------------------------------
exports.getSlowDbLogs = async (req, res) => {
  try {
    const logs = await Log.find({
      requete_sql: { $exists: true },    // c'est bien un log DB
      duree_ms: { $gt: 1000 }            // duree > 1000ms = 1 seconde
    }).sort({ duree_ms: -1 }).limit(50); // les plus lents en premier
    res.json({ total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
