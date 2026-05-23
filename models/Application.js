const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  app_id: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  version: { type: String },
  environnement: { type: String, enum: ['prod', 'dev', 'test'] },
  technologie: { type: String, enum: ['Java', 'Node.js', 'Python', 'PHP'] },
  responsable: { type: String },
  sla_pct: { type: Number }
});

module.exports = mongoose.model('Application', applicationSchema, 'applications');