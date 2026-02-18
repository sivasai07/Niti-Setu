import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
  {
    farmerName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    story: {
      type: String,
      required: true,
    },
    scheme: {
      type: String,
      required: true,
    },
    impact: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '/images/farmer-image.png',
    },
    sourceType: {
      type: String,
      enum: ['manual', 'feedback'],
      default: 'manual',
    },
    sourceFeedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Story = mongoose.model('Story', storySchema);

export default Story;
