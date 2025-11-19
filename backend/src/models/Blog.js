import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    // Deprecated plain text/HTML content (kept for backward compatibility)
    content: { type: String, default: '' },
    // Google Docs/Quill-style rich content delta
    contentDelta: { type: mongoose.Schema.Types.Mixed, default: null },
    // Rendered HTML snapshot for quick rendering/search
    contentHTML: { type: String, default: '' },
    // Version counter for saved document states
    version: { type: Number, default: 0, index: true },
    lastEditAt: { type: Date },
    tags: [{ type: String, index: true }],
    category: { type: String, index: true, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0, index: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Blog = mongoose.model('Blog', BlogSchema);
export default Blog;
