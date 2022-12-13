const Mongoose = require('mongoose');

const { Schema } = Mongoose;

// CaseComment Schema
const CaseCommentSchema = new Schema({
  userId : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caseId : {
    type: Schema.Types.ObjectId,
    ref: 'Case',
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

module.exports = Mongoose.model('CaseComment', CaseCommentSchema);

