import { supabase } from '../lib/supabaseClient';

export interface AdminUser {
  id: string;
  full_name: string;
  email_address: string;
  profile_created_at: string;
}

export interface UserListItem {
  id: string;
  full_name: string;
  email_address: string;
  role: 'client' | 'admin';
  is_active: boolean;
  phone?: string;
  profile_created_at: string;
  resumes_created_count: number;
}

export interface RoleOperationResult {
  success: boolean;
  message: string;
  user_id?: string;
  user_email?: string;
}

class AdminService {
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_current_user_admin');

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error in isCurrentUserAdmin:', error);
      return false;
    }
  }

  async grantAdminRole(userId: string): Promise<RoleOperationResult> {
    try {
      const { data, error } = await supabase.rpc('grant_admin_role', {
        target_user_id: userId
      });

      if (error) {
        console.error('Error granting admin role:', error);
        return {
          success: false,
          message: error.message || 'Failed to grant admin role'
        };
      }

      return data as RoleOperationResult;
    } catch (error) {
      console.error('Error in grantAdminRole:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to grant admin role'
      };
    }
  }

  async revokeAdminRole(userId: string): Promise<RoleOperationResult> {
    try {
      const { data, error } = await supabase.rpc('revoke_admin_role', {
        target_user_id: userId
      });

      if (error) {
        console.error('Error revoking admin role:', error);
        return {
          success: false,
          message: error.message || 'Failed to revoke admin role'
        };
      }

      return data as RoleOperationResult;
    } catch (error) {
      console.error('Error in revokeAdminRole:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to revoke admin role'
      };
    }
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase.rpc('get_all_admins');

      if (error) {
        console.error('Error fetching admins:', error);
        throw new Error(error.message || 'Failed to fetch admin users');
      }

      return data as AdminUser[];
    } catch (error) {
      console.error('Error in getAllAdmins:', error);
      throw error;
    }
  }

  async getAllUsers(
    searchQuery: string = '',
    roleFilter: 'all' | 'client' | 'admin' = 'all',
    limitCount: number = 50,
    offsetCount: number = 0
  ): Promise<UserListItem[]> {
    try {
      const { data, error } = await supabase.rpc('get_all_users', {
        search_query: searchQuery,
        role_filter: roleFilter,
        limit_count: limitCount,
        offset_count: offsetCount
      });

      if (error) {
        console.error('Error fetching users:', error);
        throw new Error(error.message || 'Failed to fetch users');
      }

      return data as UserListItem[];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    totalAdmins: number;
    totalClients: number;
    activeUsers: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role, is_active');

      if (error) {
        console.error('Error fetching user stats:', error);
        throw new Error('Failed to fetch user statistics');
      }

      const totalUsers = data.length;
      const totalAdmins = data.filter(u => u.role === 'admin').length;
      const totalClients = data.filter(u => u.role === 'client').length;
      const activeUsers = data.filter(u => u.is_active).length;

      return {
        totalUsers,
        totalAdmins,
        totalClients,
        activeUsers
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
