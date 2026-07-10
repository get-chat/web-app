export interface Tag {
	id: number;
	name: string;
	web_inbox_color: string;
	tagging_id?: number;
}

export interface CreateTagRequest {
	name: string;
	web_inbox_color: string;
}
