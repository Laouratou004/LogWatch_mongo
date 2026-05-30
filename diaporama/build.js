/**
 * Diaporama LogWatch — Soutenance UGANC Groupe 3
 * Génère diaporama.pptx (12 slides, style mixte)
 * Lancement : node build.js
 */
const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10" × 5.625"
pres.author = 'Groupe 3 — LogTech Solutions';
pres.title = 'LogWatch — Soutenance UGANC';

// ── Palette (alignée sur le dashboard) ──
const C = {
  navy:      '0B0F19',   // fond sombre principal
  navyCard:  '151B28',   // fond carte sombre
  primary:   '4361EE',   // bleu principal
  secondary: '7209B7',   // violet
  accent:    '4CC9F0',   // cyan
  danger:    'EF4444',
  success:   '10B981',
  warning:   'F59E0B',
  white:     'FFFFFF',
  textDark:  '0F172A',
  muted:     '64748B',
  border:    'E2E8F0',
  bgLight:   'FFFFFF',
  bgCard:    'F8FAFC',
};

const FONT_H = 'Calibri';
const FONT_B = 'Calibri';

// ─────────────────────────────────────────────
// SLIDE 1 — Couverture (sombre)
// ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navy };

  // Accent rectangle gauche
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.18, h: 5.625,
    fill: { color: C.primary }, line: { type: 'none' },
  });

  // Logo éclair (texte stylisé)
  s.addText('⚡', {
    x: 0.6, y: 0.4, w: 0.8, h: 0.8,
    fontSize: 44, color: C.accent, bold: true, fontFace: FONT_H,
  });
  s.addText('LogWatch', {
    x: 1.4, y: 0.5, w: 4, h: 0.6,
    fontSize: 24, color: C.white, bold: true, fontFace: FONT_H, margin: 0,
  });

  // Titre principal
  s.addText('Système centralisé de gestion\net d\'analyse de logs applicatifs', {
    x: 0.6, y: 1.7, w: 8.8, h: 1.4,
    fontSize: 36, color: C.white, bold: true, fontFace: FONT_H,
    align: 'left', valign: 'top',
  });

  // Sous-titre
  s.addText('Soutenance — Cours BD NoSQL', {
    x: 0.6, y: 3.2, w: 8.8, h: 0.4,
    fontSize: 16, color: C.accent, fontFace: FONT_B, align: 'left', italic: true,
  });

  // Bloc équipe en bas
  s.addText('Groupe 3 — LogTech Solutions', {
    x: 0.6, y: 4.4, w: 5, h: 0.35,
    fontSize: 13, color: C.white, bold: true, fontFace: FONT_B,
  });
  s.addText('Université Gamal Abdel Nasser de Conakry — L3 Développement Logiciel', {
    x: 0.6, y: 4.75, w: 8.5, h: 0.35,
    fontSize: 11, color: 'CBD5E1', fontFace: FONT_B,
  });
  s.addText('Encadrant : Mr. Djiba Kaba', {
    x: 0.6, y: 5.1, w: 8.5, h: 0.35,
    fontSize: 11, color: 'CBD5E1', fontFace: FONT_B,
  });

  // Date à droite
  s.addText('Mai 2026', {
    x: 7.5, y: 5.1, w: 2, h: 0.35,
    fontSize: 11, color: C.accent, fontFace: FONT_B, align: 'right',
  });
}

// ─────────────────────────────────────────────
// SLIDE 2 — Sommaire (clair)
// ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  s.addText('Plan de la présentation', {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    fontSize: 30, color: C.textDark, bold: true, fontFace: FONT_H, margin: 0,
  });

  const items = [
    { n: '1', t: 'Contexte & problématique',     d: 'Pourquoi LogWatch à l\'UGANC' },
    { n: '2', t: 'Solution & architecture',      d: 'Stack technique et modèle 3 couches' },
    { n: '3', t: 'Modélisation MongoDB',         d: '3 collections, schéma flexible' },
    { n: '4', t: 'Pipelines d\'agrégation',      d: '4 pipelines analytiques' },
    { n: '5', t: 'Performance & index',          d: 'Mesures explain() réelles' },
    { n: '6', t: 'Démonstration live',           d: 'Le dashboard en action' },
    { n: '7', t: 'Bilan & perspectives',         d: 'Contraintes CDC ✓ et conclusion' },
  ];

  items.forEach((it, i) => {
    const y = 1.3 + i * 0.55;
    // Cercle numéroté
    s.addShape(pres.shapes.OVAL, {
      x: 0.7, y: y, w: 0.4, h: 0.4,
      fill: { color: C.primary }, line: { type: 'none' },
    });
    s.addText(it.n, {
      x: 0.7, y: y, w: 0.4, h: 0.4,
      fontSize: 14, color: C.white, bold: true, align: 'center', valign: 'middle',
      fontFace: FONT_B, margin: 0,
    });
    // Titre
    s.addText(it.t, {
      x: 1.3, y: y, w: 4.5, h: 0.4,
      fontSize: 16, color: C.textDark, bold: true, fontFace: FONT_H,
      valign: 'middle', margin: 0,
    });
    // Description
    s.addText(it.d, {
      x: 5.8, y: y, w: 3.7, h: 0.4,
      fontSize: 12, color: C.muted, fontFace: FONT_B, italic: true,
      valign: 'middle', margin: 0,
    });
  });
}

