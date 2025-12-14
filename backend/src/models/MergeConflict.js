import mongoose from 'mongoose';

const MergeConflictSchema = new mongoose.Schema(
  {
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
    segmentId: { type: String, required: true, index: true },
    versionA: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      edit: { type: mongoose.Schema.Types.ObjectId, ref: 'CollabEdit' },
      text: { type: String, required: true },
    },
    versionB: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      edit: { type: mongoose.Schema.Types.ObjectId, ref: 'CollabEdit' },
      text: { type: String, required: true },
    },
    mergedText: { type: String },
    rationale: [{ type: String }],
    status: {
      type: String,
      enum: ['pending_ai', 'awaiting_approval', 'resolved', 'rejected'],
      default: 'pending_ai',
      index: true,
    },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

const MergeConflict = mongoose.model('MergeConflict', MergeConflictSchema);
export default MergeConflict;
