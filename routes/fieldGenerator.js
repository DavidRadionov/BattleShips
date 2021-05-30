const express = require('express');
const router = express.Router();
const {gameFieldGenerator} = require("../server/GameFieldGenerator");

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.json(gameFieldGenerator.generate());
});

module.exports = router;
