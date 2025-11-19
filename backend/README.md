# CollabWrite Backend
 
 Production-ready Node.js + Express backend for a Medium + Google Docs style app with AI-assisted writing, real-time collaboration, analytics, notifications, and admin features.
 
 ## Tech Stack
 
 - Node.js, Express
 - MongoDB, Mongoose
 - Socket.IO (real-time collab + notifications)
 - JWT Auth (bcrypt, jsonwebtoken)
 - Cloudinary (media uploads)
 - OpenAI API (AI writing assistant)
 - Multer (file uploads)
 - Helmet, CORS, Rate Limiting, Morgan (security & logging)
 
 ## Project Structure
 
 ```
 backend/
   src/
     app.js
     server.js
     config/
       env.js
       db.js
       cloudinary.js
     controllers/
       authController.js
       blogController.js
       aiController.js
       analyticsController.js
       adminController.js
       mediaController.js
     routes/
       index.js
       authRoutes.js
       blogRoutes.js
       aiRoutes.js
       analyticsRoutes.js
       adminRoutes.js
       collabRoutes.js
       mediaRoutes.js
     models/
       User.js
       Blog.js
       BlogVersion.js
       CollabSession.js
       CollabEdit.js
       Interaction.js
       Notification.js
       AdminAuditLog.js
       UserPreference.js
     middlewares/
       authMiddleware.js
       adminMiddleware.js
       errorHandler.js
       validate.js
       validateRequest.js
       avatarUpload.js
     services/
       collaborationService.js
     sockets/
       collaborationSocket.js
       notificationSocket.js
     utils/
       logger.js
       response.js
       render.js
    validations/
      authValidation.js
      blogValidation.js
      adminValidation.js
 ```
 
 ## Getting Started
 
  1. Copy env file
 
  ```
  cp .env.example .env
  ```
 
 2. Fill values in `.env` (MongoDB, JWT secret, Client origin, Cloudinary, OpenAI)
 
  3. Install dependencies
 
  ```
  npm install
  ```
 
  4. Run dev server
 
  ```
  npm run dev
  ```
 
 Server runs on `http://localhost:4000` by default. Health check: `GET /api/health`.
 
 ## Environment Variables
 
 See `.env.example` for full list:
 
 - PORT
 - MONGO_URI
 - JWT_SECRET
 - CLIENT_ORIGIN
 - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 - OPENAI_API_KEY
 - YJS_WS_URL (optional for external Yjs server)
 
 ## Key API Endpoints
 
 - Auth
   - POST `/api/auth/register`
   - POST `/api/auth/login`
   - GET `/api/auth/profile`
   - PUT `/api/auth/profile`
 - Blog
   - POST `/api/blog`
   - GET `/api/blog`
   - GET `/api/blog/:id`
   - PUT `/api/blog/:id`
   - DELETE `/api/blog/:id`
   - POST `/api/blog/upload-image` (Cloudinary upload via Multer)
   - GET `/api/blog/:id/versions`
   - GET `/api/blog/:id/versions/:version`
   - POST `/api/blog/:id/versions/:version/restore`
 - Collaboration
   - POST `/api/collab/start`
   - POST `/api/collab/join`
   - GET `/api/blog/:id/realtime` (Yjs ws discovery)
 - AI Assistant
   - POST `/api/ai/generate-blog`
   - POST `/api/ai/generate-title`
   - POST `/api/ai/generate-summary`
   - POST `/api/ai/keywords`
   - POST `/api/ai/generate-outline`
 - Analytics
   - POST `/api/analytics/record`
   - GET `/api/analytics/summary`
 - Admin
   - GET `/api/admin/users`
   - PATCH `/api/admin/users/:id/suspend`
   - DELETE `/api/admin/users/:id`
   - GET `/api/admin/blogs`
   - DELETE `/api/admin/blogs/:id`
   - PATCH `/api/admin/blogs/:id/approve`
   - GET `/api/admin/analytics`
   - GET `/api/admin/trending`
 - Media
   - POST `/api/media/upload`
 
 All protected endpoints require `Authorization: Bearer <JWT>`.
 
 ## Real-Time Sockets
 
 - Collaboration (`src/sockets/collaborationSocket.js`)
   - joinSession { blogId, userId, cursor }
   - cursorUpdate { blogId, userId, cursor }
   - editContent { blogId, userId, delta }
   - saveDraft { blogId, userId, content }
   - presenceUpdate broadcast
 - Notifications (`src/sockets/notificationSocket.js`)
   - Client emits: `auth` { userId }
   - Server emits: `notification` payloads to `user:<userId>` room
 
 ## Security & Best Practices
 
 - Helmet, CORS configured in `src/app.js`
 - Rate limiting enabled (120 req/min default)
 - Central error handler in `middlewares/errorHandler.js`
 - Input validation via `express-validator` + `zod` utilities
 - Mongo indexes defined via schemas for performance
 
 ## Notes
 
 - AI features require setting `OPENAI_API_KEY`.
 - Cloudinary uploads are memory-streamed with Multer; adjust file size limits as needed.
 - Yjs WebSocket support can be hosted separately; discovery endpoint returns ws URL.
