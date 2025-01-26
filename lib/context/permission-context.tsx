'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/lib/types/auth';

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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadUserPermissions = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        setPermissions([]);
        setUserRole(null);
        return;
      }

      // First get the user's role
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('role_id')
        .eq('id', user.id)
        .single();

      if (userDataError) throw userDataError;

      if (!userData?.role_id) {
        setPermissions([]);
        setUserRole(null);
        return;
      }

      // Then get the role details and permissions
      const { data, error: roleError } = await supabase
        .from('roles')
        .select(`
          name,
          role_permissions!inner (
            permissions!inner (
              name
            )
          )
        `)
        .eq('id', userData.role_id)
        .single();

      if (roleError) throw roleError;

      // Cast the data to unknown first, then to our type
      const roleData = data as unknown as RoleData;
      if (roleData) {
        setUserRole(roleData.name);
        const perms = roleData.role_permissions.map(rp => rp.permissions.name);
        setPermissions(perms);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions([]);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserPermissions();
  }, []);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const refreshPermissions = async () => {
    setLoading(true);
    await loadUserPermissions();
  };

  return (
    <PermissionContext.Provider
      value={{
        userRole,
        permissions,
        loading,
        hasPermission,
        refreshPermissions,
      }}
    >
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
