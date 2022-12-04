const Mongoose = require('mongoose');

const { Schema } = Mongoose;

// Case Schema
const CaseSchema = new Schema({
  attorney : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post : {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  customer : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status : {
    type: String,
    default: 'SENT_REQUEST',
    enum: ['SENT_REQUEST', 'IN-PROGRESS', 'CANCELLED', 'COMPLETED' ]
  },
  customerStatus : {
    type: String,
    default: 'IN-PROGRESS',
    enum: ['IN-PROGRESS', 'CANCELLED', 'COMPLETED' ]
  },
  attorneyStatus : {
    type: String,
    default: 'IN-PROGRESS',
    enum: ['IN-PROGRESS', 'CANCELLED', 'COMPLETED' ]
  },
  startingTime : {
    type: Date
  },
  endingTime : {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Case', CaseSchema);

