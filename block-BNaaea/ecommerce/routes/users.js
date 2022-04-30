var express = require('express');
var router = express.Router();

var User = require('../models/User');
var Product = require('../models/Product');

var auth = require('../middlewares/auth');

// SignUp
router.get('/signup', (req, res, next) => {
  var error = req.flash('error')[0];
  res.render('signup', { error });
});

router.post('/signup', (req, res, next) => {
  var data = req.body;
  User.create(data, (err, user) => {
    if (err) {
      if (err.code === 11000) {
        req.flash('error', 'This email is already registered...');
        return res.redirect('/users/signup');
      }
      if (err.name === 'ValidationError') {
        req.flash('error', 'Enter a valid and strong password..');
        return res.redirect('/users/signup');
      }
    } else {
      return res.redirect('/users/signin');
    }
  });
});

// Products
router.get('/products', (req, res, next) => {
  var allCategories = [];
  var allSizes = [];
  Product.distinct('category', (err, elem) => {
    if (err) return next(err);
    allCategories.push(elem);
  });
  Product.distinct('size', (err, elem) => {
    if (err) return next(err);
    allSizes.push(elem);
  });
  Product.find({}, (err, products) => {
    if (err) return next(err);
    res.render('products', { products, allCategories, allSizes });
  });
});

// Admin DashBoard

router.get('/adminDashboard', auth.loggedInUser, (req, res, next) => {
  var productArr = [];
  Product.find({}, (err, products) => {
    if (err) return next(err);
    products.forEach((product) => {
      console.log(String(product.owner), req.user.id);
      if (String(product.owner) === req.user.id) {
        productArr.push(product);
      }
    });

    res.render('adminDashboard', { products: productArr });
  });
});

// SignIn
router.get('/signin', (req, res, next) => {
  var error = req.flash('error')[0];
  res.render('signin', { error });
});

router.post('/signin', (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash('error', 'Email or Password is missing...');
    return res.redirect('/users/signin');
  }

  User.findOne({ email: email }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      req.flash('error', 'Email is not registered...');
      return res.redirect('/users/signin');
    }

    user.verifyPassword(password, (err, result) => {
      if (!result) {
        req.flash('error', 'Password is wrong...');
        return res.redirect('/users/signin');
      }
      //  Persist Logged In User
      req.session.userId = user.id;
      res.redirect('/users/products');
    });
  });
});

// Logout
router.get('/logout', auth.loggedInUser, (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect-sid');
  res.redirect('/users/signin');
});

module.exports = router;
