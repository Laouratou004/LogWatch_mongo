// =============================================================================
// scripts/generate-logs.js — Ajout incremental de logs
// -----------------------------------------------------------------------------
// Role : AJOUTE N nouveaux logs SANS effacer ceux qui existent deja.
// Utile pour simuler une activite en continu et tester l'auto-refresh
// du dashboard (qui se rafraichit toutes les 30 secondes).
//
// Difference cle avec seed.js :
//   - seed.js     -> VIDE tout et recree 2000 logs (reset complet)
//   - generate.js -> AJOUTE des logs frais aux existants (incremental)
//
// Usage :
//   node scripts/generate-logs.js               # 100 logs (defaut)
//   node scripts/generate-logs.js 500           # 500 logs
//   node scripts/generate-logs.js 200 java      # 200 logs Java uniquement
//   node scripts/generate-logs.js 200 web       # 200 logs Web uniquement
//   node scripts/generate-logs.js 200 securite  # 200 logs Securite uniquement
//   node scripts/generate-logs.js 200 db        # 200 logs Base de donnees uniquement
// =============================================================================

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

// =============================================================================
// SECTION 1 — Configuration
// =============================================================================
const appIds = [
  'app_si_etudiant', 'app_scolarite', 'app_bibliotheque', 'app_api_gateway',
  'app_paiement', 'app_authentification', 'WEB', 'SIE', 'FW', 'MSG'
];
const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];

// =============================================================================
// SECTION 2 — Helpers
// =============================================================================

// Tirage pondere des niveaux (15% DEBUG, 35% INFO, 20% WARN, 20% ERROR, 10% CRITICAL)
function randomLevel(weights = [15, 35, 20, 20, 10]) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return levels[i];
  }
  return 'INFO';
}

// Date aleatoire dans la DERNIERE HEURE (-> simule de l'activite "fraiche")
// Difference avec seed.js : ici on veut du recent pour voir l'auto-refresh marcher
function timestampRecent() {
  const now = Date.now();
  const past = now - 60 * 60 * 1000;  // -1h (60 min * 60 sec * 1000 ms)
  return new Date(faker.number.int({ min: past, max: now }));
}

// =============================================================================
// SECTION 3 — Generateurs par type (memes types que seed.js)
// =============================================================================

// --- TYPE 1 : Log Java ---
function genererLogJava(suffix) {
  const exceptions = [
    'NullPointerException', 'ClassCastException', 'ArrayIndexOutOfBoundsException',
    'IllegalArgumentException', 'StackOverflowError', 'OutOfMemoryError',
    'NumberFormatException', 'IllegalStateException'
  ];
  const classes = [
    'UserService', 'AuthController', 'InscriptionService', 'EtudiantDAO',
    'PaiementService', 'BiblioController', 'SessionManager', 'TokenValidator'
  ];
  const exception = faker.helpers.arrayElement(exceptions);
  const classe = faker.helpers.arrayElement(classes);
  const line = faker.number.int({ min: 42, max: 520 });

  return {
    // suffix base sur Date.now() pour garantir l'unicite a chaque lancement
    log_id: `LOG-JAVA-${suffix}`,
    app_id: faker.helpers.arrayElement(['SIE', 'app_si_etudiant', 'app_paiement', 'app_scolarite']),
    timestamp: timestampRecent(),
    level: faker.helpers.arrayElement(['ERROR', 'ERROR', 'CRITICAL', 'WARN']),
    type_log: 'erreur',
    message: `${exception} dans ${classe}.java a la ligne ${line}`,
    source_fichier: `${classe}.java`,
    ligne_code: line,
    exception_type: exception,
    stack_trace: `java.lang.${exception}\n\tat com.logwatch.${classe}.method(${classe}.java:${line})`,
    nb_occurrences: faker.number.int({ min: 1, max: 50 })
  };
}

// --- TYPE 2 : Log Web ---
function genererLogWeb(suffix) {
  const level = randomLevel([10, 40, 20, 20, 10]);
  const methodes = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const urls = [
    '/api/etudiants', '/api/inscriptions', '/api/notes', '/api/paiements',
    '/api/auth/login', '/api/bibliotheque', '/api/messages', '/admin/dashboard'
  ];
  // Code HTTP coherent avec le niveau de gravite
  const codes = level === 'ERROR' ? [404, 500, 503]
              : level === 'WARN'  ? [400, 401, 403]
              : [200, 201, 204];
  const methode = faker.helpers.arrayElement(methodes);
  const url = faker.helpers.arrayElement(urls);
  const code = faker.helpers.arrayElement(codes);

  return {
    log_id: `LOG-WEB-${suffix}`,
    app_id: faker.helpers.arrayElement(['WEB', 'app_api_gateway', 'app_authentification']),
    timestamp: timestampRecent(),
    level,
    type_log: 'web',
    message: `${methode} ${url} -> HTTP ${code}`,
    source_fichier: 'access.log',
    methode_http: methode,
    url,
    code_statut: code,
    duree_ms: faker.number.int({ min: 10, max: 3000 }),
    ip_source: faker.internet.ip()
  };
}

