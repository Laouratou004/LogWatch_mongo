let chartTemporal = null;
let chartNiveaux = null;

// Palette de couleurs du nouveau thème
const COLORS = {
  primary:   '#4361EE',
  secondary: '#7209B7',
  accent:    '#4CC9F0',
  danger:    '#EF4444',
  warning:   '#FFD60A',
  success:   '#10B981',
  pink:      '#F72585',
  muted:     '#8E9AAF',
  grid:      'rgba(255,255,255,0.05)',
  text:      '#8E9AAF',
};

const CHART_DEFAULTS = {
  font: { family: 'Inter', size: 12 },
  color: COLORS.text,
};

Chart.defaults.font.family = 'Inter';
Chart.defaults.color = COLORS.text;

async function loadDashboard() {
  await Promise.all([
    loadKPIs(),
    loadDashboardLogs(),
    loadChartTemporal(),
    loadChartNiveaux(),
    loadInsertApps(),
  ]);
}

// ── KPIs ──
async function loadKPIs() {
  try {
    const [logsRes, alertesRes, appsRes, erreursRes] = await Promise.all([
      fetch(`${API}/logs?limit=1`),
      fetch(`${API}/alertes`),
      fetch(`${API}/applications`),
      fetch(`${API}/logs/search?level=ERROR,CRITICAL&limit=1`)
    ]);

    const logs    = await logsRes.json();
    const alertes = await alertesRes.json();
    const apps    = await appsRes.json();
    const erreurs = await erreursRes.json();

    animateNumber('kpi-total',     logs.total    || 0);
    animateNumber('kpi-critiques', erreurs.total || 0);
    animateNumber('kpi-alertes',   alertes.alertes?.filter(a => !a.resolue).length || 0);
    animateNumber('kpi-apps',      apps.total    || 0);
  } catch (err) {
    console.error('Erreur KPIs:', err);
  }
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const duration = 800;
  const start = Date.now();
  const from = parseInt(el.textContent) || 0;
  const tick = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * ease).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  };
  tick();
}

