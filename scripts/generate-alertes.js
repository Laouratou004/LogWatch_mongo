// =============================================================================
// scripts/generate-alertes.js — Ajout incremental d'alertes systeme
// -----------------------------------------------------------------------------
// Role : AJOUTE N nouvelles alertes a la collection "alertes_systeme"
//        SANS effacer celles qui existent deja.
//
// Difference avec les alertes automatiques :
//   - Les alertes AUTO sont creees par le pipeline 4 (anomalies) ou par
//     l'insertion d'un log CRITICAL.
//   - Ce script cree des alertes MANUELLES (utile pour la demo ou les tests).
//
// Types d'alertes :
//   - VOLUME_ANOMALIE   : pic de logs detecte
//   - ERREUR_CRITIQUE   : log CRITICAL repete
//   - SECURITE          : tentative d'intrusion / brute force
//   - PERFORMANCE       : lenteur reseau ou base de donnees
//
// Usage :
//   node scripts/generate-alertes.js                    # 10 alertes (defaut)
//   node scripts/generate-alertes.js 20                 # 20 alertes
//   node scripts/generate-alertes.js 5 VOLUME_ANOMALIE  # 5 alertes volume
//   node scripts/generate-alertes.js 5 ERREUR_CRITIQUE  # 5 alertes erreurs
//   node scripts/generate-alertes.js 5 SECURITE         # 5 alertes securite
//   node scripts/generate-alertes.js 5 PERFORMANCE      # 5 alertes performance
// =============================================================================

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const Alerte = require('../models/Alerte');
const Application = require('../models/Application');

// =============================================================================
// SECTION 1 — Configuration
// =============================================================================

// Les 4 types d'alertes geres par le systeme
const TYPES_ALERTES = ['VOLUME_ANOMALIE', 'ERREUR_CRITIQUE', 'SECURITE', 'PERFORMANCE'];

// Membres de l'equipe pouvant etre assignes a une alerte (ou null = non assignee)
const ASSIGNEES = [null, 'M1', 'M2', 'M3'];

// =============================================================================
// SECTION 2 — Generateurs specifiques par type d'alerte
// Chaque type a sa propre logique de description / seuil / valeur observee.
// =============================================================================

// --- TYPE 1 : Anomalie de volume (pic de logs) ---
function genererAlerteVolume(suffix, appIds) {
  const appId = faker.helpers.arrayElement(appIds);
  const seuil = faker.helpers.arrayElement([3, 5, 10, 20, 50]);
  // Valeur observee toujours superieure au seuil (puisqu'il est depasse)
  const valeur = seuil + faker.number.int({ min: 1, max: 150 });

  return {
    alerte_id: `alerte_vol_${suffix}`,
    app_id: appId,
    timestamp: faker.date.recent({ days: 7 }),     // dans les 7 derniers jours
    type_alerte: 'VOLUME_ANOMALIE',
    description: `Pic de logs detecte : ${valeur} logs en 5 minutes sur ${appId}`,
    seuil_declenche: seuil,
    valeur_observee: valeur,
    resolue: faker.datatype.boolean({ probability: 0.4 }),   // 40% resolues
    assignee_uid: faker.helpers.arrayElement(ASSIGNEES)
  };
}

// --- TYPE 2 : Erreur critique repetee ---
function genererAlerteErreurCritique(suffix, appIds) {
  const appId = faker.helpers.arrayElement(appIds);
  const erreurs = [
    'NullPointerException', 'OutOfMemoryError', 'DatabaseConnectionFailure',
    'TimeoutException', 'StackOverflowError', 'AuthenticationFailure',
    'KafkaProducerException', 'RedisConnectionLost'
  ];
  const erreur = faker.helpers.arrayElement(erreurs);
  const occurrences = faker.number.int({ min: 5, max: 100 });

  return {
    alerte_id: `alerte_err_${suffix}`,
    app_id: appId,
    timestamp: faker.date.recent({ days: 7 }),
    type_alerte: 'ERREUR_CRITIQUE',
    description: `${erreur} repetee ${occurrences}x sur ${appId} dans les 10 dernieres minutes`,
    seuil_declenche: 5,
    valeur_observee: occurrences,
    resolue: faker.datatype.boolean({ probability: 0.3 }),
    assignee_uid: faker.helpers.arrayElement(ASSIGNEES)
  };
}

// --- TYPE 3 : Alerte de securite (brute force, intrusion) ---
function genererAlerteSecurite(suffix, appIds) {
  // Pour les alertes securite, on cible souvent les applis sensibles
  const appsSensibles = appIds.filter(id =>
    id.includes('auth') || id === 'FW' || id.includes('paiement')
  );
  const appId = appsSensibles.length > 0
    ? faker.helpers.arrayElement(appsSensibles)
    : faker.helpers.arrayElement(appIds);

  const scenarios = [
    { desc: 'Tentatives de brute force', seuil: 5 },
    { desc: 'Acces admin non autorise', seuil: 1 },
    { desc: 'Plusieurs echecs de connexion depuis IP unique', seuil: 10 },
    { desc: 'Token JWT expire utilise massivement', seuil: 20 },
    { desc: 'Tentative SQL injection detectee', seuil: 1 }
  ];
  const scenario = faker.helpers.arrayElement(scenarios);
  const ip = faker.internet.ip();
  const valeur = faker.number.int({ min: scenario.seuil + 1, max: scenario.seuil + 50 });

  return {
    alerte_id: `alerte_sec_${suffix}`,
    app_id: appId,
    timestamp: faker.date.recent({ days: 7 }),
    type_alerte: 'SECURITE',
    description: `${scenario.desc} depuis ${ip} - ${valeur} tentative(s)`,
    seuil_declenche: scenario.seuil,
    valeur_observee: valeur,
    // Les alertes securite sont moins souvent resolues (necessite enquete)
    resolue: faker.datatype.boolean({ probability: 0.2 }),
    assignee_uid: faker.helpers.arrayElement(ASSIGNEES)
  };
}

