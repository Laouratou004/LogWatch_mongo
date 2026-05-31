// =============================================================================
// scripts/seed.js — Initialisation complete de la base de donnees
// -----------------------------------------------------------------------------
// Role : VIDE puis REMPLIT la base avec un dataset de demonstration.
//   - 10 applications (donnees fixes)
//   - 2000 logs (4 types x 500) generes avec Faker.js
//   - 65 alertes systeme
//   - Export final dans data/logs.json (livrable demande par le sujet)
//
// Lancement : node scripts/seed.js
// ATTENTION : ce script efface TOUT et recommence. Pour ajouter des logs
// sans tout effacer, utiliser plutot scripts/generate-logs.js.
// =============================================================================

// --- Imports ---
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');  // librairie de generation de fausses donnees
const fs = require('fs');                       // pour ecrire le fichier data/logs.json
const path = require('path');                   // pour construire des chemins fiables
require('dotenv').config();                     // charge MONGODB_URI depuis .env

const Application = require('../models/Application');
const Alerte = require('../models/Alerte');

// =============================================================================
// SECTION 1 — Les 10 applications surveillees (donnees fixes, codees en dur)
// =============================================================================
const applications = [
  { app_id: 'app_si_etudiant',      nom: 'Systeme Information Etudiant', version: '2.1.0', environnement: 'prod', technologie: 'Java',    responsable: 'Mamadou Diallo',   sla_pct: 99.9 },
  { app_id: 'app_scolarite',        nom: 'Portail Scolarite',            version: '1.3.2', environnement: 'prod', technologie: 'PHP',     responsable: 'Fatoumata Camara', sla_pct: 99.5 },
  { app_id: 'app_bibliotheque',     nom: 'Gestion Bibliotheque',         version: '3.0.1', environnement: 'prod', technologie: 'Python',  responsable: 'Ibrahima Sow',     sla_pct: 98.0 },
  { app_id: 'app_api_gateway',      nom: 'API Gateway UGANC',            version: '1.0.5', environnement: 'prod', technologie: 'Node.js', responsable: 'Alseny Kouyate',   sla_pct: 99.8 },
  { app_id: 'app_paiement',         nom: 'Systeme de Paiement',          version: '2.0.0', environnement: 'prod', technologie: 'Java',    responsable: 'Mariama Bah',      sla_pct: 99.9 },
  { app_id: 'app_authentification', nom: 'Service Authentification',     version: '1.1.0', environnement: 'prod', technologie: 'Node.js', responsable: 'Oumar Balde',      sla_pct: 99.7 },
  { app_id: 'WEB',                  nom: 'Portail Web UGANC',            version: '4.2.0', environnement: 'prod', technologie: 'Node.js', responsable: 'Aminata Diallo',   sla_pct: 99.7 },
  { app_id: 'SIE',                  nom: 'Systeme Information Etudiant', version: '3.5.1', environnement: 'prod', technologie: 'Java',    responsable: 'Ismael Camara',    sla_pct: 99.8 },
  { app_id: 'FW',                   nom: 'Pare-feu Reseau',              version: '1.8.4', environnement: 'prod', technologie: 'Python',  responsable: 'Salam Bah',        sla_pct: 99.9 },
  { app_id: 'MSG',                  nom: 'Messagerie Institutionnelle',  version: '2.7.0', environnement: 'prod', technologie: 'PHP',     responsable: 'Kadiatou Traore',  sla_pct: 99.6 },
];

// Liste des app_id (utilisee plus bas pour tirer une app au hasard)
const appIds = applications.map(a => a.app_id);
const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];

// =============================================================================
// SECTION 2 — Helpers (fonctions utilitaires reutilisables)
// =============================================================================

// Tire un niveau au hasard mais selon des PROBABILITES PONDEREES.
// Defaut : 15% DEBUG, 35% INFO, 20% WARN, 20% ERROR, 10% CRITICAL.
// C'est ce qui rend les donnees realistes (sinon trop de CRITICAL).
function randomLevel(weights = [15, 35, 20, 20, 10]) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return levels[i];
  }
  return 'INFO';
}

