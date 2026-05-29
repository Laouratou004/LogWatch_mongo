const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    log_id: { type: String, required: true, unique: true },
    app_id: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true, index: true },
    level: { type: String, required: true, index: true },
    message: { type: String, required: true }
    // strict: false allows adding flexible fields like `stack_trace`, `url`, `methode_http`, etc.
}, {
    strict: false,
    timestamps: true
});

module.exports = mongoose.model('Log', logSchema);
