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
  category : {
    type: String,
    enum: ['Constitutional', 'Administrative', 'Finance', 'Land', 'Civil', 'Labour', 
    'Marriage and Family', 'Criminal', 'Criminal Procedure', 'Civil Procedure', 'Economic', 'International'] 
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

