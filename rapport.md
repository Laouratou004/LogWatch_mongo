            
UNIVERSITÉ GAMAL ABDEL NASSER DE CONAKRY
Centre Informatique — Licence 3 Développement Logiciel
Cours : Bases de données NoSQL — Mr. Djiba Kaba

RAPPORT DE PROJET
  LogWatch  
Système centralisé de gestion et d'analyse de logs applicatifs

Groupe	Groupe 3 — LogTech Solutions
Cheffe de groupe	Laouratou Bah
Projet	Projet n°7 — LogWatch
Cours BD NoSQL	Mr. Djiba Kaba
Version	v1.0 — 11 mai 2026


Composition de l'équipe
N°	Nom et Prénom	Rôle
1	Laouratou Bah	Cheffe de groupe — Frontend Lead
2	Hadiatou Sow	Membre — Backend API
3	Ibrahima Kalil Kourouma	Membre — Pipelines & Analytics
4	Tiguidanké Nabé	Membre — Frontend & Tests
5	Abdoulaye Diallo	Membre — DBA & Script seed
6	Abdoulaye Dioubaté	Membre — Rapport & Slides
 
1. Introduction
1.1 Contexte
L'Université Gamal Abdel Nasser de Conakry (UGANC) gère une infrastructure informatique complexe comprenant plusieurs applications critiques : un système d'information étudiant, un portail de scolarité, une bibliothèque numérique, une passerelle API, un système de paiement et un service d'authentification. Ces applications génèrent quotidiennement des milliers de logs de natures très différentes : erreurs Java avec traces d'exécution, requêtes web HTTP, événements de sécurité et requêtes de base de données.

Face à cette hétérogénéité et ce volume croissant, il devient indispensable de disposer d'un système centralisé capable de collecter, stocker, analyser et visualiser ces logs en temps réel. C'est dans ce cadre que s'inscrit le projet LogWatch.

1.2 Problématique
Les logs applicatifs de l'UGANC posent plusieurs défis majeurs :
•	Hétérogénéité des données : chaque type de log possède des champs spécifiques différents, incompatibles avec un schéma SQL fixe
•	Volume important : 2 000+ logs générés quotidiennement, nécessitant des performances élevées en lecture et écriture
•	Détection d'anomalies en temps réel : identification automatique des pics de logs anormaux
•	Recherche avancée : filtrage par type, niveau, période et contenu textuel
•	Évolutivité : possibilité d'ajouter de nouveaux types de logs sans migration coûteuse

1.3 Objectifs du projet
•	Collecter et stocker 2 000+ logs de 4 types différents dans MongoDB Atlas
•	Implémenter une API REST complète avec 23 routes couvrant les opérations CRUD et la recherche avancée
•	Développer 4 pipelines d'agrégation MongoDB pour l'analyse des données
•	Créer un dashboard web temps réel pour la visualisation et la supervision
•	Démontrer les avantages du schéma flexible NoSQL face à l'hétérogénéité des logs

1.4 Architecture générale
LogWatch est structuré en trois couches interconnectées :

Frontend	Backend	Base de données
HTML / CSS / JavaScript
Dashboard temps réel
Formulaires CRUD
Graphiques Chart.js	Node.js + Express
API REST (23 routes)
Mongoose ODM
Script seed Faker.js	MongoDB Atlas (cloud)
3 collections
2 index : level + timestamp
4 pipelines d'agrégation
 
2. Modélisation MongoDB
2.1 Les 3 collections
La base de données logwatch_db comprend trois collections correspondant aux entités principales du système :

Collection applications (10 documents)
Stocke les métadonnées des 10 applications surveillées par LogWatch :
{
  "app_id": "app_si_etudiant",
  "nom": "Système Information Étudiant",
  "version": "2.1.0",
  "environnement": "prod",   // prod | dev | test
  "technologie": "Java",     // Java | Node.js | Python | PHP
  "responsable": "Mamadou Diallo",
  "sla_pct": 99.9
}

