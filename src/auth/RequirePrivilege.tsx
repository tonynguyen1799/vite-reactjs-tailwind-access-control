import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '../contexts/usePermissions';

interface RequirePrivilegeProps {
  allowedPrivileges: string[];
}

export default function RequirePrivilege({ allowedPrivileges }: RequirePrivilegeProps) {
  const { hasPrivilege } = usePermissions();

  // Check if the user has at least one of the allowed privileges
  const isAuthorized = allowedPrivileges.some((privilege) => hasPrivilege(privilege));

  if (!isAuthorized) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}
