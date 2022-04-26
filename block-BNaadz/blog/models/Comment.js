var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema(
  {
    content: { type: String, required: true },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Blog',
    },
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, 
      ref: 'User',
    },
  },

  { timestamps: true }
);

var Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
