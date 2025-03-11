import { BaseStorage } from './BaseStorage';

export class MemoryStorage extends BaseStorage {
	getItem(itemKey: string) {
		return window.customStorage?.[itemKey];
	}

	setItem(itemKey: string, itemValue: string) {
		if (window.customStorage === undefined) {
			window.customStorage = {};
		}

		window.customStorage[itemKey] = itemValue;
	}

	removeItem(itemKey: string) {
		delete window.customStorage?.[itemKey];
	}
}