// ─────────────────────────────────────────────
// SLIDE 3 — Contexte UGANC (clair)
// ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  s.addText('1. Contexte & problématique', {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    fontSize: 28, color: C.textDark, bold: true, fontFace: FONT_H, margin: 0,
  });
  s.addText('L\'infrastructure informatique universitaire', {
    x: 0.5, y: 0.95, w: 9, h: 0.4,
    fontSize: 14, color: C.muted, fontFace: FONT_B, italic: true, margin: 0,
  });

  // Carte gauche — contexte
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.7, w: 4.5, h: 3.3,
    fill: { color: C.bgCard }, line: { color: C.border, width: 1 },
  });
  s.addText('Situation actuelle', {
    x: 0.8, y: 1.85, w: 4, h: 0.4,
    fontSize: 15, color: C.primary, bold: true, fontFace: FONT_H, margin: 0,
  });
  s.addText([
    { text: 'Plus de 10 applications hétérogènes', options: { bullet: true, breakLine: true } },
    { text: '4 technologies différentes : Java, Node.js, Python, PHP', options: { bullet: true, breakLine: true } },
    { text: 'Chaque application génère ses propres logs', options: { bullet: true, breakLine: true } },
    { text: 'Aucune centralisation', options: { bullet: true, breakLine: true } },
    { text: 'Diagnostic manuel, fastidieux, lent', options: { bullet: true } },
  ], {
    x: 0.8, y: 2.3, w: 4, h: 2.6,
    fontSize: 13, color: C.textDark, fontFace: FONT_B, paraSpaceAfter: 6,
  });

  // Carte droite — conséquences
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.7, w: 4.3, h: 3.3,
    fill: { color: C.bgCard }, line: { color: C.border, width: 1 },
  });
  s.addText('Conséquences', {
    x: 5.5, y: 1.85, w: 4, h: 0.4,
    fontSize: 15, color: C.danger, bold: true, fontFace: FONT_H, margin: 0,
  });
  s.addText([
    { text: 'Détection tardive des incidents', options: { bullet: true, breakLine: true } },
    { text: 'Pas de vue d\'ensemble sur la santé du SI', options: { bullet: true, breakLine: true } },
    { text: 'Difficultés à corréler les erreurs entre apps', options: { bullet: true, breakLine: true } },
    { text: 'Aucune détection d\'anomalie automatisée', options: { bullet: true, breakLine: true } },
    { text: 'Audit sécurité quasi impossible', options: { bullet: true } },
  ], {
    x: 5.5, y: 2.3, w: 3.8, h: 2.6,
    fontSize: 13, color: C.textDark, fontFace: FONT_B, paraSpaceAfter: 6,
  });

  // Bandeau bas
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 5.2, w: 9, h: 0.3,
    fill: { color: C.primary }, line: { type: 'none' },
  });
  s.addText('→ Besoin d\'un système centralisé temps réel pour superviser tout le SI', {
    x: 0.5, y: 5.2, w: 9, h: 0.3,
    fontSize: 12, color: C.white, bold: true, align: 'center', valign: 'middle',
    fontFace: FONT_B, margin: 0,
  });
}

