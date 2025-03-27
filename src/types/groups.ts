export interface Group {
	id: number;
	name: string;
}

export type GroupList = {
	[key: string]: Group;
};
