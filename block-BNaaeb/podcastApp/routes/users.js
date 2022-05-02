var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* GET users listing. */
router.get('/register', async (req,res,next)=> {
  try {
    const info = req.flash('info')[0];
    res.render('registerPage',{info});
  } catch (error) {
    return next(error);
  }
});

router.post('/register', async (req,res,next)=> {
  try {
    console.log(req.body);
    const user = await User.create(req.body);
    res.redirect('/users/login');
  } catch (error) {
    return next(error);
  }
});

router.get('/login', async (req,res,next)=> {
  try {
    const info = req.flash('info')[0];
    res.render('loginPage', {info});
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req,res,next)=> {
  try {
    const {email,password} = req.body;
    if(!email || !password){
      req.flash('info', 'Email and Password required!')
      return res.redirect('/users/login');
    }
    const user = await User.findOne({email});
    if(!user){
      req.flash('info', 'User is not registered!');
      return res.redirect('/users/register');
    }
    const verifyPassword = await user.verifyPassword(password);
    if(!verifyPassword){
      req.flash('info', 'Password is wrong!')
      return res.redirect('/users/login');
    }
    req.session.userId = user.id;
    res.redirect('/podcasts')


  } catch (error) {
    return next(error);
  }
});

router.get('/logout', async(req,res,next)=> {
  try {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.redirect('/podcasts');
  } catch (error) {
    return next(error);
  }
})

module.exports = router;
