// =============================================================================
// public/js/dashboard.js — Logique de la page Dashboard
// -----------------------------------------------------------------------------
// Charge :
//   - 4 KPIs (total logs, erreurs critiques, alertes actives, applications)
//   - Le tableau des 10 derniers logs
//   - Le graphique barres (distribution horaire)
//   - Le graphique donut (repartition par niveau)
//   - Le modal de detail d'un log
//   - L'AUTO-REFRESH toutes les 30 secondes
// =============================================================================

// Variables globales pour stocker les instances de graphiques (Chart.js)
// On les garde en memoire pour pouvoir les detruire avant de recreer (sinon fuites)
let chartTemporal = null;
let chartNiveaux = null;

// =============================================================================
// Palette de couleurs (synchro avec le CSS)
// =============================================================================
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

// Configuration globale de Chart.js (s'applique a tous les graphiques)
Chart.defaults.font.family = 'Inter';
Chart.defaults.color = COLORS.text;

// =============================================================================
// SECTION 1 — Point d'entree : charge TOUTES les sections du dashboard
// =============================================================================
async function loadDashboard() {
  // Promise.all = execute toutes les requetes EN PARALLELE (plus rapide que sequentiel)
  await Promise.all([
    loadKPIs(),
    loadDashboardLogs(),
    loadChartTemporal(),
    loadChartNiveaux(),
    loadInsertApps(),
  ]);
}

// =============================================================================
// SECTION 2 — KPIs (4 cartes statistiques en haut)
// =============================================================================
async function loadKPIs() {
  try {
    // Lancement parallele de 4 requetes API
    const [logsRes, alertesRes, appsRes, erreursRes] = await Promise.all([
      fetch(`${API}/logs?limit=1`),                              // pour avoir le "total"
      fetch(`${API}/alertes`),
      fetch(`${API}/applications`),
      fetch(`${API}/logs/search?level=ERROR,CRITICAL&limit=1`)   // count des erreurs
    ]);

    // Conversion des reponses en JSON
    const logs    = await logsRes.json();
    const alertes = await alertesRes.json();
    const apps    = await appsRes.json();
    const erreurs = await erreursRes.json();

    // Mise a jour des 4 KPIs avec animation de comptage
    animateNumber('kpi-total',     logs.total    || 0);
    animateNumber('kpi-critiques', erreurs.total || 0);
    // .filter(a => !a.resolue) = ne garde que les alertes NON resolues
    animateNumber('kpi-alertes',   alertes.alertes?.filter(a => !a.resolue).length || 0);
    animateNumber('kpi-apps',      apps.total    || 0);
  } catch (err) {
    console.error('Erreur KPIs:', err);
  }
}

// =============================================================================
// Animation de comptage : passe de 0 a la valeur cible en 0.8 secondes
// =============================================================================
function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const duration = 800;                                 // duree totale en ms
  const start = Date.now();
  const from = parseInt(el.textContent) || 0;           // valeur de depart

  // Fonction qui se rappelle elle-meme via requestAnimationFrame (~60fps)
  const tick = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);   // 0 -> 1
    // Easing cubic : demarre vite, ralentit a la fin (plus naturel visuellement)
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * ease).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  };
  tick();
}

