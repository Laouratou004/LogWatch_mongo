// =============================================================================
// models/Application.js — Modele Mongoose de la collection "applications"
// -----------------------------------------------------------------------------
// Represente une des 10 applications surveillees de l'UGANC.
// Contrairement au modele Log, ici le schema est STRICT (pas de strict: false)
// car toutes les applications ont les memes champs.
// =============================================================================

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({

  // Identifiant unique de l'application (ex: "app_si_etudiant", "WEB", "FW")
  // C'est cette cle qu'on retrouve dans le champ app_id des logs.
  app_id: { type: String, required: true, unique: true },

  // Nom lisible (ex: "Systeme Information Etudiant")
  nom: { type: String, required: true },

  // Version de l'application (ex: "2.1.0")
  version: { type: String },

  // Environnement de deploiement. enum = valeurs autorisees uniquement.
  environnement: { type: String, enum: ['prod', 'dev', 'test'] },

  // Langage / framework utilise. enum = 4 technos pour notre infra.
  technologie: { type: String, enum: ['Java', 'Node.js', 'Python', 'PHP'] },

  // Nom du responsable technique (ex: "Mamadou Diallo")
  responsable: { type: String },

  // SLA (Service Level Agreement) en pourcentage. Ex: 99.9 = 99,9% de disponibilite garantie.
  sla_pct: { type: Number }
});

// Le 3eme argument force le nom de la collection a "applications".
module.exports = mongoose.model('Application', applicationSchema, 'applications');
