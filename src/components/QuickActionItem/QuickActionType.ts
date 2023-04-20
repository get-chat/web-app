export type QuickActionType = {
	id?: string;
	command: string;
	isStatic: boolean;
	parameters?: (string | undefined)[];
	parameterHint?: string;
	description?: string;
	runCommand?: boolean;
	customActionCommand?: string;
};