// ─────────────────────────────────────────────
// SLIDE 4 — Pourquoi NoSQL / Solution (clair)
// ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  s.addText('2. Solution — Pourquoi MongoDB ?', {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    fontSize: 28, color: C.textDark, bold: true, fontFace: FONT_H, margin: 0,
  });
  s.addText('SQL vs NoSQL pour des logs hétérogènes', {
    x: 0.5, y: 0.95, w: 9, h: 0.4,
    fontSize: 14, color: C.muted, fontFace: FONT_B, italic: true, margin: 0,
  });

  // Colonne SQL (rouge)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.7, w: 4.4, h: 3.7,
    fill: { color: C.bgCard }, line: { color: C.danger, width: 2 },
  });
  s.addText('SQL classique', {
    x: 0.7, y: 1.85, w: 4, h: 0.4,
    fontSize: 16, color: C.danger, bold: true, fontFace: FONT_H, margin: 0,
  });
  s.addText('Schéma fixe — colonnes pré-définies', {
    x: 0.7, y: 2.3, w: 4, h: 0.35,
    fontSize: 11, color: C.muted, fontFace: FONT_B, italic: true, margin: 0,
  });
  s.addText([
    { text: '4 tables différentes (Java, Web, Sec, DB)', options: { bullet: true, breakLine: true } },
    { text: 'Beaucoup de colonnes NULL', options: { bullet: true, breakLine: true } },
    { text: 'JOIN multiples pour analyser', options: { bullet: true, breakLine: true } },
    { text: 'Migration lourde si nouveau type', options: { bullet: true, breakLine: true } },
    { text: 'Performance dégradée à grand volume', options: { bullet: true } },
  ], {
    x: 0.7, y: 2.7, w: 4, h: 2.6,
    fontSize: 12, color: C.textDark, fontFace: FONT_B, paraSpaceAfter: 6,
  });

  // Colonne MongoDB (vert)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.7, w: 4.4, h: 3.7,
    fill: { color: C.bgCard }, line: { color: C.success, width: 2 },
  });
  s.addText('MongoDB', {
    x: 5.3, y: 1.85, w: 4, h: 0.4,
    fontSize: 16, color: C.success, bold: true, fontFace: FONT_H, margin: 0,
  });
  s.addText('Schéma flexible — strict: false', {
    x: 5.3, y: 2.3, w: 4, h: 0.35,
    fontSize: 11, color: C.muted, fontFace: FONT_B, italic: true, margin: 0,
  });
  s.addText([
    { text: '1 collection logs — tous les types ensemble', options: { bullet: true, breakLine: true } },
    { text: 'Champs spécifiques par document', options: { bullet: true, breakLine: true } },
    { text: '$exists pour filtrer par type', options: { bullet: true, breakLine: true } },
    { text: 'Nouveau type ajouté sans migration', options: { bullet: true, breakLine: true } },
    { text: 'Pipelines d\'agrégation natifs', options: { bullet: true } },
  ], {
    x: 5.3, y: 2.7, w: 4, h: 2.6,
    fontSize: 12, color: C.textDark, fontFace: FONT_B, paraSpaceAfter: 6,
  });

  s.addText('LogWatch produit 2 013 logs de 4 types différents — impossible à gérer proprement en SQL', {
    x: 0.5, y: 5.5, w: 9, h: 0.3,
    fontSize: 11, color: C.muted, italic: true, align: 'center', fontFace: FONT_B,
  });
}

