type DeepMutable<T> = {
	-readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

export function makeMutable<T>(input: T): DeepMutable<T> {
	if (typeof structuredClone === 'function') {
		return structuredClone(input) as DeepMutable<T>;
	}

	// Fallback (unsafe for Date, Map, Set, etc.)
	return JSON.parse(JSON.stringify(input)) as DeepMutable<T>;
}
