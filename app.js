// Import required modules
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session'); // Import express-session for session management


// Import route modules
var indexRouter = require('./routes/index');
var registrationRouter = require('./routes/registration');
var loginRouter = require('./routes/login');
var adminRouter = require('./routes/admin'); // Import the admin dashboard route

// Import MySQL module for database connection
var mysql = require('mysql');

// Create express app
var app = express();

// Database connection setup
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'abcd1234',
  database: 'dbtravel_248'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database!');
});


app.use((req, res, next) => {
  req.socket = connection;
  next();
});


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'your-secret-key', // Change this to a random string
  resave: false,
  saveUninitialized: true
}));


app.use('/', indexRouter);
app.use('/register', registrationRouter);
app.use('/login', loginRouter);
app.use('/admin', adminRouter); // Use the admin dashboard route for the /admin path


app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};


  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
