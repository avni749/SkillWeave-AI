# SkillWeave AI Backend

The SkillWeave AI Backend is a robust, modular Node.js REST API providing core services for a developer collaboration and matching platform. 

## Features
- **User Authentication:** Secure JWT-based authentication.
- **Developer Profiles:** Manage skills, roles, and portfolios.
- **GitHub Integration:** Connect and showcase GitHub repositories.
- **Social Feed & Interactions:** Posts, comments, and likes.
- **AI Profile Analyzer:** Powered by Gemini AI to review skill gaps and suggest learning roadmaps.
- **AI Developer Matching:** Uses semantic scoring to match developers for collaboration based on complementary skills and shared interests.
- **Swagger Documentation:** Auto-generated API documentation.

## Tech Stack
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** PostgreSQL (via NeonDB)
- **ORM:** Prisma
- **AI Integration:** Google Gemini (`@google/genai`)
- **Testing:** Jest & Supertest

## Prerequisites
- Node.js (v18+)
- PostgreSQL Database

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the `/server` directory and add the following keys:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@host/db"
   NODE_ENV=development

   JWT_SECRET="YOUR_RANDOM_ACCESS_SECRET"
   JWT_EXPIRES_IN="15m"
   JWT_REFRESH_SECRET="YOUR_RANDOM_REFRESH_SECRET"
   JWT_REFRESH_EXPIRES_IN="7d"

   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   ```

3. **Database Setup**
   Run Prisma migrations to initialize the database schema:
   ```bash
   npx prisma db push
   # Or npx prisma migrate dev
   ```

4. **Start the Server**
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

5. **API Documentation**
   When the server is running, visit:
   `http://localhost:5000/api-docs` to interact with the API endpoints via Swagger UI.

## Testing
Run the automated test suite using:
```bash
npm test
```
(Note: You may need `--experimental-vm-modules` for Jest with ES Modules)

## Security
- All sensitive routes are protected by the `protect` JWT middleware.
- Global rate limiting is applied via `express-rate-limit` (100 requests / 15 minutes).
- Passwords are encrypted with bcrypt and never exposed in API payloads.
- Prisma ORM prevents SQL injection by default.
