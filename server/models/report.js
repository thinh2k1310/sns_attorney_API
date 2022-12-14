const Mongoose = require('mongoose');

const { Schema } = Mongoose;

// Report Schema
const ReportSchema = new Schema({
  reportingUser : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedModerator : {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reportedUser : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post : {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
  comment : {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  },
  type : {
    type: String,
    default: "Post",
    enum: ["Comment","Post"]
  },
  problem : {
    type: String,
    default: "Something else",
    enum: ["Nudity", "Violence", "Spam", "Something else"]
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Report', ReportSchema);