export interface LoginRequest {
	username: string;
	password: string;
	rememberMe?: boolean;
}

export interface AuthTokens {
	token: string;
	refreshToken: string;
	type: string;
}

export interface JsonResponseAuthTokens {
	code: number;
	message: string;
	data: AuthTokens;
}

export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export interface RefreshTokenRequest {
	refreshToken: string;
}

export interface UserDetailResponse {
	textId: string;
	username: string;
	email: string;
	enabled: boolean;
	roles: string[];
}

export interface Pagination<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	size: number;
	number: number;
}

export interface CreateUserRequest {
	username: string;
	email: string;
	password: string;

	roleTextIds: string[];
}

export interface UpdateUserRolesRequest {
	roleTextIds: string[];
}

export interface UpdateUserStatusRequest {
	enabled: boolean;
}

export interface PrivilegeResponse {
	name: string;
	description: string;
}

export interface RoleResponse {
	textId: string;
	name: string;
	privileges: string[];
}

export interface CreateRoleRequest {
	name: string;
}

export interface UpdateRoleRequest {
	name: string;
	privileges: string[];
}