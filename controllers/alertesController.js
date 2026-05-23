const Alerte = require('../models/Alerte');

// GET /api/alertes — Liste (non résolues en premier)
exports.getAlertes = async (req, res) => {
  try {
    const alertes = await Alerte.find().sort({ resolue: 1, timestamp: -1 });
    res.json({ total: alertes.length, alertes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/alertes/:id/resoudre — Marquer résolue
exports.resoudreAlerte = async (req, res) => {
  try {
    const alerte = await Alerte.findByIdAndUpdate(
      req.params.id,
      { resolue: true },
      { new: true }
    );
    if (!alerte) return res.status(404).json({ error: 'Alerte introuvable' });
    res.json({ message: 'Alerte résolue', alerte });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/alertes/:id — Supprimer
exports.deleteAlerte = async (req, res) => {
  try {
    const alerte = await Alerte.findByIdAndDelete(req.params.id);
    if (!alerte) return res.status(404).json({ error: 'Alerte introuvable' });
    res.json({ message: 'Alerte supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};