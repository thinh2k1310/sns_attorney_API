const Mongoose = require('mongoose');

const { Schema } = Mongoose;

// User Schema
const UserSchema = new Schema({
  email: {
    type: String,
    required: () => {
      return this.provider !== 'email' ? false : true;
    }
  },
  phoneNumber: {
    type: String
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  password: {
    type: String
  },
  provider: {
    type: String,
    required: true,
    default: 'email'
  },
  googleId: {
    type: String
  },
  facebookId: {
    type: String
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  updated: {type : Date},
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('User', UserSchema);