Collection logs (2 000+ documents) — Schéma flexible
C'est la collection centrale du projet. Elle adopte un schéma flexible (strict: false dans Mongoose) permettant à chaque type de log d'avoir ses propres champs spécifiques. Tous les documents partagent des champs communs :
{
  "log_id": "LOG-001387",
  "app_id": "app_si_etudiant",
  "timestamp": "2026-01-11T07:21:55.244Z",
  "level": "ERROR",   // DEBUG | INFO | WARN | ERROR | CRITICAL
  "message": "ClassCastException dans InscriptionService",
  "source_fichier": "AuthController.java",
  "ligne_code": 161
}

Collection alertes_systeme (65+ documents)
Stocke les alertes générées automatiquement par le pipeline de détection d'anomalies :
{
  "alerte_id": "alerte_auto_1779446351796",
  "app_id": "system",
  "type_alerte": "VOLUME_ANOMALIE",
  "description": "Pic détecté : 4 logs à 2026-04-28T05",
  "seuil_declenche": 3,
  "valeur_observee": 4,
  "resolue": false,
  "assignee_uid": null
}

2.2 Les 4 types de logs — Schéma flexible
L'avantage clé de MongoDB est que chaque type de log possède uniquement ses champs spécifiques, sans colonnes NULL inutiles :

TYPE 1 — Erreur Java
Champs spécifiques présents UNIQUEMENT dans les logs d'erreur Java :
  "exception_type": "ClassCastException",
  "stack_trace": "java.lang.ClassCastException\n\tat com.logwatch.InscriptionService...",
  "nb_occurrences": 27

TYPE 2 — Log Web
Champs spécifiques présents UNIQUEMENT dans les logs web HTTP :
  "methode_http": "GET",
  "url": "/api/inscriptions",
  "code_statut": 403,
  "duree_ms": 76,
  "user_agent": "Mozilla/5.0 (Linux; Android 13) Mobile Chrome/120.0",
  "ip_source": "172.64.34.49"

TYPE 3 — Log Sécurité
Champs spécifiques présents UNIQUEMENT dans les logs de sécurité :
  "user": "admin_test",
  "action": "LOGIN",
  "ip_source": "198.127.210.226",
  "succes": false,
  "tentatives": 7

TYPE 4 — Log Base de données
Champs spécifiques présents UNIQUEMENT dans les logs de base de données :
  "requete_sql": "SELECT e.nom, n.note FROM etudiants e JOIN notes n ON e.id = n.etudiant_id",
  "duree_ms": 3769,
  "nb_lignes_affectees": 4220
 
3. Justification NoSQL vs SQL
3.1 Schéma SQL équivalent
Pour stocker les 4 types de logs dans une base SQL relationnelle, il faudrait créer une table unique avec toutes les colonnes possibles. La majorité serait NULL pour la plupart des enregistrements :

CREATE TABLE logs (
  id              INT PRIMARY KEY,
  log_id          VARCHAR(50),
  app_id          VARCHAR(50),
  timestamp       DATETIME,
  level           VARCHAR(10),
  message         TEXT,
  source_fichier  VARCHAR(100),
  ligne_code      INT,

  -- TYPE 1 : Erreur Java (NULL pour les 3 autres types)
  exception_type  VARCHAR(100) NULL,
  stack_trace     TEXT NULL,
  nb_occurrences  INT NULL,

  -- TYPE 2 : Log Web (NULL pour les 3 autres types)
  methode_http    VARCHAR(10) NULL,
  url             VARCHAR(200) NULL,
  code_statut     INT NULL,
  duree_ms        INT NULL,
  user_agent      TEXT NULL,
  ip_source       VARCHAR(50) NULL,

  -- TYPE 3 : Sécurité (NULL pour les 3 autres types)
  user            VARCHAR(100) NULL,
  action          VARCHAR(50) NULL,
  succes          BOOLEAN NULL,
  tentatives      INT NULL,

  -- TYPE 4 : Base de données (NULL pour les 3 autres types)
  requete_sql          TEXT NULL,
  nb_lignes_affectees  INT NULL
);

3.2 Problèmes du schéma SQL
Problème	Explication
Sparse table	75% des colonnes sont NULL pour chaque ligne — gaspillage de mémoire et d'espace disque
ALTER TABLE interdit	Ajouter un 5ème type de log en production nécessite une migration risquée et coûteuse avec temps d'arrêt
Rigidité du schéma	Impossible d'ajouter des champs spécifiques à un seul type sans modifier toute la table
Index sur NULL peu efficaces	Les index sur colonnes avec beaucoup de valeurs NULL sont inefficaces et volumineux

