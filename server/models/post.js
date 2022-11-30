const Mongoose = require('mongoose');

const { Schema } = Mongoose;

// Post Schema
const PostSchema = new Schema({
  user : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String
  },
  mediaUrl: {
    type: String,
  },
  mediaId: {
    type: String,
  },
  isBlock: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    required: true,
    default: 'DISCUSSING',
    enum: ['DISCUSSING', 'REQUESTING']
  },
  updated: {type : Date},
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Post', PostSchema);

