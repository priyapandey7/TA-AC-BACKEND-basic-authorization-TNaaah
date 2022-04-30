var express = require('express');
var router = express.Router();

const Product = require('../models/Product');
const Comment = require('../models/Comment');

var auth = require('../middlewares/auth');

router.get('/edit/:id', auth.loggedInUser, function (req, res, next) {
  var commentId = req.params.id;
  Comment.findById(commentId, (err, comment) => {
    if (err) return next(err);
    res.render('editComment', { comment });
  });
});

router.post('/update/:id', auth.loggedInUser, function (req, res, next) {
  var commentId = req.params.id;
  var data = req.body;
  Comment.findByIdAndUpdate(commentId, data, (err, comment) => {
    if (err) return next(err);
    res.redirect('/products/details/' + comment.productId);
  });
});

router.get('/delete/:id', auth.loggedInUser, function (req, res, next) {
  var commentId = req.params.id;
  Comment.findByIdAndRemove(commentId, (err, comment) => {
    if (err) return next(err);
    Product.findByIdAndUpdate(
      comment.productId,
      { $pull: { comments: commentId } },
      (err, product) => {
        if (err) return next(err);
        res.redirect('/products/details/' + comment.productId);
      }
    );
  });
});

module.exports = router;
