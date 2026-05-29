let charts = {};

document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
    setInterval(fetchDashboardData, 30000); // Auto-refresh 30s
});

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(el => el.classList.add('d-none'));
    document.getElementById(`section-${sectionId}`).classList.remove('d-none');
    
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if (sectionId === 'logs') fetchLogs();
    if (sectionId === 'alertes') fetchAlertes();
}

function getBadgeClass(level) {
    switch(level) {
        case 'INFO': return 'badge-info';
        case 'WARN': return 'badge-warn';
        case 'ERROR': return 'badge-error';
        case 'CRITICAL': return 'badge-critical';
        default: return 'bg-secondary';
    }
}

async function fetchDashboardData() {
    try {
        // Stats KPIs
        const statsRes = await fetch('/api/stats');
        const stats = await statsRes.json();
        document.getElementById('kpi-total-logs').innerText = stats.totalLogs.toLocaleString();
        document.getElementById('kpi-erreurs').innerText = stats.totalErreurs.toLocaleString();
        document.getElementById('kpi-alertes').innerText = stats.totalAlertes.toLocaleString();

        // Taux Erreur
        const tauxRes = await fetch('/api/analytics/taux-erreur');
        const tauxData = await tauxRes.json();
        renderChart('chartTauxErreur', 'bar', tauxData.map(d => d.app_id), tauxData.map(d => d.taux_erreur), "Taux d'erreur (%)", 'rgba(220, 53, 69, 0.7)');

        // Top Erreurs
        const topRes = await fetch('/api/analytics/top-erreurs');
        const topData = await topRes.json();
        renderChart('chartTopErreurs', 'pie', topData.map(d => d._id.substring(0, 20) + '...'), topData.map(d => d.count), "Occurrences");

        // Distribution Temporelle
        const distRes = await fetch('/api/analytics/distribution');
        const distData = await distRes.json();
        renderChart('chartDistribution', 'line', distData.map(d => `${d._id}h`), distData.map(d => d.count), "Logs par heure", 'rgba(13, 110, 253, 0.7)');

        // Anomalies
        const anomRes = await fetch('/api/analytics/anomalies');
        const anomData = await anomRes.json();
        const anomLabels = anomData.map(d => `${d._id.app} (${d._id.heure}h)`);
        renderChart('chartAnomalies', 'bar', anomLabels, anomData.map(d => d.count), "Pics d'erreurs", 'rgba(255, 193, 7, 0.8)');

    } catch (err) {
        console.error("Error fetching dashboard data", err);
    }
}

async function fetchLogs() {
    const level = document.getElementById('search-level').value;
    const type = document.getElementById('search-type').value;
    
    let url = '/api/logs?limit=50';
    if (level) url += `&level=${level}`;
    if (type) url += `&type=${type}`;

    try {
        const res = await fetch(url);
        const logs = await res.json();
        const tbody = document.getElementById('table-logs-body');
        tbody.innerHTML = '';

        logs.forEach(log => {
            const date = new Date(log.timestamp).toLocaleString('fr-FR');
            let details = '';
            if (log.source_fichier) details += `<span class="badge bg-secondary">Java: ${log.source_fichier}</span> `;
            if (log.methode_http) details += `<span class="badge bg-secondary">Web: ${log.methode_http} ${log.code_statut}</span>`;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${date}</td>
                <td>${log.app_id}</td>
                <td><span class="badge ${getBadgeClass(log.level)}">${log.level}</span></td>
                <td>${log.message.substring(0, 50)}...</td>
                <td>${details}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Error fetching logs", err);
    }
}

async function fetchAlertes() {
    try {
        const res = await fetch('/api/alertes');
        const alertes = await res.json();
        const tbody = document.getElementById('table-alertes-body');
        tbody.innerHTML = '';

        alertes.forEach(alerte => {
            const date = new Date(alerte.timestamp).toLocaleString('fr-FR');
            const statut = alerte.resolue 
                ? '<span class="badge bg-success">Résolue</span>' 
                : '<span class="badge bg-danger">En cours</span>';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${alerte.alerte_id}</td>
                <td>${alerte.app_id}</td>
                <td>${date}</td>
                <td>${alerte.type_alerte}</td>
                <td>${statut}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Error fetching alertes", err);
    }
}

function renderChart(canvasId, type, labels, data, label, color = null) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }

    const bgColors = color ? color : [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
    ];

    charts[canvasId] = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: bgColors,
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: type === 'pie'
                }
            },
            scales: type !== 'pie' ? {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a0a0a0' } },
                x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a0a0a0' } }
            } : {}
        }
    });
}
