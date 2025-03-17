export interface SavedResponse {
	id: number;
	text: string;
	created_by: number;
	timestamp: number;
}

export interface SavedResponsesResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: SavedResponse[];
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
