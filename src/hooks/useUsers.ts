import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, updateUserRole } from '@/app/actions/users';

export interface User {
  id: string;
  displayName: string;
  pictureUrl: string | null;
  role: 'OPERATOR' | 'DRIVER' | 'ADMIN';
  createdAt: Date;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const result = await getAllUsers();
    if (result.success && result.users) {
      setUsers(result.users as User[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const changeRole = async (userId: string, newRole: 'OPERATOR' | 'DRIVER' | 'ADMIN') => {
    const res = await updateUserRole(userId, newRole);
    if (res.success) {
      await fetchUsers();
      return true;
    }
    return false;
  };

  return {
    users,
    loading,
    refetch: fetchUsers,
    changeRole
  };
}
