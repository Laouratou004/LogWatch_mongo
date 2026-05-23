async function loadApplications() {
  await loadAppsTable();
}

async function loadAppsTable() {
  try {
    const [appsRes, errorRateRes] = await Promise.all([
      fetch(`${API}/applications`),
      fetch(`${API}/analytics/error-rate`)
    ]);

    const appsData = await appsRes.json();
    const errorData = await errorRateRes.json();

    // Créer un map taux d'erreur par app_id
    const tauxMap = {};
    errorData.resultats.forEach(r => {
      tauxMap[r.app_id] = r.taux_erreur_pct;
    });

    const tbody = document.getElementById('applications-body');

    tbody.innerHTML = appsData.applications.map(app => {
      const taux = tauxMap[app.app_id] ?? '—';
      const tauxColor = taux > 30 ? 'var(--danger)' :
                        taux > 15 ? 'var(--warning)' :
                        'var(--success)';
      const tauxBg = taux > 30 ? 'rgba(239, 68, 68, 0.15)' :
                     taux > 15 ? 'rgba(255, 214, 10, 0.15)' :
                     'rgba(6, 214, 160, 0.15)';

      const techSpecs = {
        'Java': { color: '#f89820', bg: 'rgba(248, 152, 32, 0.15)' },
        'Node.js': { color: '#06D6A0', bg: 'rgba(6, 214, 160, 0.15)' },
        'Python': { color: '#3572a5', bg: 'rgba(53, 114, 165, 0.15)' },
        'PHP': { color: '#9061F9', bg: 'rgba(144, 97, 249, 0.15)' }
      };

      const tech = techSpecs[app.technologie] || { color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.05)' };

      const envBadge = {
        'prod': '<span class="badge" style="background:rgba(6, 214, 160, 0.15);color:var(--success)">prod</span>',
        'dev': '<span class="badge" style="background:rgba(76, 201, 240, 0.15);color:var(--info)">dev</span>',
        'test': '<span class="badge" style="background:rgba(255, 214, 10, 0.15);color:var(--warning)">test</span>'
      };

      return `
        <tr>
          <td>
            <div style="font-weight:700; color:white;">${app.nom}</div>
            <div style="color:var(--text-muted);font-size:11px;margin-top:2px;">${app.app_id}</div>
          </td>
          <td>
            <span class="badge" style="color:${tech.color}; background:${tech.bg}; font-weight:700;">
              ${app.technologie}
            </span>
          </td>
          <td>${envBadge[app.environnement] || app.environnement}</td>
          <td style="font-family:monospace;font-size:12px;font-weight:600;color:var(--text-muted);">v${app.version}</td>
          <td style="color:#e2e8f0; font-weight:500;">${app.responsable}</td>
          <td>
            <span style="color:var(--success); font-weight:700; background:rgba(6, 214, 160, 0.1); padding:2px 8px; border-radius:6px;">
              ${app.sla_pct}%
            </span>
          </td>
          <td>
            <span class="badge" style="color:${tauxColor}; background:${tauxBg}; font-weight:700;">
              ${taux !== '—' ? taux + '%' : '—'}
            </span>
          </td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Erreur applications:', err);
  }
}