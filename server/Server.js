const User = require("./User");
const Room = require("./Room");
const eventBus = require("./EventBus");
const GameEvent = require("./GameEvent");

class Server {
    constructor() {
        this.rooms = new Map();
        eventBus.on(GameEvent.SURRENDER, data => {
            const room = this.rooms.get(data.roomID);
           
            if (room.users[0].id === data.userID) {
                for(let i = 0 ; i < 10 ; i++) {
                    for (let j = 0 ; j < 10; j++) {
                        if (room.game.field1[i][j] === 1) { 
                            room.game.field1[i][j] = 5;
                        }
                    }
                }
            } else {
                for(let i = 0 ; i < 10 ; i++) {
                    for (let j = 0 ; j < 10; j++) {
                        if (room.game.field2[i][j] === 1) {
                            room.game.field2[i][j] = 5;
                        }
                    }
                }
            }

            eventBus.emit(GameEvent.UPDATE_GAME, room);

        }, this);

        eventBus.on(GameEvent.NEW_GAME, data => {
            this.rooms.delete(data.roomID);
        }, this);

        eventBus.on(GameEvent.MAKE_MOVE, data => {
            this.move(data.x, data.y, data.userID, data.roomID);
        }, this);

        eventBus.on(GameEvent.SEND_CHAT_MESSAGE, data => {
            const room = this.rooms.get(data.roomID);
           
            if (room) {
                eventBus.emit(GameEvent.UPDATE_CHAT, {
                    room: room,
                    text: data.text,
                    from: this.getUserNameByOneOfUsers(room, data.userID)
                });
            }
        }, this);
    }

    checkField(field,ships) {

        //TODO: check field
        let count = 0;
        let countCheck = [];
        if (field.length === 0) {
            return false;
        }

        for (let i = 0 ; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (field[i][j] === 0) {
                    count++;
                }
            }
        }
       
        if (count > 80) {
            return false;
        }
        
        
        
       for (let i = 0 ; i < 10 ; i ++) {
           for(let j = 0 ; j < 10; j++) {
               if(field[i][j] === 1) {

                   if (i !== 9 && j !== 9) {
                    countCheck.push((field[i + 1][j] === 1 && field[i][j + 1] === 1) ? true: false);
                    countCheck.push((field[i + 1][j + 1] === 1) ? true: false);
                   }

                   if (i !== 0 && j !== 0) {
                    countCheck.push((field[i][j - 1] === 1 && field[i - 1][j] === 1) ? true: false);
                    countCheck.push((field[i - 1][j - 1] === 1) ? true: false);
                   }

                   if (i !== 0 && j !== 9) {
                    countCheck.push((field[i - 1][j] === 1 && field[i][j + 1] === 1) ? true: false);
                    countCheck.push((field[i - 1][j + 1] === 1) ? true: false);
                   }

                   if (i !== 9 && j !== 0 ) {
                    countCheck.push((field[i][j - 1] === 1 && field[i + 1][j] === 1) ? true: false);
                    countCheck.push((field[i + 1][j - 1] === 1) ? true: false)
                   }
                   
                   countCheck.forEach(element => {
                       if(element) {
                           return false;
                       }
                   });
               }
           }
       }
        
        return true;
    }

    addUser(userID, field, userName) {
        let user = new User(userID, field, userName);
        let room = undefined;

        for (let r of this.rooms.values()) {
            if (r.users.length === 1) {
                room = r;
                break;
            }
        }

        if (!room) {
            room = new Room(Date.now());
            this.rooms.set(room.id, room);
        }

        room.add(user);

        if (room.users.length === 2) {
            this.startGame(room);
        }

        return room.id;
    }

    move(x, y, userID, roomID) {
        const room = this.rooms.get(roomID);

        const result = room.move(x, y, userID);
        if (result !== null) {
            eventBus.emit(GameEvent.UPDATE_GAME, room);
        }
    }

    getRoomByUsers(userID1, userID2) {
        for (let r of this.rooms.values()) {
            if (r.users.length === 2 && r.users[0].id === userID1 && r.users[1].id === userID2) {
                return r;
            }
        }
    }
    getUserByRoom(room,userID) {
        if(room.users[0].id === userID) {
            return room.users[0];
        } else {
            return room.users[1];
        }
    }
    // getRoomByOneOfUsers(userID) {
    //     for (let room of this.rooms.values()) {
    //         if (room.users[0].id === userID) {
    //             return room;
    //         } else if (room.users.length === 2 && room.users[1].id === userID) {
    //             return room;
    //         }
    //     }
    // }

    getUserNameByOneOfUsers(room, userID) {
        
        if (room.users[0].id === userID) {
            return room.users[0].userName;
        } else {
            return room.users[1].userName;
        }
    }

    isGameOver(roomID) {
        const room = this.rooms.get(roomID);
        return room.game.checkGameOver();
    }

    startGame(room) {
        room.startGame();
        
        setTimeout(() => {
            eventBus.emit(GameEvent.UPDATE_GAME, room);
        }, 3000);
    }
}

module.exports = new Server();