// ─────────────────────────────────────────────
// SLIDE 5 — Architecture 3 couches (clair)
// ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  s.addText('3. Architecture LogWatch', {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    fontSize: 28, color: C.textDark, bold: true, fontFace: FONT_H, margin: 0,
  });
  s.addText('Modèle 3 couches — Frontend / Backend / Base', {
    x: 0.5, y: 0.95, w: 9, h: 0.4,
    fontSize: 14, color: C.muted, fontFace: FONT_B, italic: true, margin: 0,
  });

  // Couche 1 — Frontend
  s.addShape(pres.shapes.RECTANGLE, {
    x: 1, y: 1.6, w: 8, h: 0.95,
    fill: { color: C.bgCard }, line: { color: C.primary, width: 2 },
  });
  s.addText('FRONTEND', {
    x: 1.2, y: 1.65, w: 1.5, h: 0.3,
    fontSize: 10, color: C.primary, bold: true, charSpacing: 4, fontFace: FONT_B, margin: 0,
  });
  s.addText('HTML / CSS / JavaScript vanilla  •  Chart.js 4.x  •  Phosphor Icons', {
    x: 1.2, y: 1.95, w: 6.5, h: 0.3,
    fontSize: 13, color: C.textDark, bold: true, fontFace: FONT_B, margin: 0,
  });
  s.addText('Dashboard temps réel, 5 pages, modal détail, auto-refresh', {
    x: 1.2, y: 2.2, w: 6.5, h: 0.3,
    fontSize: 11, color: C.muted, fontFace: FONT_B, italic: true, margin: 0,
  });

  // Flèche
  s.addText('▼', {
    x: 4.85, y: 2.6, w: 0.3, h: 0.25,
    fontSize: 14, color: C.muted, bold: true, align: 'center', margin: 0,
  });

  // Couche 2 — Backend
  s.addShape(pres.shapes.RECTANGLE, {
    x: 1, y: 2.95, w: 8, h: 0.95,
    fill: { color: C.bgCard }, line: { color: C.secondary, width: 2 },
  });
  s.addText('BACKEND', {
    x: 1.2, y: 3, w: 1.5, h: 0.3,
    fontSize: 10, color: C.secondary, bold: true, charSpacing: 4, fontFace: FONT_B, margin: 0,
  });
  s.addText('Node.js 18+  •  Express 5.x  •  Mongoose 9.x  •  Helmet + Morgan + CORS', {
    x: 1.2, y: 3.3, w: 6.5, h: 0.3,
    fontSize: 13, color: C.textDark, bold: true, fontFace: FONT_B, margin: 0,
  });
  s.addText('26 routes REST testées à 100% — pattern MVC (routes / controllers / models)', {
    x: 1.2, y: 3.55, w: 6.5, h: 0.3,
    fontSize: 11, color: C.muted, fontFace: FONT_B, italic: true, margin: 0,
  });

  // Flèche
  s.addText('▼', {
    x: 4.85, y: 3.95, w: 0.3, h: 0.25,
    fontSize: 14, color: C.muted, bold: true, align: 'center', margin: 0,
  });

  // Couche 3 — Database
  s.addShape(pres.shapes.RECTANGLE, {
    x: 1, y: 4.3, w: 8, h: 0.95,
    fill: { color: C.bgCard }, line: { color: C.accent, width: 2 },
  });
  s.addText('BASE DE DONNÉES', {
    x: 1.2, y: 4.35, w: 2, h: 0.3,
    fontSize: 10, color: C.accent, bold: true, charSpacing: 4, fontFace: FONT_B, margin: 0,
  });
  s.addText('MongoDB Atlas (cloud, M0 Free Tier)  •  Cluster Projet3-LogWatch', {
    x: 1.2, y: 4.65, w: 6.5, h: 0.3,
    fontSize: 13, color: C.textDark, bold: true, fontFace: FONT_B, margin: 0,
  });
  s.addText('3 collections — 2 013 logs, 10 applications, 67 alertes — 3 index actifs', {
    x: 1.2, y: 4.9, w: 6.5, h: 0.3,
    fontSize: 11, color: C.muted, fontFace: FONT_B, italic: true, margin: 0,
  });
}

// ─────────────────────────────────────────────
// SLIDE 6 — Modélisation MongoDB (clair)
// ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  s.addText('4. Modélisation MongoDB', {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    fontSize: 28, color: C.textDark, bold: true, fontFace: FONT_H, margin: 0,
  });
  s.addText('3 collections — relation par référence (app_id)', {
    x: 0.5, y: 0.95, w: 9, h: 0.4,
    fontSize: 14, color: C.muted, fontFace: FONT_B, italic: true, margin: 0,
  });

  // 3 cartes collections
  const collections = [
    { x: 0.5, name: 'applications', count: '10', color: C.primary, lines: ['app_id (PK)', 'nom, version', 'environnement', 'technologie', 'responsable', 'sla_pct'] },
    { x: 3.55, name: 'logs', count: '2 013', color: C.secondary, lines: ['log_id (PK)', 'app_id (FK)', 'timestamp', 'level', 'message', '+ champs flexibles'] },
    { x: 6.6, name: 'alertes_systeme', count: '67', color: C.accent, lines: ['alerte_id (PK)', 'app_id (FK)', 'timestamp', 'type_alerte', 'resolue', 'assignee_uid'] },
  ];

  collections.forEach(c => {
    // Carte
    s.addShape(pres.shapes.RECTANGLE, {
      x: c.x, y: 1.6, w: 2.9, h: 3.6,
      fill: { color: C.bgCard }, line: { color: c.color, width: 2 },
    });
    // Bandeau header
    s.addShape(pres.shapes.RECTANGLE, {
      x: c.x, y: 1.6, w: 2.9, h: 0.8,
      fill: { color: c.color }, line: { type: 'none' },
    });
    s.addText(c.name, {
      x: c.x, y: 1.65, w: 2.9, h: 0.35,
      fontSize: 14, color: C.white, bold: true, align: 'center',
      fontFace: FONT_B, valign: 'middle', margin: 0,
    });
    s.addText(c.count + ' documents', {
      x: c.x, y: 2.0, w: 2.9, h: 0.35,
      fontSize: 11, color: 'E2E8F0', align: 'center', italic: true,
      fontFace: FONT_B, valign: 'middle', margin: 0,
    });
    // Champs
    s.addText(
      c.lines.map((l, i) => ({ text: l, options: { bullet: true, breakLine: i < c.lines.length - 1 } })),
      {
        x: c.x + 0.25, y: 2.6, w: 2.5, h: 2.5,
        fontSize: 11, color: C.textDark, fontFace: 'Consolas', paraSpaceAfter: 4,
      }
    );
  });

  // Note
  s.addText('Choix : référence (app_id) plutôt qu\'imbrication — 2 000+ logs par app, imbrication non viable', {
    x: 0.5, y: 5.4, w: 9, h: 0.3,
    fontSize: 11, color: C.muted, italic: true, align: 'center', fontFace: FONT_B,
  });
}

