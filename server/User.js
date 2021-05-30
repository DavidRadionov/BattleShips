class User {
    constructor(id, field, name) {
        this.id = id;
        this.field = field;
        this.userName = name;
        this.statusMove = false;
    }

    getFieldForEnemy() {
        const forEnemy = [];

        for (let y = 0; y < this.field.length; y++) {
            const row = this.field[y];

            forEnemy.push(row.concat());

            for (let x = 0; x < row.length; x++) {
                forEnemy[y][x] = this.field[y][x] === 1 ? 0 : this.field[y][x];
            }
        }

        return forEnemy;
    }
}

module.exports = User;