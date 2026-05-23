const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function exportData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas');

    const logs = await mongoose.connection.db.collection('logs').find({}).toArray();
    const filePath = path.join(__dirname, '../data/logs.json');
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
    console.log(`✅ Export terminé : ${logs.length} logs exportés`);
    console.log(`📁 Fichier : data/logs.json`);

  } catch (err) {
    console.error('❌ Erreur export :', err);
  } finally {
    mongoose.connection.close();
  }
}

exportData();