// Import modules
// Import modules
const express = require('express');          // Framework web pour Node.js
const dotenv = require('dotenv');            // Charge les variables d'environnement
const { connectDB } = require('./configs/db'); // Connexion à MongoDB
const { authRoutes, authenticate, isAdmin } = require('./routes/auth.routes'); // Routes d'authentification
const articleRoutes = require('./routes/article.routes'); // Routes des articles
const swaggerUi = require('swagger-ui-express'); // Interface Swagger UI
const path = require('path');                // Gestion des chemins de fichiers
const cors = require('cors');                // Middleware CORS
const WebSocket = require('ws');             // Module WebSocket
const http = require('http');                // Serveur HTTP natif Node.js
const { initWebSocket } = require('./realtime/ws'); // Importe l'init du WS depuis le module dédié

// Crée l'application Express
const app = express();
const server = http.createServer(app); // Crée un serveur HTTP unique pour Express + WS

// Initialise WebSocket et récupère la fonction de broadcast
const { broadcast } = initWebSocket(server); // Attache le serveur WS sur le même port

// Rend la fonction de broadcast accessible globalement
app.locals.wsBroadcast = broadcast;

// Charge .env
dotenv.config();

// Middleware global
app.use(cors());                             // Autorise les requêtes Cross-Origin
app.use(express.json());                     // Parse le JSON des requêtes
app.use(express.urlencoded({ extended: true })); // Parse les formulaires

// Connexion MongoDB
connectDB()
  .then(() => console.log('✅ Connexion à MongoDB établie'))
  .catch(err => {
    console.error('Échec de connexion à MongoDB', err);
    process.exit(1);
  });

// Serveur Swagger UI
const swaggerSpec = require('./configs/swaggerConfig');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes principales
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/articles', articleRoutes);

app.get('/api/v1/admin', authenticate, isAdmin, (req, res) => {
  res.json({ message: 'Bienvenue admin !' });
});

// Images statiques
app.use('/api/v1/uploads', express.static(path.join(__dirname, 'uploads')));

// Route racine
app.get('/api/v1', (req, res) => {
  res.send("Bienvenue sur l'API Articles & Utilisateurs");
});

// Erreur 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Erreur globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur' });
});

// Démarrage du serveur HTTP + WS
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
  console.log(`🛰️ WebSocket dispo sur ws://localhost:${PORT}`);
});
// Exportation de l'application Express
module.exports = { app, server };