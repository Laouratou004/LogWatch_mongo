// =============================================================================
// server.js — Point d'entree du serveur Express LogWatch
// -----------------------------------------------------------------------------
// Role : ce fichier est lance quand on fait "npm start" ou "npm run dev".
//        Il configure Express, se connecte a MongoDB Atlas, monte les 5
//        routeurs (/api/logs, /api/applications, /api/alertes,
//        /api/analytics, /api/audit) puis ecoute sur le port 3000.
// =============================================================================

// --- Import des librairies ---
const helmet = require('helmet');       // Securite : ajoute des headers HTTP de protection (XSS, clickjacking...)
const morgan = require('morgan');       // Logger HTTP : affiche chaque requete dans la console
const express = require('express');     // Framework web minimaliste (gere routes, middlewares)
const mongoose = require('mongoose');   // ORM pour MongoDB : permet de manipuler la base via des modeles JS
const cors = require('cors');           // Autorise le frontend (autre origine) a appeler l'API
require('dotenv').config();             // Charge les variables d'environnement depuis le fichier .env

// --- Creation de l'application Express ---
const app = express();

// --- Middlewares (executes pour CHAQUE requete entrante, dans l'ordre) ---
// helmet({ contentSecurityPolicy: false }) : on desactive CSP car notre frontend
// charge des polices et CDN externes (Phosphor Icons, Chart.js) qui seraient bloques.
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(morgan('combined'));            // 2. Affiche un log de chaque requete (GET /api/logs 200 12ms...)
app.use(cors());                        // 3. Autorise les appels cross-origin (necessaire pour le dashboard)
app.use(express.json());                // 4. Parse automatiquement le JSON du body (req.body)
app.use(express.static('public'));      // 5. Sert les fichiers statiques (HTML/CSS/JS) du dossier public/

// --- Connexion a MongoDB Atlas (cloud) ---
// L'URI est dans .env : mongodb+srv://user:pass@cluster.mongodb.net/logwatch_db
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecte a MongoDB Atlas — logwatch_db'))
  .catch(err => console.error('Erreur de connexion MongoDB :', err));

// --- Gestion des evenements MongoDB APRES le demarrage ---
// Permet de detecter une perte de connexion ou une erreur en cours d'execution.
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB déconnecté — tentative de reconnexion...');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB :', err.message);
});

// --- Montage des routeurs ---
// Chaque routeur regroupe les endpoints d'un domaine fonctionnel.
// Express prefixe automatiquement toutes les routes du routeur avec le chemin donne.
app.use('/api/logs', require('./routes/logs'));                  // CRUD logs + recherche + filtres par type
app.use('/api/applications', require('./routes/applications'));  // CRUD applications surveillees
app.use('/api/alertes', require('./routes/alertes'));            // Lecture / resolution / suppression alertes
app.use('/api/analytics', require('./routes/analytics'));        // Les 4 pipelines d'agregation
app.use('/api/audit', require('./routes/audit'));                // IPs et utilisateurs suspects

// --- Route de sante enrichie ---
// Utile pour le monitoring : statut Mongo, uptime serveur, timestamp.
// mongoose.connection.readyState === 1 -> connexion etablie.
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'LogWatch API opérationnelle',
    mongodb: mongoose.connection.readyState === 1 ? 'connecté' : 'déconnecté',
    uptime_secondes: Math.floor(process.uptime()),
    timestamp: new Date()
  });
});

// --- Route 404 (filet de securite) ---
// Si aucune route precedente ne matche, on renvoie un message clair.
app.use((req, res) => {
  res.status(404).json({ error: `Route introuvable : ${req.method} ${req.originalUrl}` });
});

// --- Middleware global de gestion d'erreurs ---
// Tout throw / next(err) dans les controllers atterrit ici.
// Evite que le serveur crashe sur une exception non gerée.
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur :', err.message);
  res.status(500).json({ error: 'Erreur interne du serveur', details: err.message });
});

// --- Demarrage du serveur HTTP ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur demarre sur http://localhost:${PORT}`);
});
