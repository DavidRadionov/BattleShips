const Game = require("./Game");

class Room {
    constructor(roomID) {
        this.game = undefined;
        this.users = [];
        this.id = roomID;
    }

    startGame() {
        this.users[0].statusMove = true;
        this.users[1].statusMove = false;
        this.game = new Game(this.users[0].field, this.users[1].field);
    }

    add(user) {
        if (this.users.length < 2) {
            this.users.push(user);
        } else {
            console.log("Error: max users - 2.");
        }
    }

    move(x, y, userID) {
        const user = this.getEnemyForUserID(userID);

        if (this.users[this.game.activeUser].userID !== userID) {
            return this.game.move(x, y, user.field);
        } 
        return null;
        
        
        
    }

    getEnemyForUserID(userID) {
        return this.users.find(user => user.id !== userID);
    }

    getUserByID(userID) {
        return this.users.find(user => user.id === userID);
    }
}

module.exports = Room;