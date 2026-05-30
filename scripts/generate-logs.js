/**
 * scripts/generate-logs.js
 * ─────────────────────────────────────────────────────────────
 * Ajoute N nouveaux logs à la collection existante (pas de reset).
 * Utile pour simuler l'activité continue d'applications surveillées
 * et tester l'auto-refresh du dashboard.
 *
 * Usage :
 *   node scripts/generate-logs.js               # 100 logs (défaut)
 *   node scripts/generate-logs.js 500           # 500 logs
 *   node scripts/generate-logs.js 200 java      # 200 logs Java uniquement
 *   node scripts/generate-logs.js 200 web       # 200 logs Web uniquement
 *   node scripts/generate-logs.js 200 securite  # 200 logs Sécurité uniquement
 *   node scripts/generate-logs.js 200 db        # 200 logs Base de données uniquement
 *
 * Différence avec seed.js :
 *   - seed.js   → vide tout et recrée 2000 logs (reset complet)
 *   - generate  → ajoute des logs frais aux existants (incrémental)
 * ─────────────────────────────────────────────────────────────
 */

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

// ─── Configuration ───
const appIds = [
  'app_si_etudiant', 'app_scolarite', 'app_bibliotheque', 'app_api_gateway',
  'app_paiement', 'app_authentification', 'WEB', 'SIE', 'FW', 'MSG'
];
const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];

// ─── Helpers ───
function randomLevel(weights = [15, 35, 20, 20, 10]) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return levels[i];
  }
  return 'INFO';
}

// Timestamp récent — entre il y a 1h et maintenant (simule "fraîcheur")
function timestampRecent() {
  const now = Date.now();
  const past = now - 60 * 60 * 1000; // -1h
  return new Date(faker.number.int({ min: past, max: now }));
}

// ─── Générateurs par type (alignés sur seed.js) ───
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
    log_id: `LOG-JAVA-${suffix}`,
    app_id: faker.helpers.arrayElement(['SIE', 'app_si_etudiant', 'app_paiement', 'app_scolarite']),
    timestamp: timestampRecent(),
    level: faker.helpers.arrayElement(['ERROR', 'ERROR', 'CRITICAL', 'WARN']),
    type_log: 'erreur',
    message: `${exception} dans ${classe}.java à la ligne ${line}`,
    source_fichier: `${classe}.java`,
    ligne_code: line,
    exception_type: exception,
    stack_trace: `java.lang.${exception}\n\tat com.logwatch.${classe}.method(${classe}.java:${line})`,
    nb_occurrences: faker.number.int({ min: 1, max: 50 })
  };
}

function genererLogWeb(suffix) {
  const level = randomLevel([10, 40, 20, 20, 10]);
  const methodes = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const urls = [
    '/api/etudiants', '/api/inscriptions', '/api/notes', '/api/paiements',
    '/api/auth/login', '/api/bibliotheque', '/api/messages', '/admin/dashboard'
  ];
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
    message: `${methode} ${url} → HTTP ${code}`,
    source_fichier: 'access.log',
    methode_http: methode,
    url,
    code_statut: code,
    duree_ms: faker.number.int({ min: 10, max: 3000 }),
    ip_source: faker.internet.ip()
  };
}

function genererLogSecurite(suffix) {
  const succes = faker.datatype.boolean();
  const tentatives = succes ? 1 : faker.number.int({ min: 1, max: 15 });
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
    message: `${action} — ${succes ? 'succès' : 'échec'} depuis ${ip}`,
    source_fichier: 'security.log',
    user: `user_${faker.number.int({ min: 1000, max: 9999 })}`,
    action,
    ip_source: ip,
    succes,
    tentatives
  };
}

function genererLogDB(suffix) {
  const duree = faker.number.int({ min: 1, max: 5000 });
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
    message: `Requête exécutée en ${duree}ms`,
    source_fichier: 'database.log',
    requete_sql: faker.helpers.arrayElement(queries),
    duree_ms: duree,
    nb_lignes_affectees: faker.number.int({ min: 0, max: 5000 })
  };
}

// ─── Routage par type ───
const GENERATEURS = {
  java:     genererLogJava,
  web:      genererLogWeb,
  securite: genererLogSecurite,
  db:       genererLogDB
};

function genererLogAleatoire(suffix) {
  const types = Object.keys(GENERATEURS);
  const type = faker.helpers.arrayElement(types);
  return GENERATEURS[type](suffix);
}

// ─── Programme principal ───
async function generate() {
  // Parse arguments CLI
  const nb = parseInt(process.argv[2], 10) || 100;
  const type = process.argv[3]?.toLowerCase();

  if (type && !GENERATEURS[type]) {
    console.error(`❌ Type invalide : "${type}"`);
    console.error(`   Types valides : ${Object.keys(GENERATEURS).join(', ')}`);
    process.exit(1);
  }

  if (nb < 1 || nb > 10000) {
    console.error('❌ Le nombre de logs doit être entre 1 et 10000.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas\n');

    const collection = mongoose.connection.db.collection('logs');
    const avant = await collection.countDocuments();
    console.log(`📊 Logs en base avant : ${avant}`);

    // Générer suffix unique basé sur timestamp pour éviter les collisions log_id
    const baseSuffix = Date.now().toString(36).toUpperCase();
    const generateur = type ? GENERATEURS[type] : genererLogAleatoire;
    const label = type ? type.toUpperCase() : 'MIXTE';

    console.log(`📝 Génération de ${nb} logs (${label})...`);

    const logs = Array.from({ length: nb }, (_, i) =>
      generateur(`${baseSuffix}-${String(i + 1).padStart(5, '0')}`)
    );

    const result = await collection.insertMany(logs);
    const apres = await collection.countDocuments();

    console.log(`\n✅ ${result.insertedCount} logs ajoutés`);
    console.log('─────────────────────────────────────');
    console.log(`Logs avant : ${avant}`);
    console.log(`Logs après : ${apres}`);
    console.log(`Différence : +${apres - avant}`);

  } catch (err) {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

generate();
