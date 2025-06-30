"use client"

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import UnauthorizedPage from '@/app/unauthorized/page';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false, requireSuperAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setHasCheckedAuth(true);
      if (!isAuthenticated) {
        // Use immediate redirect for logout scenarios
        window.location.href = '/admin/login';
        return;
      }
    }
  }, [isAuthenticated, isLoading]);

  // Debug logging
  useEffect(() => {
    if (hasCheckedAuth) {
      console.log('ProtectedRoute - Auth state:', {
        isAuthenticated,
        isAdmin,
        userRole: user?.role,
        requireAdmin,
        requireSuperAdmin,
        pathname,
        pagePermissions: user?.pagePermissions
      });
    }
  }, [hasCheckedAuth, isAuthenticated, isAdmin, user?.role, requireAdmin, requireSuperAdmin, pathname, user?.pagePermissions]);

  // RBAC: Check page permissions
  const getPageKey = (path: string) => {
    if (path.startsWith('/admin/orders')) return 'orders';
    if (path.startsWith('/admin/pos')) return 'pos';
    if (path.startsWith('/admin/customers')) return 'customers';
    if (path.startsWith('/admin/services')) return 'services';
    if (path.startsWith('/admin/categories')) return 'categories';
    if (path.startsWith('/admin/reports')) return 'reports';
    if (path.startsWith('/admin/users')) return 'users';
    if (path.startsWith('/admin/expenses')) return 'expenses';
    if (path.startsWith('/admin/gallery')) return 'gallery';
    if (path.startsWith('/admin/testimonials')) return 'testimonials';
    if (path.startsWith('/admin/promotions')) return 'promotions';
    if (path.startsWith('/admin/settings')) return 'settings';
    if (path.startsWith('/admin')) return 'dashboard';
    return '';
  };

  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (requireSuperAdmin && user?.role !== 'superadmin') {
    console.log('Access denied - Only superadmin allowed');
    return <UnauthorizedPage />;
  }

  if (requireAdmin && !isAdmin) {
    console.log('Access denied - User role:', user?.role, 'isAdmin:', isAdmin);
    return <UnauthorizedPage />;
  }

  // Superadmin can access everything
  if (user?.role === 'superadmin') {
    console.log('Superadmin access granted');
    return <>{children}</>;
  }

  // For non-superadmin users, check page permissions
  const pageKey = getPageKey(pathname || '');
  console.log('Checking permissions for page:', pageKey);
  
  if (!pageKey) {
    console.log('No page key found, allowing access');
    return <>{children}</>;
  }

  // Check if user has pagePermissions array
  if (!user?.pagePermissions || !Array.isArray(user.pagePermissions)) {
    console.log('No pagePermissions found, denying access');
    return <UnauthorizedPage />;
  }

  const permission = user.pagePermissions.find((p: any) => p.page === pageKey);
  console.log('Found permission:', permission);
  
  if (!permission || !permission.canView) {
    console.log('Access denied - No permission or canView is false');
    return <UnauthorizedPage />;
  }

  console.log('Access granted based on permissions');
  return <>{children}</>;
} 