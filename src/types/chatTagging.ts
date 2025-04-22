export interface CreateChatTaggingRequest {
	tag: number;
	chat: string;
}

export interface CreateChatTaggingResponse {
	id: number;
	tag: number;
	chat: string;
}
