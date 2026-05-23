const Application = require('../models/Application');

// GET /api/applications — Liste toutes les applications
exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ nom: 1 });
    res.json({ total: applications.length, applications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/applications — Nouvelle application
exports.createApplication = async (req, res) => {
  try {
    const application = await Application.create(req.body);
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/applications/:id — Mise à jour
exports.updateApplication = async (req, res) => {
  try {
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

// DELETE /api/applications/:id — Supprimer
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application introuvable' });
    res.json({ message: 'Application supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};