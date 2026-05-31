// =============================================================================
// models/Log.js — Modele Mongoose de la collection "logs"
// -----------------------------------------------------------------------------
// C'est LE modele central du projet. Il represente un log applicatif.
// Point cle pour la presentation : "strict: false" permet le SCHEMA FLEXIBLE,
// c'est-a-dire que chaque log peut avoir des champs supplementaires en
// fonction de son type (Java, Web, Securite, Base de donnees).
// =============================================================================

const mongoose = require('mongoose');

// --- Definition du schema ---
// Les champs declares ici sont COMMUNS a tous les types de logs.
const logSchema = new mongoose.Schema({

  // _id personnalise en String (au lieu du ObjectId par defaut de Mongo).
  // Genere automatiquement si non fourni.
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },

  // Identifiant metier unique du log (ex: "LOG-JAVA-000001")
  log_id: { type: String, required: true, unique: true },

  // Identifiant de l'application qui a produit ce log (ex: "app_si_etudiant")
  app_id: { type: String, required: true },

  // Date/heure de production du log. Si non fourni, Mongo met la date actuelle.
  timestamp: { type: Date, default: Date.now },

  // Niveau de gravite. enum = seules ces 5 valeurs sont autorisees.
  level: { type: String, enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'], required: true },

  // Message lisible decrivant l'evenement
  message: { type: String },

  // Nom du fichier source (ex: "UserService.java")
  source_fichier: { type: String },

  // Numero de ligne dans le code source
  ligne_code: { type: Number }

}, {
  // strict: false = AUTORISE des champs supplementaires non declares ci-dessus.
  // C'est ce qui permet d'avoir 4 types de logs avec des champs differents :
  //   - Log Java     -> stack_trace, exception_type
  //   - Log Web      -> methode_http, url, code_statut, duree_ms
  //   - Log Securite -> user, action, succes, tentatives
  //   - Log DB       -> requete_sql, duree_ms, nb_lignes_affectees
  // C'est l'argument cle pour justifier l'utilisation de MongoDB (NoSQL).
  strict: false
});

// --- Indexes (acceleration des requetes) ---
// Recommandes par le cahier des charges pour optimiser les filtrages frequents.
// Validation faite avec explain('executionStats') -> IXSCAN confirme.
logSchema.index({ timestamp: -1 });  // -1 = ordre decroissant (date la plus recente en premier)
logSchema.index({ level: 1 });       //  1 = ordre croissant (DEBUG, INFO, WARN, ERROR, CRITICAL)
logSchema.index({ app_id: 1 });      // filtrage rapide par application

// --- Export du modele ---
// Arguments : nom du modele, schema, nom REEL de la collection en base.
// Sans le 3eme argument, Mongo creerait une collection "logs" (pluralisation auto).
module.exports = mongoose.model('Log', logSchema, 'logs');