// Choisit aleatoirement une application parmi les 10
function randomAppId() {
  return faker.helpers.arrayElement(appIds);
}

// Genere une date aleatoire entre le 1er decembre 2025 et maintenant
function randomTimestamp() {
  return faker.date.between({ from: '2025-12-01', to: new Date() });
}

// =============================================================================
// SECTION 3 — Les 4 generateurs de logs (un par type)
// Chaque fonction "usine" produit UN log d'un type precis avec les champs
// specifiques a ce type (grace au schema flexible strict: false du modele).
// =============================================================================

// --- TYPE 1 : Log Java (erreur applicative) ---
function genererLogJava(index) {
  // Forcer un mix de gravites (ERROR x2 = 50% de chance car Java = surtout des erreurs)
  const level = faker.helpers.arrayElement(['ERROR', 'ERROR', 'CRITICAL', 'WARN']);
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
  const appId = faker.helpers.arrayElement(['SIE', 'app_si_etudiant', 'app_paiement', 'app_scolarite']);

  return {
    log_id: `LOG-JAVA-${String(index).padStart(6, '0')}`,    // padStart -> "LOG-JAVA-000042"
    app_id: appId,
    timestamp: randomTimestamp(),
    level,
    type_log: 'erreur',
    message: `${exception} dans ${classe}.java a la ligne ${line}`,
    source_fichier: `${classe}.java`,
    ligne_code: line,
    // --- Champs SPECIFIQUES Java (n'existent QUE dans ce type de log) ---
    exception_type: exception,
    stack_trace: `java.lang.${exception}\n\tat com.logwatch.${classe}.method(${classe}.java:${line})\n\tat org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089)`,
    nb_occurrences: faker.number.int({ min: 1, max: 50 })
  };
}

// --- TYPE 2 : Log Web (requete HTTP entrante) ---
function genererLogWeb(index) {
  // Distribution differente : peu d'erreurs serveur en realite
  const level = randomLevel([10, 40, 20, 20, 10]);
  const methodes = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const urls = [
    '/api/etudiants', '/api/inscriptions', '/api/notes', '/api/paiements',
    '/api/auth/login', '/api/bibliotheque', '/api/messages', '/admin/dashboard',
    '/api/users', '/api/reports'
  ];
  // COHERENCE : si le level est ERROR, on tire un code 5xx, sinon 2xx, etc.
  const codes = level === 'ERROR' ? [404, 500, 503] :
                level === 'WARN'  ? [400, 401, 403] :
                [200, 201, 204];
  const appId = faker.helpers.arrayElement(['WEB', 'app_api_gateway', 'app_authentification']);

  return {
    log_id: `LOG-WEB-${String(index).padStart(6, '0')}`,
    app_id: appId,
    timestamp: randomTimestamp(),
    level,
    type_log: 'web',
    message: `${faker.helpers.arrayElement(methodes)} ${faker.helpers.arrayElement(urls)} -> HTTP ${faker.helpers.arrayElement(codes)}`,
    source_fichier: 'access.log',
    ligne_code: faker.number.int({ min: 1, max: 200 }),
    // --- Champs SPECIFIQUES Web ---
    methode_http: faker.helpers.arrayElement(methodes),
    url: faker.helpers.arrayElement(urls),
    code_statut: faker.helpers.arrayElement(codes),
    duree_ms: faker.number.int({ min: 10, max: 3000 }),
    user_agent: faker.helpers.arrayElement([
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      'Mozilla/5.0 (Linux; Android 13) Mobile Chrome/120.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X) Safari/537.36',
      'PostmanRuntime/7.32.0'
    ]),
    ip_source: faker.internet.ip()
  };
}

