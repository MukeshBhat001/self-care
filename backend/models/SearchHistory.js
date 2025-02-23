import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: [String],
  analysis: {
    analysis: {
      conditions: [String],
      recommendations: [String],
      urgency: String
    },
    rawResponse: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('SearchHistory', searchHistorySchema);