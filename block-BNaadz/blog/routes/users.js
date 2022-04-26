var express = require('express');
var router = express.Router();
var User = require('../models/User');
var auth = require('../middlewares/auth');





// register

router.get('/register', (req, res) => {
  var error = req.flash('error')[0];
  res.render('register', { error });
});

// register

router.post('/register', (req, res, next) => {
  User.create(req.body, (err, user) => {
    // console.log(err, user)
    if (err) {
      if (err.code === 11000) {
        req.flash('error', 'This email is already registered');
        return res.redirect('/users/register');
      }
      if (err.name === 'ValidationError') {
        req.flash('error', err.message);
        return res.redirect('/users/register');
      }
      return res.json({ err });
    }
    res.redirect('/users/login');
  });
});

// user login

router.get('/login', (req, res, next) => {
  var error = req.flash('error')[0];
  res.render('login', { error });
});

// login

router.post('/login', (req, res, next) => {
  var { email, password } = req.body;
  if (!email || !password) {
    req.flash('error', 'Email and Password required');
    return res.redirect('/users/login');
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);
    // no user
    if (!user) {
      req.flash('error', 'This email is not registered!');
      return res.redirect('/users/login');
    }
    // compare password

    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);
      if (!result) {
        req.flash('error', 'Incorrect Password!');
        return res.redirect('/users/login');
      }

      // persist logged in user information
      req.session.userId = user._id;
      res.redirect('/blogs');
    });
  });
});

// logout

router.get('/logout', auth.loggedInUser, (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/users/login');
});

module.exports = router;
