const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB Atlas — logwatch_db'))
  .catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

// Routes
app.use('/api/logs', require('./routes/logs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/alertes', require('./routes/alertes'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/audit', require('./routes/audit'));

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LogWatch API opérationnelle' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});