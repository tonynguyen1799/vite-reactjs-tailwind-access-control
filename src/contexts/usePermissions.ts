import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  // Checks if the user's privileges array includes the specified privilege
  const hasPrivilege = (privilege: string) => {
    return user?.privileges?.includes(privilege) ?? false;
  };

  return { hasPrivilege };
};
