# SkillWeave AI

SkillWeave AI is an intelligent developer community platform designed to connect software engineers through AI-powered profile analysis and strategic collaboration matching. It features a complete social feed, real-time collaboration requests, and personalized AI learning roadmaps.

## 🚀 Features

- **Authentication**: JWT-based auth with secure HTTP-only refresh cookies.
- **Developer Profiles**: Customizable profiles showcasing skills, education, experience, and direct GitHub API integration.
- **Social Feed**: Post updates, like, comment, and seamlessly follow other developers.
- **AI Profile Analyzer**: Leverages Google's Gemini AI to instantly generate personalized career roadmaps, identify skill gaps, and suggest project recommendations based on your unique profile data.
- **AI Developer Matching**: An intelligent recommendation engine that ranks potential collaborators based on complementary skills and shared project interests, complete with an AI-generated explanation of the synergy.
- **Collaboration Dashboard**: Send, receive, accept, and reject collaboration requests.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, React Router, Axios, Lucide React.
- **Backend**: Node.js, Express.js, Prisma ORM, JWT, bcryptjs.
- **Database**: PostgreSQL.
- **AI Integration**: `@google/genai` (Gemini-3.5-flash).

## 📦 Local Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or Managed Database like Supabase / Neon)
- A Gemini API Key from Google AI Studio

### 2. Backend Setup
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   npm install
   ```
2. Create a `.env` file in the `server` directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/skillweave?schema=public"
   JWT_ACCESS_SECRET="your_access_secret_key"
   JWT_REFRESH_SECRET="your_refresh_secret_key"
   GEMINI_API_KEY="your_actual_gemini_api_key"
   CLIENT_URL="http://localhost:5173"
   ```
3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   npm install
   ```
2. Create a `.env` file in the `client` directory with the following variables:
   ```env
   VITE_API_URL="http://localhost:5000/api"
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 🌍 Production Deployment

### Database (Managed PostgreSQL)
1. Provision a PostgreSQL instance using Supabase, Neon, or Render.
2. Retrieve the connection string.

### Backend (Render)
This project includes a `render.yaml` configuration file for zero-config deployment.
1. Connect your GitHub repository to Render.
2. Select **Blueprint** deployment or create a new Web Service using the `server` root directory.
3. Add the following Environment Variables in the Render Dashboard:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Your production PostgreSQL URL
   - `JWT_ACCESS_SECRET`: A secure random string
   - `JWT_REFRESH_SECRET`: A secure random string
   - `GEMINI_API_KEY`: Your Gemini API key
   - `CLIENT_URL`: The URL of your Vercel frontend (e.g., `https://skillweave.vercel.app`)

### Frontend (Vercel)
This project includes a `vercel.json` file designed to handle React Router SPA rewrites.
1. Import the project into Vercel.
2. Set the **Root Directory** to `client`.
3. Vercel will automatically detect Vite. 
4. Add the following Environment Variable:
   - `VITE_API_URL`: Your production Render backend URL (e.g., `https://skillweave-api.onrender.com/api`)
5. Deploy.

---

## 📜 API Documentation
- A Swagger UI endpoint is available by default at `http://localhost:5000/api-docs` when the backend is running.
- Includes full schema definitions for `/auth`, `/profiles`, `/posts`, `/feed`, `/ai`, and `/matching`.

---

## 🔒 Security & Best Practices
- **Never expose your `.env` files** or commit them to version control.
- Cross-Origin Resource Sharing (CORS) is strictly bound to the `CLIENT_URL` in production.
- Refresh Tokens are secured via `httpOnly`, `Secure`, and `SameSite=None` attributes in production to allow seamless cross-domain authentication between Vercel and Render.
