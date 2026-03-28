# Planavi Project Setup - Quick Start Guide

## ✅ What's Been Built

Your Planavi family visit scheduling system is now ready with all core features:

### Pages Created
- **Home** (`/`) - Beautiful landing page with gradient design
- **Public Visits View** (`/visits`) - Display all residents and their scheduled visits
- **Admin Login** (`/admin`) - Password-protected access page
- **Admin Dashboard** (`/admin/dashboard`) - Full CRUD management interface

### Features Implemented
✅ Firebase Realtime Database integration
✅ Real-time data synchronization with hooks
✅ Resident management (add, view residents)
✅ Visit scheduling (add, edit, delete visits)
✅ Password-protected admin access
✅ Responsive blue-green gradient design
✅ Fully typed with TypeScript
✅ Session-based admin authentication

### Project Structure
```
src/
├── app/               # Next.js pages and layouts
├── components/        # Reusable React components
├── hooks/            # Custom React hooks (Firebase integration)
├── lib/              # Firebase config and database operations
├── types/            # TypeScript types and interfaces
└── utils/            # Helper utilities (authentication)
```

## 🚀 Next Steps (Required)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Create a new project named "Planavi"
3. Choose your region
4. Enable Google Analytics (optional)

### 3. Set Up Realtime Database
1. In Firebase Console, go to **Build → Realtime Database**
2. Click **Create Database**
3. Choose your preferred region
4. Start in **Test Mode** (for development)
5. Copy your **Database URL** (looks like: `https://your-project.firebaseio.com`)

### 4. Get Firebase Credentials
1. Go to **Project Settings** (⚙️ icon)
2. Click **Service Accounts** tab
3. Click **Generate New Private Key** button
4. Copy your credentials (you'll use them below)

Or find your public config:
1. In Project Settings, scroll to **Web API Key** section
2. Copy all values

### 5. Configure Environment Variables
1. Create `.env.local` file in project root (copy from `.env.local.example`)
2. Fill in your Firebase credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   NEXT_PUBLIC_ADMIN_PASSWORD=planavi_admin_2026  # Change this!
   ```

### 6. Initialize Database Structure
1. Go to your Firebase Realtime Database
2. Click the **⋮** menu and select **Import JSON**
3. Use this structure:
```json
{
  "residents": {
    "resident_1": {
      "id": "resident_1",
      "name": "Margaret Smith",
      "roomNumber": "201"
    }
  },
  "visits": {}
}
```

## 🏃 Running the App

### Development Mode
```bash
npm run dev
```
Opens at http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

## 📍 Navigation Map

### Public Access
- **Home**: `/` - Landing page with features overview
- **Visits**: `/visits` - Browse all residents and their scheduled visits

### Admin Access (Password Required)
- **Admin Login**: `/admin` - Enter password here
- **Dashboard**: `/admin/dashboard` - Manage residents and visits
  - Add/Edit/Delete visits
  - Add/Delete residents
  - View all scheduled visits

## 🔐 Security Checklist

### Before Going Live
- [ ] Change admin password from default
- [ ] Review Firebase Security Rules (currently in Test Mode)
- [ ] Set up proper authentication (Firebase Auth or NextAuth.js)
- [ ] Use environment variables for all sensitive data
- [ ] Set up HTTPS/SSL certificate
- [ ] Enable Firebase Database backups
- [ ] Review Privacy Policy and Terms of Service
- [ ] Test on multiple browsers and devices

### Firebase Security Rules for Production
Update these in Firebase Console → Database → Rules:
```json
{
  "rules": {
    "residents": {
      ".read": true,
      ".write": "auth != null && auth.uid != null"
    },
    "visits": {
      ".read": true,
      ".write": "auth != null && auth.uid != null"
    }
  }
}
```

## 📱 Features You Can Start With

### Add Your First Resident
1. Go to `/admin`
2. Enter password (default: `planavi_admin_2026`)
3. Click "Manage Residents" tab
4. Fill in name and room number
5. Click "Add Resident"

### Schedule Your First Visit
1. In Admin Dashboard, stay on "Manage Visits" tab
2. Select a resident
3. Enter visitor name, date, and time
4. Click "Add Visit"

### View Public Schedule
1. Go to `/visits`
2. See all residents listed as cards
3. Click on a resident card to expand and see their visits

## 🐛 Troubleshooting

### "Firebase initialization failed"
- Check all environment variables are set correctly
- Restart dev server after adding `.env.local`
- Verify database URL format

### "Admin login not working"
- Password is case-sensitive
- Check `NEXT_PUBLIC_ADMIN_PASSWORD` in `.env.local`
- Clear browser cache/session storage

### "No data showing in visits page"
- Verify data was imported into Firebase Realtime Database
- Check data is under `/residents` and `/visits` paths
- Check browser console for Firebase errors

### "Changes not appearing in real-time"
- Refresh the page
- Check your internet connection
- Verify Firebase project is still active

## 📞 Support Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Docs**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs

## 📄 Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/firebase.ts` | Firebase initialization |
| `src/hooks/useFirebase.ts` | React hooks for data fetching |
| `src/app/admin/dashboard/page.tsx` | Admin management interface |
| `src/app/visits/page.tsx` | Public visit display |
| `.env.local.example` | Environment variables template |

## 🎨 Customization Tips

### Change Colors
Edit `src/app/globals.css`:
```css
--primary-blue: #2563eb;
--primary-green: #10b981;
```

### Change Admin Password
Update `.env.local`:
```
NEXT_PUBLIC_ADMIN_PASSWORD=your_new_password
```

### Modify Navbar Links
Edit `src/components/Navbar.tsx`

### Change Home Page Content
Edit `src/app/page.tsx`

## ✨ You're All Set!

Your Planavi application is ready to go. Follow the steps above to set up Firebase, configure your environment variables, and start scheduling visits!

For detailed documentation, see [PLANAVI_SETUP.md](./PLANAVI_SETUP.md)
