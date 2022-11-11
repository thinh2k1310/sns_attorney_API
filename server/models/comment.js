const Mongoose = require('mongoose');

const { Schema } = Mongoose;

// Comment Schema
const CommentSchema = new Schema({
  userId : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId : {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  content : {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Comment', CommentSchema);

