const Mongoose = require('mongoose');

const { Schema } = Mongoose;

// Like Schema
const LikeSchema = new Schema({
  user : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post : {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Like', LikeSchema);

