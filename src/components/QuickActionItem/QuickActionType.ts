export type QuickActionType = {
	command: string;
	parameters?: (string | undefined)[];
	parameterHint?: string;
	description?: string;
	runCommand?: boolean;
};
