var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, match: /@/, unique: true },
    password: { type: String, required: true, minlength: 5 },
    isAdmin: { type: String, default: 'false' },
    myProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

userSchema.pre('save', function (next) {
  // Deciding Admin
  if (this.isAdmin === 'admin') {
    this.isAdmin = true;
  } else if (this.isAdmin === 'user') {
    this.isAdmin = false;
  }

  //   Hashing Password
  if (this.password && this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, hashedPwd) => {
      // if (err) return next(err);
      this.password = hashedPwd;
      return next();
    });
  } else {
    next();
  }
});

userSchema.methods.verifyPassword = function (password, cb) {
  console.log(password, this.password);
  bcrypt.compare(password, this.password, (err, result) => {
    console.log(result, err);
    return cb(err, result);
  });
};

module.exports = mongoose.model('User', userSchema);
