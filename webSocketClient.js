const WebSocket = require('ws');

// URL du serveur WebSocket
// const wsUrl = 'ws://localhost:3000';
const wsUrl = 'ws://192.168.1.73:3000/ws';

// Crée une connexion WebSocket
const ws = new WebSocket(wsUrl);

// Événement déclenché lorsque la connexion est établie
ws.on('open', function open() {
    console.log('✅ Connecté au serveur WebSocket');
    
    // Envoie un message ping pour tester la connexion
    ws.send(JSON.stringify({
        type: 'ping',
        message: 'Test de connexion',
        at: new Date().toISOString()
    }));
});

// Événement déclenché lorsqu'un message est reçu
ws.on('message', function message(data) {
    try {
        const message = JSON.parse(data);
        console.log('📨 Message reçu du serveur:', message);
        
        // Traitement des différents types de messages
        switch (message.type) {
            case 'system.welcome':
                console.log('👋 Message de bienvenue:', message.message);
                break;
            case 'pong':
                console.log('🏓 Réponse ping reçue');
                break;
            case 'article.created':
                console.log('🆕 Nouvel article créé:', message.article.title);
                break;
            case 'article.updated':
                console.log('🔄 Article mis à jour:', message.article.title);
                break;
            case 'article.deleted':
                console.log('🗑️ Article supprimé:', message.articleId);
                break;
            default:
                console.log('📦 Message de type inconnu:', message.type);
        }
    } catch (error) {
        console.error('❌ Erreur de parsing du message:', error);
    }
});

// Événement déclenché en cas d'erreur
ws.on('error', function error(err) {
    console.error('❌ Erreur WebSocket:', err);
});

// Événement déclenché lorsque la connexion est fermée
ws.on('close', function close() {
    console.log('❌ Déconnecté du serveur WebSocket');
});

// Garde le client actif
setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'ping',
            at: new Date().toISOString()
        }));
    }
}, 30000); // Ping toutes les 30 secondes

console.log('🔌 Client WebSocket de test démarré. Connecté à:', wsUrl);