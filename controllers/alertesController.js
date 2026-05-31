// =============================================================================
// controllers/alertesController.js — Logique des routes /api/alertes
// -----------------------------------------------------------------------------
// Lecture, resolution et suppression d'alertes.
// La CREATION d'alertes se fait automatiquement dans analyticsController
// (quand le pipeline 4 detecte une anomalie).
// =============================================================================

const Alerte = require('../models/Alerte');

// -----------------------------------------------------------------------------
// GET /api/alertes — Liste avec les non-resolues en premier
// -----------------------------------------------------------------------------
exports.getAlertes = async (req, res) => {
  try {
    // Tri multi-cles :
    //   - resolue: 1     -> false (0) avant true (1) -> non resolues d'abord
    //   - timestamp: -1  -> les plus recentes en premier
    const alertes = await Alerte.find().sort({ resolue: 1, timestamp: -1 });
    res.json({ total: alertes.length, alertes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// PUT /api/alertes/:id/resoudre — Marquer une alerte comme resolue
// -----------------------------------------------------------------------------
exports.resoudreAlerte = async (req, res) => {
  try {
    // On force resolue = true. { new: true } -> renvoie le document mis a jour.
    const alerte = await Alerte.findByIdAndUpdate(
      req.params.id,
      { resolue: true },
      { new: true }
    );
    if (!alerte) return res.status(404).json({ error: 'Alerte introuvable' });
    res.json({ message: 'Alerte resolue', alerte });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------------------------------
// DELETE /api/alertes/:id — Supprimer une alerte
// -----------------------------------------------------------------------------
exports.deleteAlerte = async (req, res) => {
  try {
    const alerte = await Alerte.findByIdAndDelete(req.params.id);
    if (!alerte) return res.status(404).json({ error: 'Alerte introuvable' });
    res.json({ message: 'Alerte supprimee' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