3.3 Avantages de MongoDB
Avantage	Explication
Schéma flexible	Chaque document contient exactement les champs dont il a besoin — pas de NULL, pas de gaspillage
Opérateur $exists	Filtre par type de log sans colonne discriminante — équivalent de IS NOT NULL en SQL mais plus expressif
Évolutivité zero-migration	Ajouter un 5ème type de log = simplement insérer des documents avec de nouveaux champs, sans modifier la structure existante
Documents auto-suffisants	Pas de JOIN nécessaire — chaque log contient toutes ses informations, performance optimale en lecture
Index natifs performants	Index sur level et timestamp avec IXSCAN confirmé — réduction de 77% des documents examinés

3.4 Différence $exists vs IS NOT NULL
En SQL, IS NOT NULL vérifie qu'une colonne a une valeur (la colonne existe toujours dans la table). En MongoDB, $exists: true vérifie que le champ est physiquement présent dans le document. Si le champ est absent, il n'existe tout simplement pas — ce n'est pas NULL, il n'est pas là. C'est cette différence fondamentale qui permet le schéma flexible : un log Web n'a pas de champ stack_trace du tout, alors qu'en SQL il aurait stack_trace = NULL.
 
4. Fonctionnalités de l'application
4.1 Module Dashboard
Le tableau de bord principal affiche en temps réel les métriques clés de l'infrastructure :
•	4 KPIs : total des logs, nombre d'erreurs critiques (ERROR + CRITICAL), alertes actives, nombre d'applications surveillées
•	Graphique en barres : distribution temporelle des logs par heure (Pipeline 3)
•	Graphique camembert : répartition des logs par niveau (DEBUG, INFO, WARN, ERROR, CRITICAL)
•	Tableau des derniers logs avec lien vers la modale de détail

4.2 Module Insertion temps réel (contrainte obligatoire)
Formulaire interactif permettant d'insérer un nouveau log en temps réel depuis l'interface web :
•	Sélecteur de type de log (4 options : Erreur Java, Web, Sécurité, Base de données)
•	Champs dynamiques qui changent selon le type sélectionné
•	Appel POST /api/logs → notification de confirmation → rafraîchissement automatique du dashboard

4.3 Module Recherche avancée
Module de recherche exploitant les opérateurs MongoDB avancés :
•	Recherche textuelle $regex sur le champ message (insensible à la casse)
•	Filtre par niveau $in (sélection multiple : ERROR, CRITICAL, etc.)
•	Filtre par type $exists (/java-errors, /web, /security, /slow-db)
•	Filtre par plage de dates avec $gte et $lte
•	Tableau paginé avec 10 résultats par page et modale de détail avec stack_trace complète

4.4 Module Analytique
Visualisation des 4 pipelines d'agrégation MongoDB :
•	Pipeline 1 : taux d'erreur par application (graphique barres horizontal)
•	Pipeline 2 : top 10 erreurs les plus fréquentes (liste classée)
•	Pipeline 3 : distribution temporelle complète (graphique linéaire)
•	Pipeline 4 : anomalies détectées avec seuil configurable

4.5 Module Audit Sécurité
Surveillance de la sécurité de l'infrastructure :
•	Liste des alertes actives et résolues avec bouton Résoudre (PUT /api/alertes/:id/resoudre)
•	Top 10 IPs suspectes avec nombre de tentatives échouées
•	Tableau des utilisateurs avec tentatives > 5

4.6 Module Applications
Vue d'ensemble des 10 applications surveillées :
•	Tableau avec technologie, environnement, version, responsable et SLA
•	Taux d'erreur en temps réel calculé via le Pipeline 1

4.7 API REST complète
23 routes testées et documentées, organisées en 4 groupes :

