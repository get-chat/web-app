class LoginResponse {
	public token: string;

	constructor(data: any) {
		this.token = data.token;
	}
}

export default LoginResponse;
