// Requiring the packages
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var session = require('express-session');
var MongoStore = require('connect-mongo');


require('dotenv').config();

// Requiring the routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');
var commentsRouter = require('./routes/comments');

var auth = require('./middlewares/auth');

// Connecting to MongoDB
mongoose.connect(
  'mongodb://localhost/ecommerce',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (error) => {
    console.log('Connected to database: ', error ? false : true);
  }
);

// Instantiating the application
var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Using Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));

// Creating Session
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: 'mongodb://localhost/ecommerce',
    }),
  })
);


// Connecting To Flash
app.use(flash());

// Using User Information
app.use(auth.userInfo);

// Using The Routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/comments', commentsRouter);

// Catch 404 And Forward To Error Handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
