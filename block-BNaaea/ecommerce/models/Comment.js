var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema(
  {
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    likes: { type: Number, default: 0 },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
