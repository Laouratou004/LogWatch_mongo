// =============================================================================
// scripts/export.js — Export de TOUS les logs vers data/logs.json
// -----------------------------------------------------------------------------
// Role : produit le fichier livrable demande par le sujet (un dataset JSON
// contenant les 2000+ logs de la collection).
//
// Usage : node scripts/export.js
// =============================================================================

const mongoose = require('mongoose');
const fs = require('fs');         // module Node natif pour ecrire des fichiers
const path = require('path');     // module Node natif pour gerer les chemins
require('dotenv').config();

async function exportData() {
  try {
    // --- 1. Connexion a MongoDB ---
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecte a MongoDB Atlas');

    // --- 2. Recuperation de TOUS les logs ---
    // .find({}) sans filtre = tous les documents
    // .toArray() convertit le curseur Mongo en tableau JS
    const logs = await mongoose.connection.db.collection('logs').find({}).toArray();

    // --- 3. Construction du chemin du fichier de sortie ---
    // __dirname = dossier ou se trouve ce script (scripts/)
    // path.join(...) gere les / et \ selon l'OS (Windows vs Mac/Linux)
    const filePath = path.join(__dirname, '../data/logs.json');

    // --- 4. Ecriture du fichier ---
    // JSON.stringify(obj, replacer, indent) -> JSON formate avec indentation 2
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
    console.log(`Export termine : ${logs.length} logs exportes`);
    console.log(`Fichier : data/logs.json`);

  } catch (err) {
    console.error('Erreur export :', err);
  } finally {
    // Toujours fermer la connexion (libere les ressources)
    mongoose.connection.close();
  }
}

// Lancement
exportData();
