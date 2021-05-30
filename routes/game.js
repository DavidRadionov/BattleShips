const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/:roomID/user/:userID', (req, res, next) => {
    res.render('game', {title: 'Морской Бой'});
});

module.exports = router;
