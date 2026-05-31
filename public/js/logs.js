// =============================================================================
// public/js/logs.js — Page "Logs" : recherche, filtrage, pagination
// -----------------------------------------------------------------------------
// Cette page utilise 2 endpoints selon ce que l'utilisateur a entre :
//   - GET /api/logs?page=X         si AUCUN filtre (liste paginee classique)
//   - GET /api/logs/search?...     si filtres (recherche avancee)
//   - GET /api/logs/{type}         si type predefini (java-errors, web, etc.)
// =============================================================================

// Variables d'etat globales pour la pagination
let currentPage = 1;
let currentFilters = {};

// =============================================================================
// Fonction principale : charge les logs selon les filtres actifs
// =============================================================================
async function loadLogs(page = 1) {
  currentPage = page;
  const tbody = document.getElementById('logs-body');
  // Affichage immediat d'un loader pendant le chargement
  tbody.innerHTML = '<tr><td colspan="5" class="loader">Chargement...</td></tr>';

  try {
    let url;
    const type = document.getElementById('search-type')?.value;

    // --- Cas 1 : Type predefini (java-errors, web, security, slow-db) ---
    // Ces routes utilisent l'operateur $exists cote backend
    if (type && ['java-errors', 'web', 'security', 'slow-db'].includes(type)) {
      url = `${API}/logs/${type}`;
    } else {
      // --- Cas 2 : Filtres custom (texte, niveau, dates) ---
      const q = document.getElementById('search-q')?.value;
      const level = document.getElementById('search-level')?.value;
      const dateDebut = document.getElementById('search-date-debut')?.value;
      const dateFin = document.getElementById('search-date-fin')?.value;

      // URLSearchParams = helper natif pour construire une querystring proprement
      // Sortie : ?q=Null&level=ERROR&dateDebut=2026-01-01
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (level) params.append('level', level);
      if (dateDebut) params.append('dateDebut', dateDebut);
      if (dateFin) params.append('dateFin', dateFin);

      // Si au moins un filtre actif -> route /search, sinon route paginee
      const hasFilters = q || level || dateDebut || dateFin;
      if (hasFilters) {
        url = `${API}/logs/search?${params.toString()}`;
      } else {
        url = `${API}/logs?page=${page}&limit=10`;
      }
    }

    // --- Appel API ---
    const res = await fetch(url);
    const data = await res.json();
    const logs = data.logs || [];
    const total = data.total || 0;

    // --- Gestion du cas vide ---
    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="loader">Aucun log trouvé</td></tr>';
      document.getElementById('logs-pagination').innerHTML = '';
      return;
    }

    // --- Construction des lignes du tableau ---
    // Chaque ligne est cliquable -> ouvre le modal de detail (showLogDetail defini dans dashboard.js)
    tbody.innerHTML = logs.map(log => `
      <tr onclick="showLogDetail('${log._id}')">
        <td>${formatDate(log.timestamp)}</td>
        <td>${badgeLevel(log.level)}</td>
        <td><span class="badge" style="background: rgba(114, 9, 183, 0.1); color: var(--secondary); font-weight:700;">${log.type_log || '—'}</span></td>
        <td><span style="font-weight: 600; color: var(--primary-light);">${log.app_id}</span></td>
        <td style="max-width: 350px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${log.message}
        </td>
      </tr>
    `).join('');

    // --- Pagination uniquement pour la liste GENERALE (pas si filtres actifs) ---
    if (!document.getElementById('search-type')?.value &&
        !document.getElementById('search-q')?.value &&
        !document.getElementById('search-level')?.value) {
      renderPagination(total, page);
    } else {
      // Sinon, juste afficher le nombre de resultats
      document.getElementById('logs-pagination').innerHTML =
        `<span style="color:var(--text-muted);font-size:13px">${total} résultat(s)</span>`;
    }

  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" class="loader">Erreur de chargement</td></tr>';
    console.error('Erreur logs:', err);
  }
}

// =============================================================================
// Construction des boutons de pagination "<  1  2  3  >"
// =============================================================================
function renderPagination(total, currentPage) {
  // Math.ceil(2000 / 10) = 200 pages
  const totalPages = Math.ceil(total / 10);
  const container = document.getElementById('logs-pagination');

  // Si une seule page, pas de pagination a afficher
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = '';

  // Bouton "precedent"
  if (currentPage > 1) {
    html += `<button onclick="loadLogs(${currentPage - 1})">←</button>`;
  }

  // On affiche au max 5 pages : currentPage et ses 2 voisines de chaque cote
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i++) {
    html += `<button class="${i === currentPage ? 'active' : ''}" onclick="loadLogs(${i})">${i}</button>`;
  }

  // Bouton "suivant"
  if (currentPage < totalPages) {
    html += `<button onclick="loadLogs(${currentPage + 1})">→</button>`;
  }

  container.innerHTML = html;
}

// =============================================================================
// Handlers de la barre de recherche
// =============================================================================

// Lance une nouvelle recherche (depuis la page 1)
function searchLogs() {
  loadLogs(1);
}

// Vide tous les filtres et recharge la liste complete
function resetSearch() {
  document.getElementById('search-q').value = '';
  document.getElementById('search-level').value = '';
  document.getElementById('search-type').value = '';
  document.getElementById('search-date-debut').value = '';
  document.getElementById('search-date-fin').value = '';
  loadLogs(1);
}
