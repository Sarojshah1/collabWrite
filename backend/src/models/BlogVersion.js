import mongoose from 'mongoose';

const BlogVersionSchema = new mongoose.Schema(
  {
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
    version: { type: Number, required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentDelta: { type: mongoose.Schema.Types.Mixed, default: null },
    contentHTML: { type: String, default: '' },
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

BlogVersionSchema.index({ blog: 1, version: -1 }, { unique: true });

const BlogVersion = mongoose.model('BlogVersion', BlogVersionSchema);
export default BlogVersion;