// --- TYPE 3 : Log Securite (tentative de connexion, action sensible) ---
function genererLogSecurite(index) {
  const succes = faker.datatype.boolean();
  // Si succes -> 1 tentative. Si echec -> entre 1 et 15 tentatives.
  const tentatives = succes ? 1 : faker.number.int({ min: 1, max: 15 });
  // LOGIQUE METIER : > 5 tentatives echouees = potentielle attaque -> CRITICAL
  const level = !succes && tentatives > 5 ? 'CRITICAL' :
                !succes ? 'WARN' : 'INFO';
  const actions = ['LOGIN', 'LOGOUT', 'ADMIN_ACCESS', 'PASSWORD_CHANGE', 'TOKEN_REFRESH'];
  const appId = faker.helpers.arrayElement(['app_authentification', 'FW', 'app_si_etudiant']);

  return {
    log_id: `LOG-SEC-${String(index).padStart(6, '0')}`,
    app_id: appId,
    timestamp: randomTimestamp(),
    level,
    type_log: 'securite',
    message: `${faker.helpers.arrayElement(actions)} — ${succes ? 'succes' : 'echec'} depuis ${faker.internet.ip()}`,
    source_fichier: 'security.log',
    ligne_code: faker.number.int({ min: 1, max: 300 }),
    // --- Champs SPECIFIQUES Securite ---
    user: `user_${faker.number.int({ min: 1000, max: 9999 })}`,
    action: faker.helpers.arrayElement(actions),
    ip_source: faker.internet.ip(),
    succes,
    tentatives
  };
}

// --- TYPE 4 : Log Base de donnees (execution d'une requete SQL) ---
function genererLogDB(index) {
  const duree = faker.number.int({ min: 1, max: 5000 });
  // LOGIQUE METIER : plus c'est long, plus c'est grave
  //   > 3 sec  = CRITICAL (requete bloquante)
  //   > 1 sec  = WARN (lente)
  //   sinon    = INFO
  const level = duree > 3000 ? 'CRITICAL' :
                duree > 1000 ? 'WARN' : 'INFO';
  const queries = [
    'SELECT * FROM etudiants WHERE filiere_id = ?',
    'SELECT e.nom, n.note FROM etudiants e JOIN notes n ON e.id = n.etudiant_id',
    'INSERT INTO inscriptions (etudiant_id, cours_id, date) VALUES (?, ?, ?)',
    'UPDATE etudiants SET statut = ? WHERE id = ?',
    'DELETE FROM sessions WHERE expires_at < NOW()',
    'SELECT COUNT(*) FROM paiements WHERE status = "pending"',
    'SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC',
  ];
  const appId = faker.helpers.arrayElement(['SIE', 'app_si_etudiant', 'MSG', 'app_paiement']);

  return {
    log_id: `LOG-DB-${String(index).padStart(6, '0')}`,
    app_id: appId,
    timestamp: randomTimestamp(),
    level,
    type_log: 'base_de_donnees',
    message: `Requete executee en ${duree}ms`,
    source_fichier: 'database.log',
    ligne_code: faker.number.int({ min: 1, max: 400 }),
    // --- Champs SPECIFIQUES Base de donnees ---
    requete_sql: faker.helpers.arrayElement(queries),
    duree_ms: duree,
    nb_lignes_affectees: faker.number.int({ min: 0, max: 5000 })
  };
}

// =============================================================================
// SECTION 4 — Generateur d'alertes systeme
// =============================================================================
function genererAlertes(nb) {
  const types = ['VOLUME_ANOMALIE', 'ERREUR_CRITIQUE', 'SECURITE', 'PERFORMANCE'];
  // Array.from({ length: N }, callback) -> tableau de N elements
  return Array.from({ length: nb }, (_, i) => {
    const valeur = faker.number.int({ min: 4, max: 200 });
    const appId = faker.helpers.arrayElement(appIds);
    return {
      alerte_id: `alerte_${String(i + 1).padStart(3, '0')}`,
      app_id: appId,
      timestamp: faker.date.between({ from: '2026-01-01', to: new Date() }),
      type_alerte: faker.helpers.arrayElement(types),
      description: `Pic de logs detecte : ${valeur} logs en 5 minutes sur ${appId}`,
      seuil_declenche: 3,
      valeur_observee: valeur,
      resolue: faker.datatype.boolean(),
      // Une alerte peut etre non-assignee (null) ou assignee a un membre
      assignee_uid: faker.helpers.arrayElement([null, 'M1', 'M2', 'M3'])
    };
  });
}

