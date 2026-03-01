# K&L Auto Repair CRM

Professional Auto Repair Customer Relationship Management System with Dark Theme

## 🚀 Features

- **Customer Management** - Add, edit, delete, and search customers
- **Vehicle Tracking** - Manage customer vehicles with detailed information
- **Repair Jobs** - Track repair jobs with status and payment tracking
- **Invoice Generation** - Auto-generate professional invoices with PDF download
- **Appointment Booking** - Schedule and manage customer appointments
- **Staff Management** - Manage staff members and their information
- **Attendance Tracking** - Track staff check-in/check-out and leave management
- **Dashboard Analytics** - Real-time statistics and charts
- **Role-Based Access** - Owner, Worker, and Receptionist roles
- **Dark Theme** - Professional automotive dark theme UI

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Chart.js
- Axios
- Lucide Icons

### Backend
- Node.js
- Express.js
- Supabase (PostgreSQL)
- JWT Authentication
- bcryptjs

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account
- Git installed

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/simon575884/CRM-K-L.git
cd CRM-K-L
```

### 2. Install dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Setup Supabase Database

1. Create a new project on [Supabase](https://supabase.com)
2. Go to SQL Editor in Supabase Dashboard
3. Copy all content from `supabase-setup.sql`
4. Paste and run in Supabase SQL Editor
5. Wait for success message

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Update with your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_DB_HOST=db.your-project-id.supabase.co
SUPABASE_DB_PASSWORD=your-database-password
```

### 5. Run the application

```bash
# Start backend server
npm start

# In another terminal, start frontend
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🔐 Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Owner | owner | admin123 |
| Worker | worker | worker123 |
| Receptionist | receptionist | reception123 |

## 🚀 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: client/dist

5. Add Environment Variables in Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `SUPABASE_DB_HOST`
   - `SUPABASE_DB_PASSWORD`
   - `JWT_SECRET`
   - `DATABASE_TYPE=supabase`

6. Click "Deploy"

### 3. Configure API Routes

After deployment, update your frontend API calls to use Vercel URL:
- Production API: `https://your-app.vercel.app/api`

## 📊 Database Schema

The application uses 9 main tables:
- `users` - Authentication
- `customers` - Customer information
- `vehicles` - Vehicle details
- `repairs` - Repair job tracking
- `invoices` - Invoice records
- `appointments` - Appointment bookings
- `staff` - Staff members
- `attendance` - Attendance tracking
- `notifications` - Future notification system

## 🎨 Theme Colors

- Background: #0F172A
- Cards: #1E293B
- Primary (Red): #E53935
- Success (Green): #10B981
- Warning (Orange): #F59E0B
- Info (Blue): #3B82F6

## 📝 Project Structure

```
CRM-K-L/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
├── server/                # Backend Express app
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── supabaseClient.js # Supabase connection
│   └── index.js          # Server entry point
├── supabase-setup.sql    # Database setup script
├── .env.example          # Environment template
├── vercel.json           # Vercel configuration
└── package.json          # Backend dependencies
```

## 🔒 Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Environment variables for sensitive data
- Row Level Security ready (optional in Supabase)

## 📞 Support

For issues or questions:
- Email: klmobileexp@yahoo.com
- Phone: 803-477-1467

## 📄 License

This project is private and proprietary to K&L 24 Hour Mobile Tire & Roadside Service.

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for automotive repair businesses
- Optimized for performance and user experience

---

**Made with ❤️ for K&L Auto Repair**
