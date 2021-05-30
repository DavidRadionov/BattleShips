const eventBus = require("./EventBus");
const GameEvent = require("./GameEvent");
const { isGameOver } = require("./Server");

class GamesManager {
    constructor() {
        this.connections = new Map();

        eventBus.on(GameEvent.NEW_GAME, data => this.sendNewGame(data), this);
        eventBus.on(GameEvent.UPDATE_GAME, data => this.sendUpdateMessage(data), this);
        eventBus.on(GameEvent.UPDATE_CHAT, data => this.sendChatMessage(data), this);
        
    }

    setServer(webSocketServer) {
        this.webSocketServer = webSocketServer;

        this.webSocketServer.on('connection', (wsClient, request) => {
            this.addClient(wsClient, request.url);
        });
    }

    addClient(wsClient, id) {
        this.connections.set(id, wsClient);
        console.log(id + " connected");

        wsClient.on('close', data => {
            for (const [key, value] of this.connections.entries()) {
                if (value === wsClient) {
                    this.connections.delete(key);

                    console.log(key + " disconnected");
                    break;
                }
            }
        });

        wsClient.on('error', (data) => {
            console.log(data);
        });

        wsClient.on('message', data => {
            try {
                const msg = JSON.parse(data);

                this.processMessage(msg);
            } catch (e) {
                // do nothing if there's an error.
            }
        });
    }

    processMessage(msg) {
        const command = msg.command;
        const data = msg.data;

        switch (command) {
            case GameEvent.SURRENDER:
                eventBus.emit(GameEvent.SURRENDER, data);
                break;

            case GameEvent.NEW_GAME:
                eventBus.emit(GameEvent.NEW_GAME, data);
                break;

            case GameEvent.MAKE_MOVE:
                eventBus.emit(GameEvent.MAKE_MOVE, data);
                break;

            case GameEvent.SEND_CHAT_MESSAGE:
                eventBus.emit(GameEvent.SEND_CHAT_MESSAGE, data);
                break;

            default:
                console.error(`Unknown command: ${command}`);
        }
    }

    sendChatMessage(data) {
        const client1 = this.connections.get(`/${data.room.id}:${data.room.users[0]?.id}`);
        const client2 = this.connections.get(`/${data.room.id}:${data.room.users[1]?.id}`);

        const message = {
            command: GameEvent.UPDATE_CHAT,
            data: {
                message: data.text,
                from: data.from
            }
        };

        if (client1) {
            client1.send(JSON.stringify(message));
        }

        if (client2) {
            client2.send(JSON.stringify(message));
        }
    }

    sendUpdateMessage(room) {
        const client1 = this.connections.get(`/${room.id}:${room.users[0]?.id}`);
        const client2 = this.connections.get(`/${room.id}:${room.users[1]?.id}`);

        if (client1) {
            const message1 = {
                command: GameEvent.UPDATE_GAME,
                data: {
                    isMoveAvailable: room.game.activeUser === 0,
                    my: room.users[0].field,
                    enemy: room.users[1].getFieldForEnemy(),
                    isGameOver: room.game.checkGameOver(),
                    winner: -1
                }
            };

            if (message1.data.isGameOver) {
                message1.data.enemy = room.users[1].field;
                message1.data.winner = room.users[room.game.winner].id;
            }

            client1.send(JSON.stringify(message1));
        }

        if (client2) {
            const message2 = {
                command: GameEvent.UPDATE_GAME,
                data: {
                    isMoveAvailable: room.game.activeUser === 1,
                    my: room.users[1].field,
                    enemy: room.users[0].getFieldForEnemy(),
                    isGameOver: room.game.checkGameOver(),
                    winner: -1
                    
                }
            };

            if (message2.data.isGameOver) {
                message2.data.enemy = room.users[0].field;
                message2.data.winner = room.users[room.game.winner].id;
            }

            client2.send(JSON.stringify(message2));
        }
    }
}

module.exports = new GamesManager();