require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const Application = require('./models/Application');
const Log = require('./models/Log');
const Alerte = require('./models/Alerte');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/logwatch';

const TECHNOLOGIES = ['Java', 'Node.js', 'Python', 'PHP'];
const ENVIRONNEMENTS = ['Production', 'Staging', 'Development'];
const LEVELS = ['INFO', 'WARN', 'ERROR', 'CRITICAL'];
const ALERT_TYPES = ['Pic d\'erreurs', 'CPU High', 'Memory Leak', 'DB Slow Query'];

async function seedDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('Clearing existing data...');
        await Application.deleteMany({});
        await Log.deleteMany({});
        await Alerte.deleteMany({});

        console.log('Generating 10 applications...');
        const apps = [];
        for (let i = 1; i <= 10; i++) {
            const app = new Application({
                app_id: `APP-${faker.string.numeric(4)}`,
                nom: i === 1 ? 'Site UGANC' : faker.company.name(),
                version: faker.system.semver(),
                environnement: faker.helpers.arrayElement(ENVIRONNEMENTS),
                technologie: faker.helpers.arrayElement(TECHNOLOGIES),
                responsable: faker.person.fullName(),
                sla_pct: faker.number.float({ min: 95, max: 99.99, fractionDigits: 2 })
            });
            apps.push(app);
        }
        await Application.insertMany(apps);

        console.log('Generating 2013 logs...');
        const logs = [];
        for (let i = 1; i <= 2013; i++) {
            const app = faker.helpers.arrayElement(apps);
            const level = faker.helpers.arrayElement(LEVELS);
            
            const logData = {
                log_id: `LOG-${app.technologie.toUpperCase()}-${faker.string.numeric(6)}`,
                app_id: app.app_id,
                timestamp: faker.date.recent({ days: 30 }),
                level: level,
                message: faker.lorem.sentence()
            };

            // Add flexible fields based on technology
            if (app.technologie === 'Java' && ['ERROR', 'CRITICAL'].includes(level)) {
                logData.source_fichier = `${faker.word.sample()}Service.java`;
                logData.ligne_code = faker.number.int({ min: 10, max: 1000 });
                logData.exception_type = 'NullPointerException';
                logData.stack_trace = `java.lang.NullPointerException at ${faker.internet.domainName()}...`;
                logData.nb_occurrences = faker.number.int({ min: 1, max: 50 });
            } else if (app.technologie === 'Node.js' || app.technologie === 'PHP') {
                logData.methode_http = faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE']);
                logData.url = faker.internet.url({ appendSlash: true });
                logData.code_statut = ['ERROR', 'CRITICAL'].includes(level) ? faker.helpers.arrayElement([500, 502, 503]) : faker.helpers.arrayElement([200, 201, 304, 400, 401, 404]);
                logData.duree_ms = faker.number.int({ min: 20, max: 2000 });
                logData.ip_source = faker.internet.ipv4();
            }

            logs.push(logData);
        }
        // Insert in chunks to avoid memory issues
        for (let i = 0; i < logs.length; i += 500) {
            await Log.insertMany(logs.slice(i, i + 500));
        }

        console.log('Generating 67 alertes...');
        const alertes = [];
        for (let i = 1; i <= 67; i++) {
            const app = faker.helpers.arrayElement(apps);
            alertes.push({
                alerte_id: `ALRT-${faker.string.numeric(5)}`,
                app_id: app.app_id,
                timestamp: faker.date.recent({ days: 7 }),
                type_alerte: faker.helpers.arrayElement(ALERT_TYPES),
                resolue: faker.datatype.boolean({ probability: 0.7 }),
                assignee_uid: faker.datatype.boolean({ probability: 0.5 }) ? faker.string.uuid() : null
            });
        }
        await Alerte.insertMany(alertes);

        console.log('🎉 Seed completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
}

seedDB();