// =============================================================================
// SECTION 5 — Programme principal : orchestration du seed
// =============================================================================
async function seed() {
  try {
    // --- 1. Connexion a MongoDB Atlas ---
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecte a MongoDB Atlas\n');

    // --- 2. Insertion des applications (uniquement celles qui manquent) ---
    let appsInserees = 0;
    for (const app of applications) {
      const existe = await Application.findOne({ app_id: app.app_id });
      if (!existe) { await Application.create(app); appsInserees++; }
    }
    console.log(`Applications : ${appsInserees} ajoutees (total: ${await Application.countDocuments()})`);

    // --- 3. RESET COMPLET de la collection logs ---
    await mongoose.connection.db.collection('logs').deleteMany({});
    console.log('Collection logs videe');

    // --- 4. Generation des 2000 logs en 4 lots ---
    const logsCollection = mongoose.connection.db.collection('logs');
    const BATCH = 500;  // 500 logs par type
    let total = 0;

    console.log('\nGeneration des logs...');

    // TYPE 1 — Java (500 logs)
    // Array.from(...) construit un tableau de 500 logs en appelant genererLogJava
    const java = Array.from({ length: BATCH }, (_, i) => genererLogJava(i + 1));
    await logsCollection.insertMany(java);  // insertion en masse (rapide)
    total += java.length;
    console.log(`   TYPE 1 — Erreurs Java    : ${java.length} logs`);

    // TYPE 2 — Web (500 logs)
    const web = Array.from({ length: BATCH }, (_, i) => genererLogWeb(i + 1));
    await logsCollection.insertMany(web);
    total += web.length;
    console.log(`   TYPE 2 — Logs Web        : ${web.length} logs`);

    // TYPE 3 — Securite (500 logs)
    const sec = Array.from({ length: BATCH }, (_, i) => genererLogSecurite(i + 1));
    await logsCollection.insertMany(sec);
    total += sec.length;
    console.log(`   TYPE 3 — Logs Securite   : ${sec.length} logs`);

    // TYPE 4 — Base de donnees (500 logs)
    const db = Array.from({ length: BATCH }, (_, i) => genererLogDB(i + 1));
    await logsCollection.insertMany(db);
    total += db.length;
    console.log(`   TYPE 4 — Logs DB         : ${db.length} logs`);

    // --- 5. Generation des 65 alertes ---
    await Alerte.deleteMany({});
    const alertes = genererAlertes(65);
    await Alerte.insertMany(alertes);
    console.log(`\nAlertes : ${alertes.length} inserees`);

    // --- 6. Export du dataset complet dans data/logs.json (livrable demande) ---
    const allLogs = await logsCollection.find({}).toArray();
    const filePath = path.join(__dirname, '../data/logs.json');
    fs.writeFileSync(filePath, JSON.stringify(allLogs, null, 2));
    console.log(`Export : data/logs.json (${allLogs.length} logs)`);

    // --- 7. Resume final ---
    console.log('\nSeed termine avec succes');
    console.log('-------------------------------------');
    console.log(`Applications : ${await Application.countDocuments()}`);
    console.log(`Logs         : ${await logsCollection.countDocuments()}`);
    console.log(`Alertes      : ${await Alerte.countDocuments()}`);

  } catch (err) {
    console.error('Erreur seed :', err);
  } finally {
    // Toujours fermer la connexion meme en cas d'erreur
    mongoose.connection.close();
  }
}

// Lancement immediat du seed des que le script est execute
seed();
