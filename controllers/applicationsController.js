// =============================================================================
// controllers/applicationsController.js — Logique des routes /api/applications
// -----------------------------------------------------------------------------
// CRUD simple (Create, Read, Update, Delete) sur la collection "applications".
// =============================================================================

const Application = require('../models/Application');

// -----------------------------------------------------------------------------
// GET /api/applications — Liste toutes les applications (triees par nom)
// -----------------------------------------------------------------------------
exports.getApplications = async (req, res) => {
  try {
    // sort({ nom: 1 }) -> ordre alphabetique croissant (A vers Z)
    const applications = await Application.find().sort({ nom: 1 });
    res.json({ total: applications.length, applications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// POST /api/applications — Creation d'une nouvelle application
// -----------------------------------------------------------------------------
exports.createApplication = async (req, res) => {
  try {
    // Mongoose valide automatiquement les champs requis (app_id, nom)
    // et les enum (environnement, technologie) du schema.
    const application = await Application.create(req.body);
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// PUT /api/applications/:id — Mise a jour d'une application
// -----------------------------------------------------------------------------
exports.updateApplication = async (req, res) => {
  try {
    // findByIdAndUpdate(id, donnees, options)
    // { new: true } = renvoie le document MIS A JOUR (sinon par defaut Mongo
    //                 renvoie l'ancien document avant modification).
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!application) return res.status(404).json({ error: 'Application introuvable' });
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// DELETE /api/applications/:id — Supprimer une application
// -----------------------------------------------------------------------------
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application introuvable' });
    res.json({ message: 'Application supprimee' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
