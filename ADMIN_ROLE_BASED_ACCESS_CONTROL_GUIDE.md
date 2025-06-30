# Admin Role-Based Access Control (RBAC) Guide

## Overview

This system implements comprehensive role-based access control for the Econuru admin panel. It ensures that:

1. **Regular users (`user` role) CANNOT access admin login at all**
2. **Only admins and superadmins can login to admin panel**
3. **Admin access is controlled by page-specific permissions set in User Management**
4. **Superadmins have full access to everything**

## 🚫 Access Control Layers

### Layer 1: Admin Login Restriction
- **API**: `/api/auth/admin-login` - Dedicated admin-only login endpoint
- **Blocks**: Regular users (`user` role) are immediately rejected with 403 error
- **Allows**: Only `admin` and `superadmin` roles can authenticate

### Layer 2: Route Protection
- **Component**: `ProtectedRoute` with enhanced permission checking
- **Redirects**: Regular users to `/dashboard`, unauthorized admins to error pages
- **Checks**: Page-specific permissions for admin users

### Layer 3: UI Permission Gates
- **Component**: `PermissionGate` for conditional rendering
- **Navigation**: Only shows accessible pages in admin sidebar
- **Buttons**: Hides actions user cannot perform

## 👥 User Roles

### 1. Regular User (`user`)
- **Admin Panel Access**: ❌ BLOCKED completely
- **Login Redirect**: Goes to `/dashboard` (customer dashboard)
- **Error Message**: "This area is restricted to administrators only"

### 2. Admin (`admin`)
- **Admin Panel Access**: ✅ Allowed based on permissions
- **Default Permissions**: Limited edit access to core pages
- **Customizable**: Permissions can be modified via User Management

### 3. Super Admin (`superadmin`)
- **Admin Panel Access**: ✅ Full access to everything
- **Permissions**: Cannot be restricted
- **User Management**: Can modify all user permissions

## 📋 Page Permissions System

Each admin user has `pagePermissions` array with permissions for each page:

```typescript
interface IPagePermission {
  page: string;           // e.g., 'orders', 'dashboard', 'users'
  canView: boolean;       // Can view the page
  canEdit: boolean;       // Can create/modify data
  canDelete: boolean;     // Can delete data
}
```

### Available Pages
- `dashboard` - Admin overview and statistics
- `orders` - Order management
- `pos` - Point of sale system
- `customers` - Customer management (clients page)
- `services` - Service configuration
- `categories` - Service categories
- `reports` - Business reports
- `users` - User management (superadmin only by default)
- `expenses` - Expense tracking
- `gallery` - Image gallery management
- `testimonials` - Customer testimonials
- `promotions` - Promotional offers
- `settings` - System settings

## 🔧 How to Manage User Access

### Step 1: Access User Management
1. Login as **superadmin**
2. Navigate to **User Management** (`/admin/users`)
3. Only superadmins can access this page by default

### Step 2: Configure User Permissions
1. Click **"Set Permissions"** for any admin user
2. Configure page-by-page permissions:
   - **View**: Can access the page
   - **Edit**: Can create/modify data
   - **Delete**: Can delete records
3. Click **"Save Permissions"**

### Step 3: Verify Access
- User will immediately see updated navigation
- Blocked pages show permission denied error
- Console logs show access decisions

## 🛡️ Security Features

### Authentication Security
```typescript
// Regular users are blocked immediately
if (user.role === 'user') {
  console.log('🚫 Regular user attempted admin login');
  return { error: 'Access denied. Admin privileges required.' };
}
```

### Route Protection
```typescript
// Automatic redirects based on role
if (user && user.role === 'user') {
  router.push('/dashboard'); // Customer dashboard
  return;
}
```

### Permission Checking
```typescript
// Page-specific permission validation
if (!canViewPage(user, currentPage)) {
  console.log(`🚫 Access denied - No permission for page: ${currentPage}`);
  // Show permission denied UI
}
```

## 🔍 Permission Checking Components

### ProtectedRoute Component
```jsx
<ProtectedRoute requireSuperAdmin={true}>
  {/* Only superadmins can see this */}
</ProtectedRoute>

<ProtectedRoute requiredPage="users">
  {/* Only users with 'users' page permission */}
</ProtectedRoute>
```

### PermissionGate Component
```jsx
<PermissionGate page="orders" action="edit">
  <Button>Edit Order</Button>
</PermissionGate>

<PermissionGate role="superadmin">
  <Button>Delete User</Button>
</PermissionGate>
```

### usePermissions Hook
```tsx
const { canView, canEdit, canDelete, isAdmin, isSuperAdmin } = usePermissions();

if (canEdit('orders')) {
  // Show edit UI
}
```

## 🚨 Error Messages & Redirects

### Regular User Attempts Admin Login
- **Message**: "Access denied. This area is restricted to administrators only."
- **Action**: Show error, no authentication token created

### Admin Without Page Permission
- **Message**: "You don't have permission to view the [page] page"
- **Action**: Show permission denied UI with back button
- **Details**: Shows current role and email for debugging

### Inactive/Unapproved Admin
- **Message**: "Account is deactivated" or "Admin account is pending approval"
- **Action**: Block login, show appropriate message

## 📊 Monitoring & Debugging

### Console Logging
All access decisions are logged with emojis for easy identification:

```
✅ Admin login successful: admin@test.com (admin)
🚫 Regular user attempted admin login: user@test.com
✅ Access granted based on permissions
🚫 Access denied - No permission for page: users
```

### Debug Information
The system logs detailed auth state including:
- User role and permissions
- Current page being accessed
- Permission check results
- Redirect decisions

## 🔄 Migration & Setup

### For Existing Admin Users
1. Existing admins will get default permissions automatically
2. Permissions are created on first login if missing
3. No data loss or disruption

### Default Permission Sets

**Admin User Default Permissions:**
- **View**: All pages except Users and Settings
- **Edit**: dashboard, orders, pos, customers, services, categories
- **Delete**: orders, customers

**Superadmin User:**
- **Full access**: All permissions on all pages
- **Cannot be restricted**: Always bypasses permission checks

## 🚀 Implementation Files

### Core Files
- `/app/api/auth/admin-login/route.ts` - Admin-only authentication
- `/lib/permissions.ts` - Permission checking utilities
- `/components/ProtectedRoute.tsx` - Route-level protection
- `/components/PermissionGate.tsx` - UI-level permission gates
- `/app/admin/layout.tsx` - Permission-based navigation

### Models & Types
- `/lib/models/User.ts` - User model with pagePermissions
- `/hooks/useAuth.ts` - Enhanced authentication hook

## ❗ Important Security Notes

1. **Never bypass permission checks** - Always use provided utilities
2. **Test with different roles** - Verify access control works as expected
3. **Regular audits** - Review user permissions periodically
4. **Principle of least privilege** - Grant minimal necessary permissions
5. **Immediate revocation** - Deactivate users immediately when needed

## 🔗 Related Guides
- See `ADMIN_AUTHENTICATION_GUIDE.md` for general admin setup
- See user management interface for day-to-day permission changes
- Check browser console for detailed access logs

---

**Security Note**: This system implements defense-in-depth with multiple layers of access control. Regular users are blocked at login, route, and UI levels to ensure complete security. 