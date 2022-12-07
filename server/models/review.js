const { Double } = require('mongodb');
const Mongoose = require('mongoose');

const { Schema } = Mongoose;

// Like Schema
const ReviewSchema = new Schema({
  client : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attorney : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cases : {
    type: Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  point : {
    type: Number
  },
  content : {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Review', ReviewSchema);

