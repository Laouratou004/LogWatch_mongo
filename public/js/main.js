// =============================================================================
// public/js/main.js — Coeur du frontend LogWatch
// -----------------------------------------------------------------------------
// Ce fichier gere :
//   - L'URL de base de l'API
//   - La sidebar (ouvrir/fermer + memoire localStorage)
//   - Le theme clair/sombre (avec persistance)
//   - La navigation entre les 5 pages
//   - Les notifications (toast en haut a droite)
//   - Le modal de detail d'un log
//   - Le formulaire d'insertion temps reel (avec champs DYNAMIQUES selon le type)
// =============================================================================

// URL de base de l'API. "/api" car le frontend est servi sur le meme serveur.
const API = '/api';

// =============================================================================
// SECTION 1 — Sidebar (barre laterale gauche)
// =============================================================================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  // toggle = ajoute la classe si elle n'est pas la, l'enleve sinon
  sidebar.classList.toggle('collapsed');
  // localStorage = stockage navigateur persistant (survit aux rechargements)
  localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
}

// =============================================================================
// SECTION 2 — Theme clair / sombre
// =============================================================================

// Applique un theme en modifiant l'attribut data-theme sur <html>
// Le CSS utilise cet attribut pour basculer entre les deux palettes.
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

// Bascule entre clair et sombre, et sauvegarde le choix
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem('theme', next);
}

// =============================================================================
// SECTION 3 — Initialisation au chargement de la page
// =============================================================================
// DOMContentLoaded = evenement declenche quand le HTML est entierement charge
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');

  // Restaurer l'etat de la sidebar (ouverte / fermee)
  if (localStorage.getItem('sidebar-collapsed') === 'true') {
    sidebar.classList.add('collapsed');
  }

  // Restaurer le theme sauvegarde, sinon mode sombre par defaut
  applyTheme(localStorage.getItem('theme') || 'dark');

  updateDate();          // affiche la date du jour dans le header
  updateInsertForm();    // prepare les champs dynamiques du formulaire d'insertion
  loadDashboard();       // charge la page dashboard (KPIs, graphiques, derniers logs)
});

