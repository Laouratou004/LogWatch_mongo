const Log = require('../models/Log');
const mongoose = require('mongoose');
const Alerte = require('../models/Alerte');


// GET /api/logs — Liste paginée
exports.getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const logs = await Log.find().sort({ timestamp: -1 }).skip(skip).limit(limit);
    const total = await Log.countDocuments();

    res.json({ total, page, limit, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/logs/:id — Détail d'un log
exports.getLogById = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'ID est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    // Chercher directement dans la collection
    const log = await mongoose.connection.db
      .collection('logs')
      .findOne({ _id: new mongoose.Types.ObjectId(id) });

    if (!log) return res.status(404).json({ error: 'Log introuvable' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/logs — Insertion temps réel
exports.createLog = async (req, res) => {
  try {
    const log = await Log.create(req.body);

    // Alerte automatique si log CRITICAL
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

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/logs/:id — Suppression
exports.deleteLog = async (req, res) => {
  try {
    const log = await Log.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log introuvable' });
    res.json({ message: 'Log supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/logs/search — Recherche avancée ($regex + $in + date)
exports.searchLogs = async (req, res) => {
  try {
    const { q, level, app_id, dateDebut, dateFin } = req.query;
    const filtre = {};

    if (q) filtre.message = { $regex: q, $options: 'i' };
    if (level) filtre.level = { $in: level.split(',') };
    if (app_id) filtre.app_id = { $in: app_id.split(',') };
    if (dateDebut || dateFin) {
      filtre.timestamp = {};
      if (dateDebut) filtre.timestamp.$gte = new Date(dateDebut);
      if (dateFin) filtre.timestamp.$lte = new Date(dateFin);
    }

    const logs = await Log.find(filtre).sort({ timestamp: -1 }).limit(100);
    res.json({ total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/logs/java-errors — $exists: stack_trace
exports.getJavaErrors = async (req, res) => {
  try {
    const logs = await Log.find({ stack_trace: { $exists: true } }).sort({ timestamp: -1 }).limit(50);
    res.json({ total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/logs/web — $exists: methode_http
exports.getWebLogs = async (req, res) => {
  try {
    const logs = await Log.find({ methode_http: { $exists: true } }).sort({ timestamp: -1 }).limit(50);
    res.json({ total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/logs/security — $exists: user
exports.getSecurityLogs = async (req, res) => {
  try {
    const logs = await Log.find({ user: { $exists: true } }).sort({ timestamp: -1 }).limit(50);
    res.json({ total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/logs/slow-db — $exists: requete_sql + duree_ms > 1000
exports.getSlowDbLogs = async (req, res) => {
  try {
    const logs = await Log.find({
      requete_sql: { $exists: true },
      duree_ms: { $gt: 1000 }
    }).sort({ duree_ms: -1 }).limit(50);
    res.json({ total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};