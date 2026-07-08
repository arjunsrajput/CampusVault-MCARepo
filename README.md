# MCA Repository

A full-stack web app for MCA students to upload, browse and search past papers, notes and answer scripts — organized by batch, year, semester and subject.

## Tech Stack
- **Frontend**: React + Vite + Zustand + React Router
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Storage**: Cloudinary (PDF files)
- **Auth**: JWT (7-day tokens)

## Setup

### 1. Clone & Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Fill in your MongoDB URI, JWT secret and Cloudinary credentials
```

Get free accounts at:
- MongoDB Atlas: https://mongodb.com/atlas (free 512MB)
- Cloudinary: https://cloudinary.com (free 25GB)

### 3. Run

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

App runs at http://localhost:5173

## Features
- Register/login with any email
- Upload PDF materials (CT1, CT2, FAT, Notes, AnswerScripts)
- Browse + instant search across all materials
- Filter by batch, year, semester, subject, exam type
- Upvote and save materials
- Coverage gaps view (see what's missing)
- Contribution leaderboard
- Admin panel (flag/delete/manage users)
- PDF preview inline

## First Admin
After registering your first account, open MongoDB Atlas, find your user document and change `role` to `"admin"`. All subsequent admins can be set via the Admin panel UI.

## Deployment (Free)
- Backend: Railway.app or Render.com
- Frontend: Vercel.com
- Database: MongoDB Atlas
- Files: Cloudinary

All free tiers are sufficient for a college club.

See [DEPLOYMENT.md](DEPLOYMENT.md) for exact Render and Vercel settings.