// =============================================================================
// SECTION 4 — Affichage de la date du jour (formate en francais)
// =============================================================================
function updateDate() {
  const el = document.getElementById('current-date');
  const now = new Date();
  // toLocaleDateString avec options -> "ven. 31 mai 2026"
  el.textContent = now.toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

// =============================================================================
// SECTION 5 — Navigation entre les 5 pages
// =============================================================================

// Configuration des titres et sous-titres pour chaque page
const pageConfig = {
  dashboard:    { title: 'Dashboard',       sub: 'Vue temps réel de l\'infrastructure UGANC' },
  logs:         { title: 'Logs',            sub: 'Recherche et consultation des logs' },
  analytique:   { title: 'Analytique',      sub: 'Pipelines d\'agrégation MongoDB' },
  audit:        { title: 'Audit Sécurité',  sub: 'Surveillance des accès et tentatives suspectes' },
  applications: { title: 'Applications',    sub: 'Gestion des sources de logs surveillées' },
};

// Affiche la page demandee (cachee les autres) + met a jour le titre
function showPage(page, el) {
  // 1. Cacher toutes les pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // 2. Desactiver tous les liens de menu
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  // 3. Afficher la page choisie
  document.getElementById(`page-${page}`).classList.add('active');
  // 4. Marquer le lien de menu courant comme actif
  if (el) el.classList.add('active');

  // 5. Mettre a jour le titre du topbar
  const config = pageConfig[page];
  if (config) {
    document.getElementById('topbar-title').textContent = config.title;
    document.getElementById('topbar-sub').textContent = config.sub;
  }

  // 6. Charger les donnees specifiques a chaque page
  if (page === 'dashboard')    loadDashboard();
  if (page === 'logs')         loadLogs();
  if (page === 'analytique')   loadAnalytique();
  if (page === 'audit')        loadAudit();
  if (page === 'applications') loadApplications();
}

// =============================================================================
// SECTION 6 — Notifications (toast en haut a droite)
// =============================================================================
function notify(message, type = 'success') {
  const n = document.getElementById('notification');
  const icon = type === 'success' ? '✓' : '✕';
  n.innerHTML = `<span>${icon}</span> ${message}`;
  n.className = `notification ${type} show`;
  // Disparait apres 3.5 secondes
  setTimeout(() => n.classList.remove('show'), 3500);
}

// =============================================================================
// SECTION 7 — Modal de detail d'un log
// =============================================================================
function closeModal() {
  document.getElementById('modal-log').classList.remove('open');
}

// Ferme le modal si on clique HORS de son contenu (sur le fond noir)
function closeModalOutside(e) {
  if (e.target === document.getElementById('modal-log')) closeModal();
}

// =============================================================================
// SECTION 8 — Helpers de formatage (utilises par toutes les pages)
// =============================================================================

// Formate une date ISO en "31/05/2026 14:32"
function formatDate(ts) {
  return new Date(ts).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// Genere un badge colore pour le niveau (DEBUG, INFO, WARN, ERROR, CRITICAL)
// Les couleurs sont definies en CSS via les classes badge-DEBUG, badge-INFO...
function badgeLevel(level) {
  return `<span class="badge badge-${level}">${level}</span>`;
}

// =============================================================================
// SECTION 9 — Formulaire d'insertion : CHAMPS DYNAMIQUES
// -----------------------------------------------------------------------------
// L'utilisateur choisit un TYPE (Erreur / Web / Securite / DB) dans un select.
// Selon le choix, on injecte des champs HTML DIFFERENTS dans le formulaire.
// C'est la demonstration cote frontend du schema flexible NoSQL.
// =============================================================================
function updateInsertForm() {
  const type = document.getElementById('insert-type')?.value;
  const container = document.getElementById('insert-dynamic-fields');
  if (!container) return;

  // Dictionnaire : a chaque type, on associe le HTML des champs specifiques
  const fields = {
    // --- Type "erreur" (Java) ---
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

    // --- Type "web" ---
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

    // --- Type "securite" ---
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

    // --- Type "base_de_donnees" ---
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

  // Injection du HTML correspondant au type choisi
  container.innerHTML = fields[type] || '';
}

// =============================================================================
// SECTION 10 — Insertion temps reel d'un log
// -----------------------------------------------------------------------------
// Recupere les valeurs du formulaire, construit un objet Log avec les bons
// champs selon le type, et l'envoie via POST /api/logs.
// =============================================================================
async function insertLog() {

  // --- Recuperation des champs COMMUNS ---
  const type    = document.getElementById('insert-type').value;
  const app_id  = document.getElementById('insert-app').value;
  const level   = document.getElementById('insert-level').value;
  const message = document.getElementById('insert-message').value.trim();

  if (!message) return notify('Le message est obligatoire', 'error');

  // Helper local : recupere la valeur d'un input par son id (ou undefined)
  const get = id => document.getElementById(id)?.value;

  // --- Construction de l'objet log avec champs de base ---
  const log = {
    log_id: `LOG-RT-${Date.now()}`,                            // identifiant unique avec timestamp
    app_id, level, message,
    type_log: type,
    source_fichier: type === 'erreur' ? 'ManualInsert.java' : `${type}.log`,
    ligne_code: Math.floor(Math.random() * 500) + 1,
    timestamp: new Date()
  };

  // --- Ajout des champs SPECIFIQUES selon le type ---
  // Demonstration du schema flexible cote client.
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

  // --- Envoi au backend via POST /api/logs ---
  try {
    const res = await fetch(`${API}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });

    if (res.ok) {
      notify('✓ Log inséré avec succès !');
      document.getElementById('insert-message').value = '';
      loadDashboard();   // rafraichir le dashboard pour voir le nouveau log
    } else {
      notify('Erreur lors de l\'insertion', 'error');
    }
  } catch {
    notify('Erreur réseau', 'error');
  }
}
