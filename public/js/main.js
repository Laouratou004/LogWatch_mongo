const API = 'http://localhost:3000/api';

// ── Sidebar Toggle ──
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
  localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
}

// ── Bascule thème clair / sombre ──
function applyTheme(theme) {
  const icon = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (icon)  icon.className = 'ph-fill ph-sun';
    if (label) label.textContent = 'Mode clair';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (icon)  icon.className = 'ph-fill ph-moon';
    if (label) label.textContent = 'Mode sombre';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem('theme', next);
}

// Restaurer l'état de la sidebar et du thème
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  if (localStorage.getItem('sidebar-collapsed') === 'true') {
    sidebar.classList.add('collapsed');
  }
  applyTheme(localStorage.getItem('theme') || 'dark');
  updateDate();
  updateInsertForm();
  loadDashboard();
});

// ── Date temps réel ──
function updateDate() {
  const el = document.getElementById('current-date');
  const now = new Date();
  el.textContent = now.toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

// ── Navigation ──
const pageConfig = {
  dashboard:    { title: 'Dashboard',       sub: 'Vue temps réel de l\'infrastructure UGANC' },
  logs:         { title: 'Logs',            sub: 'Recherche et consultation des logs' },
  analytique:   { title: 'Analytique',      sub: 'Pipelines d\'agrégation MongoDB' },
  audit:        { title: 'Audit Sécurité',  sub: 'Surveillance des accès et tentatives suspectes' },
  applications: { title: 'Applications',    sub: 'Gestion des sources de logs surveillées' },
};

function showPage(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  if (el) el.classList.add('active');

  const config = pageConfig[page];
  if (config) {
    document.getElementById('topbar-title').textContent = config.title;
    document.getElementById('topbar-sub').textContent = config.sub;
  }

  if (page === 'dashboard')    loadDashboard();
  if (page === 'logs')         loadLogs();
  if (page === 'analytique')   loadAnalytique();
  if (page === 'audit')        loadAudit();
  if (page === 'applications') loadApplications();
}

// ── Notification ──
function notify(message, type = 'success') {
  const n = document.getElementById('notification');
  const icon = type === 'success' ? '✓' : '✕';
  n.innerHTML = `<span>${icon}</span> ${message}`;
  n.className = `notification ${type} show`;
  setTimeout(() => n.classList.remove('show'), 3500);
}

// ── Modal ──
function closeModal() {
  document.getElementById('modal-log').classList.remove('open');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modal-log')) closeModal();
}

// ── Formatters ──
function formatDate(ts) {
  return new Date(ts).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function badgeLevel(level) {
  return `<span class="badge badge-${level}">${level}</span>`;
}

// ── Champs dynamiques insertion ──
function updateInsertForm() {
  const type = document.getElementById('insert-type')?.value;
  const container = document.getElementById('insert-dynamic-fields');
  if (!container) return;

  const fields = {
    erreur: `
      <div class="form-group">
        <label>Type d'exception</label>
        <input type="text" id="f-exception_type" placeholder="ex: NullPointerException">
      </div>
      <div class="form-group">
        <label>Stack Trace</label>
        <textarea id="f-stack_trace" rows="5"
          placeholder="java.lang.NullPointerException&#10;  at com.uganc.Service.method(Service.java:42)"></textarea>
      </div>
      <div class="form-group">
        <label>Nb occurrences</label>
        <input type="number" id="f-nb_occurrences" value="1" min="1">
      </div>`,

    web: `
      <div class="form-group">
        <label>Méthode HTTP</label>
        <select id="f-methode_http">
          <option>GET</option><option>POST</option>
          <option>PUT</option><option>DELETE</option>
        </select>
      </div>
      <div class="form-group">
        <label>URL</label>
        <input type="text" id="f-url" placeholder="/api/etudiants">
      </div>
      <div class="form-group">
        <label>Code statut</label>
        <input type="number" id="f-code_statut" value="200">
      </div>
      <div class="form-group">
        <label>Durée (ms)</label>
        <input type="number" id="f-duree_ms" value="120">
      </div>`,

    securite: `
      <div class="form-group">
        <label>Utilisateur</label>
        <input type="text" id="f-user" placeholder="admin_test">
      </div>
      <div class="form-group">
        <label>Action</label>
        <select id="f-action">
          <option>LOGIN</option><option>LOGOUT</option>
          <option>ADMIN_ACCESS</option><option>PASSWORD_CHANGE</option>
        </select>
      </div>
      <div class="form-group">
        <label>IP Source</label>
        <input type="text" id="f-ip_source" placeholder="192.168.1.1">
      </div>
      <div class="form-group">
        <label>Succès</label>
        <select id="f-succes">
          <option value="true">✓ Oui</option>
          <option value="false">✕ Non</option>
        </select>
      </div>
      <div class="form-group">
        <label>Tentatives</label>
        <input type="number" id="f-tentatives" value="1" min="1">
      </div>`,

    base_de_donnees: `
      <div class="form-group">
        <label>Requête SQL</label>
        <textarea id="f-requete_sql" rows="4"
          placeholder="SELECT * FROM etudiants WHERE..."></textarea>
      </div>
      <div class="form-group">
        <label>Durée (ms)</label>
        <input type="number" id="f-duree_ms" value="500">
      </div>
      <div class="form-group">
        <label>Nb lignes affectées</label>
        <input type="number" id="f-nb_lignes_affectees" value="1">
      </div>`
  };

  container.innerHTML = fields[type] || '';
}

// ── Insertion log ──
async function insertLog() {
  const type    = document.getElementById('insert-type').value;
  const app_id  = document.getElementById('insert-app').value;
  const level   = document.getElementById('insert-level').value;
  const message = document.getElementById('insert-message').value.trim();

  if (!message) return notify('Le message est obligatoire', 'error');

  const get = id => document.getElementById(id)?.value;

  const log = {
    log_id: `LOG-RT-${Date.now()}`,
    app_id, level, message,
    type_log: type,
    source_fichier: type === 'erreur' ? 'ManualInsert.java' : `${type}.log`,
    ligne_code: Math.floor(Math.random() * 500) + 1,
    timestamp: new Date()
  };

  if (type === 'erreur') {
    log.exception_type  = get('f-exception_type');
    log.stack_trace     = get('f-stack_trace');
    log.nb_occurrences  = parseInt(get('f-nb_occurrences')) || 1;
  } else if (type === 'web') {
    log.methode_http = get('f-methode_http');
    log.url          = get('f-url');
    log.code_statut  = parseInt(get('f-code_statut')) || 200;
    log.duree_ms     = parseInt(get('f-duree_ms')) || 0;
    log.user_agent   = 'LogWatch Manual Insert';
    log.ip_source    = '127.0.0.1';
  } else if (type === 'securite') {
    log.user       = get('f-user');
    log.action     = get('f-action');
    log.ip_source  = get('f-ip_source');
    log.succes     = get('f-succes') === 'true';
    log.tentatives = parseInt(get('f-tentatives')) || 1;
  } else if (type === 'base_de_donnees') {
    log.requete_sql          = get('f-requete_sql');
    log.duree_ms             = parseInt(get('f-duree_ms')) || 0;
    log.nb_lignes_affectees  = parseInt(get('f-nb_lignes_affectees')) || 0;
  }

  try {
    const res = await fetch(`${API}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });

    if (res.ok) {
      notify('✓ Log inséré avec succès !');
      document.getElementById('insert-message').value = '';
      loadDashboard();
    } else {
      notify('Erreur lors de l\'insertion', 'error');
    }
  } catch {
    notify('Erreur réseau', 'error');
  }
}