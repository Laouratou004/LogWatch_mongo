# LogWatch 📊

**Système centralisé de gestion et d'analyse de logs applicatifs.**

Projet réalisé dans le cadre du cours de **Bases de Données NoSQL** (Groupe 3 - LogTech Solutions) à l'Université Gamal Abdel Nasser de Conakry (UGANC).

---

## 🎯 Objectif
LogWatch permet de collecter, rechercher et analyser des logs hétérogènes (Java, Node.js, PHP, Python) provenant des différentes applications du système d'information de l'université.

## 🛠️ Stack Technique
- **Frontend** : HTML5, CSS3 Vanilla, JavaScript Vanilla, Bootstrap 5, Chart.js 4.x
- **Backend** : Node.js (v18+), Express.js (v5.x), Mongoose (v8.x)
- **Base de Données** : MongoDB Atlas (ou local) avec un schéma flexible.

## 🚀 Fonctionnalités
- **Dashboard temps réel** : KPIs dynamiques (Total logs, Erreurs, Alertes).
- **Pipelines d'agrégation MongoDB** :
  - Taux d'erreur par application.
  - Top 10 des erreurs les plus fréquentes.
  - Distribution temporelle des logs (par heure).
  - Détection d'anomalies (pics d'erreurs).
- **Recherche Avancée** : Filtrage par niveau (INFO, ERROR, etc.) et par technologie (Java, Web).
- **Alertes Système** : Suivi des incidents (résolus / en cours).

## ⚙️ Installation & Démarrage (Local)

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/Laouratou004/LogWatch_mongo.git
   cd LogWatch_mongo
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Générer les données de test (Seed)** :
   *Génère 10 applications, 2013 logs et 67 alertes via Faker.js.*
   ```bash
   node seed.js
   ```

4. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```

5. **Accéder à l'application** :
   Ouvrez votre navigateur sur `http://localhost:3000`

---
*Projet défendu par Kalil et l'équipe LogTech Solutions.*
