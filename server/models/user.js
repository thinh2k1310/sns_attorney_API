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
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  avatar: {
    type: String,
    default: "https://www.pngitem.com/pimgs/m/524-5246388_anonymous-user-hd-png-download.png"
  },
  cover: {
    type: String
  },
  role: {
    type: String,
    default: 'ROLE_USER',
    enum: ['ROLE_USER', 'ROLE_ATTORNEY', 'ROLE_ADMIN', 'ROLE_MODERATOR']
  },
  address: {
    type: String,
  },
  work: {
    type: String,
  },
  degree: [{
    type: String
  }],
  categories : [{
    type: String,
    enum: ['Constitutional', 'Administrative', 'Finance', 'Land', 'Civil', 'Labour', 
    'Marriage and Family', 'Criminal', 'Criminal Procedure', 'Civil Procedure', 'Economic', 'International'] 
  }],
  summary: {
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
  OTP: { type: String },
  OTPExpiredTime: { type: Date },
  verified: {
    type: Boolean,
    required: true,
    default: false
  },
  updated: {type : Date},
  created: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = Mongoose.model('User', UserSchema);

