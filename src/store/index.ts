import { configureStore, PreloadedState } from '@reduxjs/toolkit';

import rootReducer from './reducers';

function configureAppStore(preloadedState: PreloadedState<any>) {
	const store = configureStore({
		reducer: rootReducer,
		preloadedState,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: false,
			}),
	});

	if (process.env.NODE_ENV !== 'production' && module.hot) {
		// @ts-ignore
		module.hot.accept('./reducers', () => store.replaceReducer(rootReducer));
	}

	return store;
}

export const store = configureAppStore({});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
