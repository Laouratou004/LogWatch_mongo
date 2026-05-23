const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  log_id: { type: String, required: true, unique: true },
  app_id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  level: { type: String, enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'], required: true },
  message: { type: String },
  source_fichier: { type: String },
  ligne_code: { type: Number }
}, { strict: false }); // strict: false = champs supplémentaires autorisés

// Indexes recommandés par le CDC : optimiser filtrage par période, niveau et application
logSchema.index({ timestamp: -1 });
logSchema.index({ level: 1 });
logSchema.index({ app_id: 1 });

module.exports = mongoose.model('Log', logSchema, 'logs');