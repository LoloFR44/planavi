# Planavi - Family Visit Scheduling System

A modern web application for managing family visits at care homes. Built with Next.js, TypeScript, Tailwind CSS, and Firebase Realtime Database.

## Features

- **Public View**: Browse residents and their scheduled visits (read-only)
- **Admin Dashboard**: Password-protected panel for managing residents and visits
- **Real-time Updates**: Live synchronization with Firebase Realtime Database
- **Responsive Design**: Blue-green gradient design that works on all devices
- **CRUD Operations**: Add, edit, and delete residents and visits

## Tech Stack

- **Frontend**: Next.js 16.2.1, React 19.2.4, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase Realtime Database
- **Authentication**: Simple password-based admin access

## Project Structure

```
src/
├── app/
│   ├── admin/              # Admin pages
│   │   ├── page.tsx       # Admin login
│   │   └── dashboard/
│   │       └── page.tsx   # Admin dashboard
│   ├── visits/            # Public visits listing
│   │   └── page.tsx
│   ├── layout.tsx         # Root layout with navbar
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── Navbar.tsx         # Navigation bar
│   └── ResidentCards.tsx  # Resident cards display
├── hooks/
│   └── useFirebase.ts     # Firebase hooks (useResidents, useVisits)
├── lib/
│   ├── firebase.ts        # Firebase config
│   └── firebaseOperations.ts  # CRUD operations
├── types/
│   └── index.ts           # TypeScript interfaces
└── utils/
    └── auth.ts            # Admin authentication utilities
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Realtime Database** (not Firestore) in your project
3. Copy your project credentials from Project Settings

### 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Firebase configuration values:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
   ```

### 4. Set Up Database Structure

In your Firebase Realtime Database, create the following structure:

```json
{
  "residents": {
    "resident_id_1": {
      "name": "Mary Johnson",
      "roomNumber": "201",
      "createdAt": 1234567890,
      "updatedAt": 1234567890
    }
  },
  "visits": {
    "visit_id_1": {
      "residentId": "resident_id_1",
      "visitorName": "John Smith",
      "date": "2026-03-28",
      "time": "14:00",
      "createdAt": 1234567890,
      "updatedAt": 1234567890
    }
  }
}
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Public View
- Navigate to the home page to see featured information
- Click "View Scheduled Visits" to see all residents and their upcoming visits
- Expand resident cards to see detailed visit information

### Admin Dashboard
1. Click "Admin" in the navigation
2. Enter the admin password (configured in `.env.local`)
3. Manage residents and visits:
   - **Add Resident**: Fill out the form to add a new resident
   - **Add Visit**: Select a resident and schedule a visit
   - **Edit Visit**: Click "Edit" on any visit card
   - **Delete**: Remove residents or visits with confirmation

## Database Schema

### Residents
```typescript
interface Resident {
  id: string;
  name: string;
  roomNumber: string;
  visits?: Visit[];  // Optional, can be populated
  createdAt?: number;
  updatedAt?: number;
}
```

### Visits
```typescript
interface Visit {
  id: string;
  residentId: string;
  visitorName: string;
  date: string;     // YYYY-MM-DD format
  time: string;     // HH:MM format
  createdAt?: number;
  updatedAt?: number;
}
```

## Design System

### Color Scheme
- **Primary Blue**: `#2563eb`
- **Primary Green**: `#10b981`
- **Gradient**: Blue to Green (135deg)

### Typography
- Clean, modern sans-serif fonts using system fonts
- Consistent heading hierarchy
- Good contrast for accessibility

## API Endpoints & Operations

### Firebase Realtime Database Paths

**Residents:**
- Read all: `/residents`
- Add: `/residents` (push)
- Update: `/residents/{residentId}`
- Delete: `/residents/{residentId}`

**Visits:**
- Read all: `/visits`
- Add: `/visits` (push)
- Update: `/visits/{visitId}`
- Delete: `/visits/{visitId}`

## Security Notes

⚠️ **Important**: This app uses a simple password-based authentication. For production:
- Hash the admin password using bcrypt or similar
- Consider implementing proper authentication (Firebase Auth, NextAuth.js)
- Add rate limiting to prevent brute force attacks
- Use HTTPS for all connections
- Implement Firebase Security Rules for database access
- Never commit `.env.local` to version control

### Recommended Firebase Rules (Production)
```json
{
  "rules": {
    "residents": {
      ".read": true,
      ".write": "auth != null"
    },
    "visits": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Deployment

### To Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Vercel will automatically deploy

### To Other Platforms
1. Build the project: `npm run build`
2. Deploy the `.next` folder and `public` folder
3. Set environment variables in your hosting platform
4. Use `npm start` to run the production server

## Troubleshooting

### Firebase connection issues
- Verify all environment variables are correctly set
- Check Firebase project is using Realtime Database (not Firestore)
- Ensure database URL is correct (should end with `.firebaseio.com`)

### Database not updating in real-time
- Check browser console for Firebase errors
- Verify Firebase security rules allow read/write access
- Ensure all environment variables are loaded (restart dev server if added)

### Admin login not working
- Verify `NEXT_PUBLIC_ADMIN_PASSWORD` is set in `.env.local`
- Check that password in form exactly matches the environment variable
- Session is stored in sessionStorage (browser tab-specific)

## Future Enhancements

- [ ] Email notifications for visits
- [ ] Visitor check-in system
- [ ] Notes/comments on visits
- [ ] Visit cancellation history
- [ ] Admin user roles and permissions
- [ ] Analytics and reporting
- [ ] Mobile app version
- [ ] QR code for visitor check-in
- [ ] Recurring visits support

## File Changes Summary

### Created Files
- `src/lib/firebase.ts` - Firebase initialization
- `src/lib/firebaseOperations.ts` - Database operations
- `src/types/index.ts` - TypeScript interfaces
- `src/hooks/useFirebase.ts` - Custom React hooks
- `src/utils/auth.ts` - Authentication utilities
- `src/app/visits/page.tsx` - Public visits view
- `src/app/admin/page.tsx` - Admin login page
- `src/app/admin/dashboard/page.tsx` - Admin dashboard
- `src/components/Navbar.tsx` - Navigation bar
- `src/components/ResidentCards.tsx` - Resident display component
- `.env.local.example` - Environment variables template

### Modified Files
- `src/app/layout.tsx` - Added Navbar, updated metadata
- `src/app/globals.css` - Updated with blue-green gradient
- `src/app/page.tsx` - New home page
- `package.json` - Added firebase dependency

## Support & Documentation

- Firebase Docs: https://firebase.google.com/docs
- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- React Docs: https://react.dev

## License

This project is proprietary and confidential.
