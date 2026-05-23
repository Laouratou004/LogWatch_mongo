let chartErrorRate = null;
let chartTemporalFull = null;

async function loadAnalytique() {
  await Promise.all([
    loadErrorRate(),
    loadTopErrors(),
    loadTemporalFull(),
    loadAnomalies(),
  ]);
}

// ── Pipeline 1 — Taux d'erreur par application ──
async function loadErrorRate() {
  try {
    const res  = await fetch(`${API}/analytics/error-rate`);
    const data = await res.json();

    const labels = data.resultats.map(r => r.app_id);
    const taux   = data.resultats.map(r => r.taux_erreur_pct);

    const colors = taux.map(t =>
      t > 30 ? COLORS.danger :
      t > 15 ? COLORS.warning :
      COLORS.primary
    );

    const bgColors = taux.map(t =>
      t > 30 ? 'rgba(239,68,68,0.15)' :
      t > 15 ? 'rgba(255,214,10,0.15)' :
      'rgba(67,97,238,0.15)'
    );

    if (chartErrorRate) chartErrorRate.destroy();

    const ctx = document.getElementById('chart-error-rate').getContext('2d');

    chartErrorRate = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Taux d\'erreur (%)',
          data: taux,
          backgroundColor: bgColors,
          borderColor: colors,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        animation: { duration: 900, easing: 'easeInOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#151B28',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            titleFont: { family: 'Inter', weight: '600' },
            bodyFont:  { family: 'Inter' },
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: ctx => ` Taux d'erreur : ${ctx.parsed.x}%`
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: COLORS.text,
              font: { family: 'Inter', size: 11 },
              callback: v => v + '%'
            },
            grid: { color: COLORS.grid },
            border: { color: COLORS.grid }
          },
          y: {
            ticks: { color: COLORS.text, font: { family: 'Inter', size: 11 } },
            grid: { color: 'transparent' },
            border: { color: COLORS.grid }
          }
        }
      }
    });
  } catch (err) {
    console.error('Erreur error-rate:', err);
  }
}

// ── Pipeline 2 — Top 10 erreurs ──
async function loadTopErrors() {
  try {
    const res  = await fetch(`${API}/analytics/top-errors`);
    const data = await res.json();
    const container = document.getElementById('top-errors-list');

    const maxOcc = data.resultats[0]?.nb_occurrences || 1;

    container.innerHTML = data.resultats.map((r, i) => {
      const pct = Math.round((r.nb_occurrences / maxOcc) * 100);
      const barColor = r.level === 'CRITICAL' ? COLORS.pink : COLORS.danger;

      return `
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;
                      align-items:center;margin-bottom:6px">
            <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
              <span style="font-size:11px;color:var(--muted);
                           font-weight:700;width:18px;flex-shrink:0">#${i+1}</span>
              <span style="font-size:12px;overflow:hidden;text-overflow:ellipsis;
                           white-space:nowrap;flex:1" title="${r._id}">
                ${r._id}
              </span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;margin-left:8px">
              ${badgeLevel(r.level)}
              <span style="color:${barColor};font-weight:700;font-size:13px;
                           font-family:'Syne',sans-serif">
                ${r.nb_occurrences}×
              </span>
            </div>
          </div>
          <div style="height:4px;background:rgba(255,255,255,0.06);
                      border-radius:99px;overflow:hidden">
            <div style="height:100%;width:${pct}%;
                        background:linear-gradient(90deg,${barColor},${barColor}88);
                        border-radius:99px;transition:width 0.8s ease"></div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Erreur top-errors:', err);
  }
}

// ── Pipeline 3 — Distribution temporelle complète ──
async function loadTemporalFull() {
  try {
    const res  = await fetch(`${API}/analytics/temporal`);
    const data = await res.json();

    const labels  = data.resultats.map(r => r.heure);
    const totaux  = data.resultats.map(r => r.total);
    const erreurs = data.resultats.map(r => r.erreurs);

    if (chartTemporalFull) chartTemporalFull.destroy();

    const ctx = document.getElementById('chart-temporal-full').getContext('2d');

    const gradBlue = ctx.createLinearGradient(0, 0, 0, 300);
    gradBlue.addColorStop(0, 'rgba(67,97,238,0.3)');
    gradBlue.addColorStop(1, 'rgba(67,97,238,0)');

    const gradRed = ctx.createLinearGradient(0, 0, 0, 300);
    gradRed.addColorStop(0, 'rgba(239,68,68,0.25)');
    gradRed.addColorStop(1, 'rgba(239,68,68,0)');

    chartTemporalFull = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total logs',
            data: totaux,
            borderColor: COLORS.primary,
            backgroundColor: gradBlue,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: COLORS.primary,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
          },
          {
            label: 'Erreurs',
            data: erreurs,
            borderColor: COLORS.danger,
            backgroundColor: gradRed,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: COLORS.danger,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        animation: { duration: 900, easing: 'easeInOutQuart' },
        plugins: {
          legend: {
            labels: {
              color: COLORS.text,
              font: { family: 'Inter', size: 12 },
              boxWidth: 12,
              borderRadius: 4,
              padding: 16,
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
          }
        },
        scales: {
          x: {
            ticks: {
              color: COLORS.text,
              font: { family: 'Inter', size: 10 },
              maxTicksLimit: 20,
              maxRotation: 45,
            },
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
    console.error('Erreur temporal full:', err);
  }
}

// ── Pipeline 4 — Anomalies ──
async function loadAnomalies() {
  try {
    const res  = await fetch(`${API}/analytics/anomalies`);
    const data = await res.json();
    const container = document.getElementById('anomalies-list');
    const badge     = document.getElementById('anomalies-badge');

    badge.textContent = `${data.anomalies_detectees} anomalie(s) — seuil : ${data.seuil}`;

    if (data.resultats.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:var(--muted)">
          <div style="font-size:32px;margin-bottom:12px">✓</div>
          <div style="font-weight:600;color:var(--success)">Aucune anomalie détectée</div>
          <div style="font-size:12px;margin-top:4px">Seuil configuré à ${data.seuil} logs/heure</div>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
        ${data.resultats.map(r => `
          <div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);
                      border-left:3px solid var(--danger);border-radius:12px;padding:16px;
                      display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:600;font-size:14px">${r.heure}</div>
              <div style="font-size:12px;color:var(--muted);margin-top:4px">
                Seuil dépassé : ${r.count} logs détectés
              </div>
            </div>
            <div style="font-family:'Syne',sans-serif;font-size:28px;
                        font-weight:800;color:var(--danger)">
              ${r.count}
            </div>
          </div>
        `).join('')}
      </div>`;
  } catch (err) {
    console.error('Erreur anomalies:', err);
  }
}