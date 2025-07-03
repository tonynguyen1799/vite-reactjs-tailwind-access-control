import http from '../utils/http';
import type { AxiosRequestConfig } from 'axios';
import type {
	LoginRequest,
	AuthTokens,
	UserDetailResponse,
	ApiResponse,
    RefreshTokenRequest,
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
    // Use the extended config type for this request
	const config: ExtendedAxiosRequestConfig = { skipAuthRefresh: true };
	return http.post<ApiResponse<AuthTokens>>('/api/auth/signin', payload, config);
};

export const refreshTokenApi = (data: RefreshTokenRequest) => {
    // Use the extended config type for this request
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
