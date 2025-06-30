# 🔐 Authentication & User Management System

## Overview

This system provides a complete authentication and user management solution for the luxury laundry application with role-based access control using **real database authentication**.

## 🎯 Features

### Authentication
- ✅ **User Registration** - New users can sign up with email/password
- ✅ **User Login** - Secure authentication with JWT tokens
- ✅ **Role-based Access** - Admin and regular user roles
- ✅ **Session Management** - Persistent login state
- ✅ **Protected Routes** - Automatic redirects for unauthorized access
- ✅ **Database Authentication** - Real user data stored in MongoDB

### User Management
- ✅ **User Dashboard** - Regular users get their own dashboard
- ✅ **Admin Panel** - Full admin interface with all features
- ✅ **User Promotion** - Admins can promote users to admin role
- ✅ **User Status** - Activate/deactivate user accounts

## 🚀 How It Works

### User Registration Flow
1. **New User Signs Up** → `/signup`
2. **Account Created** → Role automatically set to `user`
3. **User Logs In** → Redirected to `/dashboard` (user dashboard)
4. **Admin Can Promote** → User role changed to `admin`

### Admin Access Flow
1. **Admin Logs In** → `/admin/login`
2. **Authentication Check** → Role verified as `admin`
3. **Access Granted** → Redirected to `/admin/dashboard`
4. **Full Access** → All admin features available

### Regular User Flow
1. **User Logs In** → `/admin/login` (same login page)
2. **Authentication Check** → Role verified as `user`
3. **Access Denied** → Cannot access admin areas
4. **User Dashboard** → Redirected to `/dashboard`

## 📁 File Structure

```
app/
├── admin/
│   ├── login/page.tsx          # Admin login page
│   ├── dashboard/page.tsx      # Admin dashboard
│   ├── users/page.tsx          # User management
│   └── layout.tsx              # Admin layout with auth
├── dashboard/
│   └── page.tsx                # Regular user dashboard
├── signup/
│   └── page.tsx                # User registration
└── api/
    ├── auth/
    │   ├── login/route.ts      # Login API
    │   └── register/route.ts   # Registration API
    └── users/
        └── promote/route.ts    # User promotion API

lib/
├── models/User.ts              # User model
├── auth.ts                     # Auth utilities
└── mongodb.ts                  # Database connection

hooks/
└── useAuth.ts                  # Authentication hook

components/
└── ProtectedRoute.tsx          # Route protection component
```

## 🔑 Database Setup

### 1. Create Environment File
Create `.env.local` in your project root:
```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/luxury-laundry?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
```

### 2. Create Admin User
```bash
npm run create-admin
```

This will create an admin user with:
- **Email:** `admin@demolaundry.com`
- **Password:** `admin123`

### 3. Create Additional Users
- **Sign up** through `/signup` page
- **Login** with created credentials
- **Admin can promote** users to admin role

## 🎨 User Interfaces

### Admin Panel (`/admin`)
- Dashboard with business metrics
- User management
- Order management
- Service configuration
- Pricing management
- And more...

### User Dashboard (`/dashboard`)
- Personal order tracking
- Account management
- Service booking
- Profile settings

### Signup Page (`/signup`)
- User registration form
- Email/password validation
- Terms agreement
- Success/error handling

## 🔒 Security Features

- **Password Hashing** - bcrypt encryption
- **JWT Tokens** - Secure session management
- **Role Verification** - Server-side role checks
- **Protected Routes** - Client and server-side protection
- **Input Validation** - Form validation and sanitization
- **Database Security** - Real user data with proper encryption

## 🚀 Getting Started

### 1. Set Up MongoDB
1. **Create MongoDB Atlas account** (free)
2. **Create cluster** and get connection string
3. **Create `.env.local`** with your MongoDB URI
4. **Run `npm run create-admin`** to create first admin user

### 2. Test the System
```bash
npm run dev
```

Visit:
- `/admin` - Admin panel (requires login)
- `/signup` - Create new account
- `/admin/login` - Login page

### 3. User Management
- **Promote Users:** Use admin panel → Users → Promote to Admin
- **Manage Status:** Activate/deactivate user accounts
- **View Analytics:** User statistics and activity

## 🔄 User Promotion Process

1. **Regular User Signs Up** → Role: `user`
2. **Admin Logs In** → Access user management
3. **Admin Promotes User** → Role: `admin`
4. **User Gets Admin Access** → Can access admin panel

## 📱 Responsive Design

All interfaces are fully responsive and work on:
- Desktop computers
- Tablets
- Mobile phones

## 🎯 Next Steps

1. **Email Verification** - Verify user emails
2. **Password Reset** - Forgot password functionality
3. **Two-Factor Auth** - Enhanced security
4. **User Profiles** - Detailed user information
5. **Activity Logs** - Track user actions
6. **Cloudinary Integration** - Image uploads

## 🛠️ Development

### Adding New Protected Routes
```tsx
import ProtectedRoute from "@/components/ProtectedRoute"

export default function MyPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <div>Admin only content</div>
    </ProtectedRoute>
  )
}
```

### Adding New User Roles
1. Update `User` model in `lib/models/User.ts`
2. Modify `useAuth` hook in `hooks/useAuth.ts`
3. Update route protection logic

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify MongoDB connection in `.env.local`
3. Clear browser localStorage if having session issues
4. Check network tab for API errors
5. Ensure MongoDB service is running

## ⚠️ Important Notes

- **No Mock Data** - System uses real database authentication
- **MongoDB Required** - Must have MongoDB connection for authentication
- **Admin Creation** - First admin must be created via script
- **Password Security** - All passwords are hashed with bcrypt
- **Session Management** - JWT tokens for secure sessions 