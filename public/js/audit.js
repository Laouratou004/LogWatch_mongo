// =============================================================================
// public/js/audit.js — Page "Audit Securite"
// -----------------------------------------------------------------------------
// Affiche 3 sections :
//   - Liste des alertes systeme (resolution interactive)
//   - Top 10 des IPs avec le plus d'echecs (route /api/audit/top-ips)
//   - Tableau des utilisateurs suspects (route /api/audit/users)
// =============================================================================

// Point d'entree : charge les 3 sections en parallele
async function loadAudit() {
  await Promise.all([
    loadAlertes(),
    loadTopIps(),
    loadUsersSuspects(),
  ]);
}

// =============================================================================
// SECTION 1 — Liste des alertes
// =============================================================================
async function loadAlertes() {
  try {
    const res  = await fetch(`${API}/alertes`);
    const data = await res.json();
    const container = document.getElementById('alertes-list');

    // --- Cas : aucune alerte ---
    if (data.alertes.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:var(--muted)">
          <div style="font-size:32px;margin-bottom:12px">🔔</div>
          <div>Aucune alerte</div>
        </div>`;
      return;
    }

    // --- Affichage des 10 premieres alertes ---
    // .slice(0, 10) car on ne veut pas surcharger l'affichage
    container.innerHTML = data.alertes.slice(0, 10).map(alerte => `
      <div class="alerte-item ${alerte.resolue ? 'resolue' : 'non-resolue'}">
        <div style="flex:1;min-width:0">
          <!-- Type d'alerte + badge etat -->
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="font-size:13px;font-weight:600">${alerte.type_alerte}</span>
            ${alerte.resolue
              ? '<span class="badge badge-success">✓ Résolue</span>'
              : '<span class="badge badge-ERROR">● Active</span>'}
          </div>
          <!-- Description (tronquee si trop longue) -->
          <p style="color:var(--muted);font-size:12px;
                    overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            ${alerte.description}
          </p>
          <!-- Pied : date + app concernee -->
          <p style="color:var(--muted);font-size:11px;margin-top:4px">
            ${formatDate(alerte.timestamp)}
            <span style="margin:0 6px;opacity:0.4">•</span>
            ${alerte.app_id}
          </p>
        </div>
        <!-- Bouton "Resoudre" UNIQUEMENT si l'alerte est encore active -->
        ${!alerte.resolue ? `
          <button class="btn btn-success btn-sm" style="flex-shrink:0;margin-left:12px"
                  onclick="resoudreAlerte('${alerte._id}')">
            <i class="ph-fill ph-check"></i> Résoudre
          </button>` : ''}
      </div>
    `).join('');
  } catch (err) {
    console.error('Erreur alertes:', err);
  }
}

// =============================================================================
// Action : marquer une alerte comme resolue
// Appelle PUT /api/alertes/:id/resoudre puis recharge la page audit
// =============================================================================
async function resoudreAlerte(id) {
  try {
    const res = await fetch(`${API}/alertes/${id}/resoudre`, { method: 'PUT' });
    if (res.ok) {
      notify('✓ Alerte résolue avec succès');
      loadAudit();   // refresh pour voir l'alerte passer en "resolue"
    } else {
      notify('Erreur lors de la résolution', 'error');
    }
  } catch {
    notify('Erreur réseau', 'error');
  }
}

// =============================================================================
// SECTION 2 — Top 10 des IPs avec echecs de connexion
// Donnees fournies par /api/audit/top-ips (pipeline d'agregation)
// =============================================================================
async function loadTopIps() {
  try {
    const res  = await fetch(`${API}/audit/top-ips`);
    const data = await res.json();
    const container = document.getElementById('top-ips-list');

    // --- Cas : aucune IP suspecte ---
    if (data.resultats.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:var(--muted)">
          <div style="font-size:32px;margin-bottom:12px">🌐</div>
          <div>Aucune IP suspecte détectée</div>
        </div>`;
      return;
    }

    // L'IP la plus suspecte = 100% de la barre, les autres relativement
    const max = data.resultats[0]?.tentatives || 1;

    // --- Construction de la liste ---
    container.innerHTML = data.resultats.map((r, i) => {
      const pct = Math.round((r.tentatives / max) * 100);
      // Code couleur : rouge si > 10, jaune si > 5, bleu sinon
      const color = r.tentatives > 10 ? COLORS.danger :
                    r.tentatives > 5  ? COLORS.warning : COLORS.primary;
      return `
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;
                      align-items:center;margin-bottom:6px">
            <!-- Numero + IP en monospace -->
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:11px;color:var(--muted);
                           font-weight:700;width:20px">#${i+1}</span>
              <span style="font-family:monospace;font-size:13px">${r.ip}</span>
            </div>
            <!-- Nombre de tentatives -->
            <span style="color:${color};font-weight:700;font-size:13px;
                         font-family:'Syne',sans-serif">
              ${r.tentatives}
              <span style="font-size:10px;font-weight:400;
                           color:var(--muted);font-family:'Inter',sans-serif">
                tentatives
              </span>
            </span>
          </div>
          <!-- Barre de progression -->
          <div style="height:4px;background:rgba(255,255,255,0.06);
                      border-radius:99px;overflow:hidden">
            <div style="height:100%;width:${pct}%;
                        background:linear-gradient(90deg,${color},${color}88);
                        border-radius:99px;transition:width 0.8s ease"></div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Erreur top-ips:', err);
  }
}

// =============================================================================
// SECTION 3 — Tableau des utilisateurs suspects (> 5 tentatives)
// Donnees fournies par /api/audit/users
// =============================================================================
async function loadUsersSuspects() {
  try {
    const res  = await fetch(`${API}/audit/users`);
    const data = await res.json();
    const tbody = document.getElementById('users-suspects-body');

    // --- Cas : aucun utilisateur suspect ---
    if (data.resultats.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="loader" style="padding:40px">
            Aucun utilisateur suspect détecté
          </td>
        </tr>`;
      return;
    }

    // --- Construction du tableau ---
    tbody.innerHTML = data.resultats.map(r => {
      // Couleur de risque selon le nombre de tentatives cumulees
      const risk = r.total_tentatives > 50 ? COLORS.danger :
                   r.total_tentatives > 20 ? COLORS.warning : COLORS.muted;
      return `
        <tr>
          <!-- Colonne 1 : Utilisateur avec avatar (premiere lettre) -->
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:32px;height:32px;border-radius:8px;
                          background:linear-gradient(135deg,rgba(67,97,238,0.3),rgba(114,9,183,0.2));
                          display:flex;align-items:center;justify-content:center;
                          font-size:12px;font-weight:700;flex-shrink:0">
                ${r.user?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <span style="font-family:monospace;font-size:13px">${r.user}</span>
            </div>
          </td>
          <!-- Colonne 2 : Total tentatives -->
          <td>
            <span style="color:${risk};font-weight:700;
                         font-family:'Syne',sans-serif;font-size:16px">
              ${r.total_tentatives}
            </span>
          </td>
          <!-- Colonne 3 : Nombre d'echecs -->
          <td>
            <span style="color:var(--danger);font-weight:600">
              ${r.nb_echecs}
            </span>
          </td>
          <!-- Colonne 4 : Derniere tentative -->
          <td style="color:var(--muted);font-size:12px">
            ${formatDate(r.derniere_tentative)}
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Erreur users suspects:', err);
  }
}
