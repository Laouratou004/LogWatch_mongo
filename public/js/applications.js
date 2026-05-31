// =============================================================================
// public/js/applications.js — Page "Applications"
// -----------------------------------------------------------------------------
// Affiche le tableau des 10 applications surveillees avec :
//   - Nom + identifiant
//   - Badge technologie (couleur specifique par techno)
//   - Badge environnement (prod / dev / test)
//   - Version
//   - Responsable
//   - SLA garanti
//   - Taux d'erreur reel calcule par le pipeline 1 (jointure cote frontend)
// =============================================================================

// Point d'entree de la page
async function loadApplications() {
  await loadAppsTable();
}

// =============================================================================
// Construction du tableau des applications
// =============================================================================
async function loadAppsTable() {
  try {
    // --- Recuperation EN PARALLELE de 2 endpoints ---
    // 1. La liste des applications (donnees statiques de la base)
    // 2. Le pipeline 1 (taux d'erreur calcule a partir des logs)
    // On combine les deux cote frontend = jointure manuelle.
    const [appsRes, errorRateRes] = await Promise.all([
      fetch(`${API}/applications`),
      fetch(`${API}/analytics/error-rate`)
    ]);

    const appsData = await appsRes.json();
    const errorData = await errorRateRes.json();

    // --- Construction d'un dictionnaire { app_id -> taux } pour la jointure ---
    // Exemple : { 'WEB': 23.5, 'SIE': 8.2, ... }
    const tauxMap = {};
    errorData.resultats.forEach(r => {
      tauxMap[r.app_id] = r.taux_erreur_pct;
    });

    const tbody = document.getElementById('applications-body');

    // --- Construction des lignes ---
    tbody.innerHTML = appsData.applications.map(app => {

      // Recuperation du taux (?? = nullish coalescing : utilise '—' si undefined)
      const taux = tauxMap[app.app_id] ?? '—';

      // Couleur du taux selon la severite
      const tauxColor = taux > 30 ? 'var(--danger)' :
                        taux > 15 ? 'var(--warning)' :
                        'var(--success)';
      const tauxBg = taux > 30 ? 'rgba(239, 68, 68, 0.15)' :
                     taux > 15 ? 'rgba(255, 214, 10, 0.15)' :
                     'rgba(6, 214, 160, 0.15)';

      // --- Couleurs personnalisees par technologie ---
      // Chaque techno a sa couleur "officielle" pour la rendre identifiable
      const techSpecs = {
        'Java':    { color: '#f89820', bg: 'rgba(248, 152, 32, 0.15)' },   // orange Java
        'Node.js': { color: '#06D6A0', bg: 'rgba(6, 214, 160, 0.15)' },    // vert Node
        'Python':  { color: '#3572a5', bg: 'rgba(53, 114, 165, 0.15)' },   // bleu Python
        'PHP':     { color: '#9061F9', bg: 'rgba(144, 97, 249, 0.15)' }    // violet PHP
      };
      // Fallback si techno inconnue
      const tech = techSpecs[app.technologie] || { color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.05)' };

      // --- Badges pour l'environnement (prod / dev / test) ---
      const envBadge = {
        'prod': '<span class="badge" style="background:rgba(6, 214, 160, 0.15);color:var(--success)">prod</span>',
        'dev':  '<span class="badge" style="background:rgba(76, 201, 240, 0.15);color:var(--info)">dev</span>',
        'test': '<span class="badge" style="background:rgba(255, 214, 10, 0.15);color:var(--warning)">test</span>'
      };

      // --- Construction de la ligne <tr> ---
      return `
        <tr>
          <!-- Colonne 1 : Nom + app_id en sous-titre -->
          <td>
            <div style="font-weight:700; color:white;">${app.nom}</div>
            <div style="color:var(--text-muted);font-size:11px;margin-top:2px;">${app.app_id}</div>
          </td>
          <!-- Colonne 2 : Badge techno colore -->
          <td>
            <span class="badge" style="color:${tech.color}; background:${tech.bg}; font-weight:700;">
              ${app.technologie}
            </span>
          </td>
          <!-- Colonne 3 : Badge environnement -->
          <td>${envBadge[app.environnement] || app.environnement}</td>
          <!-- Colonne 4 : Version en monospace -->
          <td style="font-family:monospace;font-size:12px;font-weight:600;color:var(--text-muted);">v${app.version}</td>
          <!-- Colonne 5 : Responsable -->
          <td style="color:#e2e8f0; font-weight:500;">${app.responsable}</td>
          <!-- Colonne 6 : SLA garanti (toujours vert) -->
          <td>
            <span style="color:var(--success); font-weight:700; background:rgba(6, 214, 160, 0.1); padding:2px 8px; border-radius:6px;">
              ${app.sla_pct}%
            </span>
          </td>
          <!-- Colonne 7 : Taux d'erreur REEL (couleur conditionnelle) -->
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
