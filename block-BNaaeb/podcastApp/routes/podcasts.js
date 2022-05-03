const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Podcast = require('../models/Podcast');
const multer = require('multer');
const path = require('path');
const { VariantAlsoNegotiates } = require('http-errors');
console.log(path.join(__dirname,'..', 'public','uploads'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,'..', 'public','uploads/'));
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + "-" +file.originalname);
    }
})

const upload = multer({ storage: storage });


router.get('/', async (req,res,next)=> {
    try {
        if(req.user){
            if(req.user.isAdmin){
                var podcasts = await Podcast.find({});                
            } else {
                if(req.user.subscription === 'vip'){
                    var podcasts = await Podcast.find({isVerified : true, podcast_subscription: {$in : ["free", "vip"]} });
                } else if(req.user.subscription === 'premi  um'){
                    var podcasts = await Podcast.find({isVerified : true});
                } else {
                    var podcasts = await Podcast.find({isVerified : true, podcast_subscription: "free"});
                }
            }
            res.render('allPodcasts', {podcasts});
        }else {
            res.redirect('/users/login');
        }
        
    } catch (error) {
        return next(error);
    }    
})
router.get('/new', auth.isUserLogged, async (req,res,next)=> {
    try {
        res.render('createPodcastForm')
    } catch (error) {
        return next(error);
    }
});

router.get('/pending', auth.isUserLogged, async (req,res,next)=> {
    try {
        if(req.user.isAdmin){
            var podcasts = await Podcast.find({isVerified : false});
            res.render('pendingPodcasts', {podcasts});
        }     
    } catch (error) {
        next(error);
    }
    
});


router.get('/:id', async(req,res,next)=> {
    const id = req.params.id;
    try {
        const podcast = await Podcast.findById(id).populate('author');
        console.log(podcast);
        res.render('singlePodcast', {podcast});
    } catch (error) {
        return next(error);
    }
})


router.use(auth.isUserLogged);


router.post('/',upload.fields([{name: "image"},{name : "audioTrack"}]), async (req,res,next)=> {
    console.log(req.body, "podcast", req.user);
    req.body.author = req.user.id;
    req.body.image = req.files.image[0].filename;
    req.body.audioTrack = req.files.audioTrack[0].filename;
    try {
        if(req.user.isAdmin){
            req.body.isVerified = true; 
        }
        const podcast = await Podcast.create(req.body);
        res.redirect('/podcasts');
    } catch (error) {
         next(error);
    }
});

router.get('/:id/edit', async (req,res,next)=> {
    const id = req.params.id;
    try {
        const podcast = await Podcast.findById(id).populate('author');
        if(podcast.author.isAdmin || req.user.id === podcast.author.id ){
            res.render('editPodcastForm', {podcast});
        }
        else {
            res.redirect('/podcasts/'+ id);
        }
    } catch (error) {
        next(error);
    }
})

router.post('/:id', async (req,res,next)=> {
    const id = req.params.id;
    try {
            req.body.image = req.files.image[0].filename;
            req.body.audioTrack = req.files.audioTrack[o].filename;
            const podcast = await Podcast.findByIdAndUpdate(id,req.body);
            res.redirect('/podcasts/'+ id);
        
    } catch (error) {
        next(error);
    }
})

router.get('/:id/delete', async (req,res,next)=> {
    const id = req.params.id;
    try {
        const podcast = await Podcast.findById(id).populate('author');
        if(podcast.author.isAdmin || req.user.id === podcast.author.id){
            const podcast = await Podcast.findByIdAndDelete(id);
            res.redirect('/podcasts');
        } else{
            res.redirect('/podcasts'+id);
        }
    } catch (error) {
        next(error);
    }
});

router.get('/:id/pending', async (req,res,next)=> {
    const id = req.params.id;
    try {
        const podcast = await Podcast.findById(id).populate('author');
        res.render('pendingpodcast', {podcast});
    } catch (error) {
        next(error);
    }
});

router.get('/:id/verifyPending', async (req,res,next)=> {
    const id = req.params.id;
    try {
        const podcast = await Podcast.findByIdAndUpdate(id,{isVerified : true});
        res.redirect('/podcasts');
    } catch (error) {
        next(error);
    }
})









module.exports = router;