Méthode	Route	Description
GET	/api/logs	Liste paginée des logs
GET	/api/logs/:id	Détail d'un log
POST	/api/logs	Insertion temps réel
DELETE	/api/logs/:id	Suppression d'un log
GET	/api/logs/search	Recherche $regex + $in + date
GET	/api/logs/java-errors	$exists: stack_trace
GET	/api/logs/web	$exists: methode_http
GET	/api/logs/security	$exists: user
GET	/api/logs/slow-db	$exists: requete_sql + duree_ms > 1000
GET	/api/analytics/error-rate	Pipeline 1 — Taux d'erreur
GET	/api/analytics/top-errors	Pipeline 2 — Top 10 erreurs
GET	/api/analytics/temporal	Pipeline 3 — Distribution temporelle
GET	/api/analytics/anomalies	Pipeline 4 — Détection anomalies
GET	/api/analytics/performance	Stats explain() index
GET	/api/audit/top-ips	IPs suspectes
GET	/api/audit/users	Utilisateurs avec tentatives > 5
 
5. Pipelines d'agrégation MongoDB
Les pipelines d'agrégation constituent le cœur analytique de LogWatch. Ils permettent de transformer et analyser les données en plusieurs étapes enchaînées, à l'instar des requêtes GROUP BY / HAVING en SQL.

Pipeline 1 — Taux d'erreur par application
Ce pipeline calcule le pourcentage d'erreurs (ERROR + CRITICAL) pour chaque application :

db.logs.aggregate([
  {
    $group: {
      _id: "$app_id",
      total: { $sum: 1 },
      erreurs: {
        $sum: { $cond: [{ $in: ["$level", ["ERROR","CRITICAL"]] }, 1, 0] }
      }
    }
  },
  {
    $project: {
      app_id: "$_id",
      total: 1,
      erreurs: 1,
      taux_erreur_pct: {
        $round: [{ $multiply: [{ $divide: ["$erreurs","$total"] }, 100] }, 2]
      }
    }
  },
  { $sort: { taux_erreur_pct: -1 } }
])

Équivalent SQL :
SELECT app_id,
  COUNT(*) AS total,
  SUM(CASE WHEN level IN ('ERROR','CRITICAL') THEN 1 ELSE 0 END) AS erreurs,
  ROUND(SUM(CASE WHEN level IN ('ERROR','CRITICAL') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS taux_erreur_pct
FROM logs GROUP BY app_id ORDER BY taux_erreur_pct DESC;

Pipeline 2 — Top 10 erreurs fréquentes
Ce pipeline identifie les 10 messages d'erreur les plus récurrents :

db.logs.aggregate([
  { $match: { level: { $in: ["ERROR","CRITICAL"] } } },
  {
    $group: {
      _id: "$message",
      nb_occurrences: { $sum: 1 },
      level: { $first: "$level" },
      derniere_occurrence: { $max: "$timestamp" }
    }
  },
  { $sort: { nb_occurrences: -1 } },
  { $limit: 10 }
])

Équivalent SQL :
SELECT message, COUNT(*) AS nb_occurrences, level
FROM logs WHERE level IN ('ERROR','CRITICAL')
GROUP BY message, level ORDER BY nb_occurrences DESC LIMIT 10;

Pipeline 3 — Distribution temporelle
Ce pipeline regroupe les logs par tranche horaire et compte le total et les erreurs :

db.logs.aggregate([
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%dT%H", date: "$timestamp" } },
      total: { $sum: 1 },
      erreurs: {
        $sum: { $cond: [{ $in: ["$level", ["ERROR","CRITICAL"]] }, 1, 0] }
      }
    }
  },
  { $sort: { _id: 1 } }
])

Équivalent SQL :
SELECT DATE_FORMAT(timestamp, '%Y-%m-%dT%H') AS heure,
  COUNT(*) AS total,
  SUM(CASE WHEN level IN ('ERROR','CRITICAL') THEN 1 ELSE 0 END) AS erreurs
FROM logs GROUP BY heure ORDER BY heure ASC;

Pipeline 4 — Détection d'anomalies (contrainte obligatoire — équivalent HAVING)
Ce pipeline est la contrainte obligatoire du sujet. Il détecte automatiquement les pics de logs anormaux en utilisant un $match après un $group, ce qui est l'équivalent exact du HAVING en SQL :

