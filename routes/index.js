var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  var connection = req.socket; // Access the database connection from the request object


  var sql = 'SELECT * FROM putovanja';
  connection.query(sql, function(err, travels) {
    if (err) {
      console.error('Error fetching travels from database:', err);
      return next(err);
    }
    // Render the index page with the list of travels
    res.render('index', { title: 'Express', session: req.session, travels: travels });
  });
});


router.post('/logout', function(req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Error logging out. Please try again later.');
    }
    res.redirect('/');
  });
});


router.post('/book-travel', function(req, res, next) {
  var connection = req.socket;
  var userId = req.session.user.idkorisnici;
  var travelId = req.body.idputovanja;


  var checkSql = 'SELECT * FROM rezervacija WHERE idkorisnici = ? AND idputovanja = ?';
  connection.query(checkSql, [userId, travelId], function(err, bookings) {
    if (err) {
      console.error('Error checking existing booking:', err);
      return next(err);
    }


    if (bookings.length > 0) {
      return res.status(400).send('You have already booked this travel.');
    }

    var insertSql = 'INSERT INTO rezervacija (idkorisnici, idputovanja) VALUES (?, ?)';
    connection.query(insertSql, [userId, travelId], function(err, result) {
      if (err) {
        console.error('Error booking travel:', err);
        return next(err);
      }

      res.redirect('/');
    });
  });
});

router.get('/travel-details/:id', function(req, res, next) {
  var connection = req.socket;
  const travelId = req.params.id;


  connection.query('SELECT * FROM putovanja WHERE idputovanja = ?', [travelId], function(err, travel) {
    if (err) {
      console.error('Error fetching travel details:', err);
      return next(err);
    }

    connection.query('SELECT komentari.*, korisnici.username FROM komentari JOIN korisnici ON komentari.idkorisnici = korisnici.idkorisnici WHERE idputovanja = ?', [travelId], function(err, comments) {
      if (err) {
        console.error('Error fetching comments:', err);
        return next(err);
      }
      // Render the travel details page with the fetched travel details and comments, passing the session object
      res.render('travelDetails', { title: 'Travel Details', travel: travel[0], comments: comments, session: req.session });
    });
  });
});


router.get('/travel-history', function(req, res) {
  var connection = req.socket;
  const userId = req.session.user.idkorisnici;

  // Fetch travel history for the logged-in user from the database
  connection.query('SELECT p.* FROM putovanja p INNER JOIN rezervacija r ON p.idputovanja = r.idputovanja WHERE r.idkorisnici = ? AND p.kraj < NOW()', [userId], function(err, travelHistory) {
    if (err) {
      console.error('Error fetching travel history:', err);
      return res.status(500).send('Error fetching travel history. Please try again later.');
    }
    // Render the travelHistory.ejs view with the travel history data
    res.render('travelHistory', { title: 'Travel History', travelHistory: travelHistory });
  });
});




router.post('/add-comment/:id', function(req, res, next) {
  var connection = req.socket;
  var userId = req.session.user.idkorisnici; // Get the user ID from the session
  var travelId = req.params.id; // Get the travel ID from the URL parameter
  var commentText = req.body.comment; // Get the comment text from the form body
  var currentTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Get current date and time


  var sql = 'INSERT INTO komentari (idkorisnici, idputovanja, sadrzaj, vrijemeObjave) VALUES (?, ?, ?, ?)';
  connection.query(sql, [userId, travelId, commentText, currentTime], function(err, result) {
    if (err) {
      console.error('Error adding comment:', err);
      return next(err);
    }

    res.redirect('/travel-details/' + travelId);
  });
});


module.exports = router;
