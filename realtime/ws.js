// realtime/ws.js - Update the WebSocket initialization
const WebSocket = require('ws');
const initWebSocket = (server) => {
    const wss = new WebSocket.Server({ server });
    const clients = new Set();
    
    wss.on('connection', (ws) => {
        console.log('✅ Nouveau client WebSocket connecté');
        clients.add(ws);
        
        // Send welcome message
        ws.send(JSON.stringify({
            type: 'system.welcome',
            message: "Vous êtes connecté à l'API WebSocket en temps réel!",
            at: new Date().toISOString(),
        }));
        
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                console.log('📨 Message reçu du client:', data);
                
                if (data.type === 'ping') {
                    ws.send(JSON.stringify({
                        type: 'pong',
                        at: new Date().toISOString()
                    }));
                }
            } catch (error) {
                console.error('❌ Erreur de parsing du message:', error);
            }
        });
        
        ws.on('close', () => {
            console.log('❌ Client WebSocket déconnecté');
            clients.delete(ws);
        });
        
        ws.on('error', (error) => {
            console.error('❌ Erreur WebSocket:', error);
            clients.delete(ws);
        });
    });
    
    // Function to broadcast messages to all clients
    const broadcast = (message) => {
        const messageString = JSON.stringify(message);
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(messageString);
            }
        });
    };
    
    return { wss, broadcast };
};

module.exports = { initWebSocket };