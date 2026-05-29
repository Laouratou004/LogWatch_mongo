const Log = require('../models/Log');
const Application = require('../models/Application');
const Alerte = require('../models/Alerte');

exports.getStats = async (req, res) => {
    try {
        const totalLogs = await Log.countDocuments();
        const totalErreurs = await Log.countDocuments({ level: { $in: ['ERROR', 'CRITICAL'] } });
        const totalAlertes = await Alerte.countDocuments({ resolue: false });
        res.json({ totalLogs, totalErreurs, totalAlertes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const { limit = 100, level, type } = req.query;
        let query = {};
        if (level) query.level = level;
        
        // Flexible schema filtering based on the presentation requirements
        if (type === 'java') query.source_fichier = { $exists: true };
        if (type === 'web') query.methode_http = { $exists: true };

        const logs = await Log.find(query).sort({ timestamp: -1 }).limit(Number(limit));
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PIPELINE 1: Taux d'erreur par application
exports.getTauxErreur = async (req, res) => {
    try {
        const pipeline = [
            {
                $group: {
                    _id: "$app_id",
                    totalLogs: { $sum: 1 },
                    erreurs: {
                        $sum: {
                            $cond: [{ $in: ["$level", ["ERROR", "CRITICAL"]] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    app_id: "$_id",
                    taux_erreur: { $multiply: [{ $divide: ["$erreurs", "$totalLogs"] }, 100] },
                    totalLogs: 1,
                    erreurs: 1
                }
            },
            { $sort: { taux_erreur: -1 } }
        ];
        const result = await Log.aggregate(pipeline);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PIPELINE 2: Top 10 erreurs fréquentes
exports.getTopErreurs = async (req, res) => {
    try {
        const pipeline = [
            { $match: { level: { $in: ["ERROR", "CRITICAL"] } } },
            {
                $group: {
                    _id: "$message",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ];
        const result = await Log.aggregate(pipeline);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PIPELINE 3: Distribution temporelle (par heure)
exports.getDistributionTemporelle = async (req, res) => {
    try {
        const pipeline = [
            {
                $group: {
                    _id: { $hour: "$timestamp" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ];
        const result = await Log.aggregate(pipeline);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PIPELINE 4: Détection d'anomalies (Pics anormaux par application)
exports.getAnomalies = async (req, res) => {
    try {
        // Group by app and hour, filtering out apps that don't have enough errors to be anomalous
        const pipeline = [
            { $match: { level: { $in: ["ERROR", "CRITICAL"] } } },
            {
                $group: {
                    _id: {
                        app: "$app_id",
                        heure: { $hour: "$timestamp" },
                        jour: { $dayOfYear: "$timestamp" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $match: { count: { $gt: 5 } } }, // Seuil (HAVING count > 5)
            { $sort: { count: -1 } }
        ];
        const result = await Log.aggregate(pipeline);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAlertes = async (req, res) => {
    try {
        const alertes = await Alerte.find().sort({ timestamp: -1 }).limit(50);
        res.json(alertes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
