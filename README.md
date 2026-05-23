<div align="center">

# ⚡ LogWatch

### Système centralisé de gestion et d'analyse de logs applicatifs

[![Node.js](https://img.shields.io/badge/Node.js-18+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)](https://www.chartjs.org)

**Université Gamal Abdel Nasser de Conakry — L3 Développement Logiciel**  
**Cours BD NoSQL — Mr. Djiba Kaba**  
**Groupe 3 — LogTech Solutions**

</div>

---

## 📋 Présentation

LogWatch est un tableau de bord temps réel de surveillance et d'analyse de logs applicatifs développé pour l'infrastructure de l'UGANC. Il centralise les logs de 10 applications hétérogènes (Java, Node.js, Python, PHP) et permet leur analyse via des pipelines d'agrégation MongoDB.

### Fonctionnalités clés

- 📊 **Dashboard temps réel** — KPIs, graphiques Chart.js, derniers logs
- 🔍 **Recherche avancée** — `$regex`, `$in`, `$exists`, filtres par date
- ⚡ **Insertion temps réel** — Formulaire dynamique selon le type de log
- 📈 **4 Pipelines MongoDB** — Taux d'erreur, top erreurs, distribution temporelle, détection d'anomalies
- 🔒 **Audit sécurité** — IPs suspectes, utilisateurs avec tentatives > 5
- 🚀 **Index optimisés** — IXSCAN confirmé via `explain()`

---

## 👥 Équipe

| # | Nom | Rôle |
|---|-----|------|
| 1 | **Laouratou Bah** | Cheffe de groupe — Frontend Lead |
| 2 | **Hadiatou Sow** | Backend Lead — API REST |
| 3 | **Ibrahima Kalil Kourouma** | Pipelines & Analytics |
| 4 | **Tiguidanké Nabé** | Frontend & Tests |
| 5 | **Abdoulaye Diallo** | DBA — MongoDB Atlas & Script seed |
| 6 | **Abdoulaye Dioubaté** | Rapport & Documentation |

---

## 🛠️ Stack technique

```
Frontend  : HTML / CSS / JavaScript vanilla
           Chart.js 4.x — Graphiques
           Phosphor Icons — Icônes
           Google Fonts (Inter + Syne)

Backend   : Node.js 18+
           Express 5.x
           Mongoose 9.x

Base      : MongoDB Atlas (M0 Free Tier)
           Cluster : Projet3-LogWatch

Génération: @faker-js/faker 10.x
Tests     : Script Node.js natif (fetch API)
Versioning: Git + GitHub
```

---

## 📁 Structure du projet

```
logwatch/
├── 📄 server.js                    # Point d'entrée Express
├── 📄 package.json
├── 📄 .env                         # Variables d'environnement (non commitée)
├── 📄 .gitignore
├── 📄 README.md
│
├── 📂 models/
│   ├── Application.js              # Modèle Mongoose applications
│   ├── Log.js                      # Modèle flexible (strict: false)
│   └── Alerte.js                   # Modèle alertes système
│
├── 📂 routes/
│   ├── logs.js                     # Routes /api/logs
│   ├── applications.js             # Routes /api/applications
│   ├── alertes.js                  # Routes /api/alertes
│   ├── analytics.js                # Routes /api/analytics
│   └── audit.js                    # Routes /api/audit
│
├── 📂 controllers/
│   ├── logsController.js
│   ├── applicationsController.js
│   ├── alertesController.js
│   └── analyticsController.js
│
├── 📂 scripts/
│   ├── seed.js                     # Génération dataset (applications + alertes)
│   ├── export.js                   # Export logs.json
│   └── test-api.js                 # Tests automatisés toutes routes
│
├── 📂 data/
│   └── logs.json                   # Dataset 2000+ logs (livrable)
│
└── 📂 public/
    ├── index.html                  # Application web (5 pages)
    ├── css/
    │   └── style.css               # Design system complet
    └── js/
        ├── main.js                 # Navigation + insertion + sidebar
        ├── dashboard.js            # Dashboard + graphiques
        ├── logs.js                 # Recherche + pagination
        ├── analytics.js            # 4 pipelines visualisés
        ├── audit.js                # Alertes + IPs + utilisateurs
        └── applications.js         # Tableau applications
```

---

## 🚀 Installation & Lancement

### Prérequis

- Node.js 18+
- Git
- Accès internet (MongoDB Atlas cloud)

### 1. Cloner le dépôt

```bash
git clone https://github.com/Laouratou004/LogWatch_mongo.git
cd logwatch
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

Créer un fichier `.env` à la racine :

```env
MONGODB_URI=mongodb+srv://logwatch_user:gamal123@projet3-logwatch.tc2ox7y.mongodb.net/logwatch_db
PORT=3000
```

### 4. Lancer le serveur

```bash
npm run dev       # Développement (nodemon)
npm start         # Production
```

### 5. Accéder à l'application

```
http://localhost:3000
```

---

## 🗄️ Base de données MongoDB Atlas

```
Cluster     : Projet3-LogWatch
Base        : logwatch_db
Utilisateur : logwatch_user
Réseau      : 0.0.0.0/0 (accès tous membres)
```

### Collections

| Collection | Documents | Description |
|------------|-----------|-------------|
| `applications` | 10 | Applications surveillées |
| `logs` | 2 000+ | Logs des 4 types |
| `alertes_systeme` | 65+ | Alertes générées |

### Index créés

```javascript
db.logs.createIndex({ level: 1 })        // Filtrage par niveau
db.logs.createIndex({ timestamp: -1 })   // Requêtes temporelles
```

> Validation : `explain('executionStats')` confirme **IXSCAN** sur les deux index

---

## 📡 API REST — Routes disponibles

### Logs

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/logs` | Liste paginée (`?page=1&limit=10`) |
| `GET` | `/api/logs/:id` | Détail d'un log |
| `POST` | `/api/logs` | Insertion temps réel |
| `DELETE` | `/api/logs/:id` | Suppression |
| `GET` | `/api/logs/search` | Recherche `?q=&level=&dateDebut=&dateFin=` |
| `GET` | `/api/logs/java-errors` | `$exists: stack_trace` |
| `GET` | `/api/logs/web` | `$exists: methode_http` |
| `GET` | `/api/logs/security` | `$exists: user` |
| `GET` | `/api/logs/slow-db` | `$exists: requete_sql` + `duree_ms > 1000` |

### Applications

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/applications` | Liste des 10 applications |
| `POST` | `/api/applications` | Nouvelle application |
| `PUT` | `/api/applications/:id` | Mise à jour |
| `DELETE` | `/api/applications/:id` | Suppression |

### Alertes

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/alertes` | Liste (non résolues en premier) |
| `PUT` | `/api/alertes/:id/resoudre` | Marquer résolue |
| `DELETE` | `/api/alertes/:id` | Suppression |

### Analytics & Audit

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/analytics/error-rate` | Pipeline 1 — Taux d'erreur |
| `GET` | `/api/analytics/top-errors` | Pipeline 2 — Top 10 erreurs |
| `GET` | `/api/analytics/temporal` | Pipeline 3 — Distribution horaire |
| `GET` | `/api/analytics/anomalies` | Pipeline 4 — Détection HAVING |
| `GET` | `/api/analytics/performance` | Stats `explain()` index |
| `GET` | `/api/audit/top-ips` | IPs suspectes |
| `GET` | `/api/audit/users` | Utilisateurs suspects |

---

## 📊 Les 4 Pipelines d'agrégation

### Pipeline 1 — Taux d'erreur par application
```javascript
db.logs.aggregate([
  { $group: { _id: "$app_id", total: { $sum: 1 },
    erreurs: { $sum: { $cond: [{ $in: ["$level", ["ERROR","CRITICAL"]] }, 1, 0] } } } },
  { $project: { taux_erreur_pct: { $round: [{ $multiply: [{ $divide: ["$erreurs","$total"] }, 100] }, 2] } } },
  { $sort: { taux_erreur_pct: -1 } }
])
```

### Pipeline 2 — Top 10 erreurs fréquentes
```javascript
db.logs.aggregate([
  { $match: { level: { $in: ["ERROR","CRITICAL"] } } },
  { $group: { _id: "$message", nb_occurrences: { $sum: 1 } } },
  { $sort: { nb_occurrences: -1 } },
  { $limit: 10 }
])
```

### Pipeline 3 — Distribution temporelle
```javascript
db.logs.aggregate([
  { $group: {
    _id: { $dateToString: { format: "%Y-%m-%dT%H", date: "$timestamp" } },
    total: { $sum: 1 },
    erreurs: { $sum: { $cond: [{ $in: ["$level", ["ERROR","CRITICAL"]] }, 1, 0] } }
  }},
  { $sort: { _id: 1 } }
])
```

### Pipeline 4 — Détection d'anomalies (équivalent HAVING SQL)
```javascript
db.logs.aggregate([
  { $match: { timestamp: { $gte: new Date(Date.now() - 3600000 * 24 * 30) } } },
  { $group: {
    _id: { $dateToString: { format: "%Y-%m-%dT%H", date: "$timestamp" } },
    count: { $sum: 1 }
  }},
  { $match: { count: { $gt: 3 } } },   // ← équivalent HAVING COUNT(*) > 3
  { $sort: { count: -1 } }
])
```

---

## 🧪 Scripts disponibles

```bash
# Lancer le serveur en développement
npm run dev

# Insérer les applications et alertes en base
node scripts/seed.js

# Exporter les logs en JSON
node scripts/export.js

# Tester toutes les routes API (serveur doit être démarré)
node scripts/test-api.js
```

### Résultats des tests API

```
✅ 13 routes /api/logs     — 100% succès
✅  4 routes /api/applications — 100% succès
✅  2 routes /api/alertes  — 100% succès
✅  5 routes /api/analytics — 100% succès
✅  2 routes /api/audit    — 100% succès
─────────────────────────────────────────
✅ 26 tests — 26 succès — 0 échec
```

---

## ✅ Contraintes du sujet — Checklist

| # | Contrainte | État |
|---|------------|------|
| 1 | Volume : 2 000+ logs dans la collection `logs` | ✅ |
| 2 | Schéma flexible : 4 types de logs distincts | ✅ |
| 3 | `$exists` pour filtrer par type de log | ✅ |
| 4 | `$regex` pour la recherche textuelle | ✅ |
| 5 | `$in` pour filtrer par niveau(x) multiple(s) | ✅ |
| 6 | Pipeline 1 — Taux d'erreur par application | ✅ |
| 7 | Pipeline 2 — Top 10 erreurs fréquentes | ✅ |
| 8 | Pipeline 3 — Distribution temporelle | ✅ |
| 9 | Pipeline 4 — Anomalies (`$group` + `$match` HAVING) | ✅ |
| 10 | Index `{ timestamp: -1 }` | ✅ |
| 11 | Index `{ level: 1 }` | ✅ |
| 12 | Insertion en temps réel depuis l'interface | ✅ |
| 13 | Rapport — Comparaison SQL/MongoDB | ✅ |
| 14 | Dataset JSON exporté (2 000+ logs) | ✅ |

---

## 📝 Convention Git

### Format des commits

```
feat(scope): description courte
fix(scope): description courte
docs(scope): description courte
```

### Branches

```
main           ← code stable
develop        ← développement principal
feat/seed      ← script Faker.js (M5)
feat/api       ← routes Express (M2)
feat/pipelines ← agrégations MongoDB (M3)
feat/frontend  ← interface web (M4)
feat/search    ← recherche + tests (M5)
docs/rapport   ← rapport + slides (M6)
```

---

## 📄 Licence

Projet académique — UGANC L3 Développement Logiciel — 2026  
Groupe 3 — LogTech Solutions