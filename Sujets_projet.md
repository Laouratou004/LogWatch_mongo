Sujets de Projets
Bases de données MongoDB


Licence 3 — Développement logiciel

Vue d'ensemble des 7 sujets
N°	Nom du projet	Domaine	Volume minimum
1	GuinéaStream	Streaming musical	500 000+ écoutes
2	SensGuinée	Surveillance IoT	2 000 000+ relevés capteurs
3	ScholarsNet	Réseau académique	1 000+ publications scientifiques
4	ConakryMarket	E-commerce	100 000+ transactions
5	MediTrack	Dossiers médicaux	50 000+ événements médicaux
6	InfoGuinée	Agrégateur d'actualités	50 000+ articles
7	LogWatch	Gestion de logs	1 000 000+ logs applicatifs


  Règle d'attribution
Chaque sujet est attribué à un seul groupe — pas de doublons.
Groupes de 6 étudiants — durée : 2 semaines.
Livrable : application web + rapport écrit + presentation orale.

 
Projet 1
GuinéaStream — Plateforme de streaming musical

Domaine	Musique & Divertissement

Volume minimum	500 000+ documents (historique d'écoute)



Présentation du projet
GuinéaStream est une plateforme de streaming musical dédiée à la musique africaine et guinéenne. L'application permet aux utilisateurs de découvrir des artistes, écouter des titres et suivre leur historique d'écoute. Le système doit gérer un catalogue de musique avec des métadonnées riches et hétérogènes.
Ce projet illustre naturellement les limites du SQL : un titre peut avoir 1 ou 15 collaborateurs, des attributs complètement différents selon le genre (durée pour la musique, nb_épisodes pour les podcasts), et un volume d'écoute qui justifie pleinement le NoSQL.
Fonctionnalités attendues
•	Catalogue de titres consultable par artiste, genre, album, langue
•	Historique d'écoute par utilisateur avec date, durée écoutée et appareil
•	Statistiques d'écoute : titres les plus écoutés, artistes les plus populaires
•	Recommandations basées sur les genres les plus écoutés par un utilisateur
•	Classement top 10 par genre et par période (semaine, mois)
•	Gestion des playlists utilisateur (création, ajout/suppression de titres)
Exigences techniques MongoDB

  Contraintes obligatoires
Ces exigences sont évaluées — leur absence entraîne une pénalité sur la note technique.

1.	Volume : au moins 500 documents dans la collection ecoutes (historique)
2.	Schéma flexible démontré : au moins deux types de contenu (ex : musique et podcast) avec des champs différents dans la même collection
3.	Au moins 3 requêtes find() avec filtres avancés ($regex, $in, $exists)
4.	Au moins 4 pipelines d'agrégation exploitant $group, $sort, $limit
5.	Au moins 1 pipeline avec $unwind sur un tableau (ex : collaborateurs, genres)
6.	Indexation : créer et justifier au moins 2 index pour optimiser les requêtes fréquentes
7.	Opérations CRUD complètes : ajout d'écoute, mise à jour playlist, suppression
Structure de la base de données
Votre base de données doit contenir au minimum les collections suivantes :
Collection : titres
Volume minimum : 300+ documents
•	titre, artiste (objet : nom, pays, genre_principal)
•	album, annee_sortie, duree_sec, langue
•	genres (tableau — ex : ["Afrobeat", "Coupé-Décalé"])
•	collaborateurs (tableau — peut être vide ou contenir plusieurs artistes)
•	nb_ecoutes_total, note_moyenne
•	Pour les podcasts : nb_episodes, animateur — champs ABSENTS pour la musique (schéma flexible)
Collection : utilisateurs
Volume minimum : 50+ documents
•	pseudo, email, ville, age, sexe
•	date_inscription, abonnement (type : Gratuit/Premium)
•	genres_favoris (tableau)
Collection : ecoutes
Volume minimum : 500+ documents (collection principale pour le volume)
•	uid (référence utilisateur), tid (référence titre)
•	date_ecoute, duree_ecoutee_sec, appareil (Mobile/Web/TV)
•	termine (booléen — si l'écoute est allée jusqu'au bout)
Collection : playlists
Volume minimum : 30+ documents
•	uid, nom, description, publique (booléen)
•	titres (tableau d'objets : {tid, titre_nom, date_ajout})
•	date_creation, date_modification
Critères d'évaluation

Critère	Points	Description
Volume et qualité des données	4	500+ écoutes, schéma flexible démontré
Requêtes find() avancées	3	Filtres $regex, $in, $exists utilisés
Pipelines d'agrégation	5	4+ pipelines, $unwind inclus
Indexation justifiée	2	Index créés et expliqués
Application web fonctionnelle	4	Interface CRUD opérationnelle
Rapport écrit	4	Modélisation, justification NoSQL, difficultés
Soutenance orale	4	Clarté, maîtrise technique, démo live
Comparaison SQL / MongoDB	2	Section dédiée dans le rapport
TOTAL	28 pts	

Livrables attendus
8.	Code source de l'application web (dépôt Git ou archive ZIP)
9.	Script de génération ou fichier JSON du dataset (avec au moins 500 documents d'écoute)
10.	Rapport écrit (10-15 pages) : contexte, modélisation BDD, justification des choix NoSQL vs SQL, description des requêtes clés, difficultés rencontrées
11.	Diaporama de soutenance (10-15 slides)
12.	Démonstration live de l'application lors de la présentation
 
Projet 2
SensGuinée — Système de surveillance IoT

Domaine	Internet des objets & Infrastructure

Volume minimum	2 000 000+ documents (relevés capteurs)



Présentation du projet
SensGuinée est un système de surveillance de capteurs IoT déployés dans des bâtiments (universités, hôpitaux, usines). Les capteurs envoient des relevés à intervalles réguliers — température, humidité, consommation électrique, vibrations. Chaque type de capteur envoie des champs différents, ce qui rend le schéma fixe du SQL totalement inadapté.
Ce projet est l'un des cas d'usage NoSQL les plus représentatifs en production. Netflix, Airbus et des milliers d'entreprises industrielles utilisent exactement ce type d'architecture pour leurs données de capteurs. Le volume de données (1 relevé/minute × 100 capteurs × 365 jours = 52 millions de documents/an) justifie MongoDB de façon irréfutable.
Fonctionnalités attendues
•	Tableau de bord en temps réel : dernière valeur de chaque capteur
•	Historique d'un capteur sur une période donnée (filtre par date)
•	Alertes : détecter les relevés anormaux (ex : température > seuil)
•	Statistiques par capteur : min, max, moyenne sur une période
•	Comparaison entre capteurs d'un même bâtiment
•	Détection de capteurs inactifs (dernier relevé > 1h)
Exigences techniques MongoDB

  Contraintes obligatoires
Ces exigences sont évaluées — leur absence entraîne une pénalité sur la note technique.

13.	Volume : au moins 2 000 documents dans la collection releves (simuler plusieurs jours de données)
14.	Schéma flexible démontré : au moins 3 types de capteurs avec des champs différents (ex : temperature_c uniquement pour les capteurs thermiques, kwh uniquement pour les électriques)
15.	$exists utilisé pour filtrer par type de capteur
16.	Au moins 4 pipelines d'agrégation : statistiques par capteur, alertes, comparaisons
17.	Pipeline avec $match en début (performance) + $group + $project
18.	Au moins 1 index sur le champ date_releve pour optimiser les requêtes temporelles
19.	Mise à jour en temps réel simulée : insertion d'un nouveau relevé via l'interface
Structure de la base de données
Votre base de données doit contenir au minimum les collections suivantes :
Collection : capteurs
Volume minimum : 20+ documents
•	capteur_id, nom, type (Thermique/Électrique/Humidité/Vibration)
•	batiment, etage, salle
•	seuil_alerte (valeur au-delà de laquelle une alerte est déclenchée)
•	actif (booléen), date_installation
Collection : releves
Volume minimum : 2 000+ documents (générés par simulation)
•	capteur_id, date_releve, horodatage_unix
•	Pour capteurs Thermiques UNIQUEMENT : temperature_c, humidite_pct
•	Pour capteurs Électriques UNIQUEMENT : kwh, tension_v, courant_a
•	Pour capteurs Vibration UNIQUEMENT : amplitude_mm, frequence_hz
•	anomalie (booléen — true si le seuil est dépassé)
Collection : alertes
Volume minimum : 50+ documents
•	capteur_id, date_alerte, type_alerte
•	valeur_mesurée, seuil_depasse
•	resolue (booléen), date_resolution
Critères d'évaluation

Critère	Points	Description
Volume et simulation réaliste	4	2000+ relevés, types de capteurs variés
Schéma flexible démontré	3	$exists utilisé, 3+ types distincts
Pipelines d'agrégation	5	Statistiques, alertes, comparaisons
Performance (index)	2	Index sur date justifié et mesuré
Application web fonctionnelle	4	Dashboard, historique, alertes
Rapport écrit	4	Modélisation, justification IoT + NoSQL
Soutenance orale	4	Clarté, démo live, simulation d'alerte
Comparaison SQL / MongoDB	2	Argument volume et schéma hétérogène
TOTAL	28 pts	

Livrables attendus
20.	Code source de l'application web avec script de génération des données simulées
21.	Dataset JSON avec au moins 2 000 relevés couvrant plusieurs types de capteurs
22.	Rapport écrit (10-15 pages) : architecture IoT, justification NoSQL, description des pipelines d'agrégation, analyse des performances avec et sans index
23.	Diaporama de soutenance
24.	Démonstration live avec insertion d'un nouveau relevé et déclenchement d'alerte
 
Projet 3
ScholarsNet — Réseau social académique

Domaine	Éducation & Recherche scientifique

Volume minimum	10 000+ documents (publications scientifiques)



Présentation du projet
ScholarsNet est un réseau social pour les chercheurs et enseignants de l'UGANC. L'application permet de gérer des profils académiques, des publications scientifiques et des projets de recherche. Les publications ont des structures très hétérogènes selon leur type (article, thèse, rapport, brevet) et peuvent avoir de 1 à 30 co-auteurs.
Le dataset DBLP utilisé dans le TP1 est une base de départ réelle pour ce projet. Ce domaine illustre parfaitement deux problèmes fondamentaux du SQL : la gestion des auteurs multiples (tableau vs table de jointure) et la structure variable des métadonnées selon le type de publication.
Fonctionnalités attendues
•	Profil chercheur : publications, projets, affiliation, statistiques (h-index simplifié)
•	Moteur de recherche de publications par auteur, mot-clé, année, type
•	Réseau de co-auteurs : qui a travaillé avec qui ?
•	Statistiques d'un laboratoire : productions par année, par type, par chercheur
•	Citations : quelles publications citent d'autres publications du réseau ?
•	Import de publications depuis un fichier JSON (format DBLP ou similaire)
Exigences techniques MongoDB

  Contraintes obligatoires
Ces exigences sont évaluées — leur absence entraîne une pénalité sur la note technique.

25.	Volume : au moins 1 000 documents dans la collection publications (utiliser DBLP ou générer)
26.	Schéma flexible démontré : au moins 3 types de publications (article, book, inproceedings) avec des champs spécifiques à chaque type
27.	$unwind obligatoire sur le tableau auteurs pour au moins 2 requêtes analytiques
28.	Au moins 1 requête $regex sur les titres et abstracts
29.	Pipeline co-auteurs : qui collabore le plus avec qui ($group avec _id composé)
30.	Au moins 4 pipelines d'agrégation exploitant les données de publications
31.	Indexation sur les champs de recherche fréquents (auteurs, titre, année)
Structure de la base de données
Votre base de données doit contenir au minimum les collections suivantes :
Collection : chercheurs
Volume minimum : 30+ documents
•	uid, nom, prenom, email, université, laboratoire
•	grade (Professeur/Maître de conférences/Doctorant)
•	domaines_recherche (tableau), langues (tableau)
•	date_recrutement, actif (booléen)
Collection : publications
Volume minimum : 1 000+ documents
•	pid, titre, annee, type (article/book/inproceedings/thesis/report)
•	auteurs (tableau d'objets : {uid, nom, ordre})
•	mots_cles (tableau), langue
•	Pour articles UNIQUEMENT : journal, volume, pages, doi
•	Pour conférences UNIQUEMENT : booktitle, ville_conf, acceptation_rate
•	Pour thèses UNIQUEMENT : directeur, institution, mention
•	citations (tableau de pid cités — peut être vide)
Collection : projets
Volume minimum : 20+ documents
•	nom, description, date_debut, date_fin, statut
•	responsable_uid, membres (tableau de uid)
•	financeur, budget, publications_associées (tableau de pid)
Critères d'évaluation

Critère	Points	Description
Volume et richesse des données	4	1000+ publications, 3+ types distincts
$unwind sur auteurs	3	Analyses de co-auteurs fonctionnelles
Pipelines d'agrégation	4	4+ pipelines pertinents
Moteur de recherche ($regex)	2	Recherche par titre/auteur/mot-clé
Application web fonctionnelle	4	Profil, recherche, stats laboratoire
Rapport écrit	4	Modélisation, comparaison avec SGBDR
Soutenance orale	4	Clarté, démo live, questions
Comparaison SQL / MongoDB	3	Argumentation sur auteurs multiples
TOTAL	28 pts	

Livrables attendus
32.	Code source de l'application web
33.	Dataset JSON d'au moins 1 000 publications (DBLP enrichi ou généré)
34.	Rapport écrit (10-15 pages) : modélisation, comparaison avec un schéma SQL équivalent (montrer les jointures nécessaires), justification des choix de dénormalisation
35.	Diaporama de soutenance
36.	Démonstration live : recherche, profil chercheur, réseau de co-auteurs
 
Projet 4
ConakryMarket — Plateforme e-commerce

Domaine	Commerce & Économie numérique

Volume minimum	100 000+ documents (transactions et catalogue)



Présentation du projet
ConakryMarket est une plateforme de commerce en ligne pour les petits commerçants guinéens. L'application gère un catalogue de produits très hétérogènes (téléphones, vêtements, alimentation, équipements agricoles), des commandes avec plusieurs articles, et un historique de transactions. Les attributs d'un téléphone et d'un sac de riz n'ont rien en commun — c'est l'illustration parfaite du schéma flexible.
Ce sujet est directement inspiré de l'architecture utilisée par des plateformes comme Jumia ou Amazon. Le catalogue hétérogène et le volume de transactions font de ce cas d'usage l'un des plus convaincants pour argumenter en faveur de MongoDB face à SQL.
Fonctionnalités attendues
•	Catalogue produits avec recherche multicritères (catégorie, prix, vendeur, ville)
•	Panier et commandes : créer une commande avec plusieurs articles, calculer le total
•	Historique des commandes par client avec filtres (date, statut, montant)
•	Tableau de bord vendeur : CA total, produits les plus vendus, stock critique
•	Analyse des ventes : CA par catégorie, par ville, par période
•	Système d'avis clients : noter un produit, calculer la note moyenne
Exigences techniques MongoDB

  Contraintes obligatoires
Ces exigences sont évaluées — leur absence entraîne une pénalité sur la note technique.

37.	Volume : au moins 500 commandes, chaque commande contenant 1 à 5 articles
38.	Schéma flexible démontré : au moins 4 catégories de produits avec des attributs spécifiques (ex : taille/matière pour vêtements, processeur/RAM pour électronique)
39.	$unwind obligatoire sur le tableau articles des commandes pour les analyses de ventes
40.	Au moins 4 pipelines : CA par catégorie, top vendeurs, analyse par ville, évolution mensuelle
41.	Opération CRUD : ajouter un produit, passer une commande, mettre à jour le stock ($inc)
42.	Indexation sur catégorie et prix pour optimiser les recherches catalogue
43.	Gestion du stock : $inc pour décrémenter le stock à chaque vente
Structure de la base de données
Votre base de données doit contenir au minimum les collections suivantes :
Collection : produits
Volume minimum : 200+ documents
•	pid, nom, vendeur_uid, categorie, prix, stock, ville_vendeur
•	images (tableau d'URLs), description, note_moyenne
•	Pour Électronique : marque, modele, processeur, ram_go, stockage_go
•	Pour Vêtements : taille (tableau), couleurs (tableau), matiere
•	Pour Alimentation : poids_kg, unite, peremption
•	Pour Équipement : puissance_w, garantie_mois
Collection : commandes
Volume minimum : 500+ documents
•	oid, client_uid, date_commande, statut (en_attente/livré/annulé)
•	articles (tableau d'objets : {pid, nom, categorie, quantite, prix_unit, sous_total})
•	montant_total, mode_paiement (Mobile Money/Espèces/Carte)
•	adresse_livraison (objet : ville, quartier, details)
•	date_livraison (absent si non encore livré)
Collection : clients
Volume minimum : 50+ documents
•	uid, nom, telephone, email, ville, age
•	date_inscription, nb_commandes_total, ca_total
Collection : avis
Volume minimum : 100+ documents
•	pid, client_uid, note (1-5), commentaire, date_avis
•	utile (nb de personnes ayant trouvé l'avis utile)
Critères d'évaluation

Critère	Points	Description
Volume et schéma flexible	4	500+ commandes, 4+ catégories produits
$unwind sur articles	3	Analyse CA par catégorie produit
Pipelines d'agrégation	4	CA, top produits, analyse géographique
CRUD complet avec $inc	3	Gestion stock opérationnelle
Application web fonctionnelle	4	Catalogue, commande, tableau de bord
Rapport écrit	4	Modélisation, justification schéma flexible
Soutenance orale	4	Clarté, démo live
Comparaison SQL / MongoDB	2	Focus sur le catalogue hétérogène
TOTAL	28 pts	

Livrables attendus
44.	Code source de l'application web
45.	Dataset JSON du catalogue et des commandes (500+ documents)
46.	Rapport écrit (10-15 pages) : modélisation BDD, justification NoSQL pour le catalogue hétérogène, description du pipeline d'analyse des ventes, comparaison avec un schéma SQL normalisé
47.	Diaporama de soutenance
48.	Démonstration live : recherche produit, passage de commande, tableau de bord vendeur
 
Projet 5
MediTrack — Gestion de dossiers médicaux

Domaine	Santé publique & Médecine

Volume minimum	50 000+ documents (dossiers et événements médicaux)



Présentation du projet
MediTrack est un système de gestion de dossiers médicaux pour une clinique guinéenne. Chaque patient a un dossier contenant ses consultations, prescriptions, résultats d'analyses et hospitalisations. La structure des données médicales est naturellement hétérogène : une consultation générale et un bilan biologique n'ont aucun champ en commun.
Ce projet est pédagogiquement puissant car il illustre le vrai problème des tables creuses (sparse tables) en SQL : si on met tous les types d'examens dans une table, 90% des colonnes sont NULL pour chaque ligne. MongoDB résout ce problème élégamment avec le schéma flexible.
Fonctionnalités attendues
•	Dossier patient complet : consultations, prescriptions, analyses, hospitalisations
•	Recherche de patients par symptôme, diagnostic, médicament prescrit
•	Statistiques médicales : maladies les plus fréquentes, médicaments les plus prescrits
•	Suivi d'un patient sur une période : évolution des mesures (poids, tension, glycémie)
•	Alertes : patients diabétiques sans bilan depuis 3 mois, médicaments en rupture
•	Rapport médecin : nombre de consultations, pathologies traitées, répartition géographique
Exigences techniques MongoDB

  Contraintes obligatoires
Ces exigences sont évaluées — leur absence entraîne une pénalité sur la note technique.

49.	Volume : au moins 500 documents d'événements médicaux (consultations + analyses + prescriptions)
50.	Schéma flexible démontré : au moins 4 types d'événements avec des champs spécifiques à chaque type
51.	$exists utilisé pour filtrer par type d'événement médical
52.	Au moins 4 pipelines d'agrégation : maladies fréquentes, médicaments prescrits, stats par médecin
53.	$unwind obligatoire sur le tableau des médicaments prescrits
54.	Opérations CRUD : créer un dossier, ajouter une consultation, mettre à jour un résultat
55.	Indexation sur patient_id et date pour optimiser les accès au dossier
Structure de la base de données
Votre base de données doit contenir au minimum les collections suivantes :
Collection : patients
Volume minimum : 100+ documents
•	pid, nom, prenom, date_naissance, sexe, groupe_sanguin
•	ville, telephone, contact_urgence (objet)
•	antecedents (tableau : maladies chroniques connues)
•	allergies (tableau), assurance (objet : type, numero)
Collection : evenements_medicaux
Volume minimum : 500+ documents
•	eid, patient_id, medecin_id, date, type (consultation/analyse/hospitalisation/prescription)
•	Pour consultations : motif, diagnostic, observations, poids_kg, tension_sys, tension_dia
•	Pour analyses : type_analyse, resultats (objet avec champs variables), valeurs_normales
•	Pour hospitalisations : service, chambre, date_entree, date_sortie, diagnostic_principal
•	Pour prescriptions : medicaments (tableau : {nom, dosage, frequence, duree_jours})
Collection : medecins
Volume minimum : 15+ documents
•	uid, nom, specialite, grade, service
•	nb_consultations_total, nb_patients_suivis
Critères d'évaluation

Critère	Points	Description
Volume et schéma flexible	4	500+ événements, 4 types distincts
$exists et filtrage par type	2	Requêtes spécifiques à chaque type
$unwind sur médicaments	3	Analyse des prescriptions
Pipelines d'agrégation	4	Stats maladies, médecins, géographie
Application web fonctionnelle	4	Dossier patient, recherche, alertes
Rapport écrit	4	Comparaison tables creuses SQL vs MongoDB
Soutenance orale	4	Clarté, démo live, questions
Comparaison SQL / MongoDB	3	Démonstration du problème sparse tables
TOTAL	28 pts	

Livrables attendus
56.	Code source de l'application web
57.	Dataset JSON des patients et événements médicaux
58.	Rapport écrit (10-15 pages) : modélisation BDD, démonstration du problème des tables creuses en SQL (schéma SQL équivalent montrant les NULL), justification de MongoDB, description des pipelines clés
59.	Diaporama de soutenance
60.	Démonstration live : consulter un dossier, ajouter un événement, générer un rapport
 
Projet 6
InfoGuinée — Agrégateur d'actualités

Domaine	Médias & Information

Volume minimum	50 000+ documents (articles et interactions)



Présentation du projet
InfoGuinée est un agrégateur d'actualités guinéen et africain. L'application collecte des articles de presse de différentes sources, les catégorise et permet aux lecteurs de les commenter et partager. Chaque article peut avoir des métadonnées très variables selon sa source et son type (article de fond, dépêche, vidéo, podcast).
Ce sujet met en valeur la capacité de MongoDB à gérer des données provenant de sources hétérogènes — un défi réel pour tout agrégateur de contenu. La structure des métadonnées varie radicalement d'une source à l'autre, rendant un schéma SQL fixe impraticable.
Fonctionnalités attendues
•	Fil d'actualité : articles récents par catégorie, source, pays
•	Moteur de recherche full-text dans les titres et résumés ($regex)
•	Analyse de tendances : sujets les plus couverts, sources les plus actives
•	Engagement : articles les plus commentés, les plus partagés
•	Profil auteur : articles écrits, catégories couvertes, statistiques
•	Veille par mots-clés : alertes sur les articles contenant certains termes
Exigences techniques MongoDB

  Contraintes obligatoires
Ces exigences sont évaluées — leur absence entraîne une pénalité sur la note technique.

61.	Volume : au moins 500 articles et 1 000 interactions (commentaires + partages)
62.	Schéma flexible : au moins 3 types de contenu (article texte, vidéo, podcast) avec des champs spécifiques
63.	Au moins 3 requêtes $regex sur titre et contenu
64.	$unwind sur le tableau tags/mots_cles pour l'analyse des tendances
65.	Au moins 4 pipelines d'agrégation : tendances, sources actives, engagement, analyse temporelle
66.	Pipeline avec $match + $unwind + $group pour trouver les tags les plus utilisés
67.	Indexation sur date_publication et source pour optimiser le fil d'actualité
Structure de la base de données
Votre base de données doit contenir au minimum les collections suivantes :
Collection : articles
Volume minimum : 500+ documents
•	aid, titre, source, auteur, date_publication, pays, categorie
•	resume, url_original
•	tags (tableau de mots-clés)
•	nb_vues, nb_partages, nb_commentaires
•	Pour articles texte : nb_mots, temps_lecture_min
•	Pour vidéos : duree_sec, plateforme (YouTube/Facebook), vignette_url
•	Pour podcasts : duree_sec, saison, episode, rss_url
Collection : interactions
Volume minimum : 1 000+ documents
•	iid, aid, uid, type (vue/commentaire/partage/like)
•	date_interaction
•	Pour commentaires UNIQUEMENT : contenu, nb_likes_commentaire, signale (booléen)
•	Pour partages UNIQUEMENT : plateforme_partage, message_accompagnement
Collection : sources
Volume minimum : 20+ documents
•	sid, nom, pays, langue, fiabilite_score (1-5)
•	categories_couvertes (tableau), actif (booléen)
•	nb_articles_total, date_derniere_publication
Critères d'évaluation

Critère	Points	Description
Volume et diversité des contenus	4	500+ articles, 3 types de contenu
Recherche $regex	2	3+ requêtes textuelles fonctionnelles
$unwind sur tags + tendances	3	Analyse des topics les plus couverts
Pipelines d'agrégation	4	4+ pipelines pertinents
Application web fonctionnelle	4	Fil, recherche, tendances, engagement
Rapport écrit	4	Modélisation, justification agrégation multi-sources
Soutenance orale	4	Clarté, démo, questions
Comparaison SQL / MongoDB	3	Focus sur l'hétérogénéité des sources
TOTAL	28 pts	

Livrables attendus
68.	Code source de l'application web
69.	Dataset JSON des articles et interactions (1 500+ documents au total)
70.	Rapport écrit (10-15 pages) : modélisation, justification NoSQL pour l'agrégation multi-sources, description des pipelines de tendances, comparaison avec un schéma SQL
71.	Diaporama de soutenance
72.	Démonstration live : fil d'actualité, recherche, analyse des tendances
 
Projet 7
LogWatch — Système de gestion de logs

Domaine	DevOps & Sécurité informatique

Volume minimum	1 000 000+ documents (logs applicatifs)


Présentation du projet
LogWatch est un système centralisé de collecte et d'analyse de logs applicatifs pour une infrastructure informatique universitaire. Les logs proviennent de différentes applications (système d'information étudiant, messagerie, site web, pare-feu) et ont des structures radicalement différentes selon leur source et leur niveau de sévérité.
Les logs sont l'un des cas d'usage NoSQL les plus répandus en entreprise (Elastic Stack, MongoDB). Ce sujet permet de démontrer concrètement pourquoi le schéma fixe du SQL est impossible à maintenir face à des dizaines de formats de logs différents — et pourquoi le volume rend le SQL inadapté.
Fonctionnalités attendues
•	Tableau de bord temps réel : erreurs critiques, volume de logs par application
•	Recherche dans les logs : filtrer par niveau (ERROR/WARN/INFO), application, période
•	Analyse des erreurs : erreurs les plus fréquentes, stack traces similaires
•	Détection d'anomalies : pic de logs à une heure donnée, répétition d'une même erreur
•	Audit de sécurité : tentatives de connexion échouées, accès suspects
•	Tableau de bord par application : volumes, taux d'erreur, disponibilité
Exigences techniques MongoDB

  Contraintes obligatoires
Ces exigences sont évaluées — leur absence entraîne une pénalité sur la note technique.

73.	Volume : au moins 2 000 documents de logs (générés par script)
74.	Schéma flexible : au moins 4 sources de logs avec des champs spécifiques (stack_trace pour les erreurs Java, ip_source pour les logs réseau, user_agent pour les logs web, etc.)
75.	$exists pour filtrer les logs avec stack_trace (erreurs critiques uniquement)
76.	Au moins 4 pipelines d'agrégation : taux d'erreur, distribution temporelle, top erreurs
77.	Pipeline de détection d'anomalies : $group par heure + $match HAVING (pic de volume)
78.	Indexation sur level et timestamp pour les requêtes de monitoring en temps réel
79.	Simulation d'insertion en temps réel : ajouter un log depuis l'interface
Structure de la base de données
Votre base de données doit contenir au minimum les collections suivantes :
Collection : applications
Volume minimum : 10+ documents
•	app_id, nom, version, environnement (prod/dev/test)
•	technologie (Java/Python/Node.js/PHP)
•	responsable, sla_pct (99.9% par exemple)
Collection : logs
Volume minimum : 2 000+ documents (générés par simulation)
•	log_id, app_id, timestamp, level (DEBUG/INFO/WARN/ERROR/CRITICAL)
•	message, source_fichier, ligne_code
•	Pour erreurs UNIQUEMENT : stack_trace (chaîne), exception_type, nb_occurrences
•	Pour logs web UNIQUEMENT : methode_http, url, code_statut, duree_ms, user_agent, ip_source
•	Pour logs base de données UNIQUEMENT : requete_sql, duree_ms, nb_lignes_affectees
•	Pour logs sécurité UNIQUEMENT : user, action, ip_source, succes (booléen), tentatives
Collection : alertes_systeme
Volume minimum : 50+ documents
•	alerte_id, app_id, timestamp, type_alerte
•	description, seuil_declenche, valeur_observee
•	resolue (booléen), assignee_uid
Critères d'évaluation

Critère	Points	Description
Volume et génération réaliste	4	2000+ logs, 4 sources distinctes
Schéma flexible ($exists)	3	Filtrage par type de log opérationnel
Pipelines d'agrégation	5	Taux d'erreur, anomalies, top erreurs
Performance (index sur timestamp)	2	Index justifié, requête mesurée
Application web fonctionnelle	4	Dashboard, recherche, alertes
Rapport écrit	4	Modélisation, justification NoSQL pour logs
Soutenance orale	4	Clarté, démo live, simulation d'alerte
Comparaison SQL / MongoDB	2	Volume et hétérogénéité des logs
TOTAL	28 pts	

Livrables attendus
80.	Code source de l'application web avec script de génération des logs simulés
81.	Dataset JSON de 2 000+ logs couvrant les 4 types de sources
82.	Rapport écrit (10-15 pages) : architecture de monitoring, justification NoSQL (volume + hétérogénéité), description des pipelines de détection d'anomalies, analyse des performances avec/sans index
83.	Diaporama de soutenance
84.	Démonstration live : tableau de bord, détection d'anomalie, recherche d'erreurs critiques
 
Consignes générales pour tous les projets

Composition des groupes et attribution des sujets
•	Les groupes sont composés de maximum 7 étudiants.
•	Chaque sujet est attribué à un seul groupe — pas de doublons.
•	Les groupes choisissent leur sujet dans via un tombola d'inscription.
•	Une fois le choix validé, le sujet ne peut pas être changé.
Exigences communes à tous les projets
Indépendamment du sujet choisi, chaque groupe doit obligatoirement :
85.	Générer ou collecter un dataset RÉEL atteignant le volume minimum spécifié — les datasets de 10 documents ne seront pas acceptés. Utiliser des outils comme Faker (Python/JS) ou Mockaroo pour générer des données réalistes.
86.	Démontrer le schéma flexible : montrer concrètement deux documents de la même collection avec des structures différentes et expliquer pourquoi cela serait problématique en SQL.
87.	Justifier le choix de MongoDB vs SQL : le rapport doit contenir une section dédiée montrant le schéma SQL équivalent et argumentant pourquoi il serait inadapté.
88.	Utiliser le pipeline d'agrégation pour au moins 4 requêtes analytiques — les simples find() ne comptent pas comme agrégation.
89.	Déployer une application web fonctionnelle — pas un simple script mongosh.
Stack technique recommandée (non imposée)
•	Backend : Node.js + Express + Mongoose, ou Python + Flask + PyMongo (Ou un autre de votre choix)
•	Frontend : HTML/CSS/JavaScript vanilla, ou React, ou Vue.js (Ou un autre de votre choix)
•	Base de données : MongoDB Community Edition (local) ou MongoDB Atlas (cloud gratuit)
•	Génération de données : Faker.js (Node.js) ou Faker (Python) 

  Liberté technologique
Le choix du langage et du framework est libre.
Ce qui est évalué : la qualité de l'usage de MongoDB, pas le framework web.
Une application simple mais avec un bon usage de MongoDB vaut mieux
qu'une belle interface avec des requêtes MongoDB triviales.

Rapport écrit — structure attendue
90.	Introduction : contexte, problématique, objectifs
91.	Modélisation de la base de données : collections, documents exemples, justification des choix (imbrication vs référence)
92.	Justification NoSQL vs SQL : schéma SQL équivalent, problèmes identifiés, avantages de MongoDB pour ce cas d'usage
93.	Description des fonctionnalités : requêtes MongoDB clés avec explication
94.	Pipelines d'agrégation : au moins 3 pipelines présentés avec leur équivalent SQL et leur résultat
95.	Difficultés rencontrées et solutions apportées
96.	Conclusion et perspectives
97.	Annexes : extraits de code, captures d'écran
Soutenance orale — déroulement

Phase	Durée	Contenu
Présentation	10 min	Contexte, modélisation BDD, justification NoSQL
Démonstration	10 min	Application live : CRUD, requêtes, pipelines d'agrégation
Questions	5 min	Questions du jury — chaque membre doit pouvoir répondre


  Règle de la soutenance
Chaque membre du groupe sera interrogé individuellement.
Ne pas connaître son propre code est rédhibitoire.
La division du travail doit être expliquée dans le rapport.

Calendrier
Date de la présentation sera décider lors du prochain cours.


NB : L’utilisation de l’IA est autorisée à conditions que vous expliquiez comment vous avez eu à l’utiliser et surtout expliquez le code et les résultats obtenues. Des points vous serons retiré si vous êtes dans l’incapacité de le faire.
