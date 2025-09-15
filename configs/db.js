/**
 * Gestion de la connexion à MongoDB
 * Configure et maintient la connexion à la base de données
 */

const { MongoClient } = require('mongodb'); // Client MongoDB officiel
const dotenv = require('dotenv'); // Gestion des variables d'environnement
dotenv.config(); // Charge les variables

// Configuration de la connexion
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'registerdb';

// Variables d'état de la connexion
let client; // Instance du client MongoDB
let db; // Instance de la base de données
let isConnecting = false; // État de la connexion
let connectionPromise; // Promesse de connexion

/**
 * Établit la connexion à MongoDB
 * @returns {Promise<Db>} Instance de la base de données
 */
const connectDB = async () => {
    if (db) return db; // Si déjà connecté
    
    if (isConnecting) return connectionPromise; // Si connexion en cours
    
    isConnecting = true;
    connectionPromise = new Promise(async (resolve, reject) => {
        try {
            client = new MongoClient(mongoUrl, {
                connectTimeoutMS: 5000,
                socketTimeoutMS: 30000,
                serverSelectionTimeoutMS: 5000,
                maxPoolSize: 10,
                retryWrites: true,
                retryReads: true
            });
            
            await client.connect();
            db = client.db(dbName);
            console.log("✅ Connecté à MongoDB");

            // Création des index pour optimiser les requêtes
            await db.collection('articles').createIndex({ author: 1 });
            await db.collection('articles').createIndex({ title: 1 });
            await db.collection('users').createIndex({ email: 1 }, { unique: true });
            
            isConnecting = false;
            resolve(db);
        } catch (err) {
            isConnecting = false;
            console.error("❌ Erreur MongoDB:", err);
            reject(err);
            process.exit(1);
        }
    });
    
    return connectionPromise;
};

/**
 * Récupère l'instance de la base de données
 * @returns {Db} Instance de la base de données
 * @throws {Error} Si la base n'est pas connectée
 */
const getDB = () => {
    if (!db) throw new Error('Base de données non connectée');
    return db;
};

module.exports = { connectDB, getDB };