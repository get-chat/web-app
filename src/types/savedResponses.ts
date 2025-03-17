export interface SavedResponse {
	id: number;
	text: string;
	created_by: number;
	timestamp: number;
}

export interface CreateSavedResponseRequest {
	text: string;
}

export interface CreateSavedResponseResponse {
	id: number;
	text: string;
	created_by: number;
	timestamp: number;
}