// --- TYPE 4 : Alerte de performance (lenteur) ---
function genererAlertePerformance(suffix, appIds) {
  const appId = faker.helpers.arrayElement(appIds);
  const scenarios = [
    { desc: 'Requete SQL trop lente', seuil: 1000, unite: 'ms' },
    { desc: 'Temps de reponse API degrade', seuil: 500, unite: 'ms' },
    { desc: 'CPU serveur a saturation', seuil: 80, unite: '%' },
    { desc: 'Memoire RAM proche du max', seuil: 90, unite: '%' },
    { desc: 'Pool de connexions DB epuise', seuil: 100, unite: 'connexions' }
  ];
  const scenario = faker.helpers.arrayElement(scenarios);
  const valeur = faker.number.int({
    min: scenario.seuil + 1,
    max: scenario.seuil * (scenario.unite === '%' ? 1.1 : 5)
  });

  return {
    alerte_id: `alerte_perf_${suffix}`,
    app_id: appId,
    timestamp: faker.date.recent({ days: 7 }),
    type_alerte: 'PERFORMANCE',
    description: `${scenario.desc} : ${valeur}${scenario.unite} (seuil ${scenario.seuil}${scenario.unite})`,
    seuil_declenche: scenario.seuil,
    valeur_observee: valeur,
    resolue: faker.datatype.boolean({ probability: 0.5 }),   // 50% resolues
    assignee_uid: faker.helpers.arrayElement(ASSIGNEES)
  };
}

// =============================================================================
// SECTION 3 — Routage par type
// =============================================================================
const GENERATEURS = {
  VOLUME_ANOMALIE: genererAlerteVolume,
  ERREUR_CRITIQUE: genererAlerteErreurCritique,
  SECURITE:        genererAlerteSecurite,
  PERFORMANCE:     genererAlertePerformance
};

// Si aucun type demande -> on tire au hasard parmi les 4 pour chaque alerte
function genererAlerteAleatoire(suffix, appIds) {
  const type = faker.helpers.arrayElement(TYPES_ALERTES);
  return GENERATEURS[type](suffix, appIds);
}

// =============================================================================
// SECTION 4 — Programme principal
// =============================================================================
async function generate() {

  // --- Parsing des arguments CLI ---
  const nb = parseInt(process.argv[2], 10) || 10;        // defaut : 10 alertes
  const type = process.argv[3]?.toUpperCase();           // optionnel : type force

  // --- Validation ---
  if (type && !GENERATEURS[type]) {
    console.error(`Type d'alerte invalide : "${type}"`);
    console.error(`   Types valides : ${TYPES_ALERTES.join(', ')}`);
    process.exit(1);
  }

  if (nb < 1 || nb > 500) {
    console.error('Le nombre d\'alertes doit etre entre 1 et 500.');
    process.exit(1);
  }

  try {
    // --- Connexion a MongoDB ---
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecte a MongoDB Atlas\n');

    // --- Recuperation de la liste des app_id existants ---
    // Les alertes doivent pointer vers des applications qui existent reellement.
    const apps = await Application.find({}, 'app_id');
    if (apps.length === 0) {
      console.error('Aucune application trouvee. Lancez d\'abord seed.js ou generate-applications.js');
      process.exit(1);
    }
    const appIds = apps.map(a => a.app_id);
    console.log(`Applications disponibles : ${appIds.length}`);

    // --- Etat AVANT ---
    const avant = await Alerte.countDocuments();
    console.log(`Alertes en base avant : ${avant}`);

    // --- Generation du suffix unique ---
    // Date.now() + base 36 = identifiant court et unique a chaque lancement
    const baseSuffix = Date.now().toString(36).toUpperCase();

    const generateur = type ? GENERATEURS[type] : genererAlerteAleatoire;
    const label = type || 'MIXTE';

    console.log(`Generation de ${nb} alerte(s) (${label})...`);

    // --- Construction du tableau d'alertes ---
    const alertes = Array.from({ length: nb }, (_, i) =>
      generateur(`${baseSuffix}-${String(i + 1).padStart(4, '0')}`, appIds)
    );

    // --- Insertion en masse (1 seule requete reseau) ---
    const result = await Alerte.insertMany(alertes);

    // --- Etat APRES ---
    const apres = await Alerte.countDocuments();

    // --- Resume ---
    console.log(`\n${result.length} alerte(s) ajoutee(s)`);

    // Affichage du detail par type (utile pour valider la repartition)
    const repartition = {};
    alertes.forEach(a => {
      repartition[a.type_alerte] = (repartition[a.type_alerte] || 0) + 1;
    });
    console.log('\nRepartition par type :');
    Object.entries(repartition).forEach(([t, n]) => {
      console.log(`   ${t.padEnd(20)} : ${n}`);
    });

    console.log('\n-------------------------------------');
    console.log(`Alertes avant : ${avant}`);
    console.log(`Alertes apres : ${apres}`);
    console.log(`Difference    : +${apres - avant}`);

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
