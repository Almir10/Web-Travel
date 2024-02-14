var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('login', { title: 'User Login' , session: req.session});
});

router.post('/', function(req, res, next) {
    var connection = req.socket;


    var username = req.body.username;
    var password = req.body.password;


    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }


    var sql = 'SELECT * FROM korisnici WHERE username = ? AND password = ?';
    connection.query(sql, [username, password], function(err, results) {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).send('Error logging in. Please try again later.');
        }

        if (results.length === 0) {
            return res.status(401).send('Invalid username or password.');
        }


        req.session.user = results[0];
        res.redirect('/');
    });
});

module.exports = router;