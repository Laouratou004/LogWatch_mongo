const mongoose = require('mongoose');

const alerteSchema = new mongoose.Schema({
  alerte_id: { type: String, required: true, unique: true },
  app_id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type_alerte: { type: String },
  description: { type: String },
  seuil_declenche: { type: Number },
  valeur_observee: { type: Number },
  resolue: { type: Boolean, default: false },
  assignee_uid: { type: String, default: null }
});

module.exports = mongoose.model('Alerte', alerteSchema, 'alertes_systeme');