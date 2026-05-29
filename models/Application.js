const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    app_id: { type: String, required: true, unique: true },
    nom: { type: String, required: true },
    version: { type: String },
    environnement: { type: String },
    technologie: { type: String },
    responsable: { type: String },
    sla_pct: { type: Number }
}, {
    timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);
