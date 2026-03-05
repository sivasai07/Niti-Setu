import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['scheme', 'feedback', 'profile', 'login', 'other'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'in-progress'],
      default: 'completed',
    },
    // Additional data for eligibility checks
    inputData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    outputData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const History = mongoose.model('History', historySchema);

export default History;
