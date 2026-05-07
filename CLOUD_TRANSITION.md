# Cloud Transition Strategy (Supabase + Railway + Vercel)

This document outlines the steps to move the **Thoet Thai Delivery** app from local development to production-ready cloud infrastructure.

## Phase 1: Database & Backend (Supabase + Railway)

### 1. Supabase Setup (Database)
1. **Create Project:** Create a new project on [Supabase](https://supabase.com).
2. **Apply Schema:** Go to the **SQL Editor** and paste the contents of `docs/database-schema.sql`. Run it to create all tables, enums, and triggers.
3. **Get Connection String:** Go to Project Settings -> Database -> Connection String (URI).
   - Use the **Transaction Pooler** (port 6543) if using Serverless, or the direct string if deploying on Railway.
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`
   - *Note:* For our FastAPI backend using `asyncpg`, prefix it with `postgresql+asyncpg://`.

### 2. Railway Setup (FastAPI Backend)
1. **Connect Repo:** Link your GitHub repository to [Railway](https://railway.app).
2. **Environment Variables:** Set the following in Railway:
   - `DATABASE_URL`: Your Supabase async connection string.
   - `REDIS_URL`: Use an [Upstash](https://upstash.com) Redis URL (Free tier).
   - `JWT_SECRET`: A long random string.
   - `JWT_REFRESH_SECRET`: Another long random string.
   - `PROMPTPAY_ID`: Your PromptPay ID (Phone or ID card).
   - `DEBUG`: `false`
   - `CORS_ORIGINS`: `["https://your-app.vercel.app"]`
3. **Deploy:** Railway will automatically detect the `backend/` folder and the `requirements.txt`. Ensure the root directory is set to `backend`.

## Phase 2: Frontend (Vercel)

### 1. Vercel Setup (Next.js)
1. **Connect Repo:** Link your GitHub repository to [Vercel](https://vercel.com).
2. **Environment Variables:** Set the following in Vercel:
   - `NEXT_PUBLIC_API_URL`: Your Railway service URL (e.g., `https://backend-production.up.railway.app`).
3. **Build Settings:**
   - Root Directory: `frontend`
   - Framework Preset: `Next.js`
4. **Deploy:** Vercel will build and deploy the frontend.

## Phase 3: Storage & LINE Integration

### 1. Supabase Storage (Images)
1. **Create Bucket:** Create a public bucket named `uploads`.
2. **Update Backend:** Implement the `misc` endpoint to use the `supabase-py` library to upload images to this bucket.

### 2. LINE LIFF
1. **Create Channel:** Create a LINE Login channel in the [LINE Developers Console](https://developers.line.biz).
2. **Configure LIFF:** Create a LIFF app and point the Endpoint URL to your Vercel URL.
3. **Environment Variables:** Add `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`, and `LINE_CHANNEL_ACCESS_TOKEN` to your Railway backend.
4. **Frontend Update:** Update the login logic in the frontend to use the real LIFF SDK instead of `dev-login`.

## Phase 4: Verification
1. **Seed Production:** (Optional) Run `python seed.py` locally while pointing to the Supabase `DATABASE_URL` to populate the production database with initial data.
2. **Verify Real-Time:** Ensure WebSockets connect correctly to the Railway URL.
3. **Verify Auth:** Ensure httpOnly cookies work across the Railway and Vercel domains (may require setting `domain` and `samesite="none"` in cookies if they are on different apex domains).
