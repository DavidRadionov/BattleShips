const CellStatus = {
    EMPTY: 0,
    SEA: 3,
    SHIP: 1,
    PARTIAL: 2,
    DEAD: 4
}

const MoveResult = {
    SEA: 0,
    PARTIAL: 1,
    DEAD: 2,
    ERROR: -1
}

class Game {
    constructor(field1, field2) {
        this.field1 = field1;
        this.field2 = field2;
        this.winner = -1;
        this.activeUser = Math.round(Math.random());
    }

    move(x, y, field) {
        let result = MoveResult.SEA;

        if (field[y][x] === CellStatus.PARTIAL || field[y][x] === CellStatus.SEA || field[y][x] === CellStatus.DEAD) {
            result = MoveResult.ERROR;
        } else {
            if (field[y][x] === CellStatus.SHIP) {
                field[y][x] = CellStatus.PARTIAL;

                result = MoveResult.PARTIAL;

                if (this.checkExplosion(x, y, field)) {
                    result = MoveResult.DEAD;
                
                }
            } else {
                field[y][x] = CellStatus.SEA;
            }
        }

        if (result !== MoveResult.DEAD && result !== MoveResult.PARTIAL) {
            this.activeUser = this.activeUser === 0 ? 1 : 0;
        }

        return result;
    }

    getCellStatus(x, y, field) {
        if (x < 0 || x > 9 || y < 0 || y > 9) {
            return CellStatus.EMPTY;
        }

        return field[y][x];
    }

    checkExplosion(x, y, field) { // проверка на взрыв коробля
        let cellStatus;
        let left = true;
        let right = true;
        let up = true;
        let down = true;
        let partialShip = new Map();
        for (let i = 1; i < 5; i++) {
            if (right) {
                cellStatus = this.getCellStatus(x + i, y, field);

                if (cellStatus === CellStatus.SHIP) return false;
                if (cellStatus === CellStatus.PARTIAL) partialShip.set([x + i,y],CellStatus.DEAD);
                right = cellStatus !== CellStatus.EMPTY;
            }

            if (left) {
                cellStatus = this.getCellStatus(x - i, y, field);

                if (cellStatus === CellStatus.SHIP) return false;
                if (cellStatus === CellStatus.PARTIAL) partialShip.set([x - i,y],CellStatus.DEAD);
                left = cellStatus !== CellStatus.EMPTY;
            }

            if (down) {
                cellStatus = this.getCellStatus(x, y + i, field);

                if (cellStatus === CellStatus.SHIP) return false;
                 if (cellStatus === CellStatus.PARTIAL) partialShip.set([x,y + i],CellStatus.DEAD);
                down = cellStatus !== CellStatus.EMPTY;
            }

            if (up) {
                cellStatus = this.getCellStatus(x, y - i, field);

                if (cellStatus === CellStatus.SHIP) return false;
                if (cellStatus === CellStatus.PARTIAL) partialShip.set([x,y - i],CellStatus.DEAD);
                up = cellStatus !== CellStatus.EMPTY;
            }
        }
        field[y][x] = CellStatus.DEAD;
        for (let key of partialShip.keys()) {
            field[key[1]][key[0]] = partialShip.get(key);
        }
      
        return true;
    }

    checkGameOver() {
       
        let statusUser1 = true;
        let statusUser2 = true;

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.field1[i][j] === 1) {
                    statusUser1 = false;
                }
            }
        }

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.field2[i][j] === 1) {
                    statusUser2 = false;
                }
            }
        }
        if (statusUser1) {
            this.winner = 1;
        } else if (statusUser2) {
            this.winner = 0;
        }
        return statusUser1 !== statusUser2;
       
    }
}

module.exports = Game;