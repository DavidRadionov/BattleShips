const express = require('express');
const router = express.Router();
const gameServer = require("../server/Server");

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', {title: 'Морской Бой'});
});

router.post("/start", (req, res, next) => {
    const field = req.body.field;

    if (gameServer.checkField(field)) {
        const userID = Date.now();
        let userName;

        if (req.body.userName.length === 0) {
            userName = "Anonyme";
        } else {
            userName = req.body.userName;
        }

        const roomID = gameServer.addUser(userID, field, userName);

        if (roomID) {
            res.redirect(301, `/game/${roomID}/user/${userID}`);
        } else {
            res.json({message: "Не удалось найти соперника"});
        }
    } else {
        res.json({message: "Поле не должно быть пустым и корабли не должны соприкасаться"});
    }
});

module.exports = router;
