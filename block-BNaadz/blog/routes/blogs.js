var express = require('express');
var router = express.Router();
var auth = require('../middlewares/auth');
var Blog = require('../models/Blog');
var Comment = require('../models/Comment');
var User = require('../models/User');

router.get('/', function (req, res, next) {
  Blog.find({}, (err, blogs) => {
    if (err) return next(err);
    res.render('blogs', { blogs });
  });
});

// single article

router.get('/', function (req, res, next) {
  let userId = req.session.userId;
  User.findById(userId, (err, user) => {
    if (err) return next(err);
    Blog.find({})
      .populate('author')
      .exec((err, blogs) => {
        if (err) return next(err);
        res.render('blogs', { blogs, user });
      });
  });
});

//newBlog

router.get('/new', auth.loggedInUser, function (req, res, next) {
  let userId = req.session.userId;
     User.findById(userId, (err, user) => {
       if (err) return next(err);
       Blog.find({})
         .populate('author')
         .exec((err, blogs) => {
           if (err) return next(err);
           res.render('newBlog', { blogs, user });
         });
     });
});

router.post('/', auth.loggedInUser, function (req, res, next) {
  var data = req.body;
  data.author = req.session.userId;
  data.tags = data.tags.trim().split(',');
  Blog.create(data, (err, blog) => {
    if (err) return next(err);
    res.redirect('/blogs');
  });
});

// dashboard

router.get('/dashBoard', function (req, res, next) {
  Blog.find({})
    .populate('author')
    .exec((err, blogs) => {
      if (err) return next(err);
      res.render('dashBoard', { blogs });
    });
});

router.get('/:id', function (req, res, next) {
  let userId = req.session.userId;
  let blogId = req.params.id;

  User.findById(userId, (err, user) => {
    if (err) return next(err);

    // deep populate

    Blog.findById(blogId)
      .populate({
        path: 'comments',
        populate: {
          path: 'writer',
        },
      })
      .populate('author', 'name email')
      .exec((err, blog) => {
        if (err) return next(err);
        var isOwner = false;
        if (blog.author.id === req.session.userId) {
          isOwner = !isOwner;
        }
        res.render('blogDetails', { blog, user, isOwner });
      });
  });
});

router.get('/:id/delete', auth.loggedInUser, function (req, res, next) {
  var id = req.params.id;
  Blog.findByIdAndRemove(id, (err, blog) => {
    if (err) return next(err);
    res.redirect('/blogs');
  });
});

router.get('/:id/edit', auth.loggedInUser, function (req, res, next) {
  var id = req.params.id;
  let userId = req.session.userId;

  User.findById(userId, (err, user) => {
    if (err) return next(err);

    Blog.findById(id, (err, blog) => {
      if (err) return next(err);
      res.render('editBlog', { blog,user });
    });
  });
});

router.post('/:id', auth.loggedInUser, function (req, res, next) {
  var id = req.params.id;
  var data = req.body;
  Blog.findByIdAndUpdate(id, data, (err, updatedBlog) => {
    if (err) return next(err);
    res.redirect('/blogs/' + id);
  });
});

// Routes For Comments
router.post('/:id/comments', function (req, res, next) {
  var id = req.params.id;
  let userId = req.session.userId;

  var data = req.body;
  data.blogId = id;
  data.writer = userId;
  if (userId) {
    Comment.create(data, (err, comment) => {
      if (err) return next(err);
      Blog.findByIdAndUpdate(
        id,
        { $push: { comments: comment._id } },
        (err, updatedBook) => {
          if (err) return next(err);

          res.redirect('/blogs/' + id);
        }
      );
    });
  } else {
     res.redirect('/login');
  }
});

// Routes For Reactions

router.get('/click/:id/likes', function (req, res, next) {
  var id = req.params.id;
  Blog.findByIdAndUpdate(id, { $inc: { likes: +1 } }, (err, updatedBlog) => {
    if (err) return next(err);
    res.redirect('/blogs/' + id);
  });
});

router.get('/click/:id/dislikes', function (req, res, next) {
  var id = req.params.id;
  Blog.findByIdAndUpdate(id, { $inc: { dislikes: +1 } }, (err, updatedBlog) => {
    if (err) return next(err);
    res.redirect('/blogs/' + id);
  });
});

router.get('/click/:id/flames', function (req, res, next) {
  var id = req.params.id;
  Blog.findByIdAndUpdate(id, { $inc: { flames: +1 } }, (err, updatedBlog) => {
    if (err) return next(err);
    res.redirect('/blogs/' + id);
  });
});

router.get('/click/:id/hearts', function (req, res, next) {
  var id = req.params.id;
  Blog.findByIdAndUpdate(id, { $inc: { hearts: +1 } }, (err, updatedBlog) => {
    if (err) return next(err);
    res.redirect('/blogs/' + id);
  });
});

router.get('/click/:id/applauses', function (req, res, next) {
  var id = req.params.id;
  Blog.findByIdAndUpdate(
    id,
    { $inc: { applauses: +1 } },
    (err, updatedBlog) => {
      if (err) return next(err);
      res.redirect('/blogs/' + id);
    }
  );
});

module.exports = router;
