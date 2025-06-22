import http from '../utils/http';
// By adding "type", we fix the error.
import type {
	LoginRequest,
	JsonResponseAuthTokens,
	UserDetailResponse,
} from './types';

export const loginApi = (data: LoginRequest) => {
	return http.post<JsonResponseAuthTokens>('/api/auth/signin', data);
};

export const getMeApi = () => {
	// Assuming a generic JsonResponse wrapper from your YAML for the 'me' endpoint
	return http.get<{ code: number; message: string; data: UserDetailResponse }>(
		'/api/auth/me'
	);
};