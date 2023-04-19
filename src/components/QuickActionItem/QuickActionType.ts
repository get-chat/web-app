export type QuickActionType = {
	command: string;
	isStatic: boolean;
	parameters?: (string | undefined)[];
	parameterHint?: string;
	description?: string;
	runCommand?: boolean;
};