// ─────────────────────────────────────────────
// SLIDE 7 — Schéma flexible (clair, code visuel)
// ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  s.addText('Schéma flexible — preuve par l\'exemple', {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    fontSize: 26, color: C.textDark, bold: true, fontFace: FONT_H, margin: 0,
  });
  s.addText('Deux documents dans la même collection logs — structures totalement différentes', {
    x: 0.5, y: 0.95, w: 9, h: 0.4,
    fontSize: 13, color: C.muted, fontFace: FONT_B, italic: true, margin: 0,
  });

  // Log Java (gauche)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 4.4, h: 3.6,
    fill: { color: C.navyCard }, line: { color: C.danger, width: 1 },
  });
  s.addText('Log Java (erreur)', {
    x: 0.7, y: 1.7, w: 4, h: 0.35,
    fontSize: 13, color: C.danger, bold: true, fontFace: FONT_B, margin: 0,
  });
  s.addText(
`{
  log_id: "LOG-JAVA-000042",
  app_id: "app_si_etudiant",
  timestamp: ISODate(...),
  level: "CRITICAL",
  message: "NullPointer...",
  source_fichier: "UserService.java",
  ligne_code: 287,
  exception_type: "NullPointer...",
  stack_trace: "java.lang...",
  nb_occurrences: 12
}`, {
    x: 0.7, y: 2.1, w: 4, h: 3,
    fontSize: 10, color: 'E2E8F0', fontFace: 'Consolas', valign: 'top',
  });

  // Log Web (droite)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.6, w: 4.4, h: 3.6,
    fill: { color: C.navyCard }, line: { color: C.accent, width: 1 },
  });
  s.addText('Log Web', {
    x: 5.3, y: 1.7, w: 4, h: 0.35,
    fontSize: 13, color: C.accent, bold: true, fontFace: FONT_B, margin: 0,
  });
  s.addText(
`{
  log_id: "LOG-WEB-000156",
  app_id: "WEB",
  timestamp: ISODate(...),
  level: "INFO",
  message: "GET /api/...",
  methode_http: "GET",
  url: "/api/etudiants",
  code_statut: 200,
  duree_ms: 145,
  ip_source: "10.0.2.34"
}`, {
    x: 5.3, y: 2.1, w: 4, h: 3,
    fontSize: 10, color: 'E2E8F0', fontFace: 'Consolas', valign: 'top',
  });

  // Note explicative
  s.addText('En SQL : 2 tables avec des colonnes différentes + JOIN ou colonne NULL partout', {
    x: 0.5, y: 5.4, w: 9, h: 0.3,
    fontSize: 11, color: C.muted, italic: true, align: 'center', fontFace: FONT_B,
  });
}

