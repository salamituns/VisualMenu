export type UserRole = 'owner' | 'manager' | 'staff';

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: UserRole;
  description: string;
}

export interface UserWithRole {
  id: string;
  email: string;
  role_id: string;
  role?: Role;
  permissions?: string[];
}

export const PERMISSIONS = {
  MENU: {
    CREATE: 'menu:create',
    READ: 'menu:read',
    UPDATE: 'menu:update',
    DELETE: 'menu:delete',
  },
  ORDERS: {
    CREATE: 'orders:create',
    READ: 'orders:read',
    UPDATE: 'orders:update',
  },
  ANALYTICS: {
    READ: 'analytics:read',
  },
  USERS: {
    MANAGE: 'users:manage',
  },
} as const; 