// --- TYPE 3 : Log Securite ---
function genererLogSecurite(suffix) {
  const succes = faker.datatype.boolean();
  const tentatives = succes ? 1 : faker.number.int({ min: 1, max: 15 });
  // > 5 tentatives echouees -> CRITICAL (logique anti-brute-force)
  const level = !succes && tentatives > 5 ? 'CRITICAL'
              : !succes ? 'WARN' : 'INFO';
  const actions = ['LOGIN', 'LOGOUT', 'ADMIN_ACCESS', 'PASSWORD_CHANGE', 'TOKEN_REFRESH'];
  const action = faker.helpers.arrayElement(actions);
  const ip = faker.internet.ip();

  return {
    log_id: `LOG-SEC-${suffix}`,
    app_id: faker.helpers.arrayElement(['app_authentification', 'FW', 'app_si_etudiant']),
    timestamp: timestampRecent(),
    level,
    type_log: 'securite',
    message: `${action} — ${succes ? 'succes' : 'echec'} depuis ${ip}`,
    source_fichier: 'security.log',
    user: `user_${faker.number.int({ min: 1000, max: 9999 })}`,
    action,
    ip_source: ip,
    succes,
    tentatives
  };
}

// --- TYPE 4 : Log Base de donnees ---
function genererLogDB(suffix) {
  const duree = faker.number.int({ min: 1, max: 5000 });
  // Gravite proportionnelle a la lenteur
  const level = duree > 3000 ? 'CRITICAL'
              : duree > 1000 ? 'WARN' : 'INFO';
  const queries = [
    'SELECT * FROM etudiants WHERE filiere_id = ?',
    'SELECT e.nom, n.note FROM etudiants e JOIN notes n ON e.id = n.etudiant_id',
    'INSERT INTO inscriptions (etudiant_id, cours_id, date) VALUES (?, ?, ?)',
    'UPDATE etudiants SET statut = ? WHERE id = ?',
    'DELETE FROM sessions WHERE expires_at < NOW()'
  ];

  return {
    log_id: `LOG-DB-${suffix}`,
    app_id: faker.helpers.arrayElement(['SIE', 'app_si_etudiant', 'MSG', 'app_paiement']),
    timestamp: timestampRecent(),
    level,
    type_log: 'base_de_donnees',
    message: `Requete executee en ${duree}ms`,
    source_fichier: 'database.log',
    requete_sql: faker.helpers.arrayElement(queries),
    duree_ms: duree,
    nb_lignes_affectees: faker.number.int({ min: 0, max: 5000 })
  };
}

// =============================================================================
// SECTION 4 — Routage par type
// Permet de choisir QUEL type generer selon l'argument CLI passe.
// =============================================================================
const GENERATEURS = {
  java:     genererLogJava,
  web:      genererLogWeb,
  securite: genererLogSecurite,
  db:       genererLogDB
};

// Si aucun type n'est demande, on tire au hasard parmi les 4 pour chaque log
function genererLogAleatoire(suffix) {
  const types = Object.keys(GENERATEURS);
  const type = faker.helpers.arrayElement(types);
  return GENERATEURS[type](suffix);
}

// =============================================================================
// SECTION 5 — Programme principal
// =============================================================================
async function generate() {

  // --- Parsing des arguments CLI ---
  // process.argv[0] = chemin de node
  // process.argv[1] = chemin du script
  // process.argv[2] = 1er argument utilisateur (nombre)
  // process.argv[3] = 2eme argument utilisateur (type)
  const nb = parseInt(process.argv[2], 10) || 100;       // defaut : 100 logs
  const type = process.argv[3]?.toLowerCase();           // optionnel
  // Note : ?. = optional chaining, evite l'erreur si argv[3] est undefined

  // --- Validation des arguments ---
  if (type && !GENERATEURS[type]) {
    console.error(`Type invalide : "${type}"`);
    console.error(`   Types valides : ${Object.keys(GENERATEURS).join(', ')}`);
    process.exit(1);  // arret du script avec code d'erreur
  }

  if (nb < 1 || nb > 10000) {
    console.error('Le nombre de logs doit etre entre 1 et 10000.');
    process.exit(1);
  }

  try {
    // --- Connexion a MongoDB ---
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecte a MongoDB Atlas\n');

    const collection = mongoose.connection.db.collection('logs');

    // --- Etat AVANT ---
    const avant = await collection.countDocuments();
    console.log(`Logs en base avant : ${avant}`);

    // --- Generation du suffix unique pour les log_id ---
    // Date.now() = timestamp en ms (ex: 1717084800000)
    // .toString(36) = conversion en base 36 (lettres + chiffres) -> plus court
    // .toUpperCase() = aspect visuel ("LWXJ4K9P")
    // -> garantit qu'a chaque lancement on n'aura pas de collision avec l'ancien run
    const baseSuffix = Date.now().toString(36).toUpperCase();

    // --- Choix du generateur (un type fixe ou mixte) ---
    const generateur = type ? GENERATEURS[type] : genererLogAleatoire;
    const label = type ? type.toUpperCase() : 'MIXTE';

    console.log(`Generation de ${nb} logs (${label})...`);

    // --- Generation du tableau de logs ---
    // padStart(5, '0') -> formatte le numero sur 5 chiffres ("00001", "00042"...)
    const logs = Array.from({ length: nb }, (_, i) =>
      generateur(`${baseSuffix}-${String(i + 1).padStart(5, '0')}`)
    );

    // --- Insertion en masse (1 seule requete reseau pour N logs) ---
    const result = await collection.insertMany(logs);

    // --- Etat APRES ---
    const apres = await collection.countDocuments();

    // --- Resume ---
    console.log(`\n${result.insertedCount} logs ajoutes`);
    console.log('-------------------------------------');
    console.log(`Logs avant : ${avant}`);
    console.log(`Logs apres : ${apres}`);
    console.log(`Difference : +${apres - avant}`);

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