// ─────────────────────────────────────────────
// SLIDE 8 — Pipelines d'agrégation (clair, tableau)
// ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  s.addText('5. Pipelines d\'agrégation MongoDB', {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    fontSize: 26, color: C.textDark, bold: true, fontFace: FONT_H, margin: 0,
  });
  s.addText('4 pipelines analytiques — opérateurs $group, $match, $project, $sort, $cond', {
    x: 0.5, y: 0.95, w: 9, h: 0.4,
    fontSize: 13, color: C.muted, fontFace: FONT_B, italic: true, margin: 0,
  });

  const pipelines = [
    { n: '1', t: 'Taux d\'erreur par application', d: 'Quel SI est le plus instable ?', sql: 'GROUP BY + CASE WHEN', color: C.primary },
    { n: '2', t: 'Top 10 erreurs fréquentes',       d: 'Quels messages reviennent ?',  sql: 'GROUP BY message ORDER BY count', color: C.secondary },
    { n: '3', t: 'Distribution temporelle',         d: 'À quelles heures les pics ?',  sql: 'GROUP BY HOUR(timestamp)', color: C.accent },
    { n: '4', t: 'Détection d\'anomalies',          d: 'Pics anormaux > seuil',        sql: 'GROUP BY + HAVING COUNT > 3', color: C.danger },
  ];

  pipelines.forEach((p, i) => {
    const y = 1.6 + i * 0.85;
    // Carte
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: y, w: 9, h: 0.75,
      fill: { color: C.bgCard }, line: { color: C.border, width: 1 },
    });
    // Cercle numéro
    s.addShape(pres.shapes.OVAL, {
      x: 0.7, y: y + 0.17, w: 0.4, h: 0.4,
      fill: { color: p.color }, line: { type: 'none' },
    });
    s.addText(p.n, {
      x: 0.7, y: y + 0.17, w: 0.4, h: 0.4,
      fontSize: 14, color: C.white, bold: true, align: 'center', valign: 'middle',
      fontFace: FONT_B, margin: 0,
    });
    // Titre
    s.addText(p.t, {
      x: 1.3, y: y + 0.1, w: 4.2, h: 0.35,
      fontSize: 14, color: C.textDark, bold: true, fontFace: FONT_H, margin: 0,
    });
    // Description
    s.addText(p.d, {
      x: 1.3, y: y + 0.42, w: 4.2, h: 0.3,
      fontSize: 11, color: C.muted, fontFace: FONT_B, italic: true, margin: 0,
    });
    // Équivalent SQL
    s.addText('SQL équivalent', {
      x: 5.7, y: y + 0.1, w: 3.7, h: 0.25,
      fontSize: 9, color: C.muted, bold: true, charSpacing: 2, fontFace: FONT_B, margin: 0,
    });
    s.addText(p.sql, {
      x: 5.7, y: y + 0.35, w: 3.7, h: 0.35,
      fontSize: 11, color: C.textDark, fontFace: 'Consolas', margin: 0,
    });
  });
}

// ─────────────────────────────────────────────
// SLIDE 9 — Performance & Index (clair, chiffres)
// ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  s.addText('6. Performance — IXSCAN vs COLLSCAN', {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    fontSize: 26, color: C.textDark, bold: true, fontFace: FONT_H, margin: 0,
  });
  s.addText('Mesures explain() réelles sur le cluster Atlas (2 013 logs)', {
    x: 0.5, y: 0.95, w: 9, h: 0.4,
    fontSize: 13, color: C.muted, fontFace: FONT_B, italic: true, margin: 0,
  });

  // Tableau comparatif
  const tableData = [
    [
      { text: 'Scénario', options: { bold: true, color: C.white, fill: { color: C.textDark }, align: 'center' } },
      { text: 'Stratégie', options: { bold: true, color: C.white, fill: { color: C.textDark }, align: 'center' } },
      { text: 'Docs examinés', options: { bold: true, color: C.white, fill: { color: C.textDark }, align: 'center' } },
      { text: 'Docs retournés', options: { bold: true, color: C.white, fill: { color: C.textDark }, align: 'center' } },
      { text: 'Gain', options: { bold: true, color: C.white, fill: { color: C.textDark }, align: 'center' } },
    ],
    [
      'Filtre level=ERROR\nAVEC index',
      { text: 'IXSCAN ✓', options: { color: C.success, bold: true, align: 'center' } },
      { text: '457', options: { align: 'center' } },
      { text: '457', options: { align: 'center' } },
      { text: '×4.4', options: { color: C.success, bold: true, align: 'center' } },
    ],
    [
      'Filtre level=ERROR\nSANS index',
      { text: 'COLLSCAN ✗', options: { color: C.danger, bold: true, align: 'center' } },
      { text: '2 013', options: { align: 'center' } },
      { text: '457', options: { align: 'center' } },
      { text: 'baseline', options: { color: C.muted, italic: true, align: 'center' } },
    ],
    [
      'Filtre timestamp 24h\nAVEC index',
      { text: 'IXSCAN ✓', options: { color: C.success, bold: true, align: 'center' } },
      { text: '11', options: { align: 'center' } },
      { text: '11', options: { align: 'center' } },
      { text: '×183', options: { color: C.success, bold: true, align: 'center' } },
    ],
  ];

  s.addTable(tableData, {
    x: 0.5, y: 1.7, w: 9, h: 2.8,
    fontSize: 12, fontFace: FONT_B, color: C.textDark,
    border: { type: 'solid', pt: 1, color: C.border },
    rowH: [0.5, 0.65, 0.65, 0.65],
  });

  // Encart projection
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.7, w: 9, h: 0.75,
    fill: { color: C.bgCard }, line: { color: C.primary, width: 1 },
  });
  s.addText('Projection production', {
    x: 0.7, y: 4.75, w: 3, h: 0.3,
    fontSize: 10, color: C.primary, bold: true, charSpacing: 2, fontFace: FONT_B, margin: 0,
  });
  s.addText('Sur 10 M de logs : COLLSCAN ≈ 10 s   →   IXSCAN ≈ 2.3 s   (gain critique pour un dashboard temps réel)', {
    x: 0.7, y: 5.0, w: 8.7, h: 0.4,
    fontSize: 12, color: C.textDark, fontFace: FONT_B, margin: 0,
  });
}

