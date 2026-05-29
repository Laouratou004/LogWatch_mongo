const mongoose = require('mongoose');

const alerteSchema = new mongoose.Schema({
    alerte_id: { type: String, required: true, unique: true },
    app_id: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true },
    type_alerte: { type: String, required: true },
    resolue: { type: Boolean, default: false },
    assignee_uid: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Alerte', alerteSchema);
