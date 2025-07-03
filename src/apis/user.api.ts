import http from '../utils/http';
import type { ApiResponse, PagedData, User, CreateUserRequest, UpdateUserRequest } from './types';

interface GetUsersParams {
  page?: number;
  size?: number;
  search?: string;
  enabled?: boolean;
  roleTextIds?: string;
  sort?: string; // Changed from string[] to string
}

/**
 * Fetches a paginated list of users from the API.
 */
export const getUsersApi = (params?: GetUsersParams) => {
  return http.get<ApiResponse<PagedData<User>>>('/api/admin/users', { params });
};

/**
 * Creates a new user.
 */
export const createUserApi = (data: CreateUserRequest) => {
    return http.post('/api/admin/users', data);
}

/**
 * Updates an existing user.
 */
export const updateUserApi = (userId: string, data: UpdateUserRequest) => {
    return http.put(`/api/admin/users/${userId}`, data);
}

/**
 * Deletes a user by their ID.
 */
export const deleteUserApi = (userId: string) => {
    return http.delete(`/api/admin/users/${userId}`);
}
