import { BaseStorage } from './BaseStorage';

export class LocalStorage extends BaseStorage {
	getItem(itemKey) {
		return window.localStorage.getItem(itemKey);
	}

	setItem(itemKey, itemValue) {
		window.localStorage.setItem(itemKey, itemValue);
	}

	removeItem(itemKey) {
		window.localStorage.removeItem(itemKey);
	}
}
