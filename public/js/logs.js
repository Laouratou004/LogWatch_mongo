let currentPage = 1;
let currentFilters = {};

async function loadLogs(page = 1) {
  currentPage = page;
  const tbody = document.getElementById('logs-body');
  tbody.innerHTML = '<tr><td colspan="5" class="loader">Chargement...</td></tr>';

  try {
    let url;
    const type = document.getElementById('search-type')?.value;

    if (type && ['java-errors', 'web', 'security', 'slow-db'].includes(type)) {
      url = `${API}/logs/${type}`;
    } else {
      const q = document.getElementById('search-q')?.value;
      const level = document.getElementById('search-level')?.value;
      const dateDebut = document.getElementById('search-date-debut')?.value;
      const dateFin = document.getElementById('search-date-fin')?.value;

      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (level) params.append('level', level);
      if (dateDebut) params.append('dateDebut', dateDebut);
      if (dateFin) params.append('dateFin', dateFin);

      const hasFilters = q || level || dateDebut || dateFin;
      if (hasFilters) {
        url = `${API}/logs/search?${params.toString()}`;
      } else {
        url = `${API}/logs?page=${page}&limit=10`;
      }
    }

    const res = await fetch(url);
    const data = await res.json();
    const logs = data.logs || [];
    const total = data.total || 0;

    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="loader">Aucun log trouvé</td></tr>';
      document.getElementById('logs-pagination').innerHTML = '';
      return;
    }

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

    // Pagination (seulement pour la liste générale)
    if (!document.getElementById('search-type')?.value &&
        !document.getElementById('search-q')?.value &&
        !document.getElementById('search-level')?.value) {
      renderPagination(total, page);
    } else {
      document.getElementById('logs-pagination').innerHTML =
        `<span style="color:var(--text-muted);font-size:13px">${total} résultat(s)</span>`;
    }

  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" class="loader">Erreur de chargement</td></tr>';
    console.error('Erreur logs:', err);
  }
}

function renderPagination(total, currentPage) {
  const totalPages = Math.ceil(total / 10);
  const container = document.getElementById('logs-pagination');

  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = '';
  if (currentPage > 1) {
    html += `<button onclick="loadLogs(${currentPage - 1})">←</button>`;
  }

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i++) {
    html += `<button class="${i === currentPage ? 'active' : ''}" onclick="loadLogs(${i})">${i}</button>`;
  }

  if (currentPage < totalPages) {
    html += `<button onclick="loadLogs(${currentPage + 1})">→</button>`;
  }

  container.innerHTML = html;
}

function searchLogs() {
  loadLogs(1);
}

function resetSearch() {
  document.getElementById('search-q').value = '';
  document.getElementById('search-level').value = '';
  document.getElementById('search-type').value = '';
  document.getElementById('search-date-debut').value = '';
  document.getElementById('search-date-fin').value = '';
  loadLogs(1);
}