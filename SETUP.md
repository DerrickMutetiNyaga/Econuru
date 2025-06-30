# 🔐 Authentication Setup Guide

## Quick Setup for MongoDB

### Option 1: MongoDB Atlas (Recommended - Free Cloud Database)

1. **Go to MongoDB Atlas**: https://www.mongodb.com/atlas
2. **Create a free account** and new cluster
3. **Get your connection string** from the cluster
4. **Create `.env.local` file** in your project root with:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/luxury-laundry?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
```

### Option 2: Local MongoDB

1. **Install MongoDB locally** on your machine
2. **Start MongoDB service**
3. **Create `.env.local` file** with:

```env
MONGODB_URI=mongodb://localhost:27017/luxury-laundry
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
```

## Create Admin User

After setting up MongoDB, run:

```bash
npm run create-admin
```

This will create an admin user with:
- **Email**: `admin@demolaundry.com`
- **Password**: `admin123`

## Test the System

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Visit**: `http://localhost:3000/admin`
3. **You should be redirected to login page**
4. **Login with the admin credentials**
5. **You should now have access to the admin panel**

## Security Features

✅ **Password hashing** with bcrypt  
✅ **JWT token authentication**  
✅ **Role-based access control**  
✅ **Protected admin routes**  
✅ **Automatic session management**  
✅ **Secure logout functionality**  

## Troubleshooting

### MongoDB Connection Issues
- Make sure your MongoDB URI is correct
- Check if your MongoDB service is running
- Verify network connectivity for cloud databases

### Authentication Issues
- Clear browser localStorage if you have stale tokens
- Check browser console for error messages
- Verify JWT_SECRET is set in environment variables

## Next Steps

1. **Change default admin password** after first login
2. **Set up Cloudinary** for image uploads
3. **Add more admin users** through the admin panel
4. **Customize the admin interface** as needed 