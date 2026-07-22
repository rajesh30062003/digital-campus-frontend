# Digital Campus ERP — Standalone Frontend

> **React 18 + TypeScript + Vite + Tailwind CSS Frontend Application**  
> *Independent Frontend Repository for Digital Campus ERP System*

---

## 🌟 Overview

`digital-campus-frontend` is the standalone React user interface for Digital Campus ERP. It provides interactive web portals for **Students**, **Faculty**, **Administrative Staff**, and **Hospital Clinical Interns**.

---

## 📁 Repository Directory Structure

```
digital-campus-frontend/
├── public/                 # Static web assets & icons
├── src/
│   ├── components/         # Reusable UI primitives & AppShell
│   ├── hooks/              # Custom React state hooks (useAuth, useInstitution)
│   ├── lib/                # API service bindings & Axios/Fetch wrappers
│   ├── pages/              # Route view pages (Dashboard, Hospital, Security, etc.)
│   ├── App.tsx             # Main routing component with React.lazy code-splitting
│   ├── index.css           # Tailwind CSS directives
│   └── main.tsx            # Application DOM entry point
├── .env.example            # Sample environment variables
├── .gitignore              # Git ignore rules
├── index.html              # Single Page Application HTML shell
├── package.json            # Node.js dependencies & scripts
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel deployment configuration
└── vite.config.ts          # Vite build & Rollup chunking configuration
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher (or **Bun**)

### 2. Installation
```bash
# Navigate to frontend project directory
cd digital-campus-frontend

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and set your backend API base URL:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Production Build & Testing

```bash
# Typecheck & Build for Production
npm run build

# Preview Production Build locally
npm run preview
```

---

## ☁️ Deployment to Vercel

`digital-campus-frontend` is optimized for zero-configuration deployment to **Vercel**.

### Step-by-Step Vercel Deployment:

1. **Push to GitHub**:
   Create a standalone GitHub repository named `digital-campus-frontend` and push this directory.
   ```bash
   git init
   git add .
   git commit -m "Initial commit of digital-campus-frontend"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/digital-campus-frontend.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Click **Import Project** and select your `digital-campus-frontend` GitHub repository.
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Configure Environment Variables in Vercel**:
   Add the following environment variable under **Settings > Environment Variables**:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com/api`

4. Click **Deploy**. Vercel will build and serve your SPA with global CDN edge routing and automatic HTTPS.
