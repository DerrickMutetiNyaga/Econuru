# Database Setup Guide

This guide will help you set up the MongoDB database and Cloudinary integration for the Ecolaundryservices application.

## Prerequisites

1. MongoDB Atlas account (free tier available)
2. Cloudinary account (free tier available)
3. Node.js and npm installed

## Step 1: MongoDB Setup

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier is sufficient)
4. Set up database access:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Set privileges to "Read and write to any database"

### 1.2 Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `ecolaundryservices`

## Step 2: Cloudinary Setup

### 2.1 Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. After signing up, go to your Dashboard

### 2.2 Get API Credentials

1. In your Cloudinary Dashboard, you'll find:
   - Cloud Name
   - API Key
   - API Secret
2. Copy these values (you'll need them for the environment variables)

## Step 3: Environment Configuration

### 3.1 Create .env.local File

Create a `.env.local` file in the root directory with the following content:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/ecolaundryservices?retryWrites=true&w=majority

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### 3.2 Replace Placeholder Values

1. **MONGODB_URI**: Replace with your actual MongoDB connection string
2. **JWT_SECRET**: Generate a strong secret (you can use `openssl rand -base64 32`)
3. **CLOUDINARY_CLOUD_NAME**: Your Cloudinary cloud name
4. **CLOUDINARY_API_KEY**: Your Cloudinary API key
5. **CLOUDINARY_API_SECRET**: Your Cloudinary API secret
6. **NEXTAUTH_SECRET**: Generate another strong secret

## Step 4: Install Dependencies

Run the following command to install required packages:

```bash
npm install cloudinary dotenv
```

## Step 5: Seed Initial Data

### 5.1 Run the Seeding Script

```bash
node scripts/seed-services.js
```

This will create sample services in your database with the following categories:
- Dry Cleaning
- Wash & Fold
- Luxury Care
- Business
- Home Cleaning
- Business Cleaning

## Step 6: Test the Integration

### 6.1 Start the Development Server

```bash
npm run dev
```

### 6.2 Test the Services

1. Visit `http://localhost:3000/services` to see the public services page
2. Visit `http://localhost:3000/admin/services` to manage services (requires admin login)
3. Try creating, editing, and deleting services
4. Test image upload functionality

## API Endpoints

The following API endpoints are available:

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create a new service (requires auth)
- `PUT /api/services/[id]` - Update a service (requires auth)
- `DELETE /api/services/[id]` - Delete a service (requires auth)

### Image Upload
- `POST /api/upload` - Upload image to Cloudinary

## Database Models

### Service Model
```typescript
interface Service {
  _id: string;
  name: string;
  description: string;
  category: 'dry-cleaning' | 'wash-fold' | 'luxury' | 'business' | 'home-cleaning' | 'business-cleaning';
  price: string;
  turnaround: string;
  active: boolean;
  featured: boolean;
  image: string; // Cloudinary URL
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Features

### Admin Panel Features
- ✅ Create new services
- ✅ Edit existing services
- ✅ Delete services
- ✅ Toggle service active/inactive status
- ✅ Upload images to Cloudinary
- ✅ Mark services as featured
- ✅ Real-time updates

### Public Features
- ✅ Display active services
- ✅ Filter by category
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your connection string
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Verify username and password

2. **Cloudinary Upload Error**
   - Check your Cloudinary credentials
   - Ensure the image file is valid
   - Check file size limits

3. **Authentication Error**
   - Ensure JWT_SECRET is set
   - Check if user is logged in and has admin role

### Environment Variables Not Loading

If your environment variables aren't loading:

1. Ensure the `.env.local` file is in the root directory
2. Restart your development server
3. Check that the variable names match exactly

## Security Notes

1. Never commit your `.env.local` file to version control
2. Use strong, unique secrets for JWT_SECRET and NEXTAUTH_SECRET
3. Regularly rotate your API keys
4. Set up proper CORS policies for production

## Production Deployment

For production deployment:

1. Set up environment variables in your hosting platform
2. Configure proper CORS settings
3. Set up SSL certificates
4. Configure proper security headers
5. Set up monitoring and logging

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Check the server logs
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed

For additional help, refer to the documentation for:
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Cloudinary](https://cloudinary.com/documentation)
- [Next.js](https://nextjs.org/docs) 