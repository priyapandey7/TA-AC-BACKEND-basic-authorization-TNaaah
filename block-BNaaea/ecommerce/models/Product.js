var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    cover: { type: String, required: true },
    size: { type: String, required: true },
    category: [{ type: String }],
    likes: { type: Number, default: 0 },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
