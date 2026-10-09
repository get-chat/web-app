import { store } from '@src/store';
import {
	advanceLoadingProgress,
	setState,
} from '@src/store/reducers/UIReducer';

describe('Initial load progress', () => {
	const progress = () => store.getState().UI.loadingProgress;

	it('only moves forward', () => {
		store.dispatch(setState({ loadingProgress: 0 }));
		store.dispatch(advanceLoadingProgress(25));
		store.dispatch(advanceLoadingProgress(10));
		expect(progress()).toBe(25);
	});

	it('advances again after a reset (logout and login without a reload)', () => {
		// The previous session finished loading
		store.dispatch(setState({ loadingProgress: 100 }));
		// Main mounts again and resets it
		store.dispatch(setState({ loadingProgress: 0 }));

		store.dispatch(advanceLoadingProgress(10));
		expect(progress()).toBe(10);
		store.dispatch(advanceLoadingProgress(35));
		expect(progress()).toBe(35);
	});
});
