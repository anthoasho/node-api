var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

/* TODO bcrypt goes here */

let userSchema = new mongoose.Schema({
  userType:{
    type: Number,
    default: 0
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  ratings: [{
    _id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    score: {
      type: Number
    },
    review:{
      type: String
    }
  }],
  userDetails: {
    profileImg: {
      type: String
    },
    bio: {
      type: String,
    },
    interests: [String],
    languages: [String],
    education: {
      type: String
    },
    location: {
      type: String
    }
  }
})


userSchema.pre('save', function(next){
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, 10).then(function(hashedPassword) {
      user.password = hashedPassword;
      next();
  }, function(err){
    return next(err);
  });
});

userSchema.methods.comparePassword = function(candidatePassword, next) {
  return bcrypt.compare(candidatePassword, this.password)
};


const User = mongoose.model("User", userSchema);
module.exports = User;
