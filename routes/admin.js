const express = require('express');
const router = express.Router();




router.get('/', function(req, res) {
    var connection = req.socket;


    connection.query('SELECT * FROM korisnici WHERE role ="user"', function(err, users) {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Error fetching users. Please try again later.');
        }


        connection.query('SELECT * FROM putovanja', function(err, travels) {
            if (err) {
                console.error('Error fetching travels:', err);
                return res.status(500).send('Error fetching travels. Please try again later.');
            }


            connection.query('SELECT * FROM komentari', function(err, comments) {
                if (err) {
                    console.error('Error fetching comments:', err);
                    return res.status(500).send('Error fetching comments. Please try again later.');
                }


                res.render('adminDashboard', { title: 'Admin Dashboard', users: users, travels: travels, comments: comments });
            });
        });
    });
});



router.post('/deactivate-user/:id', function(req, res) {
    var connection = req.socket

    const userId = req.params.id;

    connection.query('UPDATE korisnici SET aktivan = (1 - aktivan) WHERE idkorisnici = ?', [userId], function(err, result) {
        if (err) {
            console.error('Error toggling user status:', err);
            return res.status(500).send('Error toggling user status. Please try again later.');
        }
        res.redirect('/admin');
    });
});

router.get('/edit-user/:id', function(req, res) {
    var connection = req.socket;
    const userId = req.params.id;


    connection.query('SELECT * FROM korisnici WHERE idkorisnici = ?', [userId], function(err, user) {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).send('Error fetching user data. Please try again later.');
        }

        if (user.length === 0) {
            return res.status(404).send('User not found');
        }

        res.render('editUser', { title: 'Edit User', user: user[0] });
    });
});


router.post('/edit-user/:id', function(req, res) {
    var connection = req.socket;

    const userId = req.params.id;
    const { username, email, role, aktivan } = req.body;

    connection.query('UPDATE korisnici SET username = ?, email = ?, role = ?, aktivan = ? WHERE idkorisnici = ?', [username, email, role, aktivan, userId], function(err, result) {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).send('Error updating user. Please try again later.');
        }
        res.redirect('/admin');
    });
});


router.get('/edit-travel/:id', function(req, res) {
    var connection = req.socket;

    const travelId = req.params.id;

    connection.query('SELECT * FROM putovanja WHERE idputovanja = ?', [travelId], function(err, travel) {
        if (err) {
            console.error('Error fetching travel:', err);
            return res.status(500).send('Error fetching travel. Please try again later.');
        }
        res.render('editTravel', { title: 'Edit Travel', travel: travel[0] });
    });
});

router.post('/edit-travel/:id', function(req, res) {
    var connection = req.socket;

    const travelId = req.params.id;
    const { naziv, lokacija, pocetak, kraj, kategorija, cijena, slika } = req.body;

    connection.query('UPDATE putovanja SET naziv = ?, lokacija = ?, pocetak = ?, kraj = ?, kategorija = ?, cijena = ?, slika = ? WHERE idputovanja = ?', [naziv, lokacija, pocetak, kraj, kategorija, cijena, slika, travelId], function(err, result) {
        if (err) {
            console.error('Error updating travel:', err);
            return res.status(500).send('Error updating travel. Please try again later.');
        }
        res.redirect('/admin');
    });
});


router.post('/add-travel', function(req, res) {
    var connection = req.socket;


    const { naziv, lokacija, pocetak, kraj, kategorija, cijena, slika } = req.body;


    connection.query('INSERT INTO putovanja (naziv, lokacija, pocetak, kraj, kategorija, cijena, slika) VALUES (?, ?, ?, ?, ?, ?, ?)', [naziv, lokacija, pocetak, kraj, kategorija, cijena, slika], function(err, result) {
        if (err) {
            console.error('Error adding travel:', err);
            return res.status(500).send('Error adding travel. Please try again later.');
        }
        res.redirect('/admin');
    });
});

router.post('/delete-travel/:id', function(req, res) {
    var connection = req.socket;
    const travelId = req.params.id;


    connection.query('DELETE FROM komentari WHERE idputovanja = ?', [travelId], function(err, result) {
        if (err) {
            console.error('Error deleting associated comments:', err);
            return res.status(500).send('Error deleting associated comments. Please try again later.');
        }


        connection.query('DELETE FROM rezervacija WHERE idputovanja = ?', [travelId], function(err, result) {
            if (err) {
                console.error('Error deleting associated reservations:', err);
                return res.status(500).send('Error deleting associated reservations. Please try again later.');
            }

            connection.query('DELETE FROM putovanja WHERE idputovanja = ?', [travelId], function(err, result) {
                if (err) {
                    console.error('Error deleting travel:', err);
                    return res.status(500).send('Error deleting travel. Please try again later.');
                }
                res.redirect('/admin');
            });
        });
    });
});




router.get('/view-comments/:id', function(req, res) {
    var connection = req.socket;
    const travelId = req.params.id;


    connection.query('SELECT komentari.*, korisnici.username AS username FROM komentari JOIN korisnici ON komentari.idkorisnici = korisnici.idkorisnici WHERE komentari.idputovanja = ?', [travelId], function(err, comments) {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).send('Error fetching comments. Please try again later.');
        }
        res.render('viewComments', { title: 'View Comments', comments: comments });
    });
});

router.post('/delete-comment/:id', function(req, res) {
    var connection = req.socket;
    const commentId = req.params.id;


    connection.query('DELETE FROM komentari WHERE idkomentari = ?', [commentId], function(err, result) {
        if (err) {
            console.error('Error deleting comment:', err);
            return res.status(500).send('Error deleting comment. Please try again later.');
        }
        res.redirect('/admin');
    });
});



module.exports = router;
