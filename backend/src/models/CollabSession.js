import mongoose from 'mongoose';

const CollabSessionSchema = new mongoose.Schema(
  {
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CollabSession = mongoose.model('CollabSession', CollabSessionSchema);
export default CollabSession;
