export class BaseStorage {
	getItem(itemKey: string) {
		throw new Error('Not implemented.');
	}

	setItem(itemKey: string, itemValue: string) {
		throw new Error('Not implemented.');
	}

	removeItem(itemKey: string) {
		throw new Error('Not implemented.');
	}
}
