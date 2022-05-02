const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var bcrypt = require('bcrypt');


const userSchema = new Schema({
    firstName : {
        type : String,
        required: true
    },
    lastName : {
        type : String,
        required : true,
    },
    email : {
        type: String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required: true
    },
    isAdmin : {
        type : Boolean,
        default : false   
    },
    subscription : {
        type : String,
        default : 'free'
    }

});

userSchema.pre('save', async function(next){
    try {
        const adminEmail = ['admin1@gmail.com','admin2@gmail.com','admin3@gmail.com'];
        if(adminEmail.includes(this.email)){
            this.isAdmin = true;
        }
        if(this.password && this.isModified('password')){
            this.password = await bcrypt.hash(this.password,10)
            return next();
        
        }
        return next();
    } catch (error) {
        return next(error);   
    }
});

userSchema.methods.verifyPassword = async function(password){
    try {
        const verifyPassword = await bcrypt.compare(password, this.password);
        return verifyPassword;
    } catch (error) {
        return error;
    }
}

const User = mongoose.model('User', userSchema);
module.exports = User;
