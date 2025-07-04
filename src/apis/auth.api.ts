import http from '../utils/http';
import type { AxiosRequestConfig } from 'axios';
import type {
	LoginRequest,
	AuthTokens,
	UserDetailResponse,
	ApiResponse,
    RefreshTokenRequest,
    UpdateUserProfileRequest,
    ChangePasswordRequest,
} from './types';

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
    skipAuthRefresh?: boolean;
}

export const loginApi = (data: LoginRequest) => {
	const payload: LoginRequest = {
		username: data.username,
		password: data.password,
		rememberMe: data.rememberMe,
	};
	const config: ExtendedAxiosRequestConfig = { skipAuthRefresh: true };
	return http.post<ApiResponse<AuthTokens>>('/api/auth/signin', payload, config);
};

export const refreshTokenApi = (data: RefreshTokenRequest) => {
    const config: ExtendedAxiosRequestConfig = { skipAuthRefresh: true };
	return http.post<ApiResponse<AuthTokens>>(
		'/api/auth/refresh',
		data,
		config
	);
};

export const getMeApi = () => {
	return http.get<ApiResponse<UserDetailResponse>>('/api/auth/me');
};

export const updateProfileApi = (data: UpdateUserProfileRequest) => {
    return http.put<ApiResponse<UserDetailResponse>>('/api/auth/me', data);
};

export const changePasswordApi = (data: ChangePasswordRequest) => {
    return http.post<ApiResponse<null>>('/api/auth/change-password', data);
};
