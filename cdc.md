UNIVERSITÉ GAMAL ABDEL NASSER DE CONAKRY
Licence 3 — Développement Logiciel


CAHIER DES CHARGES
LogWatch
Système centralisé de gestion et d'analyse de logs applicatifs



Groupe	Groupe 3 — LogTech Solutions
Cheffe de groupe	Laouratou Bah
Projet	Projet n°7 — LogWatch
Cours BD NoSQL	Mr. Djiba Kaba
Cours Gestion de Projet	Méthode Agile Scrum
Version	v1.0 — 11 mai 2026
 
1. Présentation de l'équipe

Le projet LogWatch est réalisé par le Groupe 3, sous le nom de pseudo-startup LogTech Solutions, dans le cadre du cours de Bases de données NoSQL (L3 — Développement Logiciel). L'équipe est composée de 6 membres :

N°	Nom et Prénom	Rôle
1	Laouratou Bah	Cheffe de groupe
2	Hadiatou Sow	Membre
3	Ibrahima Kalil Kourouma	Membre
4	Tiguidanké Nabé	Membre
5	Abdoulaye Diallo	Membre
6	Abdoulaye Dioubaté	Membre

La répartition détaillée des tâches entre les membres sera décidée collectivement par l'équipe lors de la réunion de lancement (Sprint 0), conformément aux principes de la méthode Agile Scrum.

 
2. Contexte et présentation du projet

