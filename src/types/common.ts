export interface ApiResponse<T> {
	status: number;
	data: T;
}

export interface PaginatedResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

export interface EmptyResponse {}
