# 🚀 Quick Setup Guide

## Step 1: Set Up MongoDB

### Option A: MongoDB Atlas (Recommended - Free Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Get your connection string
5. Replace `<password>` with your database password

### Option B: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/luxury-laundry`

## Step 2: Create Environment File

Create `.env.local` in your project root:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/luxury-laundry?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
```

## Step 3: Initialize Database

```bash
npm run setup-database
```

This will:
- Connect to your MongoDB
- Create the first admin user
- Show database statistics

## Step 4: Start the Application

```bash
npm run dev
```

## Step 5: Test the System

1. **Visit:** `http://localhost:3000/admin`
2. **Login with:**
   - Email: `admin@demolaundry.com`
   - Password: `admin123`
3. **Create new users** via `/signup`
4. **Promote users** via admin panel

## 🔑 Default Admin Credentials

- **Email:** `admin@demolaundry.com`
- **Password:** `admin123`

⚠️ **Important:** Change these credentials after first login!

## 🎯 What's Working Now

✅ **Real Database Authentication** - No more mock data  
✅ **User Registration** - Create new accounts  
✅ **Admin Login** - Access admin panel  
✅ **User Management** - Promote users to admin  
✅ **Protected Routes** - Role-based access control  
✅ **Session Management** - Persistent login state  

## 🛠️ Troubleshooting

### MongoDB Connection Issues
- Check your connection string
- Verify MongoDB service is running
- Check network connectivity
- For Atlas: Check IP whitelist

### Authentication Issues
- Clear browser localStorage
- Check console for errors
- Verify JWT_SECRET is set
- Ensure database is connected

## 📞 Need Help?

1. Check the console for error messages
2. Verify your `.env.local` file
3. Ensure MongoDB is running
4. Check network connectivity

## 🎉 You're Ready!

Your authentication system is now fully functional with real database authentication! 