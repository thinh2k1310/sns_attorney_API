const Mongoose = require('mongoose');

const { Schema } = Mongoose;

// Friend Request Schema
const FriendRequestSchema = new Schema({
  requestingUser : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedUser : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status : {
    type: String,
    default: 'SENT_REQUEST',
    enum: ['SENT_REQUEST', 'FRIEND', ]
  },
  beFriendTime : {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('FriendRequest', FriendRequestSchema);

