var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    res.render('registration', { title: 'User Registration', session: req.session});
});


router.post('/', function(req, res, next) {
    var connection = req.socket;


    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;


    if (!username || !email || !password) {
        return res.status(400).send('All fields are required.');
    }


    var sql = 'INSERT INTO korisnici (username, email, password, role, aktivan) VALUES (?, ?, ?, "user", 1)';
    connection.query(sql, [username, email, password], function(err, results) {
        if (err) {
            console.error('Error inserting user into database:', err);
            return res.status(500).send('Error registering user. Please try again later.');
        }
        console.log('User registered successfully:', results.insertId);
        res.send('Registration successful!');
    });
});

module.exports = router;
