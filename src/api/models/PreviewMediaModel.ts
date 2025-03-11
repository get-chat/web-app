class PreviewMediaModel {
	public senderName: string | undefined;
	public initials: string | undefined;
	public type: string | undefined;
	public source: string | undefined;
	public timestamp: number;

	constructor(
		senderName: string | undefined,
		initials: string | undefined,
		type: string | undefined,
		source: string | undefined,
		timestamp: number
	) {
		this.senderName = senderName;
		this.initials = initials;
		this.type = type;
		this.source = source;
		this.timestamp = timestamp;
	}
}

export default PreviewMediaModel;
