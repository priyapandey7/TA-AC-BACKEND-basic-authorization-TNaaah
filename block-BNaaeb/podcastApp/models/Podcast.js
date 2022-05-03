const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const podcastSchema = new Schema({
    title : {
        type: String,
        required: true
    },
    description : {
        type : String,
        required : true
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    image : {
        type : String
    },
    audioTrack : {
        type : String
    },
    isVerified : {
        type : Boolean,
        default : false
    },
    podcast_subscription : {
        type : String,
        default : 'free'
    }
});




module.exports = mongoose.model('Podcast', podcastSchema);
