class GameFieldGenerator {
    constructor() {
        this.FIELD_SIZE = 10;

        this.gameSipsData = {
            a: {size: 4, count: 1},
            b: {size: 3, count: 2},
            c: {size: 2, count: 3},
            d: {size: 1, count: 4},
        }
    }

    generate(maxTriesCount = 5) {
        for (let i = 0; i < maxTriesCount; i++) {
            try {
                let field = this.initField();

                this.placeShips(field);

                return field;
            } catch (e) {
                console.log(e);
            }
        }

        throw `Can not generate field: tries = ${maxTriesCount}`;
    }

    printField(field) {
        let output = "";

        for (let y = 0; y < this.FIELD_SIZE; y++) {
            for (let x = 0; x < this.FIELD_SIZE; x++) {
                output += ` ${field[y][x] === 0 ? "+" : field[y][x]} `;
            }

            output += "\n";
        }

        console.log(output);
    }

    initField() {
        const field = [];

        for (let y = 0; y < this.FIELD_SIZE; y++) {
            field.push([]);

            for (let x = 0; x < this.FIELD_SIZE; x++) {
                field[y].push(0);
            }
        }

        return field;
    }

    placeShips(field) {
        Object.keys(this.gameSipsData).forEach(type => {
            const shipData = this.gameSipsData[type];

            for (let i = 0; i < shipData.count; i++) {
                this.placeShip(field, shipData.size, Math.random() > 0.5);
            }
        });
    }

    placeShip(field, shipSize, isHorizontal) {
        let placed = false;
        let count = 0;

        while(!placed) {
            const startX = Math.floor(Math.random() * this.FIELD_SIZE);
            const startY = Math.floor(Math.random() * this.FIELD_SIZE);

            if (this.isShipCanBePlaced(field, startX, startY, shipSize, isHorizontal)) {
                for (let i = 0; i < shipSize; i++) {
                    if (isHorizontal) {
                        field[startY][startX + i] = 1;
                    } else {
                        field[startY + i][startX] = 1;
                    }
                }

                placed = true;
            }

            count++;

            if (count > 100000) {
                throw `WTF???!!!! Can not place ${isHorizontal ? "horizontal" : "vertical"} ship with size ${shipSize}`;
            }
        }
    }

    isShipCanBePlaced(field, startX, startY, shipSize, isHorizontal) {
        let minX = Math.max(0, startX - 1);
        let maxX = Math.min(this.FIELD_SIZE - 1, isHorizontal ? startX + shipSize + 1 : startX + 1);
        let minY = Math.max(0, startY - 1);
        let maxY = Math.min(this.FIELD_SIZE - 1, isHorizontal ? startY + 1 : startY + shipSize + 1);

        if (isHorizontal && maxX - minX < shipSize) return false;
        if (!isHorizontal && maxY - minY < shipSize) return false;

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (field[y][x] !== 0) return false;
            }
        }

        return true;
    }
}

const gameFieldGenerator = new GameFieldGenerator();

module.exports = {
    gameFieldGenerator: new GameFieldGenerator(),
    printField: gameFieldGenerator.printField
}