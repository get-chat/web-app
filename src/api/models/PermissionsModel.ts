class PermissionsModel {
	public canUseTags: boolean;
	public canReadChats: string;
	public canWriteToChats: string;

	constructor(data: any) {
		this.canUseTags = data.can_use_tags;
		this.canReadChats = data.can_read_chats;
		this.canWriteToChats = data.can_write_to_chats;
	}
}

export default PermissionsModel;
