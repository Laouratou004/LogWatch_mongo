// =============================================================================
// models/Alerte.js — Modele Mongoose de la collection "alertes_systeme"
// -----------------------------------------------------------------------------
// Represente une alerte declenchee par le systeme.
// Une alerte est creee soit :
//   - manuellement (via seed.js pour les donnees initiales)
//   - automatiquement par le pipeline 4 (detection d'anomalies)
// =============================================================================

const mongoose = require('mongoose');

const alerteSchema = new mongoose.Schema({

  // Identifiant unique de l'alerte (ex: "alerte_001", "alerte_auto_1717084800000")
  alerte_id: { type: String, required: true, unique: true },

  // Application concernee par l'alerte
  app_id: { type: String, required: true },

  // Date/heure de declenchement de l'alerte
  timestamp: { type: Date, default: Date.now },

  // Categorie : VOLUME_ANOMALIE, ERREUR_CRITIQUE, SECURITE, PERFORMANCE
  type_alerte: { type: String },

  // Description lisible expliquant le probleme
  description: { type: String },

  // Seuil de declenchement configure (ex: 3 logs/5min)
  seuil_declenche: { type: Number },

  // Valeur observee qui a depasse le seuil (ex: 42 logs)
  valeur_observee: { type: Number },

  // Statut : false = en attente, true = traitee. Par defaut, nouvelle alerte = non resolue.
  resolue: { type: Boolean, default: false },

  // Identifiant du membre assigne au traitement (M1, M2, M3...) ou null si non assignee
  assignee_uid: { type: String, default: null }
});

// 3eme argument : nom REEL de la collection en base (note le pluriel "alertes_systeme").
module.exports = mongoose.model('Alerte', alerteSchema, 'alertes_systeme');
