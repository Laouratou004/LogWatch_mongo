const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB Atlas — logwatch_db'))
  .catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

// Gestion des événements MongoDB après démarrage
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB déconnecté — tentative de reconnexion...');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB :', err.message);
});

// Routes
app.use('/api/logs', require('./routes/logs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/alertes', require('./routes/alertes'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/audit', require('./routes/audit'));

// Route de test enrichie
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'LogWatch API opérationnelle',
    mongodb: mongoose.connection.readyState === 1 ? 'connecté' : 'déconnecté',
    uptime_secondes: Math.floor(process.uptime()),
    timestamp: new Date()
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({ error: `Route introuvable : ${req.method} ${req.originalUrl}` });
});

// Middleware global de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur :', err.message);
  res.status(500).json({ error: 'Erreur interne du serveur', details: err.message });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});