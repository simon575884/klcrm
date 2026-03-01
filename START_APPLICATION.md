# 🚀 K&L Auto Repair CRM - Quick Start Guide

## ✅ GitHub Repository Successfully Pushed!

Your project is now live at: **https://github.com/simon575884/klcrm**

---

## 📦 What's Included

- Full-stack Auto Repair CRM
- React + Vite frontend
- Node.js + Express backend
- Supabase PostgreSQL database
- Role-based authentication (Owner, Worker, Receptionist)
- Professional dark theme
- Customer, Vehicle, Repair Job management
- Appointments & Staff Attendance tracking
- Invoice generation with PDF export

---

## 🌐 Deploy to Vercel (Next Step)

### Step 1: Go to Vercel
```
https://vercel.com/new
```

### Step 2: Import Repository
1. Click "Import Git Repository"
2. Select: `simon575884/klcrm`
3. Click "Import"

### Step 3: Configure Project
```
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 4: Add Environment Variables
Click "Environment Variables" and add:

```env
SUPABASE_URL=https://qjnyixyvkcdgrofapmfd.supabase.co
SUPABASE_ANON_KEY=your_anon_key_from_env_file
SUPABASE_SERVICE_KEY=your_service_key_from_env_file
JWT_SECRET=your_jwt_secret_from_env_file
DATABASE_TYPE=supabase
```

### Step 5: Deploy Backend Separately
For the backend API, you'll need to deploy it separately:

**Option A: Vercel (Serverless)**
1. Create new project
2. Root Directory: `server`
3. Add same environment variables

**Option B: Railway/Render (Recommended for Node.js)**
1. Go to https://railway.app or https://render.com
2. Import same GitHub repo
3. Set root directory to `server`
4. Add environment variables
5. Deploy

### Step 6: Update Frontend API URL
After backend is deployed, update the frontend to point to your backend URL:
- Edit `client/src/App.jsx`
- Change `http://localhost:5000` to your backend URL

---

## 🏃 Run Locally

### Backend
```bash
npm install
npm start
```
Server runs on: http://localhost:5000

### Frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on: http://localhost:3000

---

## 👥 Default Login Credentials

**Owner Account:**
- Username: `owner`
- Password: `owner123`

**Worker Account:**
- Username: `worker`
- Password: `worker123`

**Receptionist Account:**
- Username: `receptionist`
- Password: `receptionist123`

---

## 📊 Database (Supabase)

Your database is already set up with:
- 9 tables (users, customers, vehicles, repairs, etc.)
- Sample data loaded
- Indexes for performance
- Views for reporting

**Supabase Dashboard:** https://supabase.com/dashboard/project/qjnyixyvkcdgrofapmfd

---

## 🔧 Important Files

- `.env` - Environment variables (NEVER commit this!)
- `.env.example` - Template for environment variables
- `supabase-setup.sql` - Database schema
- `vercel.json` - Vercel configuration
- `README.md` - Project documentation

---

## 📝 Next Steps

1. ✅ GitHub push - DONE!
2. 🚀 Deploy frontend to Vercel
3. 🚀 Deploy backend to Railway/Render
4. 🔗 Connect frontend to backend
5. 🎉 Your CRM is live!

---

## 🆘 Need Help?

Check these files:
- `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
- `SUPABASE_QUICK_START.md` - Database setup guide
- `README.md` - Project overview

---

**Your K&L Auto Repair CRM is ready to deploy! 🎉**
