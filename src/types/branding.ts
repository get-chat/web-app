// The branding of the inbox (MT 5.3, backend inbox#1146): the instance's
// before login, the active inbox's after. An empty URL means the app's own.
export interface Branding {
	name: string;
	favicon_url: string;
	logo_url: string;
}
