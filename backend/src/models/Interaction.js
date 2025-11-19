import mongoose from 'mongoose';

const InteractionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', index: true },
    type: { type: String, enum: ['view', 'like', 'bookmark', 'comment', 'share'], required: true, index: true },
    dwellTimeMs: { type: Number, default: 0 },
    tagsSnapshot: { type: [String], default: [] },
    authorSnapshot: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    device: { type: String, default: '' },
    location: { type: String, default: '' },
    referrer: { type: String, default: '' },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

InteractionSchema.index({ user: 1, blog: 1, type: 1, createdAt: -1 });

const Interaction = mongoose.model('Interaction', InteractionSchema);
export default Interaction;
