import http from '@/utils/http';
import type { ApiResponse, Privilege } from './types';

/**
 * Fetch all privileges from the backend.
 * Requires ROLE_MANAGEMENT_READ privilege.
 */
export async function fetchAllPrivileges(): Promise<Privilege[]> {
  const response = await http.get<ApiResponse<Privilege[]>>('/api/admin/access-control/privileges');
  return response.data.data;
} 