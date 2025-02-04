'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/lib/types/auth';
import { useAuth } from './auth-context';

interface RolePermission {
  permissions: {
    name: string;
  };
}

interface RoleData {
  name: UserRole;
  role_permissions: RolePermission[];
}

interface PermissionContextType {
  userRole: UserRole | null;
  permissions: string[];
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType>({
  userRole: null,
  permissions: [],
  loading: true,
  hasPermission: () => false,
  refreshPermissions: async () => {},
});

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const loadUserPermissions = async () => {
    if (!user || authLoading) {
      setPermissions([]);
      setUserRole(null);
      setLoading(false);
      return;
    }

    try {
      // First, check if the user has a role in the database
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        throw roleError;
      }

      // If no role is found, assign default role
      const role = roleData?.role || 'user';
      setUserRole(role as UserRole);

      // Set permissions based on role
      if (role === 'admin') {
        setPermissions([
          'view_menu',
          'update_preferences',
          'manage_menu',
          'manage_users',
          'view_analytics'
        ]);
      } else {
        setPermissions(['view_menu', 'update_preferences']);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      // Set default permissions
      setPermissions(['view_menu', 'update_preferences']);
      setUserRole('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserPermissions();
  }, [user, authLoading]);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const refreshPermissions = async () => {
    setLoading(true);
    await loadUserPermissions();
  };

  const value = useMemo(() => ({
    userRole,
    permissions,
    loading,
    hasPermission,
    refreshPermissions,
  }), [userRole, permissions, loading]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
} 
