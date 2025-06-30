# Admin Authentication System Guide

## Overview

The luxury laundry application has a comprehensive authentication system that protects all admin pages and ensures only authorized personnel (admin or superadmin) can access administrative functions.

## User Roles

### 1. **User** (Regular Customer)
- Can access customer-facing features
- Cannot access any admin pages
- Account requires admin approval

### 2. **Admin**
- Can access all admin pages
- Can manage services, orders, clients, etc.
- Can promote users to admin role
- Cannot access superadmin-only features

### 3. **Superadmin**
- Has all admin privileges
- Can access superadmin-only features
- Can manage all users including other admins
- Highest level of access

## Authentication Flow

### Login Process
1. User visits `/admin/login`
2. Enters email and password
3. System validates credentials
4. If valid admin/superadmin → redirect to `/admin/dashboard`
5. If regular user → show "Access denied" message
6. If pending approval → redirect to pending approval page

### Protection Levels

#### 1. **Layout-Level Protection** (app/admin/layout.tsx)
- All admin pages are wrapped in `ProtectedRoute requireAdmin={true}`
- This ensures only admin/superadmin users can access any admin page
- If unauthorized user tries to access → redirected to login

#### 2. **Component-Level Protection** (ProtectedRoute.tsx)
- Individual components can be wrapped for additional protection
- Shows unauthorized page instead of redirecting
- Supports both admin and superadmin roles

#### 3. **API-Level Protection** (lib/auth.ts)
- Server-side middleware protects API endpoints
- `requireAdmin()` - allows both admin and superadmin
- `requireSuperAdmin()` - allows only superadmin

## Key Files

### Authentication Hook (hooks/useAuth.ts)
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<...>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;        // true for both admin and superadmin
  isSuperAdmin: boolean;   // true only for superadmin
}
```

### Protected Route Component (components/ProtectedRoute.tsx)
```typescript
<ProtectedRoute requireAdmin={true}>
  <YourAdminComponent />
</ProtectedRoute>
```

### Auth Middleware (lib/auth.ts)
```typescript
// For admin and superadmin access
export function requireAdmin(handler: Function)

// For superadmin-only access
export function requireSuperAdmin(handler: Function)
```

## Setup Instructions

### 1. Create Admin User
```bash
npm run create-admin
```
- Email: `admin@demolaundry.com`
- Password: `admin123`
- Role: `admin`

### 2. Create Superadmin User
```bash
npm run create-superadmin
```
- Email: `superadmin@demolaundry.com`
- Password: `superadmin123`
- Role: `superadmin`

### 3. Setup Database
```bash
npm run setup-database
```

## Testing the System

### Test Admin Access
1. Login with `admin@demolaundry.com` / `admin123`
2. Should access all admin pages
3. Should see admin dashboard

### Test Superadmin Access
1. Login with `superadmin@demolaundry.com` / `superadmin123`
2. Should access all admin pages
3. Should have superadmin privileges

### Test Unauthorized Access
1. Try to access `/admin/dashboard` without login
2. Should redirect to `/admin/login`
3. Login with regular user account
4. Should show "Access Denied" page

## Unauthorized Access Page

When users without proper permissions try to access admin pages, they see a professional "Access Denied" page at `/unauthorized` that:

- Explains the restriction clearly
- Provides links to admin login
- Offers option to return to home
- Maintains professional appearance

## Security Features

### 1. **JWT Token Authentication**
- Secure session management
- 24-hour token expiration
- Automatic logout on token expiry

### 2. **Role-Based Access Control**
- Server-side role verification
- Client-side role checks
- API endpoint protection

### 3. **Password Security**
- Bcrypt hashing (12 salt rounds)
- Minimum 6 character requirement
- Secure password comparison

### 4. **Account Management**
- User approval system
- Account activation/deactivation
- Role promotion/demotion

## Adding New Protected Pages

### For Admin/Superadmin Access
```typescript
// In your page component
export default function MyAdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <div>Your admin content here</div>
    </ProtectedRoute>
  )
}
```

### For Superadmin-Only Access
```typescript
// In your page component
export default function SuperAdminPage() {
  const { isSuperAdmin } = useAuth();
  
  if (!isSuperAdmin) {
    return <UnauthorizedPage />;
  }
  
  return <div>Superadmin only content</div>
}
```

### For API Endpoints
```typescript
// For admin/superadmin access
export const POST = requireAdmin(async (request: NextRequest) => {
  // Your API logic here
});

// For superadmin-only access
export const POST = requireSuperAdmin(async (request: NextRequest) => {
  // Your superadmin API logic here
});
```

## Troubleshooting

### Common Issues

1. **"Access Denied" on admin pages**
   - Check if user has admin/superadmin role
   - Verify user is approved and active
   - Clear browser cache and localStorage

2. **Login not working**
   - Verify email/password are correct
   - Check if account is active
   - Ensure account is approved

3. **Token expired**
   - User will be automatically logged out
   - Redirect to login page
   - Re-authenticate

### Debug Commands
```bash
# Check database connection
npm run setup-database

# Create new admin user
npm run create-admin

# Create new superadmin user
npm run create-superadmin
```

## Best Practices

1. **Always use ProtectedRoute for admin pages**
2. **Implement both client and server-side protection**
3. **Use appropriate role checks for different access levels**
4. **Keep authentication tokens secure**
5. **Regularly audit user permissions**
6. **Monitor login attempts and suspicious activity**

## Support

If you encounter issues with the authentication system:

1. Check the browser console for errors
2. Verify database connection
3. Ensure all environment variables are set
4. Check user roles in the database
5. Review the authentication logs

For additional help, refer to the main `AUTHENTICATION_GUIDE.md` file. 