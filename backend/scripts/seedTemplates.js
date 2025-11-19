#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import Template from '../src/models/Template.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const TPL_DIR = path.join(ROOT, 'templates');

const filesToSeed = [
  {
    file: path.join(TPL_DIR, 'blog', 'article.md'),
    name: 'Blog – Standard Article',
    slug: 'blog-article',
    type: 'blog',
    description: 'Standard blog article with summary, key takeaways, and sections.',
    tags: ['blog', 'article']
  },
  {
    file: path.join(TPL_DIR, 'blog', 'tutorial.md'),
    name: 'Blog – Technical Tutorial',
    slug: 'blog-tutorial',
    type: 'tutorial',
    description: 'Step-by-step technical tutorial template with setup, steps, and troubleshooting.',
    tags: ['blog', 'tutorial']
  },
  {
    file: path.join(TPL_DIR, 'blog', 'listicle.md'),
    name: 'Blog – Listicle',
    slug: 'blog-listicle',
    type: 'listicle',
    description: 'List-style article with tips and final checklist.',
    tags: ['blog', 'listicle']
  },
  {
    file: path.join(TPL_DIR, 'book', 'chapter.md'),
    name: 'Book – Chapter',
    slug: 'book-chapter',
    type: 'book_chapter',
    description: 'Book-as-series chapter template using Blog + BlogVersion.',
    tags: ['book', 'chapter']
  },
  {
    file: path.join(TPL_DIR, 'book', 'series-index.md'),
    name: 'Book – Series Index',
    slug: 'book-series-index',
    type: 'book_index',
    description: 'Series index page with cover and table of contents.',
    tags: ['book', 'index']
  }
];

async function main() {
  try {
    if (!env.MONGO_URI) {
      console.error('MONGO_URI is not configured in env');
      process.exit(1);
    }
    await connectDB();

    const results = [];

    for (const f of filesToSeed) {
      if (!fs.existsSync(f.file)) {
        console.warn(`Skipping missing file: ${f.file}`);
        continue;
      }
      const body = fs.readFileSync(f.file, 'utf8');
      const payload = {
        name: f.name,
        slug: f.slug,
        type: f.type,
        description: f.description,
        tags: f.tags,
        body,
        isSystem: true,
      };

      const updated = await Template.findOneAndUpdate(
        { slug: f.slug },
        { $set: payload },
        { upsert: true, new: true }
      );
      results.push({ slug: updated.slug, id: String(updated._id) });
    }

    console.log('Seeded templates:', results);
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed templates:', err?.message || err);
    process.exit(1);
  }
}

main();
