import mongoose from 'mongoose';

const CollabEditSchema = new mongoose.Schema(
  {
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    delta: { type: Object, required: true },
  },
  { timestamps: true }
);

const CollabEdit = mongoose.model('CollabEdit', CollabEditSchema);
export default CollabEdit;
