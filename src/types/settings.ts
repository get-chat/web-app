export interface BusinessProfileSettings {
	address: string | null;
	description: string | null;
	email: string | null;
	vertical: string | null;
	websites: string[];
}

export interface PartialUpdateBusinessProfileSettings {
	address: string | null;
	description: string | null;
	email: string | null;
	vertical: string | null;
	websites: string[];
}

export interface ProfileAboutResponse {
	settings: {
		profile?: {
			about?: {
				text: string | null;
			};
		};
	};
}

export interface UpdateProfileAboutRequest {
	text: string | null;
}