db.logs.aggregate([
  {
    $match: { timestamp: { $gte: new Date(Date.now() - 3600000 * 24 * 30) } }
  },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%dT%H", date: "$timestamp" } },
      count: { $sum: 1 }
    }
  },
  { $match: { count: { $gt: 3 } } },   // ← équivalent HAVING COUNT(*) > 3
  { $sort: { count: -1 } }
])

Équivalent SQL :
SELECT DATE_FORMAT(timestamp, '%Y-%m-%dT%H') AS heure, COUNT(*) AS count
FROM logs WHERE timestamp >= NOW() - INTERVAL 30 DAY
GROUP BY heure
HAVING COUNT(*) > 3   -- ← équivalent du $match après $group
ORDER BY count DESC;

Point clé : En MongoDB, un $match placé APRÈS un $group dans un pipeline filtre les résultats agrégés. C'est exactement ce que fait HAVING en SQL : filtrer les groupes après agrégation. Sans cette distinction, un $match en début de pipeline (équivalent du WHERE) filtrerait les documents individuels avant le groupage.

Lorsqu'une anomalie est détectée, le système crée automatiquement une alerte dans la collection alertes_systeme avec un mécanisme anti-doublons (vérification préalable par findOne).
 
6. Index MongoDB & Mesure des performances
6.1 Index créés
Deux index ont été créés sur la collection logs pour optimiser les requêtes les plus fréquentes :

db.logs.createIndex({ level: 1 })        // Index 1 — filtrage par niveau
db.logs.createIndex({ timestamp: -1 })   // Index 2 — requêtes temporelles

6.2 Résultats explain()
La commande explain('executionStats') a été exécutée pour mesurer l'impact des index :

Métrique	Filtre level = ERROR	Filtre timestamp >= 2026-01-01
Stage parent	FETCH	FETCH
Stage index	IXSCAN ✓	IXSCAN ✓
Index utilisé	level_1	timestamp_-1
Documents examinés	454 / 2 000	1 553 / 2 000
Documents retournés	454	1 553
Temps d'exécution	0 ms	2 ms

6.3 Justification des index
•	Index { level: 1 } : Les requêtes de filtrage par niveau (ERROR, CRITICAL) sont les plus fréquentes dans LogWatch. Cet index réduit les documents examinés de 2 000 à 454 pour un filtre ERROR, soit une réduction de 77%.
•	Index { timestamp: -1 } : Toutes les requêtes temporelles (pipelines, dashboard, filtres par date) utilisent le champ timestamp. L'ordre décroissant (-1) optimise les requêtes récentes qui sont les plus courantes en monitoring.
•	Séparés et non composés : Le sujet impose deux index séparés. Les requêtes utilisent tantôt level seul, tantôt timestamp seul — un index composé serait moins efficace pour les requêtes n'utilisant qu'un seul champ.

6.4 IXSCAN vs COLLSCAN
Sans index, MongoDB effectue un COLLSCAN (Collection Scan) qui parcourt tous les documents de la collection. Avec les index, il effectue un IXSCAN (Index Scan) qui accède directement aux documents pertinents via la structure B-tree de l'index. Sur une collection de 2 000 documents, le gain est déjà significatif. Sur des millions de documents en production, la différence serait critique.
 
7. Difficultés rencontrées et solutions
Difficulté	Solution apportée
mongoexport non disponible sur Windows sans installation séparée	Script Node.js export.js utilisant fs.writeFileSync pour générer logs.json directement
Pipeline 4 : aucune anomalie détectée avec le seuil initial de 50	Analyse de la distribution réelle des logs (max 4 par heure) → seuil adapté à 3 selon les données réelles
Doublons d'alertes automatiques à chaque appel de /api/analytics/anomalies	Vérification findOne avant create — si l'alerte existe déjà pour ce pic, on ne la recrée pas
explain() retournait stage FETCH au lieu de IXSCAN	Fonction récursive extractStage() pour traverser les inputStage imbriqués et récupérer le stage feuille
Erreur fetch failed dans test-api.js	Le serveur doit être démarré dans un terminal séparé avant d'exécuter les tests
Conflits d'app_id en doublons lors des tests POST applications	Utilisation de Date.now() pour générer un app_id unique à chaque exécution des tests, avec suppression automatique après test
 
