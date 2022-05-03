const User = require('../models/User');
module.exports = {
    isUserLogged : async (req,res,next)=> {
        try {
            if(req.session && req.session.userId){
                return next();
            } else{
                return res.redirect('/users/login');
            }    
        } catch (error) {
            return next(error);
        }
        
    },
    userInfo : async (req,res,next)=> {
        try {
            const userId = req.session && req.session.userId;
            if(userId){
                const user = await User.findById(userId, 'firstName lastName email isAdmin subscription');
                req.user = await user;
                res.locals.user = await user;
                return next();
            } else {
                req.user = await null;
                res.locals.user = await null;
                return next();
            }
        } catch (error) {
            return next(error);
        }
    }

}