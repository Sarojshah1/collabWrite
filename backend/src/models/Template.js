import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['blog', 'tutorial', 'listicle', 'book_chapter', 'book_index'], required: true, index: true },
    description: { type: String, default: '' },
    tags: [{ type: String, index: true }],
    // Optional: front matter defaults (not required by current models)
    frontMatter: { type: mongoose.Schema.Types.Mixed, default: null },
    // Raw Markdown body with placeholders like {{title}}, {{summary}}
    body: { type: String, required: true },
    isSystem: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Template = mongoose.model('Template', TemplateSchema);
export default Template;
