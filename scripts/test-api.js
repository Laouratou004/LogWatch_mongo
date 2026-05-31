// =============================================================================
// scripts/test-api.js — Suite de tests automatises de l'API REST
// -----------------------------------------------------------------------------
// Role : appelle CHAQUE route de l'API et verifie qu'elle repond OK.
// PREREQUIS : le serveur doit etre demarre (npm run dev) avant de lancer.
//
// Usage : node scripts/test-api.js
// Resultat attendu : 26/26 tests OK
// =============================================================================

const BASE_URL = 'http://localhost:3000/api';

// =============================================================================
// Fonction utilitaire : execute UN test et affiche le resultat
// =============================================================================
async function test(nom, url, options = {}) {
  try {
    // fetch() est dispo nativement dans Node 18+
    const res = await fetch(url, options);
    const data = await res.json();

    // Code HTTP < 400 = succes (2xx ou 3xx), sinon erreur
    const ok = res.status < 400;
    console.log(`${ok ? '[OK]' : '[KO]'} [${res.status}] ${nom}`);

    // On renvoie les donnees pour pouvoir les reutiliser (ex: recuperer un id)
    return data;
  } catch (err) {
    console.log(`[KO] ERREUR ${nom} :`, err.message);
  }
}

// =============================================================================
// Suite principale : execute tous les tests dans l'ordre
// =============================================================================
async function runTests() {
  console.log('\nDemarrage des tests API LogWatch\n');
  console.log('=======================================');

  // -------------------------------------------------------------------------
  // CATEGORIE 1 : LOGS (13 tests)
  // -------------------------------------------------------------------------
  console.log('\nLOGS');

  // GET de base + recuperation d'un id pour le test suivant
  const logs = await test('GET tous les logs', `${BASE_URL}/logs`);
  const logId = logs?.logs?.[0]?._id?.toString();   // optional chaining pour eviter les crashs

  await test('GET logs pagines (page=1&limit=5)', `${BASE_URL}/logs?page=1&limit=5`);

  // Test GET par id si disponible
  if (logId) {
    await test('GET log par ID', `${BASE_URL}/logs/${logId}`);
  } else {
    console.log('[!]  Pas d\'ID disponible pour GET log par ID');
  }

  // --- Tests des filtres $exists (un par type de log) ---
  await test('GET java-errors ($exists: stack_trace)', `${BASE_URL}/logs/java-errors`);
  await test('GET web ($exists: methode_http)', `${BASE_URL}/logs/web`);
  await test('GET security ($exists: user)', `${BASE_URL}/logs/security`);
  await test('GET slow-db ($exists: requete_sql)', `${BASE_URL}/logs/slow-db`);

  // --- Tests de recherche avancee (operateurs Mongo) ---
  await test('GET search $regex (q=Exception)', `${BASE_URL}/logs/search?q=Exception`);
  await test('GET search $in (level=ERROR,CRITICAL)', `${BASE_URL}/logs/search?level=ERROR,CRITICAL`);
  await test('GET search combine ($regex + $in)', `${BASE_URL}/logs/search?q=Exception&level=ERROR`);
  await test('GET search app_id $in', `${BASE_URL}/logs/search?app_id=SIE,WEB`);

  // --- Test POST (creation) ---
  // On envoie un log de test, on recupere son id puis on le supprime
  const nouveauLog = await test('POST nouveau log', `${BASE_URL}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      log_id: `LOG-TEST-${Date.now()}`,    // unique grace au timestamp
      app_id: 'app_si_etudiant',
      level: 'ERROR',
      message: 'Test insertion temps reel',
      source_fichier: 'TestService.java',
      ligne_code: 42
    })
  });

  // --- Test DELETE (suppression du log de test) ---
  const newLogId = nouveauLog?._id;
  if (newLogId) {
    await test('DELETE log de test', `${BASE_URL}/logs/${newLogId}`, { method: 'DELETE' });
  } else {
    console.log('[!]  Pas d\'ID disponible pour DELETE log de test');
  }

  // -------------------------------------------------------------------------
  // CATEGORIE 2 : APPLICATIONS (4 tests CRUD)
  // -------------------------------------------------------------------------
  console.log('\nAPPLICATIONS');
  await test('GET toutes les applications', `${BASE_URL}/applications`);

  // Creation d'une appli de test
  const newApp = await test('POST nouvelle application', `${BASE_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: `app_test_${Date.now()}`,
      nom: 'Application Test',
      version: '1.0.0',
      environnement: 'dev',
      technologie: 'Node.js',
      responsable: 'Test User',
      sla_pct: 99.0
    })
  });

  const newAppId = newApp?._id;
  if (newAppId) {
    // PUT (modification de la version)
    await test('PUT mise a jour application', `${BASE_URL}/applications/${newAppId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: '2.0.0' })
    });
    // DELETE (nettoyage)
    await test('DELETE application test', `${BASE_URL}/applications/${newAppId}`, {
      method: 'DELETE'
    });
  } else {
    console.log('[!]  Pas d\'ID disponible pour PUT/DELETE application');
  }

  // -------------------------------------------------------------------------
  // CATEGORIE 3 : ALERTES (2 tests)
  // -------------------------------------------------------------------------
  console.log('\nALERTES');
  const alertes = await test('GET toutes les alertes', `${BASE_URL}/alertes`);
  const alerteId = alertes?.alertes?.[0]?._id;

  if (alerteId) {
    await test('PUT resoudre alerte', `${BASE_URL}/alertes/${alerteId}/resoudre`, { method: 'PUT' });
  } else {
    console.log('[!]  Pas d\'ID disponible pour PUT resoudre alerte');
  }

  // -------------------------------------------------------------------------
  // CATEGORIE 4 : ANALYTICS (5 tests = les 4 pipelines + performance)
  // -------------------------------------------------------------------------
  console.log('\nANALYTICS');
  await test('GET performance index (IXSCAN)', `${BASE_URL}/analytics/performance`);
  await test('GET pipeline 1 — taux erreur par app', `${BASE_URL}/analytics/error-rate`);
  await test('GET pipeline 2 — top 10 erreurs', `${BASE_URL}/analytics/top-errors`);
  await test('GET pipeline 3 — distribution temporelle', `${BASE_URL}/analytics/temporal`);
  await test('GET pipeline 4 — detection anomalies', `${BASE_URL}/analytics/anomalies`);

  // -------------------------------------------------------------------------
  // CATEGORIE 5 : AUDIT (2 tests)
  // -------------------------------------------------------------------------
  console.log('\nAUDIT');
  await test('GET top IPs suspectes', `${BASE_URL}/audit/top-ips`);
  await test('GET utilisateurs suspects', `${BASE_URL}/audit/users`);

  // -------------------------------------------------------------------------
  // Fin
  // -------------------------------------------------------------------------
  console.log('\n=======================================');
  console.log('Tests termines\n');
}

// Lancement de la suite
runTests();
