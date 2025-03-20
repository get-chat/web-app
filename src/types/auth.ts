export interface LoginRequest {
	username: string;
	password: string;
}

export interface LoginResponse {
	token: string;
}

export interface ChangePasswordRequest {
	current_password: string;
	new_password: string;
}

export interface ConvertRefreshTokenRequest {
	refresh_token: string;
	keep_refresh_token: boolean;
}

export interface ConvertRefreshTokenResponse {
	token: string;
}
