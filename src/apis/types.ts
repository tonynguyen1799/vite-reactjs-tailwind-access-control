// =================================================================
// Generic API Response Wrapper
// =================================================================
export interface ApiResponse<T> {
	status: number;
	message: string;
	data: T;
  }
  
  export interface PagedData<T> {
	  content: T[];
	  pageNumber: number;
	  pageSize: number;
	  totalElements: number;
	  totalPages: number;
	  isLast: boolean;
  }
  
  
  // =================================================================
  // Authentication (/api/auth)
  // =================================================================
  export interface LoginRequest {
	  username: string;
	  password: string;
	  rememberMe?: boolean;
  }
  
  export interface AuthTokens {
	  token: string;
	  refreshToken: string;
	  type: "Bearer";
  }
  
  export interface RefreshTokenRequest {
	  refreshToken: string;
  }
  
  export interface ChangePasswordRequest {
	  currentPassword: string;
	  newPassword: string;
	  confirmPassword: string;
  }
  
  // Represents the nested profile object
  export interface UserProfile {
	  firstName: string | null;
	  lastName: string | null;
	  dateOfBirth: string | null;
	  gender: "MALE" | "FEMALE" | "PREFER_NOT_TO_SAY" | "OTHER" | null;
	  phoneNumber: string | null;
	  address: string | null;
	  avatarUrl: string | null;
	  timeZone: string | null;
	  locale: string | null;
  }
  
  // From the /api/auth/me endpoint response
  export interface UserDetailResponse {
	  textId: string;
	  username: string;
	  email: string;
	  enabled: boolean;
	  roles: string[];
	  privileges: string[]; // This is the correct field for permissions
	  profile: UserProfile;
	  createdAt: number;
	  createdBy: string;
	  updatedAt?: number;
	  updatedBy?: string;
  }
  
  
  // =================================================================
  // Users (/api/admin/users)
  // =================================================================
  export interface User {
	textId: string;
	username: string;
	email: string;
	enabled: boolean;
	roles: string[];
	privileges: string[];
	createdAt: number;
	createdBy: string;
	updatedAt?: number;
	updatedBy?: string;
	avatar?: string; // Keep avatar optional for frontend use
  }
  
  export interface CreateUserRequest {
	  username: string;
	  email: string;
	  roleTextIds: string[];
  }
  
  export interface UpdateUserRequest {
	  enabled: boolean;
	  roleTextIds: string[];
  }
  
  
  // =================================================================
  // Roles (/api/admin/access-control/roles)
  // =================================================================
  export interface Role {
	  textId: string;
	  name: string;
	  description?: string;
	  privileges: string[];
  }
  
  export interface CreateRoleRequest {
	  name: string;
	  description?: string;
  }
  
  export interface UpdateRoleRequest {
	  name: string;
	  description?: string;
	  privileges: string[];
  }
  
  // =================================================================
  // Privileges
  // =================================================================
  export interface Privilege {
	  name: string;
	  description: string;
  }
  