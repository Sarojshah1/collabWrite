# Writing Templates Aligned to Models

This folder contains authoring templates tailored to your models:
- `src/models/Blog.js`
- `src/models/BlogVersion.js`

Use these templates for blogs, tutorials, listicles, and for organizing books as a series without changing your schema.

## Model Field Mapping

- Blog
  - `title` ← From front matter `title`
  - `contentDelta` ← Convert Markdown body to Quill/Docs delta on save
  - `contentHTML` ← Rendered HTML snapshot from Markdown on save
  - `version` ← Increment on significant saves
  - `lastEditAt` ← Set on save
  - `tags` ← From front matter `tags` (array of strings)
  - `category` ← From front matter `category` (e.g., `book:my-book-slug`)
  - `status` ← From front matter `status` (`draft` | `published`)
  - `author`, `collaborators`, `views`, `likes`, `bookmarks`, `lastUpdatedBy` ← Set in app logic/UI

- BlogVersion
  - `blog` ← Blog._id
  - `version` ← Blog.version at save time
  - `author` ← Current user id
  - `contentDelta` ← Delta snapshot
  - `contentHTML` ← HTML snapshot
  - `summary` ← Short abstract (use AI endpoint to generate if needed)

## AI Endpoints (`src/controllers/aiController.js`)

- POST `/ai/generate-draft` → `{ titleSuggestions, outline, content }`
- POST `/ai/generate-blog` → `{ content }`
- POST `/ai/generate-summary` → `{ summary }`
- POST `/ai/generate-title` → `{ titles }`
- POST `/ai/keywords` → `{ keywords }`
- POST `/ai/generate-outline` → `{ outline }`

## Typical Workflow

1. Start with a template (blog/article, tutorial, listicle, or book/chapter).
2. Optionally call `/ai/generate-draft` with your topic to get outline + content.
3. Edit content, add front matter fields (`title`, `category`, `tags`, `status`, `summary`).
4. On save in your app:
   - Convert body → `contentDelta` and `contentHTML`
   - Set `Blog` fields from front matter
   - Increment `Blog.version` and create a `BlogVersion` record
   - If `summary` missing, call `/ai/generate-summary` and set `BlogVersion.summary`
   - Optionally call `/ai/keywords` and merge into `Blog.tags`

## Book-as-Series Convention (No new schema)

- Treat each chapter as a `Blog` with:
  - `category`: `book:<slug>`
  - `tags`: include `["book", "<slug>", "chapter-XX"]` with zero-padded order numbers
  - `title`: `Book Title — Chapter 03: Chapter Title`
- Create a series index post with `tags` including `index` to list chapters and display cover.
- Use the first image in the index content as the cover by convention.

## Files

- `blog/front-matter.example.md` – Example front matter block and mapping.
- `blog/article.md` – Standard blog article.
- `blog/tutorial.md` – Technical tutorial with steps.
- `blog/listicle.md` – List-style article.
- `book/chapter.md` – Chapter template for book-as-series.
- `book/series-index.md` – Series index page with cover and TOC.

## Notes

- There is no `cover` field in the models. Keep cover info in content or front matter for UI rendering.
- Ensure image assets are licensed, compressed, and have alt text.