// ─────────────────────────────────────────────
// SLIDE 10 — Démo live (clair, parcours)
// ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  s.addText('7. Démonstration live', {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    fontSize: 28, color: C.textDark, bold: true, fontFace: FONT_H, margin: 0,
  });
  s.addText('Ce que nous allons montrer pendant 10 minutes', {
    x: 0.5, y: 0.95, w: 9, h: 0.4,
    fontSize: 14, color: C.muted, fontFace: FONT_B, italic: true, margin: 0,
  });

  const demos = [
    { n: '1', t: 'Dashboard temps réel',     d: 'KPIs, graphiques, auto-refresh 30s, mode clair/sombre',  color: C.primary },
    { n: '2', t: 'Insertion d\'un log',      d: 'Formulaire dynamique selon le type — apparition instantanée', color: C.secondary },
    { n: '3', t: 'Recherche avancée',        d: '$regex sur message, $in pour level, filtre temporel', color: C.accent },
    { n: '4', t: 'Filtres par type ($exists)', d: 'Logs Java, Web, Sécurité, DB lents — un clic chacun', color: C.warning },
    { n: '5', t: 'Pipelines visualisés',     d: 'Les 4 agrégations affichées avec graphiques', color: C.success },
    { n: '6', t: 'Audit sécurité',           d: 'IPs suspectes, utilisateurs avec > 5 tentatives échouées', color: C.danger },
  ];

  demos.forEach((d, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 4.6;
    const y = 1.6 + row * 1.2;
    // Carte
    s.addShape(pres.shapes.RECTANGLE, {
      x: x, y: y, w: 4.3, h: 1.05,
      fill: { color: C.bgCard }, line: { color: C.border, width: 1 },
    });
    // Cercle numéro
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.2, y: y + 0.32, w: 0.4, h: 0.4,
      fill: { color: d.color }, line: { type: 'none' },
    });
    s.addText(d.n, {
      x: x + 0.2, y: y + 0.32, w: 0.4, h: 0.4,
      fontSize: 13, color: C.white, bold: true, align: 'center', valign: 'middle',
      fontFace: FONT_B, margin: 0,
    });
    // Titre
    s.addText(d.t, {
      x: x + 0.75, y: y + 0.15, w: 3.4, h: 0.35,
      fontSize: 13, color: C.textDark, bold: true, fontFace: FONT_H, margin: 0,
    });
    // Description
    s.addText(d.d, {
      x: x + 0.75, y: y + 0.5, w: 3.4, h: 0.5,
      fontSize: 10, color: C.muted, fontFace: FONT_B, italic: true, valign: 'top', margin: 0,
    });
  });

  // Bandeau bas
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 5.2, w: 9, h: 0.3,
    fill: { color: C.primary }, line: { type: 'none' },
  });
  s.addText('http://localhost:3000  —  démo sur MongoDB Atlas en direct', {
    x: 0.5, y: 5.2, w: 9, h: 0.3,
    fontSize: 11, color: C.white, bold: true, align: 'center', valign: 'middle',
    fontFace: FONT_B, margin: 0,
  });
}

