import { BaseStorage } from './BaseStorage';

export class LocalStorage extends BaseStorage {
	getItem(itemKey: string) {
		return window.localStorage.getItem(itemKey);
	}

	setItem(itemKey: string, itemValue: string) {
		window.localStorage.setItem(itemKey, itemValue);
	}

	removeItem(itemKey: string) {
		window.localStorage.removeItem(itemKey);
	}
}
