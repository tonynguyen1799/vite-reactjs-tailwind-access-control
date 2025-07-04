import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPrivilege = (privilege: string) => {
    return user?.privileges?.includes(privilege) ?? false;
  };

  return { hasPrivilege };
};
