export class BaseStorage {
    getItem(itemKey) {
        throw new Error('Not implemented.');
    }

    setItem(itemKey, itemValue) {
        throw new Error('Not implemented.');
    }
}