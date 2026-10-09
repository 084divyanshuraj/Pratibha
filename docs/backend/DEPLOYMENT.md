# Smart Campus Analytics — Backend Production Deployment Guide

## 1. Overview
The backend is a Node.js (Express) microservice deployed on **Render** (Web Service). It persists state to **MongoDB Atlas**, interfaces with the Python FastAPI ML microservice, and services the React (Vite) frontend deployed on **Vercel**.

---

## 2. Environment Variables Checklist

| Variable | Required in Prod | Description | Example / Default |
|---|---|---|---|
| `NODE_ENV` | Yes | Runtime environment | `production` |
| `PORT` | Yes | HTTP listening port (Render sets automatically) | `5000` |
| `MONGODB_URI` | Yes | Secure MongoDB Atlas connection URI with auth | `mongodb+srv://user:pass@cluster.mongodb.net/smart_campus_prod?retryWrites=true&w=majority` |
| `JWT_SECRET` | Yes | Cryptographically secure random secret (min 32 chars) | Generated 64-char hex string |
| `JWT_EXPIRES_IN` | No | JWT lifespan token duration | `7d` |
| `FRONTEND_ORIGIN` | Yes | Comma-separated list of allowed frontend origins (CORS) | `https://pratibha-app.vercel.app,http://localhost:5173` |
| `ML_SERVICE_URL` | Yes | Deployed URL of Python FastAPI ML service | `https://smart-campus-ml.onrender.com` |
| `ML_SERVICE_TOKEN` | Optional | Shared bearer token for service-to-service auth | `sec_srv_ml_9f81a7...` |
| `ML_TIMEOUT_MS` | No | Milliseconds to wait before failing ML inference | `5000` |
| `LOG_LEVEL` | No | Morgan logging level | `info` |
| `COPILOT_ENABLED` | No | Enable AI Copilot query dispatcher | `false` (default safe) |
| `COPILOT_PROVIDER` | No | Provider for Copilot LLM (if enabled) | `none` |

---

## 3. Render Deployment Setup

1. **Create Web Service:**
   - Link repository: `https://github.com/sarra/Pratibha` (or connected repo).
   - Root Directory: `backend`
   - Runtime: `Node` (Node 20+)
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/health/live` (ensures zero-downtime rolling deploys).

2. **Atlas Network Whitelist:**
   - On MongoDB Atlas -> **Network Access**:
     - Either whitelist Render's static outbound IPs (if on paid plan) or configure `0.0.0.0/0` with strong database username and password credentials.

3. **Database Seeding (Staging/Demo):**
   - For demo deployments requiring initial synthetic students and catalog entries:
     ```bash
     npm run seed -- --force-prod-seed
     ```
   - Seed script creates synthetic records across all 7 categories and default intervention programs.

---

## 4. Frontend (Vercel) Integration

1. On Vercel, set frontend environment variable:
   ```env
   VITE_API_BASE_URL=https://smart-campus-backend.onrender.com/api/v1
   ```
2. On Render, ensure `FRONTEND_ORIGIN` matches the exact Vercel deployment URL (e.g. `https://pratibha.vercel.app`).

---

## 5. Verification Probes & Smoke Test

1. **Liveness Probe:**
   ```bash
   curl -I https://smart-campus-backend.onrender.com/health/live
   # HTTP/1.1 200 OK
   ```

2. **Readiness Probe (Verifies MongoDB Connectivity):**
   ```bash
   curl -I https://smart-campus-backend.onrender.com/health/ready
   # HTTP/1.1 200 OK
   ```

3. **Automated Smoke Test Vertical Slice:**
   ```bash
   npm run smoke
   ```
