import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const NODE_ENV = process.env.NODE_ENV || 'development';

const candidates = [
  path.join(cwd, '.env'),
  path.join(cwd, '.env.local'),
  path.join(cwd, `.env.${NODE_ENV}`),
  path.join(cwd, `.env.local.${NODE_ENV}`),
];

for (const file of candidates) {
  if (fs.existsSync(file)) {
    dotenv.config({ path: file, override: true });
  }
}

export const env = {
  NODE_ENV,
  PORT: parseInt(process.env.PORT || '4000', 10),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/collabwrite',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  AI_PROVIDER: (process.env.AI_PROVIDER || 'openai').toLowerCase(),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  // If set, the realtime endpoint will return this URL as the Yjs WebSocket base
  // Example: ws://localhost:1234 (the room will be appended by the client)
  YJS_WS_URL: process.env.YJS_WS_URL || '',
};
