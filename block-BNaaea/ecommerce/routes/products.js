var express = require('express');
var router = express.Router();

const User = require('../models/User');
const Product = require('../models/Product');
const Comment = require('../models/Comment');

var multer = require('multer');
var path = require('path');

var auth = require('../middlewares/auth');
const { render } = require('../app');

// Using Multer

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../', 'public/', 'uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Routes For Products
router.get('/add', auth.loggedInUser, (req, res, next) => {
  res.render('addProduct');
});

router.post(
  '/',
  upload.single('cover'),
  auth.loggedInUser,
  (req, res, next) => {
    var data = req.body;
    data.owner = req.user._id;
    data.cover = req.file.filename;
    data.category = data.category.trim().split(',');
    Product.create(data, (err) => {
      if (err) return next(err);
      res.redirect('/users/products');
    });
  }
);

router.get('/filter/', (req, res, next) => {
  const { category, size } = req.query;
  let arr = [];
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
  if (category) {
    Product.find({}, (err, products) => {
      if (err) return next(err);
      for (let i = 0; i < products.length; i++) {
        if (products[i].category.includes(category)) {
          arr.push(products[i]);
        }
      }
      res.render('products', {
        products: arr,
        allCategories,
        allSizes,
      });
    });
  } else {
    Product.find({}, (err, products) => {
      if (err) return next(err);
      for (let i = 0; i < products.length; i++) {
        if (products[i].size === size) {
          arr.push(products[i]);
        }
      }
      res.render('products', {
        products: arr,
        allCategories,
        allSizes,
      });
    });
  }
});

router.get('/details/:id', (req, res, next) => {
  var id = req.params.id;
  Product.findById(id)
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
      },
    })
    .exec((err, product) => {
      if (err) return next(err);
      res.render('productDetails', { product });
    });
});

router.get('/delete/:id', auth.loggedInUser, (req, res, next) => {
  var id = req.params.id;
  Product.findByIdAndRemove(id, (err, product) => {
    if (err) return next(err);
    res.redirect('/users/products');
  });
});

router.get('/edit/:id', auth.loggedInUser, (req, res, next) => {
  var id = req.params.id;
  Product.findById(id, (err, product) => {
    if (err) return next(err);
    res.render('editProduct', { product });
  });
});

router.post(
  '/update/:id',
  auth.loggedInUser,
  upload.single('cover'),
  (req, res, next) => {
    var id = req.params.id;
    var data = req.body;
    if (req.file) {
      data.cover = req.file.filename;
    }
    data.category = data.category.trim().split(',');
    Product.findByIdAndUpdate(id, data, { new: true }, (err, product) => {
      if (err) return next(err);
      res.redirect('/products/details/' + id);
    });
  }
);

// Likes
router.get('/likes/:id', auth.loggedInUser, (req, res, next) => {
  var id = req.params.id;
  Product.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    { new: true },
    (err, product) => {
      if (err) return next(err);
      res.redirect('/products/details/' + id);
    }
  );
});

// Comments

router.post('/comments/:id', auth.loggedInUser, (req, res, next) => {
  var productId = req.params.id;
  var data = req.body;
  data.author = req.user._id;
  data.productId = productId;
  Comment.create(data, (err, comment) => {
    if (err) return next(err);
    Product.findByIdAndUpdate(
      productId,
      { $push: { comments: comment._id } },
      (err, product) => {
        if (err) return next(err);
        console.log('Heyy');
        res.redirect('/products/details/' + comment.productId);
      }
    );
  });
});

// Adding to cart
router.get('/addtocart/:id', auth.loggedInUser, (req, res, next) => {
  var productId = req.params.id;
  var userId = req.user._id;
  User.findByIdAndUpdate(
    userId,
    { $push: { cart: productId } },
    (err, product) => {
      if (err) return next(err);
      res.redirect('/users/products');
    }
  );
});

// My Cart
router.get('/mycart', auth.loggedInUser, (req, res, next) => {
  var userId = req.user._id;
  User.findById(userId)
    .populate('cart')
    .exec((err, user) => {
      if (err) return next(err);
      res.render('myCart', { user });
    });
});

// Remove from cart
router.get('/remove/:id', auth.loggedInUser, (req, res, next) => {
  var productId = req.params.id;
  var userId = req.user._id;
  User.findByIdAndUpdate(
    userId,
    { $pull: { cart: productId } },
    (err, product) => {
      if (err) return next(err);
      console.log('Remove');
      res.redirect('/products/mycart');
    }
  );
});

module.exports = router;
