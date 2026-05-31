// =============================================================================
// scripts/generate-applications.js — Ajout incremental d'applications
// -----------------------------------------------------------------------------
// Role : AJOUTE N nouvelles applications a la collection "applications"
//        SANS effacer celles qui existent deja.
//
// Utile pour :
//   - Tester l'affichage du tableau des applications avec plus de donnees
//   - Simuler l'ajout d'applis suivies au fil du temps
//
// Usage :
//   node scripts/generate-applications.js              # 5 apps (defaut)
//   node scripts/generate-applications.js 10           # 10 apps
//   node scripts/generate-applications.js 3 Java       # 3 apps Java uniquement
//   node scripts/generate-applications.js 3 Node.js    # 3 apps Node.js
//   node scripts/generate-applications.js 3 Python     # 3 apps Python
//   node scripts/generate-applications.js 3 PHP        # 3 apps PHP
// =============================================================================

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const Application = require('../models/Application');

// =============================================================================
// SECTION 1 — Donnees de reference pour generer des applis realistes
// =============================================================================

// Technologies autorisees (doivent matcher l'enum du schema Application.js)
const TECHNOLOGIES = ['Java', 'Node.js', 'Python', 'PHP'];

// Environnements autorises (enum du schema)
const ENVIRONNEMENTS = ['prod', 'dev', 'test'];

// Noms de modules realistes pour generer des noms d'application
const MODULES = [
  'Gestion', 'Portail', 'Service', 'API', 'Module', 'Systeme', 'Plateforme',
  'Application', 'Interface', 'Console', 'Dashboard', 'Hub'
];

// Domaines metiers UGANC pour rendre les apps coherentes avec le contexte
const DOMAINES = [
  'Etudiants', 'Scolarite', 'Bibliotheque', 'Paiement', 'Authentification',
  'Inscription', 'Notes', 'Bourses', 'Examens', 'Cours', 'Emploi du temps',
  'Statistiques', 'Reporting', 'Notifications', 'Documents', 'Annuaire',
  'Stages', 'Diplomes', 'Recherche', 'Laboratoire', 'Conseils', 'RH'
];

// Prenoms et noms guineens pour les responsables (coherence locale)
const PRENOMS = [
  'Mamadou', 'Fatoumata', 'Ibrahima', 'Aminata', 'Oumar', 'Kadiatou',
  'Alseny', 'Mariama', 'Ismael', 'Salam', 'Aissatou', 'Sekou',
  'Hadiatou', 'Thierno', 'Aboubacar', 'Djenab'
];
const NOMS = [
  'Diallo', 'Camara', 'Bah', 'Balde', 'Sow', 'Traore',
  'Kouyate', 'Conde', 'Toure', 'Barry', 'Sylla', 'Keita'
];

// =============================================================================
// SECTION 2 — Helpers
// =============================================================================

// Genere un identifiant app_id unique base sur le domaine
// Exemple : "Etudiants" -> "app_etudiants_a1b2"
function genererAppId(domaine) {
  // toLowerCase + suppression des accents + remplacement des espaces par _
  const cle = domaine
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // enleve les accents
    .replace(/\s+/g, '_');
  // Suffixe aleatoire de 4 caracteres pour garantir l'unicite
  const suffix = Math.random().toString(36).substring(2, 6);
  return `app_${cle}_${suffix}`;
}

// Genere une version semver realiste (ex: "2.3.1")
function genererVersion() {
  return `${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 9 })}.${faker.number.int({ min: 0, max: 20 })}`;
}

// Genere un nom de responsable "Prenom Nom"
function genererResponsable() {
  return `${faker.helpers.arrayElement(PRENOMS)} ${faker.helpers.arrayElement(NOMS)}`;
}

// Genere un SLA realiste entre 98% et 99.99%
function genererSLA() {
  // Choix aleatoire entre quelques valeurs typiques de SLA
  return faker.helpers.arrayElement([98.0, 98.5, 99.0, 99.5, 99.7, 99.8, 99.9, 99.99]);
}

// =============================================================================
// SECTION 3 — Generateur principal d'une application
// =============================================================================
function genererApplication(technoForcee = null) {
  // Domaine metier tire au hasard
  const domaine = faker.helpers.arrayElement(DOMAINES);

  // Si une techno est imposee via CLI, on l'utilise. Sinon, tirage au hasard.
  const technologie = technoForcee || faker.helpers.arrayElement(TECHNOLOGIES);

  // Module + domaine pour construire un nom realiste
  // Exemple : "Gestion Etudiants", "Portail Scolarite"
  const module = faker.helpers.arrayElement(MODULES);
  const nom = `${module} ${domaine}`;

  // Environnement : 70% prod (cas le plus courant), 20% dev, 10% test
  const envRandom = Math.random();
  const environnement = envRandom < 0.7 ? 'prod' :
                        envRandom < 0.9 ? 'dev' : 'test';

  return {
    app_id: genererAppId(domaine),
    nom,
    version: genererVersion(),
    environnement,
    technologie,
    responsable: genererResponsable(),
    sla_pct: genererSLA()
  };
}

// =============================================================================
// SECTION 4 — Programme principal
// =============================================================================
async function generate() {

  // --- Parsing des arguments CLI ---
  const nb = parseInt(process.argv[2], 10) || 5;        // defaut : 5 applis
  const techno = process.argv[3];                        // optionnel : techno forcee

  // --- Validation ---
  if (techno && !TECHNOLOGIES.includes(techno)) {
    console.error(`Technologie invalide : "${techno}"`);
    console.error(`   Technologies valides : ${TECHNOLOGIES.join(', ')}`);
    process.exit(1);
  }

  if (nb < 1 || nb > 100) {
    console.error('Le nombre d\'applications doit etre entre 1 et 100.');
    process.exit(1);
  }

  try {
    // --- Connexion a MongoDB ---
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecte a MongoDB Atlas\n');

    // --- Etat AVANT ---
    const avant = await Application.countDocuments();
    console.log(`Applications en base avant : ${avant}`);

    const label = techno || 'MIXTE';
    console.log(`Generation de ${nb} application(s) (${label})...`);

    // --- Generation et insertion une par une pour gerer les doublons ---
    // On ne fait pas insertMany car app_id est unique et on veut ignorer
    // les eventuelles collisions (peu probable mais possible avec random)
    let ajoutees = 0;
    let ignorees = 0;

    for (let i = 0; i < nb; i++) {
      const app = genererApplication(techno);
      try {
        await Application.create(app);
        ajoutees++;
        console.log(`   [+] ${app.nom} (${app.technologie}) - ${app.app_id}`);
      } catch (err) {
        // Erreur duplicate key (code 11000) = app_id deja existant
        if (err.code === 11000) {
          ignorees++;
          console.log(`   [!] ${app.app_id} existe deja, ignoree`);
        } else {
          throw err;
        }
      }
    }

    // --- Etat APRES ---
    const apres = await Application.countDocuments();

    // --- Resume ---
    console.log(`\n${ajoutees} application(s) ajoutee(s)`);
    if (ignorees > 0) console.log(`${ignorees} ignoree(s) (doublons)`);
    console.log('-------------------------------------');
    console.log(`Applications avant : ${avant}`);
    console.log(`Applications apres : ${apres}`);
    console.log(`Difference         : +${apres - avant}`);

  } catch (err) {
    console.error('Erreur :', err.message);
    process.exit(1);
  } finally {
    // Toujours fermer la connexion
    await mongoose.connection.close();
  }
}

// Lancement
generate();