8. Conclusion et perspectives
8.1 Bilan du projet
Le projet LogWatch a permis de construire un système complet de gestion et d'analyse de logs applicatifs pour l'UGANC. Toutes les contraintes obligatoires du sujet ont été respectées :
•	2 000+ logs générés couvrant les 4 types de sources (Java, Web, Sécurité, Base de données)
•	Schéma flexible MongoDB avec opérateur $exists pour le filtrage par type
•	4 pipelines d'agrégation opérationnels dont le pipeline de détection d'anomalies avec $match HAVING
•	2 index validés par explain() avec IXSCAN confirmé
•	23 routes API testées à 100% avec script de test automatisé
•	Interface web complète avec dashboard temps réel, recherche avancée et insertion de logs

MongoDB s'est avéré parfaitement adapté à la problématique des logs applicatifs grâce à son schéma flexible, ses pipelines d'agrégation puissants et ses performances natives sur des données volumineuses et hétérogènes.

8.2 Perspectives
•	Ajout d'un 5ème type de log sans aucune migration — démonstration concrète de l'avantage NoSQL
•	Alertes en temps réel via WebSocket pour une supervision sans délai
•	Authentification JWT pour sécuriser l'accès à l'API et au dashboard
•	Déploiement sur serveur de production avec variables d'environnement sécurisées
•	Augmentation du volume de données pour tester les performances à grande échelle
•	Export des rapports d'analyse en PDF depuis le dashboard
 
Annexes
Annexe A — Structure du projet
logwatch/
├── .env                          ← URI MongoDB (non commitée)
├── .gitignore
├── package.json
├── server.js                     ← Point d'entrée Express
├── README.md
├── models/
│   ├── Application.js
│   ├── Log.js                    ← strict: false (schéma flexible)
│   └── Alerte.js
├── routes/
│   ├── logs.js
│   ├── applications.js
│   ├── alertes.js
│   ├── analytics.js
│   └── audit.js
├── controllers/
│   ├── logsController.js
│   ├── applicationsController.js
│   ├── alertesController.js
│   └── analyticsController.js
├── scripts/
│   ├── seed.js                   ← Génération dataset
│   ├── export.js                 ← Export logs.json
│   └── test-api.js               ← Tests automatisés
├── data/
│   └── logs.json                 ← Dataset 2 000 logs (livrable)
└── public/
    ├── index.html
    ├── css/style.css
    └── js/
        ├── main.js
        ├── dashboard.js
        ├── logs.js
        ├── analytics.js
        ├── audit.js
        └── applications.js

Annexe B — Connexion MongoDB Atlas
Cluster     : Projet3-LogWatch
Base        : logwatch_db
Utilisateur : logwatch_user
URI         : mongodb+srv://logwatch_user:***@projet3-logwatch.tc2ox7y.mongodb.net/logwatch_db
Réseau      : 0.0.0.0/0 (accès tous membres)

Annexe C — Commandes de vérification
// Vérifier le volume
db.logs.countDocuments()   // → 2000

// Vérifier les 4 types de logs
db.logs.findOne({ stack_trace: { $exists: true } })
db.logs.findOne({ methode_http: { $exists: true } })
db.logs.findOne({ user: { $exists: true } })
db.logs.findOne({ requete_sql: { $exists: true } })

// Vérifier les index
db.logs.getIndexes()   // → level_1 et timestamp_-1 présents

// Vérifier les performances
db.logs.find({ level: "ERROR" }).explain("executionStats")   // → IXSCAN

Annexe D — Résultats des tests API
Tous les tests ont été exécutés via le script scripts/test-api.js avec 100% de succès :
•	13 routes /api/logs testées (GET, POST, DELETE, search, java-errors, web, security, slow-db)
•	4 routes /api/applications testées (GET, POST, PUT, DELETE)
•	2 routes /api/alertes testées (GET, PUT résoudre)
•	5 routes /api/analytics testées (performance, error-rate, top-errors, temporal, anomalies)
•	2 routes /api/audit testées (top-ips, users)
•	Total : 26 tests — 26 succès — 0 échec
