# Deployment

This project is a two-service app:

- `server`: Node.js/Express API
- `client`: React/Vite static frontend

Recommended free deployment:

- Backend: Render Web Service
- Frontend: Vercel
- Database: MongoDB Atlas
- PDF storage: Cloudinary

## 1. Prepare MongoDB Atlas

Create an Atlas cluster and database user, then copy the connection string.

For Render/Railway style dynamic outbound IPs, add `0.0.0.0/0` in Atlas Network Access unless you have a fixed egress IP available.

Use this connection string as `MONGO_URI`.

## 2. Prepare Cloudinary

Create a Cloudinary account and copy:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## 3. Deploy Backend On Render

Create a new Render Web Service from this repo.

Use these settings:

- Root Directory: `server`
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Set environment variables:

```env
PORT=10000
MONGO_URI=your-atlas-connection-string
JWT_SECRET=use-a-long-random-secret
CLIENT_URL=https://your-vercel-app.vercel.app
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
BREVO_API_KEY=your-brevo-api-key
MAIL_FROM=Student <mcarepo@example.com>
```

After deploy, test:

```bash
curl https://your-render-service.onrender.com/api/health
```

## 4. Seed Subjects

After the backend is deployed and connected to Atlas, run this once from Render Shell:

```bash
npm run seed:subjects
```

## 5. Deploy Frontend On Vercel

Create a new Vercel project from this repo.

Use these settings:

- Root Directory: `client`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Set environment variables:

```env
VITE_API_URL=https://your-render-service.onrender.com/api
```

Deploy the frontend.

## 6. Final Backend Update

After Vercel gives you the final frontend URL, update the Render backend variable:

```env
CLIENT_URL=https://your-vercel-app.vercel.app
```

Redeploy the backend so CORS allows the production frontend.

## 7. First Admin

Register the first user from the frontend. In MongoDB Atlas, update that user's document:

```json
{
  "role": "admin"
}
```

Then admin management can happen from the app UI.