// ─────────────────────────────────────────────
// SLIDE 11 — Bilan CDC + Difficultés (clair)
// ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  s.addText('Bilan & difficultés rencontrées', {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    fontSize: 28, color: C.textDark, bold: true, fontFace: FONT_H, margin: 0,
  });
  s.addText('Toutes les contraintes du cahier des charges sont remplies', {
    x: 0.5, y: 0.95, w: 9, h: 0.4,
    fontSize: 14, color: C.muted, fontFace: FONT_B, italic: true, margin: 0,
  });

  // Colonne gauche — Contraintes CDC ✓
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 4.4, h: 3.7,
    fill: { color: C.bgCard }, line: { color: C.success, width: 2 },
  });
  s.addText('Contraintes CDC ✓', {
    x: 0.7, y: 1.75, w: 4, h: 0.4,
    fontSize: 14, color: C.success, bold: true, fontFace: FONT_H, margin: 0,
  });
  s.addText([
    { text: 'Volume 2 000+ logs', options: { bullet: true, breakLine: true } },
    { text: '4 sources distinctes (Java/Web/Sec/DB)', options: { bullet: true, breakLine: true } },
    { text: '$exists pour stack_trace', options: { bullet: true, breakLine: true } },
    { text: '4 pipelines d\'agrégation', options: { bullet: true, breakLine: true } },
    { text: 'Pipeline anomalies ($group + HAVING)', options: { bullet: true, breakLine: true } },
    { text: 'Index level + timestamp + app_id', options: { bullet: true, breakLine: true } },
    { text: 'Insertion temps réel via UI', options: { bullet: true, breakLine: true } },
    { text: 'Application web fonctionnelle', options: { bullet: true } },
  ], {
    x: 0.7, y: 2.15, w: 4, h: 3,
    fontSize: 12, color: C.textDark, fontFace: FONT_B, paraSpaceAfter: 4,
  });

  // Colonne droite — Difficultés
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.6, w: 4.4, h: 3.7,
    fill: { color: C.bgCard }, line: { color: C.warning, width: 2 },
  });
  s.addText('Difficultés rencontrées', {
    x: 5.3, y: 1.75, w: 4, h: 0.4,
    fontSize: 14, color: C.warning, bold: true, fontFace: FONT_H, margin: 0,
  });
  s.addText([
    { text: 'Configuration IP MongoDB Atlas (whitelisting)', options: { bullet: true, breakLine: true } },
    { text: 'Choix imbrication vs référence pour logs/apps', options: { bullet: true, breakLine: true } },
    { text: 'Syntaxe MongoDB du HAVING SQL ($match après $group)', options: { bullet: true, breakLine: true } },
    { text: 'Cohérence du schéma flexible (4 types)', options: { bullet: true, breakLine: true } },
    { text: 'Coordination Git en équipe (commits, branches)', options: { bullet: true, breakLine: true } },
    { text: 'Génération de données réalistes avec Faker', options: { bullet: true } },
  ], {
    x: 5.3, y: 2.15, w: 4, h: 3,
    fontSize: 12, color: C.textDark, fontFace: FONT_B, paraSpaceAfter: 4,
  });

  s.addText('Note 28 / 28 visée — tous les critères d\'évaluation couverts', {
    x: 0.5, y: 5.5, w: 9, h: 0.3,
    fontSize: 11, color: C.primary, bold: true, align: 'center', fontFace: FONT_B,
  });
}

// ─────────────────────────────────────────────
// SLIDE 12 — Conclusion / Merci (sombre)
// ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navy };

  // Barre accent
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.18, h: 5.625,
    fill: { color: C.primary }, line: { type: 'none' },
  });

  s.addText('Merci pour votre attention', {
    x: 0.6, y: 1.4, w: 8.8, h: 0.9,
    fontSize: 44, color: C.white, bold: true, fontFace: FONT_H,
  });

  s.addText('Questions & démonstration live', {
    x: 0.6, y: 2.35, w: 8.8, h: 0.5,
    fontSize: 20, color: C.accent, italic: true, fontFace: FONT_B,
  });

  // Carte "ouvert à"
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 3.4, w: 8.8, h: 1.2,
    fill: { color: C.navyCard }, line: { color: C.primary, width: 1 },
  });
  s.addText('Le groupe est prêt à répondre individuellement sur :', {
    x: 0.9, y: 3.5, w: 8.2, h: 0.35,
    fontSize: 12, color: 'CBD5E1', italic: true, fontFace: FONT_B, margin: 0,
  });
  s.addText([
    { text: 'modélisation MongoDB  •  ', options: { color: C.accent } },
    { text: 'pipelines d\'agrégation  •  ', options: { color: C.accent } },
    { text: 'index et performances  •  ', options: { color: C.accent } },
    { text: 'architecture web et REST  •  ', options: { color: C.accent } },
    { text: 'comparaison SQL/NoSQL', options: { color: C.accent } },
  ], {
    x: 0.9, y: 3.85, w: 8.2, h: 0.65,
    fontSize: 13, color: C.white, bold: true, fontFace: FONT_B, valign: 'middle', margin: 0,
  });

  // Footer
  s.addText('Groupe 3 — LogTech Solutions  |  UGANC — L3 Développement Logiciel', {
    x: 0.6, y: 5.05, w: 8.8, h: 0.3,
    fontSize: 11, color: '94A3B8', italic: true, fontFace: FONT_B, align: 'center',
  });
  s.addText('github.com/Laouratou004/LogWatch_mongo', {
    x: 0.6, y: 5.3, w: 8.8, h: 0.3,
    fontSize: 10, color: C.accent, fontFace: 'Consolas', align: 'center',
  });
}

// ── Écriture du fichier ──
pres.writeFile({ fileName: 'diaporama.pptx' })
  .then(name => console.log(`✅ Diaporama généré : ${name}`));
