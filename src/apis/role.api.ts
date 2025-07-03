import http from '../utils/http';
import type { ApiResponse, Role } from './types';

/**
 * Fetches a list of all available roles.
 */
export const getRolesApi = () => {
  return http.get<ApiResponse<Role[]>>('/api/admin/access-control/roles');
};