// ── Derniers logs ──
async function loadDashboardLogs() {
  try {
    const res  = await fetch(`${API}/logs?limit=10`);
    const data = await res.json();
    const tbody = document.getElementById('dashboard-logs-body');

    tbody.innerHTML = data.logs.map(log => `
      <tr onclick="showLogDetail('${log._id}')">
        <td style="color:var(--muted);font-size:12px;white-space:nowrap">
          ${formatDate(log.timestamp)}
        </td>
        <td>${badgeLevel(log.level)}</td>
        <td>
          <span style="font-size:12px;font-weight:500">${log.app_id}</span>
        </td>
        <td style="color:var(--muted);font-size:13px">
          ${log.message?.substring(0, 65)}${log.message?.length > 65 ? '…' : ''}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Erreur logs dashboard:', err);
  }
}

// ── Chart Temporal (barres) ──
async function loadChartTemporal() {
  try {
    const res  = await fetch(`${API}/analytics/temporal`);
    const data = await res.json();

    const slice   = data.resultats.slice(-24);
    const labels  = slice.map(r => r.heure?.split('T')[1] || r.heure);
    const totaux  = slice.map(r => r.total);
    const erreurs = slice.map(r => r.erreurs);

    if (chartTemporal) chartTemporal.destroy();

    const ctx = document.getElementById('chart-temporal').getContext('2d');

    // Dégradé bleu
    const gradBlue = ctx.createLinearGradient(0, 0, 0, 300);
    gradBlue.addColorStop(0, 'rgba(67,97,238,0.8)');
    gradBlue.addColorStop(1, 'rgba(67,97,238,0.2)');

    // Dégradé rouge
    const gradRed = ctx.createLinearGradient(0, 0, 0, 300);
    gradRed.addColorStop(0, 'rgba(239,68,68,0.8)');
    gradRed.addColorStop(1, 'rgba(239,68,68,0.2)');

    chartTemporal = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Total logs',
            data: totaux,
            backgroundColor: gradBlue,
            borderColor: COLORS.primary,
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'Erreurs',
            data: erreurs,
            backgroundColor: gradRed,
            borderColor: COLORS.danger,
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        animation: { duration: 800, easing: 'easeInOutQuart' },
        plugins: {
          legend: {
            labels: { color: COLORS.text, font: { family: 'Inter', size: 12 }, boxWidth: 12, borderRadius: 4 }
          },
          tooltip: {
            backgroundColor: '#151B28',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            titleFont: { family: 'Inter', weight: '600' },
            bodyFont:  { family: 'Inter' },
            padding: 12,
            cornerRadius: 10,
          }
        },
        scales: {
          x: {
            ticks: { color: COLORS.text, font: { family: 'Inter', size: 11 }, maxTicksLimit: 12 },
            grid: { color: COLORS.grid },
            border: { color: COLORS.grid }
          },
          y: {
            ticks: { color: COLORS.text, font: { family: 'Inter', size: 11 } },
            grid: { color: COLORS.grid },
            border: { color: COLORS.grid }
          }
        }
      }
    });
  } catch (err) {
    console.error('Erreur chart temporal:', err);
  }
}

// ── Chart Niveaux (donut) ──
async function loadChartNiveaux() {
  try {
    const niveaux  = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    const couleurs = [COLORS.muted, COLORS.accent, COLORS.warning, COLORS.danger, COLORS.pink];

    const counts = await Promise.all(niveaux.map(async level => {
      const r = await fetch(`${API}/logs/search?level=${level}&limit=1`);
      const d = await r.json();
      return d.total || 0;
    }));

    if (chartNiveaux) chartNiveaux.destroy();

    chartNiveaux = new Chart(document.getElementById('chart-niveaux'), {
      type: 'doughnut',
      data: {
        labels: niveaux,
        datasets: [{
          data: counts,
          backgroundColor: couleurs.map(c => c + '99'),
          borderColor: couleurs,
          borderWidth: 2,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        cutout: '68%',
        animation: { duration: 800, easing: 'easeInOutQuart' },
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: COLORS.text,
              font: { family: 'Inter', size: 12 },
              boxWidth: 12,
              borderRadius: 4,
              padding: 12,
              generateLabels: chart => {
                const data = chart.data;
                return data.labels.map((label, i) => ({
                  text: `${label}  ${counts[i].toLocaleString()}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 2,
                  index: i
                }));
              }
            }
          },
          tooltip: {
            backgroundColor: '#151B28',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            titleFont: { family: 'Inter', weight: '600' },
            bodyFont:  { family: 'Inter' },
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: ctx => ` ${ctx.label} : ${ctx.parsed.toLocaleString()} logs`
            }
          }
        }
      }
    });
  } catch (err) {
    console.error('Erreur chart niveaux:', err);
  }
}

// ── Select apps pour insertion ──
async function loadInsertApps() {
  try {
    const res  = await fetch(`${API}/applications`);
    const data = await res.json();
    const select = document.getElementById('insert-app');
    if (!select) return;
    select.innerHTML = data.applications.map(app =>
      `<option value="${app.app_id}">${app.nom}</option>`
    ).join('');
  } catch (err) {
    console.error('Erreur chargement apps:', err);
  }
}

