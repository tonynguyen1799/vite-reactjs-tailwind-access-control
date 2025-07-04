import http from '../utils/http';
import type { ApiResponse, Role, Privilege, CreateRoleRequest, UpdateRoleRequest } from './types';

/**
 * Fetches a list of all available roles.
 */
export const getRolesApi = () => {
  return http.get<ApiResponse<Role[]>>('/api/admin/access-control/roles');
};

/**
 * Fetches a list of all available privileges.
 */
export const getPrivilegesApi = () => {
    return http.get<ApiResponse<Privilege[]>>('/api/admin/access-control/privileges');
};

/**
 * Creates a new role.
 */
export const createRoleApi = (data: CreateRoleRequest) => {
    return http.post<ApiResponse<Role>>('/api/admin/access-control/roles', data);
};

/**
 * Updates an existing role.
 */
export const updateRoleApi = (roleId: string, data: UpdateRoleRequest) => {
    return http.put<ApiResponse<Role>>(`/api/admin/access-control/roles/${roleId}`, data);
};

/**
 * Deletes a role by its ID.
 */
export const deleteRoleApi = (roleId: string) => {
    return http.delete<ApiResponse<null>>(`/api/admin/access-control/roles/${roleId}`);
};