2.1 Problème actuel
Dans les environnements informatiques universitaires et d'entreprise, la gestion des logs applicatifs constitue un défi majeur souvent sous-estimé. Les logs sont générés en permanence par des dizaines d'applications hétérogènes : systèmes d'information étudiants, messageries, serveurs web, pare-feux, bases de données. En l'absence d'un système centralisé, ces données critiques se retrouvent dispersées sur des fichiers locaux, des serveurs isolés ou des outils non connectés.
Cette fragmentation entraîne des conséquences directes : détection tardive des pannes, impossibilité d'analyser les tendances d'erreurs, audit de sécurité difficile et temps de résolution des incidents très allongé. Dans un contexte académique comme celui de l'UGANC, plusieurs applications critiques coexistent (plateforme pédagogique, portail étudiant, messagerie institutionnelle, pare-feu réseau) — l'absence d'un outil de monitoring centralisé expose l'infrastructure à des risques importants.
Par ailleurs, les formats de logs varient radicalement d'une application à l'autre : une erreur Java produit une stack_trace multiligne, un log réseau contient une ip_source, un log web inclut un user_agent et un code HTTP. Cette hétérogénéité structurelle rend les bases de données relationnelles SQL totalement inadaptées — un schéma fixe ne peut pas accueillir ces formats sans multiplier les colonnes NULL.
2.2 Besoins identifiés
Face à cette situation, les équipes techniques expriment un besoin croissant de centralisation et d'analyse des logs :
•	disposer d'un tableau de bord centralisé affichant l'état de santé des applications en temps réel ;
•	rechercher et filtrer rapidement les logs par niveau de sévérité, application et période ;
•	détecter automatiquement les anomalies (pics d'erreurs, répétitions suspectes) ;
•	réaliser des audits de sécurité sur les tentatives de connexion et accès suspects ;
•	mesurer le taux d'erreur de chaque application et conserver un historique structuré.
2.3 Raison d'être du projet
LogWatch est né de la volonté de répondre à ces problématiques en proposant une plateforme web centralisée de collecte, stockage et analyse de logs applicatifs, construite sur MongoDB — particulièrement adapté à la nature hétérogène et volumineuse des données de logs.
LogWatch vise à transformer des flux de logs bruts et disparates en informations exploitables, permettant aux équipes techniques de réagir rapidement aux incidents, d'anticiper les défaillances et de renforcer la sécurité de leur infrastructure.
2.4 Acteurs impliqués
•	L'administrateur système : supervise le dashboard, gère les alertes, configure les applications sources.
•	Les développeurs / équipes techniques : consultent les logs, filtrent par application et niveau, analysent les erreurs.
•	Le responsable sécurité : utilise le module d'audit pour détecter les tentatives d'intrusion.
•	Le système (automatique) : génère des alertes via les pipelines de détection d'anomalies.
•	L'équipe projet (Groupe 3 — LogTech Solutions) : conception, développement et maintenance de la plateforme.
•	Les encadreurs académiques : suivi méthodologique (cours BD NoSQL — Mr. Djiba Kaba, et cours Gestion de Projet).
 
3. Objectifs du projet

3.1 Objectifs généraux
L'objectif général de LogWatch est de concevoir et mettre en œuvre une application web de monitoring centralisé permettant la collecte, le stockage structuré et l'analyse de logs applicatifs hétérogènes, en exploitant les capacités NoSQL de MongoDB pour gérer efficacement le volume et la diversité des données.
3.2 Objectifs spécifiques
•	Centraliser les logs de 4 sources applicatives distinctes dans une base MongoDB avec schéma flexible ;
•	Offrir un tableau de bord web temps réel avec indicateurs de sévérité par application ;
•	Permettre la recherche et le filtrage des logs par niveau, application, période et type ($exists) ;
•	Implémenter 4 pipelines d'agrégation MongoDB : taux d'erreur, distribution temporelle, top erreurs, détection d'anomalies ;
•	Générer un dataset réaliste de 2 000 à 5 000 logs couvrant les 4 types de sources ;
•	Créer et justifier des index sur timestamp et level avec mesure de performance (explain()) ;
•	Simuler l'insertion de logs en temps réel depuis l'interface ;
•	Démontrer concrètement l'inadaptation du SQL face aux logs hétérogènes (colonnes NULL).
3.3 Améliorations attendues
•	Réactivité face aux incidents : détection immédiate des erreurs critiques et des pics d'activité ;
•	Visibilité de l'infrastructure : tableau de bord centralisé remplaçant la consultation manuelle de fichiers ;
•	Sécurité renforcée : audit automatisé des tentatives de connexion suspectes ;
•	Analyse rétrospective : historique structuré permettant d'identifier des patterns d'erreurs récurrents ;
•	Performance des requêtes : indexation MongoDB justifiée et mesurée.
 
4. Périmètre du projet

4.1 Ce qui est inclus
•	Conception et développement d'une application web accessible via navigateur ;
•	Génération d'un dataset de 2 000 à 5 000 logs couvrant 4 types de sources applicatives ;
•	Mise en place de la base MongoDB avec 3 collections (applications, logs, alertes_systeme) ;
•	Tableau de bord temps réel : erreurs critiques, volume de logs par application ;
•	Moteur de recherche et filtrage des logs (niveau, application, période, type via $exists) ;
•	4 pipelines d'agrégation MongoDB : taux d'erreur, distribution temporelle, top erreurs, anomalies ;
•	Création et justification d'index sur timestamp et level avec comparaison de performance ;
•	Simulation d'insertion de logs en temps réel depuis l'interface ;
•	Système d'alertes automatiques pour les erreurs critiques (CRITICAL) ;
•	Documentation complète du projet selon la norme IEEE 830.
4.2 Ce qui est exclu
•	Authentification et gestion des comptes utilisateurs (hors périmètre académique — non évalué) ;
Choix délibéré : l'équipe concentre ses efforts sur les fonctionnalités MongoDB obligatoires (pipelines, schéma flexible, index). Une authentification JWT est envisagée en perspective d'évolution.
•	Application mobile native (Android ou iOS) ;
•	Intégration avec des agents de collecte de logs réels (Logstash, Fluentd, Filebeat) ;
•	Déploiement en production sur une infrastructure réelle universitaire ;
•	Maintenance commerciale après la phase académique ;
•	Toute fonctionnalité non décrite dans le présent cahier des charges.
 
5. Description fonctionnelle

La présente section décrit l'ensemble des fonctionnalités de LogWatch, organisées en modules. Chaque module répond à un besoin précis des utilisateurs.
MODULE 1 — Tableau de bord (Dashboard)
Cœur opérationnel de LogWatch — vue synthétique temps réel de l'état de santé des applications.
1.1 Vue d'ensemble temps réel
•	Volume total de logs par application sur les dernières 24h.
•	Indicateurs : nombre d'erreurs CRITICAL et ERROR actives, taux de disponibilité par application.
•	Histogramme de distribution temporelle des logs (par heure).
1.2 Alertes actives
•	Liste des alertes système non résolues avec niveau de criticité.
•	Possibilité de marquer une alerte comme résolue depuis l'interface.
•	Compteur de logs CRITICAL des 30 dernières minutes.
1.3 Insertion temps réel (simulation)
•	Formulaire d'insertion d'un nouveau log depuis l'interface.
•	Mise à jour instantanée du dashboard après insertion.
•	Déclenchement automatique d'une alerte si le log inséré est CRITICAL.
MODULE 2 — Recherche & Filtrage
Retrouver rapidement des logs spécifiques selon plusieurs critères.
2.1 Filtres disponibles
•	Niveau de sévérité : DEBUG / INFO / WARN / ERROR / CRITICAL.
•	Application source (app_id).
•	Plage de dates (timestamp_debut — timestamp_fin).
•	Recherche textuelle dans le champ message.
2.2 Filtrage par type de log ($exists)
•	Logs avec stack_trace uniquement (erreurs Java critiques).
•	Logs web uniquement (champ methode_http présent).
•	Logs de sécurité (champs user et action présents).
•	Logs base de données (champ requete_sql présent).
2.3 Affichage des résultats
•	Résultats paginés (50 logs par page).
•	Détail complet d'un log au clic (tous les champs spécifiques visibles).
MODULE 3 — Opérations CRUD
Gestion complète des documents dans les collections MongoDB.
3.1 Collection logs
•	CREATE : insertion d'un nouveau log via le formulaire temps réel (POST /api/logs).
•	READ : lecture filtrée des logs avec requêtes find() avancées ($regex, $in, $exists).
•	UPDATE : mise à jour du statut d'un log (ex. : marquer comme traité).
•	DELETE : suppression d'un log ou d'un ensemble de logs par filtre.
3.2 Collection alertes_systeme
•	CREATE : création automatique d'alerte lors d'un pic ou d'un log CRITICAL.
•	READ : consultation de toutes les alertes avec filtres.
•	UPDATE : marquer une alerte comme résolue (resolue = true), assigner à un membre.
•	DELETE : suppression des alertes archivées.
3.3 Collection applications
•	CREATE : ajout d'une nouvelle application source.
•	READ : consultation de la fiche d'une application avec ses statistiques.
•	UPDATE : mise à jour de la version, du responsable ou du SLA.
•	DELETE : désactivation d'une application source.
MODULE 4 — Pipelines d'agrégation MongoDB
Transformation des logs bruts en informations exploitables via 4 pipelines obligatoires.
Pipeline 1 — Taux d'erreur par application
•	$group par app_id et level — calcul du % d'erreurs (ERROR + CRITICAL) par rapport au total.
•	Affichage en tableau et graphique en barres.
Pipeline 2 — Distribution temporelle
•	$group avec $dateToString par heure — histogramme du volume de logs sur 24h.
•	Identification visuelle des pics d'activité anormaux.
Pipeline 3 — Top 10 erreurs
•	$group par message + $sort + $limit 10 — messages d'erreur les plus répétés.
•	Drill-down possible pour voir les logs correspondants.
Pipeline 4 — Détection d'anomalies
•	$group par heure → $match HAVING volume > seuil (ex. : > 100 logs/heure).
•	Génération automatique d'une alerte_systeme si une anomalie est détectée.
MODULE 5 — Audit de sécurité
•	Affichage des tentatives de connexion échouées (succes = false).
•	Regroupement par ip_source pour détecter les attaques par force brute.
•	Pipeline : top 10 des IP les plus actives sur les connexions échouées.
MODULE 6 — Gestion des applications
•	Liste des applications enregistrées avec statut (prod/dev/test).
•	Fiche application : nom, version, technologie, SLA, responsable.
•	Statistiques par application : volume de logs, taux d'erreur, dernière activité.
MODULE 7 — Performance & Index
•	Affichage du temps de réponse d'une requête avec et sans index (explain()).
•	Visualisation des index créés sur timestamp et level.
•	Section dédiée dans le rapport : justification et mesure de l'impact des index.
 
6. Exigences non fonctionnelles

6.1 Performance
•	Chargement du dashboard principal en moins de 3 secondes en conditions normales.
•	Requêtes de filtrage en moins de 2 secondes grâce aux index MongoDB.
•	Pipelines d'agrégation en moins de 5 secondes sur 2 000 à 5 000 documents.
•	L'architecture doit supporter une montée en charge vers 100 000+ logs si nécessaire.
6.2 Sécurité
Dans cette version académique, l'interface web est accessible sans authentification, conformément au périmètre défini en section 4.2. L'équipe a choisi de concentrer ses efforts sur les fonctionnalités MongoDB obligatoires. Une authentification JWT est proposée comme évolution future.
•	Les données en transit doivent être chiffrées (HTTPS en production).
•	Les variables sensibles (URI MongoDB) doivent être stockées dans des fichiers d'environnement (.env).
6.3 Ergonomie
•	Interface responsive : fonctionnelle sur ordinateur, tablette et smartphone.
•	Dashboard lisible d'un coup d'œil, avec couleurs distinctives par niveau de sévérité (rouge = CRITICAL, orange = ERROR, jaune = WARN).
•	Messages d'erreur et de confirmation explicites.
•	Interface en français.
Note technique : le niveau de sophistication du frontend (React vs HTML/CSS vanilla) sera décidé par l'équipe selon sa maîtrise des technologies. L'évaluation porte sur MongoDB, pas sur le framework frontend.
6.4 Maintenance
•	Code source modulaire, structuré et commenté.
•	Documentation technique complète : architecture, endpoints API, collections MongoDB.
6.5 Compatibilité
•	Navigateurs : Google Chrome, Firefox, Edge, Safari.
•	Systèmes : Windows, Linux, macOS et navigateurs mobiles (Android/iOS).
 
7. Architecture et technologies

7.1 Architecture générale
Architecture retenue : Backend REST API (Node.js/Express) + Frontend web + Base de données MongoDB.
•	Frontend : interface utilisateur (HTML/CSS/JS ou React selon décision d'équipe) ;
•	Backend : API REST Node.js/Express exposant les données MongoDB ;
•	Base de données : MongoDB avec Mongoose comme ODM ;
•	Génération de données : script Faker.js pour produire 2 000 à 5 000 logs réalistes.

7.2 Stack technologique retenu
Couche	Technologie retenue	Justification
Backend	Node.js 20 + Express 4	Stack JavaScript unifié avec le frontend. Manipulation native du JSON (format des logs MongoDB). Modèle non-bloquant adapté aux APIs avec nombreuses requêtes simultanées.
Frontend	HTML/CSS/JS + Bootstrap 5 (ou React selon niveau)	Bootstrap 5 (CDN) permet un dashboard professionnel en 1 jour. React envisageable si l'équipe le maîtrise déjà. L'évaluation porte sur MongoDB, pas sur le framework frontend.
Base de données	MongoDB 7 + Mongoose 8	Schéma flexible natif — chaque type de log a ses propres champs sans colonne NULL. Pipeline d'agrégation natif, performant. Index sur timestamp et level.
Génération données	Faker.js (Node.js)	Génération de données réalistes en JS : IPs, user-agents, stack traces, requêtes SQL. Cohérence avec le reste du stack.
ODM	Mongoose 8	Définition des schémas MongoDB avec validation et middleware. Facilite les opérations CRUD et les pipelines.
Graphiques	Chart.js (CDN) ou Recharts	Chart.js via CDN est simple et rapide. Recharts si le frontend est en React. Indispensable pour les histogrammes du dashboard.
Versioning	Git + GitHub	Collaboration à 6 membres : branches par fonctionnalité, pull requests, historique des commits.
Gestion de projet	Jira (Scrum)	Epics, User Stories, tableau Scrum avec sprints d'une semaine. Gestion du backlog et des impediments.

7.3 Justification de Node.js vs Python
•	Cohérence du stack : JavaScript partout (frontend + backend). L'équipe maîtrise un seul langage.
•	Traitement JSON natif : Node.js manipule nativement le JSON, format des documents MongoDB.
•	Performance I/O : le modèle non-bloquant (event loop) de Node.js est adapté aux dashboards avec nombreuses requêtes simultanées.
•	Faker.js : bibliothèque plus riche et mieux maintenue que Faker Python pour la génération de logs réalistes.

7.4 Justification de MongoDB vs SQL
LogWatch illustre parfaitement les cas où MongoDB est supérieur à SQL :
Critère	SQL (PostgreSQL)	MongoDB	Avantage
Schéma des logs	Colonnes fixes — 90% NULL selon le type	Champs variables par type (stack_trace, user_agent...)	MongoDB
Volume	Dégradation sans partitionnement complexe	Conçu pour le volume, index natifs sur timestamp	MongoDB
Nouveaux formats	ALTER TABLE à chaque nouveau format de log	Nouveaux champs sans migration de schéma	MongoDB
Agrégation	JOINs multiples, GROUP BY complexes	Pipelines natifs, expressifs et performants	MongoDB

7.5 Hébergement et déploiement
•	Développement : MongoDB Community Edition en local (localhost:27017).
•	Alternative cloud : MongoDB Atlas (plan gratuit M0) pour le travail collaboratif à distance.
•	Backend : serveur Node.js/Express local (port 3000).
•	Déploiement MVP (optionnel) : Render.com ou Railway.app (plans gratuits).

7.6 Résumé du stack final
Composant	Technologie
Backend	Node.js 20 LTS + Express 4
Frontend	Bootstrap 5 + HTML/CSS/JS (ou React selon décision d'équipe)
Base de données	MongoDB 7 + Mongoose 8
Graphiques	Chart.js (CDN) ou Recharts
Génération de données	Faker.js 8 (Node.js) — 2 000 à 5 000 logs
Versioning	Git + GitHub (branches par fonctionnalité)
Gestion de projet	Jira — Méthode Agile Scrum (2 sprints d'1 semaine)
Base de données cloud	MongoDB Atlas M0 (gratuit) pour collaboration à distance
Déploiement (optionnel)	Render.com ou Railway.app (plans gratuits)
 
8. Modélisation

8.1 Diagramme de cas d'usage
Acteurs
•	Administrateur système : supervise le dashboard, gère les alertes, configure les applications sources.
•	Développeur / Technicien : consulte les logs, filtre par application et niveau, analyse les erreurs.
•	Responsable sécurité : détecte les tentatives d'intrusion via le module d'audit.
•	Système (automatique) : génère des alertes via les pipelines de détection d'anomalies.
Cas d'usage — Administrateur / Développeur
•	Consulter le dashboard temps réel
•	Insérer un nouveau log (simulation temps réel)
•	Rechercher des logs par niveau, application, période
•	Filtrer par type de log ($exists : stack_trace, methode_http, user, requete_sql)
•	Consulter le détail d'un log (stack_trace complète)
•	Consulter les statistiques d'agrégation (taux d'erreur, top erreurs, distribution temporelle)
•	Détecter des anomalies (pipeline $group + $match HAVING)
•	Gérer les alertes (marquer comme résolue, assigner)
•	Consulter les performances des index MongoDB (explain())
Cas d'usage — Responsable sécurité
•	Consulter les tentatives de connexion échouées (succes = false)
•	Identifier les IPs suspectes (top connexions échouées par ip_source)
•	Filtrer les logs de sécurité par user et action

8.2 Modélisation de la base de données MongoDB
La base de données LogWatch contient 3 collections. Le schéma flexible de MongoDB est au cœur de la modélisation : la collection logs accueille 4 types de documents aux structures radicalement différentes dans la même collection, sans aucune colonne NULL.
Collection : applications — Volume minimum : 10+ documents
Champ	Description
app_id	Identifiant unique de l'application (ex. : app_001)
nom	Nom de l'application (ex. : Portail étudiant, Messagerie institutionnelle)
version	Version de l'application (ex. : 2.3.1)
environnement	Environnement de déploiement : prod / dev / test
technologie	Technologie : Java / Python / Node.js / PHP
responsable	Nom du responsable technique
sla_pct	Objectif de disponibilité SLA (ex. : 99.9%)

Collection : logs — Volume : 2 000 à 5 000 documents (collection principale)
Champs communs à TOUS les types de logs :
Champ commun	Description
log_id	Identifiant unique (ObjectId MongoDB)
app_id	Référence vers la collection applications (indexé)
timestamp	Date et heure précise du log — ISODate — INDEXÉ
level	Sévérité : DEBUG / INFO / WARN / ERROR / CRITICAL — INDEXÉ
message	Message principal du log
source_fichier	Fichier source ayant généré le log (ex. : AuthController.java)
ligne_code	Numéro de ligne dans le fichier source

Champs spécifiques par type de log — SCHÉMA FLEXIBLE (absents des autres types) :
Type de log	Champs spécifiques	Exemple
Erreurs applicatives	stack_trace, exception_type, nb_occurrences	NullPointerException — AuthService.java:42 — 3 occurrences
Logs web	methode_http, url, code_statut, duree_ms, user_agent, ip_source	POST /api/login — 401 — Mozilla/5.0 — 192.168.1.5 — 240ms
Logs base de données	requete_sql, duree_ms, nb_lignes_affectees	SELECT * FROM etudiants WHERE... — 1 240ms — 5 432 lignes
Logs sécurité	user, action, ip_source, succes, tentatives	admin — LOGIN_FAILED — 10.0.0.23 — false — 5 tentatives

Illustration du schéma flexible : deux documents de la même collection 'logs' peuvent avoir des structures totalement différentes. Un log web a methode_http mais pas stack_trace, un log d'erreur a stack_trace mais pas ip_source. En SQL, cela nécessiterait soit 4 tables séparées avec JOINs complexes, soit une seule table avec 90% de valeurs NULL.

Collection : alertes_systeme — Volume minimum : 50+ documents
Champ	Description
alerte_id	Identifiant unique de l'alerte
app_id	Application source de l'alerte (référence applications)
timestamp	Date et heure de déclenchement
type_alerte	PIC_VOLUME / ERREUR_CRITIQUE / SECURITE / SLA_BREACH
description	Description lisible de l'alerte
seuil_declenche	Seuil configuré (ex. : > 100 logs/heure)
valeur_observee	Valeur effectivement observée (ex. : 247 logs en 1 heure)
resolue	Booléen — true si l'alerte a été traitée
assignee	Nom du membre assigné à la résolution

8.3 Index MongoDB — Justification
Index	Collection	Justification
{ timestamp: -1 }	logs	Optimise les requêtes de filtrage par période (les plus fréquentes en monitoring). Tri décroissant pour afficher les logs récents en premier. Impact mesuré avec explain().
{ level: 1 }	logs	Optimise les requêtes de filtrage par niveau de sévérité (ERROR, CRITICAL). Cas d'usage principal du dashboard. Impact mesuré avec explain().

8.4 Relations entre collections
•	applications 1—N logs (app_id référence la collection applications)
•	applications 1—N alertes_systeme (app_id référence la collection applications)
•	logs ——> alertes_systeme (les pipelines d'agrégation sur logs génèrent des alertes_systeme)

8.5 Flux de données principaux
•	Script Faker.js → génération de 2 000 à 5 000 logs → insertion MongoDB (insertMany)
•	Frontend → requête API REST → Node.js/Express → Mongoose → MongoDB → réponse JSON → affichage
•	Pipeline d'agrégation → $group par heure → $match HAVING → création alerte_systeme si seuil dépassé
•	Insertion log (interface) → POST /api/logs → vérification level CRITICAL → alerte automatique

8.6 Diagramme de classes UML
Classes principales
•	Application : appId, nom, version, environnement, technologie, responsable, slaPct
•	Log : logId, appId, timestamp, level, message, sourceFichier, ligneCode [+ champs spécifiques selon type]
•	LogErreur (extends Log) : stackTrace, exceptionType, nbOccurrences
•	LogWeb (extends Log) : methodeHttp, url, codeStatut, dureeMs, userAgent, ipSource
•	LogBDD (extends Log) : requeteSql, dureeMs, nbLignesAffectees
•	LogSecurite (extends Log) : user, action, ipSource, succes, tentatives
•	AlerteSysteme : alerteId, appId, timestamp, typeAlerte, description, seuilDeclenche, valeurObservee, resolue, assignee
Associations
•	Application 1..* Log
•	Application 1..* AlerteSysteme
•	Log ---> AlerteSysteme (via pipeline d'agrégation)
 
9. Organisation de l'équipe — Méthode Agile Scrum

Le projet LogWatch est conduit selon la méthodologie Agile Scrum, adaptée à un projet académique de 2 semaines. L'équipe (Groupe 3 — LogTech Solutions) est composée de 6 membres. La répartition des rôles Scrum et des tâches sera décidée collectivement lors du Sprint 0.

9.1 Rôles Scrum à attribuer en équipe
Les rôles suivants devront être attribués lors de la réunion de lancement :
Rôle Scrum	Responsabilités
Scrum Master	Organisation des cérémonies Agile (daily, sprint review, retrospective), suivi du board Jira, levée des blocages.
Product Owner	Garant du CDC et du rapport final, priorisation du backlog, interface avec les encadreurs.
Développeurs (x4)	Génération des données, modélisation MongoDB, développement backend (API REST), développement frontend (dashboard, recherche).

La répartition précise des tâches entre les 6 membres sera décidée collectivement lors du Sprint 0 et documentée dans le board Jira.

9.2 Planning Agile — 2 Sprints Scrum
Sprint 0 — Lancement (J1, demi-journée)
•	Validation du CDC en équipe.
•	Création du dépôt GitHub et configuration des branches.
•	Configuration du board Jira : Epics, User Stories, sprints.
•	Attribution collective des rôles et des tâches.
•	Choix final du frontend (Bootstrap vs React).
Sprint 1 (Semaine 1) — Données & MongoDB
Objectif : base MongoDB fonctionnelle avec 2 000+ logs et toutes les requêtes MongoDB validées.
Jour	Tâches Sprint 1
J1	Modélisation finale des collections MongoDB. Validation du schéma des 4 types de logs.
J2	Écriture du script Faker.js : génération de 2 000 à 5 000 logs réalistes (4 types).
J3	Création des collections MongoDB, insertion des données, création des 2 index.
J4	Écriture et test des 4 pipelines d'agrégation dans mongosh. Mesure de performance (explain()).
J5	Mise en place du projet Node.js/Express. Connexion MongoDB via Mongoose. Routes de base. Revue Sprint 1.

Sprint 2 (Semaine 2) — Application & Rapport
Objectif : application web fonctionnelle avec dashboard, recherche, alertes et rapport rédigé.
Jour	Tâches Sprint 2
J6	Développement des endpoints API REST (logs, alertes, applications, 4 pipelines d'agrégation).
J7	Dashboard frontend : indicateurs temps réel, histogrammes, compteurs d'alertes.
J8	Module recherche : filtres par niveau, application, période, $exists. Insertion log temps réel.
J9	Rédaction du rapport final : modélisation, pipelines, comparaison SQL/MongoDB, index.
J10	Tests, corrections de bugs, préparation du diaporama, répétition de la démo live.

9.3 Cérémonies Agile Scrum
•	Daily standup (10 min/jour) : Qu'ai-je fait hier ? Que vais-je faire aujourd'hui ? Y a-t-il des blocages ?
•	Sprint Review (fin de chaque sprint) : démonstration de ce qui a été produit, validation collective.
•	Sprint Retrospective : ce qui a bien fonctionné, ce qui peut être amélioré, actions correctives.
•	Backlog Grooming : révision et priorisation des User Stories avant le Sprint 2.

9.4 Outils de gestion de projet
•	Jira : board Scrum avec Epics, User Stories, sprints d'une semaine et gestion du backlog.
•	GitHub : dépôt unique avec branches par fonctionnalité (feature/dashboard, feature/api-logs...).
•	WhatsApp / Discord : communication rapide et partage de ressources entre membres.
•	Google Meet : réunions de sprint review et retrospective.
 
10. Calendrier (Planning prévisionnel)

Durée : 2 semaines — Méthodologie : Agile Scrum avec 2 sprints d'une semaine, daily standups et sprint reviews.

Phase	Durée	Livrables
Sprint 0 — Lancement & cadrage	J1 (demi-journée)	CDC validé, GitHub créé, board Jira configuré, rôles attribués
Sprint 1 — Données & MongoDB	J1 – J5 (1 semaine)	Script Faker.js, dataset 2000-5000 logs, collections MongoDB, 4 pipelines, index
Sprint 2 — Application & Tests	J6 – J9 (4 jours)	API REST, dashboard, recherche, alertes, insertion temps réel
Phase finale — Rapport & Soutenance	J9 – J10 (1 jour)	Rapport final, diaporama, répétition soutenance, démo live validée
 
11. Livrables

11.1 Code source
•	Dépôt GitHub structuré (branches protégées, historique des commits, README complet).
•	Script de génération des logs simulés (Faker.js — 2 000 à 5 000 documents).
•	API REST Node.js/Express avec tous les endpoints et les 4 pipelines d'agrégation.
•	Application frontend avec dashboard, recherche et alertes.
11.2 Dataset JSON
•	Fichier JSON exporté contenant 2 000 à 5 000 logs couvrant les 4 types de sources.
•	Script d'import MongoDB (mongoimport ou script Node.js).
•	Exemples de documents illustrant le schéma flexible (même collection, structures différentes).
11.3 Documentation technique
•	Architecture logicielle (schéma Backend / Frontend / MongoDB).
•	Description des 3 collections MongoDB et de leurs champs.
•	Documentation des endpoints API (route, méthode, paramètres, réponse).
•	Justification des index avec mesure de performance (explain() avec et sans index).
11.4 Rapport écrit (10-15 pages)
•	Introduction : contexte, problématique, objectifs.
•	Modélisation : collections, documents exemples, justification des choix.
•	Justification NoSQL vs SQL : schéma SQL équivalent avec colonnes NULL, problèmes identifiés.
•	Les 4 pipelines d'agrégation avec leur équivalent SQL et leurs résultats.
•	Analyse des performances : requêtes avec et sans index (explain()).
•	Difficultés rencontrées et solutions apportées.
•	Conclusion et perspectives (dont authentification JWT comme évolution).
11.5 Diaporama de soutenance (10-15 slides)
•	Contexte et problématique des logs en informatique.
•	Présentation de LogWatch et de ses fonctionnalités.
•	Modélisation MongoDB : schéma flexible illustré avec exemples de documents.
•	Démonstration live de l'application.
•	Comparaison SQL vs MongoDB argumentée.
11.6 Démonstration live
•	Dashboard temps réel avec données réelles.
•	Simulation d'insertion d'un log et déclenchement d'alerte.
•	Pipeline de détection d'anomalies en action.
•	Filtrage $exists par type de log.
•	Comparaison de performance avec/sans index (explain()).
 
12. Modalités de test et validation

12.1 Types de tests
Tests unitaires
•	Fonctions de génération de données Faker.js (vérification du format des 4 types de logs).
•	Validateurs Mongoose (champs obligatoires, types, valeurs acceptées pour level).
Tests d'intégration
•	Communication correcte entre l'API REST et MongoDB.
•	Exécution correcte des 4 pipelines d'agrégation avec résultats cohérents.
•	Déclenchement automatique des alertes lors de l'insertion de logs CRITICAL.
Tests fonctionnels — Scénarios
•	Scénario 1 : filtrage des logs ERROR de l'application 'Portail étudiant' sur les 7 derniers jours.
•	Scénario 2 : détection d'un pic de volume (>100 logs/heure) et génération d'une alerte_systeme.
•	Scénario 3 : affichage des logs avec stack_trace uniquement ($exists = true).
•	Scénario 4 : insertion d'un log CRITICAL et vérification de l'alerte créée automatiquement.
•	Scénario 5 : comparaison du temps de réponse avec et sans index (explain()).
12.2 Critères d'acceptation
•	Fonctionnalité implémentée conformément aux exigences du CDC.
•	Aucun dysfonctionnement bloquant lors des tests.
•	Les 4 pipelines retournent des résultats cohérents avec les données.
•	Les index MongoDB améliorent mesuralement les temps de réponse.
12.3 Validation finale
•	Revue collective du code sur GitHub (pull requests).
•	Démonstration live validée par l'ensemble du groupe avant la soutenance.
•	Rapport relu et validé par la cheffe de groupe avant soumission.
 
13. Budget estimatif

Le budget du projet LogWatch est établi dans un contexte académique, en privilégiant des solutions open source et gratuites. Tous les montants sont exprimés en Franc Guinéen (GNF). Taux de référence utilisé : 1 USD ≈ 8 700 GNF — 1 EUR ≈ 9 500 GNF (mai 2026).

13.1 Coût du développement humain
Le développement est entièrement réalisé par les 6 membres du Groupe 3 dans le cadre académique. Aucun coût financier direct n'est engagé. La valeur estimative indicative est donnée à titre pédagogique.
Poste	Coût direct (GNF)	Valeur indicative (GNF)
Travail de l'équipe (6 membres × 2 semaines)	0 GNF (académique)	7 000 000 – 12 000 000 GNF

13.2 Hébergement et infrastructure
Élément	Coût mensuel (GNF)	Coût annuel (GNF)
MongoDB Atlas M0 (plan gratuit)	0 GNF	0 GNF
Render.com (plan gratuit)	0 GNF	0 GNF
GitHub (plan gratuit)	0 GNF	0 GNF
Jira (plan Free — jusqu'à 10 membres)	0 GNF	0 GNF
Nom de domaine (optionnel)	~8 000 GNF / mois	~95 000 GNF / an
TOTAL infrastructure	0 GNF (sans domaine)	0 – 95 000 GNF / an

13.3 Connexion Internet et équipement
La connexion Internet est nécessaire pour la collaboration à distance (GitHub, Jira, MongoDB Atlas, réunions Meet).
Poste	Coût estimé par membre	Coût total équipe (6 membres)
Forfait data mobile (2 semaines)	~50 000 GNF	~300 000 GNF
Électricité (charge ordinateurs)	~15 000 GNF	~90 000 GNF
Impression (rapport + diaporama)	~20 000 GNF	~20 000 GNF
TOTAL équipement	~85 000 GNF / membre	~410 000 GNF

13.4 Récapitulatif général
Poste	Montant estimé (GNF)
Développement (valeur académique estimée)	7 000 000 – 12 000 000 GNF (non facturé)
Hébergement & infrastructure (annuel)	0 – 95 000 GNF / an
Connexion Internet & électricité	~300 000 GNF (forfaits 2 semaines)
Impression et supports	~20 000 GNF
TOTAL coût direct (hors travail académique)	~320 000 – 415 000 GNF

Le budget réel engagé par le groupe est limité aux forfaits Internet, à l'électricité et aux impressions, soit environ 320 000 à 415 000 GNF pour les 2 semaines du projet. Toutes les technologies utilisées sont gratuites et open source.
 
14. Annexes

14.1 Glossaire
Terme	Définition
$exists	Opérateur MongoDB filtrant les documents selon la présence ou l'absence d'un champ — clé du schéma flexible.
$group	Étape de pipeline MongoDB regroupant les documents selon un critère et calculant des agrégats (count, sum, avg...).
$match	Étape de pipeline MongoDB filtrant les documents selon une condition (équivalent WHERE/HAVING en SQL).
Agrégation	Pipeline de traitement de données MongoDB : séquence d'étapes ($match, $group, $sort, $project, $limit).
API REST	Interface de Programmation Applicative respectant l'architecture REST pour la communication client-serveur en JSON.
Backlog	Liste priorisée de toutes les User Stories et tâches à réaliser dans un projet Scrum.
CDC	Cahier des Charges — document de référence décrivant les exigences fonctionnelles et non fonctionnelles d'un projet.
CRUD	Create, Read, Update, Delete — les 4 opérations fondamentales sur une base de données.
Daily Standup	Réunion quotidienne de 10 min en Scrum : hier / aujourd'hui / blocages.
Epic	Grand ensemble de User Stories dans Jira, regroupées par thème fonctionnel.
explain()	Méthode MongoDB analysant l'exécution d'une requête pour mesurer l'impact des index.
Faker.js	Bibliothèque JavaScript de génération de données fictives réalistes (IPs, user-agents, stack traces...).
GNF	Franc Guinéen — monnaie officielle de la République de Guinée.
IEEE 830	Norme internationale définissant la structure d'une Software Requirements Specification (SRS).
Index	Structure de données MongoDB accélérant les requêtes sur les champs indexés (ex. : timestamp, level).
Jira	Outil de gestion de projet Agile (Atlassian) utilisé pour les Epics, User Stories et sprints.
JSON	JavaScript Object Notation — format d'échange de données utilisé nativement par MongoDB.
Level	Niveau de criticité d'un log : DEBUG < INFO < WARN < ERROR < CRITICAL.
Log	Enregistrement horodaté d'un événement applicatif généré automatiquement par un système ou une application.
Mongoose	ODM (Object Data Modeling) pour MongoDB en Node.js — facilite la définition de schémas et les opérations CRUD.
MVP	Minimum Viable Product — version minimale fonctionnelle du produit couvrant les exigences obligatoires.
NoSQL	Famille de bases de données non relationnelles offrant un schéma flexible, adapté aux données hétérogènes.
ODM	Object Data Modeling — couche d'abstraction entre le code applicatif et la base de données.
Pipeline	Séquence d'étapes de traitement de données dans MongoDB.
Product Owner	Rôle Scrum responsable du backlog, des priorités et de la vision produit.
Scrum	Cadre Agile de gestion de projet basé sur des sprints, des rôles définis et des cérémonies régulières.
Scrum Master	Rôle Scrum facilitant les cérémonies, levant les blocages et veillant au respect de la méthode.
SLA	Service Level Agreement — engagement de disponibilité d'un service (ex. : 99.9%).
Sprint	Itération de développement courte (1 semaine ici) avec un objectif clair et des livrables définis.
Stack trace	Trace complète de la pile d'appel lors d'une erreur — champ spécifique aux logs d'erreurs Java.
User Story	Description fonctionnelle d'une fonctionnalité du point de vue de l'utilisateur, dans Jira.

14.2 Références
•	IEEE 830 — Software Requirements Specification (SRS)
•	Cours de Bases de données NoSQL — MongoDB — UGANC L3 Développement Logiciel — Mr. Djiba Kaba
•	Cours de Gestion de Projet — Méthode Agile Scrum — UGANC
•	Documentation officielle MongoDB : mongodb.com/docs
•	Documentation officielle Mongoose : mongoosejs.com/docs
•	Documentation officielle Node.js : nodejs.org/docs
•	Documentation Faker.js : fakerjs.dev
•	Documentation Jira Scrum : atlassian.com/agile/scrum
•	Elastic Stack — cas d'usage NoSQL pour logs : elastic.co

14.3 Documents complémentaires
•	Board Jira du projet (Epics, User Stories, sprints)
•	Dépôt GitHub du projet (code source, documentation, dataset)
•	Script Faker.js de génération des données
•	Export du dataset JSON (2 000 à 5 000 logs)
•	Diagrammes UML détaillés (cas d'usage, classes, séquences)
•	Rapport de comparaison des performances avec/sans index MongoDB (explain())
