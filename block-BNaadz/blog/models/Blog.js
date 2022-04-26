var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, required: true, ref:'User' },
    tags: [String],
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    flames: { type: Number, default: 0 },
    applauses: { type: Number, default: 0 },
    hearts: { type: Number, default: 0 },
    comments: [
      { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Comment' },
    ],
  },
  { timestamps: true }
);

var Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