// =============================================================================
// SECTION 3 — Tableau des 10 derniers logs
// =============================================================================
async function loadDashboardLogs() {
  try {
    const res  = await fetch(`${API}/logs?limit=10`);
    const data = await res.json();
    const tbody = document.getElementById('dashboard-logs-body');

    // Construction du HTML : 1 ligne <tr> par log, clic = ouvre le modal
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

// =============================================================================
// SECTION 4 — Graphique barres : distribution sur 24h
// Utilise le pipeline 3 (analytics/temporal)
// =============================================================================
async function loadChartTemporal() {
  try {
    const res  = await fetch(`${API}/analytics/temporal`);
    const data = await res.json();

    // .slice(-24) = ne garder QUE les 24 dernieres entrees
    const slice   = data.resultats.slice(-24);
    // Extraction des labels (heure) et des deux series (totaux + erreurs)
    const labels  = slice.map(r => r.heure?.split('T')[1] || r.heure);
    const totaux  = slice.map(r => r.total);
    const erreurs = slice.map(r => r.erreurs);

    // Detruire le graphique precedent pour eviter un empilement
    if (chartTemporal) chartTemporal.destroy();

    const ctx = document.getElementById('chart-temporal').getContext('2d');

    // --- Creation de deux degrades pour des barres plus jolies ---
    const gradBlue = ctx.createLinearGradient(0, 0, 0, 300);
    gradBlue.addColorStop(0, 'rgba(67,97,238,0.8)');
    gradBlue.addColorStop(1, 'rgba(67,97,238,0.2)');

    const gradRed = ctx.createLinearGradient(0, 0, 0, 300);
    gradRed.addColorStop(0, 'rgba(239,68,68,0.8)');
    gradRed.addColorStop(1, 'rgba(239,68,68,0.2)');

    // --- Construction du graphique Chart.js ---
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

// =============================================================================
// SECTION 5 — Graphique donut : repartition par niveau (DEBUG, INFO, ...)
// =============================================================================
async function loadChartNiveaux() {
  try {
    const niveaux  = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    const couleurs = [COLORS.muted, COLORS.accent, COLORS.warning, COLORS.danger, COLORS.pink];

    // 5 requetes en parallele pour compter chaque niveau
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
          // c + '99' = ajoute une opacite 60% au hex de la couleur
          backgroundColor: couleurs.map(c => c + '99'),
          borderColor: couleurs,
          borderWidth: 2,
          hoverOffset: 8,    // effet de "pop" au survol
        }]
      },
      options: {
        responsive: true,
        cutout: '68%',       // taille du trou central (donut)
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
              // Affichage personnalise : "INFO  700" au lieu de juste "INFO"
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

// =============================================================================
// SECTION 6 — Chargement du select des applications (pour le formulaire d'insertion)
// =============================================================================
async function loadInsertApps() {
  try {
    const res  = await fetch(`${API}/applications`);
    const data = await res.json();
    const select = document.getElementById('insert-app');
    if (!select) return;
    // Construit dynamiquement les <option> a partir des applications de la base
    select.innerHTML = data.applications.map(app =>
      `<option value="${app.app_id}">${app.nom}</option>`
    ).join('');
  } catch (err) {
    console.error('Erreur chargement apps:', err);
  }
}

// =============================================================================
// SECTION 7 — Modal de detail d'un log
// Affiche TOUS les champs du log, y compris les champs specifiques au type.
// =============================================================================
async function showLogDetail(id) {
  try {
    const res = await fetch(`${API}/logs/${id}`);
    const log = await res.json();

    // --- Helper pour generer un bloc "label + valeur" ---
    // mono = true affiche en police monospace (utile pour code, IP, URL...)
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

    // Bloc stack trace (uniquement pour logs Java)
    const stackTrace = log.stack_trace ? `
      <div style="margin-bottom:14px">
        <div style="font-size:11px;color:var(--muted);font-weight:600;
                    text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px">
          Stack Trace
        </div>
        <div class="stack-trace">${log.stack_trace}</div>
      </div>` : '';

    // Bloc SQL (uniquement pour logs DB)
    const sqlBlock = log.requete_sql ? `
      <div style="margin-bottom:14px">
        <div style="font-size:11px;color:var(--muted);font-weight:600;
                    text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px">
          Requête SQL
        </div>
        <div class="stack-trace" style="color:#4CC9F0">${log.requete_sql}</div>
      </div>` : '';

    // --- Assemblage du contenu du modal ---
    // On affiche conditionnellement les champs selon le type de log.
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

    // Ouvrir le modal
    document.getElementById('modal-log').classList.add('open');
  } catch (err) {
    console.error('Erreur détail log:', err);
  }
}

// =============================================================================
// SECTION 8 — AUTO-REFRESH DU DASHBOARD (toutes les 30 secondes)
// -----------------------------------------------------------------------------
// Permet de voir les nouveaux logs en temps reel sans rafraichir la page.
// L'utilisateur peut mettre en pause / reprendre le refresh.
// =============================================================================

const REFRESH_INTERVAL_MS = 30000;     // 30 secondes
let refreshTimerId    = null;          // setInterval pour le refresh des donnees
let lastRefreshTime   = Date.now();    // horodatage de la derniere mise a jour
let labelTimerId      = null;          // setInterval pour le libelle "il y a Xs"
let autoRefreshActive = true;

// Demarre le refresh automatique
function startAutoRefresh() {
  stopAutoRefresh();   // securite : arreter les anciens timers s'ils existent
  autoRefreshActive = true;

  // setInterval = execute la fonction toutes les N ms
  refreshTimerId = setInterval(() => {
    // On ne refresh QUE si on est sur la page dashboard (sinon gaspillage)
    if (document.getElementById('page-dashboard').classList.contains('active')) {
      loadDashboard();
      lastRefreshTime = Date.now();
    }
  }, REFRESH_INTERVAL_MS);

  // 2eme timer : met a jour "il y a Xs" toutes les secondes
  labelTimerId = setInterval(updateRefreshLabel, 1000);

  setRefreshUI(true);
  lastRefreshTime = Date.now();
  updateRefreshLabel();
}

// Arrete les timers
function stopAutoRefresh() {
  if (refreshTimerId) clearInterval(refreshTimerId);
  if (labelTimerId)   clearInterval(labelTimerId);
  refreshTimerId = null;
  labelTimerId   = null;
}

// Bascule pause / lecture
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

// Met a jour l'icone et le point d'etat (vert pulsant ou gris)
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

// Genere le texte "Auto-refresh actif — derniere mise a jour : il y a 12s"
function updateRefreshLabel() {
  const label = document.getElementById('refreshLabel');
  if (!label || !autoRefreshActive) return;
  const secs = Math.floor((Date.now() - lastRefreshTime) / 1000);
  const texte = secs < 5 ? "à l'instant"
              : secs < 60 ? `il y a ${secs}s`
              : `il y a ${Math.floor(secs / 60)} min`;
  label.textContent = `Auto-refresh actif — dernière mise à jour : ${texte}`;
}

// Demarrer l'auto-refresh des que la page est prete (avec 1s de delai
// pour laisser le premier loadDashboard() se faire)
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(startAutoRefresh, 1000);
});
