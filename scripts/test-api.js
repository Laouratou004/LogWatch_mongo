const BASE_URL = 'http://localhost:3000/api';

async function test(nom, url, options = {}) {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    const ok = res.status < 400;
    console.log(`${ok ? '✅' : '❌'} [${res.status}] ${nom}`);
    return data;
  } catch (err) {
    console.log(`❌ ERREUR ${nom} :`, err.message);
  }
}

async function runTests() {
  console.log('\n🚀 Démarrage des tests API LogWatch\n');
  console.log('═══════════════════════════════════════');

  // ── LOGS ──
  console.log('\n📁 LOGS');
  const logs = await test('GET tous les logs', `${BASE_URL}/logs`);
  const logId = logs?.logs?.[0]?._id?.toString();


  await test('GET logs paginés (page=1&limit=5)', `${BASE_URL}/logs?page=1&limit=5`);

  if (logId) {
    await test('GET log par ID', `${BASE_URL}/logs/${logId}`);
  } else {
    console.log('⚠️  Pas d\'ID disponible pour GET log par ID');
  }

  await test('GET java-errors ($exists: stack_trace)', `${BASE_URL}/logs/java-errors`);
  await test('GET web ($exists: methode_http)', `${BASE_URL}/logs/web`);
  await test('GET security ($exists: user)', `${BASE_URL}/logs/security`);
  await test('GET slow-db ($exists: requete_sql)', `${BASE_URL}/logs/slow-db`);
  await test('GET search $regex (q=Exception)', `${BASE_URL}/logs/search?q=Exception`);
  await test('GET search $in (level=ERROR,CRITICAL)', `${BASE_URL}/logs/search?level=ERROR,CRITICAL`);
  await test('GET search combiné ($regex + $in)', `${BASE_URL}/logs/search?q=Exception&level=ERROR`);
  await test('GET search app_id $in', `${BASE_URL}/logs/search?app_id=SIE,WEB`);

  const nouveauLog = await test('POST nouveau log', `${BASE_URL}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      log_id: `LOG-TEST-${Date.now()}`,
      app_id: 'app_si_etudiant',
      level: 'ERROR',
      message: 'Test insertion temps réel',
      source_fichier: 'TestService.java',
      ligne_code: 42
    })
  });

  const newLogId = nouveauLog?._id;
  if (newLogId) {
    await test('DELETE log de test', `${BASE_URL}/logs/${newLogId}`, { method: 'DELETE' });
  } else {
    console.log('⚠️  Pas d\'ID disponible pour DELETE log de test');
  }

  // ── APPLICATIONS ──
  console.log('\n📁 APPLICATIONS');
  await test('GET toutes les applications', `${BASE_URL}/applications`);

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
    await test('PUT mise à jour application', `${BASE_URL}/applications/${newAppId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: '2.0.0' })
    });
    await test('DELETE application test', `${BASE_URL}/applications/${newAppId}`, {
      method: 'DELETE'
    });
  } else {
    console.log('⚠️  Pas d\'ID disponible pour PUT/DELETE application');
  }

  // ── ALERTES ──
  console.log('\n📁 ALERTES');
  const alertes = await test('GET toutes les alertes', `${BASE_URL}/alertes`);
  const alerteId = alertes?.alertes?.[0]?._id;

  if (alerteId) {
    await test('PUT résoudre alerte', `${BASE_URL}/alertes/${alerteId}/resoudre`, { method: 'PUT' });
  } else {
    console.log('⚠️  Pas d\'ID disponible pour PUT résoudre alerte');
  }

  // ── ANALYTICS ──
  console.log('\n📁 ANALYTICS');
  await test('GET performance index (IXSCAN)', `${BASE_URL}/analytics/performance`);
  await test('GET pipeline 1 — taux erreur par app', `${BASE_URL}/analytics/error-rate`);
  await test('GET pipeline 2 — top 10 erreurs', `${BASE_URL}/analytics/top-errors`);
  await test('GET pipeline 3 — distribution temporelle', `${BASE_URL}/analytics/temporal`);
  await test('GET pipeline 4 — détection anomalies', `${BASE_URL}/analytics/anomalies`);

  // ── AUDIT ──
  console.log('\n📁 AUDIT');
  await test('GET top IPs suspectes', `${BASE_URL}/audit/top-ips`);
  await test('GET utilisateurs suspects', `${BASE_URL}/audit/users`);

  console.log('\n═══════════════════════════════════════');
  console.log('✅ Tests terminés\n');
}

runTests();