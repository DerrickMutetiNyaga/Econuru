import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// DELETE user - only superadmin can delete users
export const DELETE = requireSuperAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDB();
    
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get the current user from the request (added by requireSuperAdmin)
    const currentUser = (request as any).user;
    
    // Prevent self-deletion
    if (currentUser.userId === userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Find the user to delete
    const userToDelete = await User.findById(userId);
    
    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting other superadmins (optional safety check)
    if (userToDelete.role === 'superadmin') {
      return NextResponse.json(
        { error: 'Cannot delete superadmin users' },
        { status: 403 }
      );
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });

  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});

