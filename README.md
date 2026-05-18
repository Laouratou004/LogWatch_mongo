# LogWatch MongoDB 📊 • Système Centralisé de Gestion et d'Analyse de Logs

### 🎓 Projet Académique de Fin d'Études — Licence 3 Développement Logiciel (UGANC)

**LogWatch** est une plateforme robuste de centralisation, de filtrage et de détection d'anomalies conçue pour traiter des flux massifs de logs applicatifs hétérogènes (Web, Erreurs, Sécurité, Base de données).

Le projet met en application la flexibilité des schémas polymorphes de **MongoDB** et la puissance de son **Framework d'Agrégation** pour surpasser les limites des architectures relationnelles (SQL) classiques face aux données de monitoring semi-structurées.

---

# 🛠️ Stack Technique

| Couche | Technologie |
|---------|------------|
| Base de données | MongoDB Atlas + mongosh |
| Backend | Node.js + Express.js |
| Frontend | React + Tailwind CSS |
| Gestion projet | Jira |
| Versioning | Git + GitHub |

---

# 📦 Installation & Configuration

Le projet peut être exécuté sur **Windows** et **macOS**.

---

# 💻 Installation sous Windows

## 1. Installer Node.js

Télécharger Node.js LTS :

https://nodejs.org

Vérifier l'installation :

```bash
node -v

npm -v
```

---

## 2. Installer Git

Télécharger :

https://git-scm.com/downloads

Vérifier :

```bash
git --version
```

---

## 3. Installer MongoDB Shell (mongosh)

Télécharger :

https://www.mongodb.com/try/download/shell

Vérifier :

```bash
mongosh --version
```

---

## 4. Cloner le dépôt

```bash
git clone https://github.com/VOTRE_COMPTE/logwatch.git

cd logwatch
```

---

## 5. Installer les dépendances backend

```bash
cd backend

npm install
```

---

## 6. Installer le frontend

```bash
cd ../frontend

npm install
```

---

# 🍎 Installation sous macOS

## 1. Installer Homebrew

Vérifier :

```bash
brew --version
```

Si absent :

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

## 2. Installer Node.js

```bash
brew install node
```

Vérifier :

```bash
node -v

npm -v
```

---

## 3. Installer Git

```bash
brew install git
```

Vérifier :

```bash
git --version
```

---

## 4. Installer Mongo Shell

```bash
brew install mongosh
```

Vérifier :

```bash
mongosh --version
```

---

## 5. Cloner le dépôt

```bash
git clone https://github.com/VOTRE_COMPTE/logwatch.git

cd logwatch
```

---

## 6. Installer les dépendances

Backend :

```bash
cd backend

npm install
```

Frontend :

```bash
cd ../frontend

npm install
```

---

# ⚙️ Configuration du projet

Créer le fichier :

```bash
backend/.env
```

Ajouter :

```env
PORT=3000

MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/logwatch_db
```

⚠️ Ne jamais publier les identifiants MongoDB dans GitHub.

Ajouter `.env` au `.gitignore` :

```txt
.env
```

---

# 🗄️ Connexion à MongoDB Atlas

Le projet utilise **MongoDB Atlas Cloud**.

Connexion via Mongo Shell :

```bash
mongosh "mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/logwatch_db"
```

Connexion directe à une collection :

```javascript
use logwatch_db
```

Afficher les collections :

```javascript
show collections
```

Résultat attendu :

```txt
applications

logs

alertes_systeme
```

Afficher quelques logs :

```javascript
db.logs.find().limit(5)
```

Compter les documents :

```javascript
db.logs.countDocuments()
```

---

# 🚀 Lancer le projet

Backend :

```bash
cd backend

npm run dev
```

Frontend :

```bash
cd frontend

npm start
```

---

# 📂 Structure du projet

```txt
logwatch/

│── backend/

│   ├── controllers/

│   ├── models/

│   ├── routes/

│   ├── services/

│   └── app.js

│

│── frontend/

│   ├── src/

│   ├── pages/

│   ├── components/

│   └── assets/

│

│── scripts/

│   └── faker-generator.js

│

│── datasets/

│   └── logs.json

│

└── README.md
```

---

# 📊 Collections MongoDB

### applications

Informations des applications surveillées.

### logs

Collection principale :

- logs Web
- logs erreurs
- logs sécurité
- logs BDD

### alertes_systeme

Alertes générées automatiquement :

- erreurs critiques
- pics d'activité
- anomalies
- sécurité

---

# 👥 Équipe — LogTech Solutions

- Laouratou Bah — Cheffe de groupe
- Hadiatou Sow
- Ibrahima Kalil Kourouma
- Tiguidanké Nabé
- Abdoulaye Diallo
- Abdoulaye Dioubaté

---

Licence 3 — Développement Logiciel — UGANC
2026
