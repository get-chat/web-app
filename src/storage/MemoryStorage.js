import {BaseStorage} from "./BaseStorage";

export class MemoryStorage extends BaseStorage {
    getItem(itemKey) {
        return window.customStorage?.[itemKey];
    }

    setItem(itemKey, itemValue) {
        if (window.customStorage === undefined) {
            window.customStorage = [];
        }

        window.customStorage[itemKey] = itemValue;
    }

    removeItem(itemKey) {
        delete window.customStorage?.[itemKey];
    }
}