// ── Détail log (modal) ──
async function showLogDetail(id) {
  try {
    const res = await fetch(`${API}/logs/${id}`);
    const log = await res.json();

    const field = (label, value, mono = false) => value ? `
      <div style="margin-bottom:14px">
        <div style="font-size:11px;color:var(--muted);font-weight:600;
                    text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px">
          ${label}
        </div>
        <div style="font-size:13px;${mono ? 'font-family:monospace' : ''}">
          ${value}
        </div>
      </div>` : '';

    const stackTrace = log.stack_trace ? `
      <div style="margin-bottom:14px">
        <div style="font-size:11px;color:var(--muted);font-weight:600;
                    text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px">
          Stack Trace
        </div>
        <div class="stack-trace">${log.stack_trace}</div>
      </div>` : '';

    const sqlBlock = log.requete_sql ? `
      <div style="margin-bottom:14px">
        <div style="font-size:11px;color:var(--muted);font-weight:600;
                    text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px">
          Requête SQL
        </div>
        <div class="stack-trace" style="color:#4CC9F0">${log.requete_sql}</div>
      </div>` : '';

    document.getElementById('modal-log-content').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        ${field('Timestamp',     formatDate(log.timestamp))}
        ${field('Niveau',        badgeLevel(log.level))}
        ${field('Application',   log.app_id)}
        ${field('Type',          log.type_log || '—')}
        ${field('Source',        log.source_fichier)}
        ${field('Ligne',         log.ligne_code)}
      </div>
      ${field('Message', `<span style="color:var(--muted)">${log.message}</span>`)}
      ${log.exception_type ? field('Exception', `<span style="color:var(--danger)">${log.exception_type}</span>`) : ''}
      ${log.nb_occurrences ? field('Occurrences', log.nb_occurrences) : ''}
      ${stackTrace}
      ${log.methode_http ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        ${field('Méthode', log.methode_http, true)}
        ${field('Statut',  log.code_statut)}
        ${field('URL',     log.url, true)}
        ${field('Durée',   log.duree_ms + ' ms')}
        ${field('IP',      log.ip_source, true)}
        ${field('Agent',   log.user_agent)}
      </div>` : ''}
      ${log.user ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        ${field('Utilisateur', log.user, true)}
        ${field('Action',      log.action)}
        ${field('IP',          log.ip_source, true)}
        ${field('Succès',      log.succes ? '✓ Oui' : '✕ Non')}
        ${field('Tentatives',  log.tentatives)}
      </div>` : ''}
      ${sqlBlock}
      ${log.nb_lignes_affectees !== undefined ? field('Lignes affectées', log.nb_lignes_affectees) : ''}
    `;

    document.getElementById('modal-log').classList.add('open');
  } catch (err) {
    console.error('Erreur détail log:', err);
  }
}

// ══════════════════════════════════════
// AUTO-REFRESH DU DASHBOARD
// ══════════════════════════════════════
const REFRESH_INTERVAL_MS = 30000;     // 30 secondes
let refreshTimerId    = null;          // setInterval pour le refresh des données
let lastRefreshTime   = Date.now();    // horodatage de la dernière mise à jour
let labelTimerId      = null;          // setInterval pour le libellé "il y a Xs"
let autoRefreshActive = true;

function startAutoRefresh() {
  stopAutoRefresh();
  autoRefreshActive = true;

  // Refresh des données toutes les 30s
  refreshTimerId = setInterval(() => {
    if (document.getElementById('page-dashboard').classList.contains('active')) {
      loadDashboard();
      lastRefreshTime = Date.now();
    }
  }, REFRESH_INTERVAL_MS);

  // Mise à jour du libellé "il y a Xs" toutes les secondes
  labelTimerId = setInterval(updateRefreshLabel, 1000);

  setRefreshUI(true);
  lastRefreshTime = Date.now();
  updateRefreshLabel();
}

function stopAutoRefresh() {
  if (refreshTimerId) clearInterval(refreshTimerId);
  if (labelTimerId)   clearInterval(labelTimerId);
  refreshTimerId = null;
  labelTimerId   = null;
}

function toggleAutoRefresh() {
  if (autoRefreshActive) {
    stopAutoRefresh();
    autoRefreshActive = false;
    setRefreshUI(false);
    const label = document.getElementById('refreshLabel');
    if (label) label.textContent = 'Auto-refresh en pause';
  } else {
    loadDashboard();
    startAutoRefresh();
  }
}

function setRefreshUI(active) {
  const dot  = document.getElementById('refreshDot');
  const icon = document.getElementById('refreshIcon');
  if (!dot || !icon) return;
  if (active) {
    dot.classList.remove('paused');
    icon.className = 'ph-fill ph-pause';
  } else {
    dot.classList.add('paused');
    icon.className = 'ph-fill ph-play';
  }
}

function updateRefreshLabel() {
  const label = document.getElementById('refreshLabel');
  if (!label || !autoRefreshActive) return;
  const secs = Math.floor((Date.now() - lastRefreshTime) / 1000);
  const texte = secs < 5 ? "à l'instant"
              : secs < 60 ? `il y a ${secs}s`
              : `il y a ${Math.floor(secs / 60)} min`;
  label.textContent = `Auto-refresh actif — dernière mise à jour : ${texte}`;
}

// Démarrer le refresh dès que le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  // Petit délai pour laisser le premier loadDashboard() se faire
  setTimeout(startAutoRefresh, 1000);
});
