import {
	combineReducers,
	configureStore,
	PreloadedState,
	Reducer,
} from '@reduxjs/toolkit';

import rootReducer from './reducers';
import { resetInboxState } from './reducers/inboxesReducer';

const createReducer = (reducers: typeof rootReducer) => {
	const appReducer = combineReducers(reducers);
	type State = ReturnType<typeof appReducer>;

	// Switching inboxes resets every slice but the inbox list and what
	// belongs to the app rather than to an inbox
	const reducer: Reducer<State> = (state, action) => {
		if (state && resetInboxState.match(action)) {
			const { inboxes, UI } = state;
			return appReducer(
				{
					inboxes,
					UI: {
						...appReducer(undefined, action).UI,
						isReadOnly: UI.isReadOnly,
						isBrowserOffline: UI.isBrowserOffline,
					},
				} as State,
				action
			);
		}
		return appReducer(state, action);
	};
	return reducer;
};

function configureAppStore(preloadedState: PreloadedState<any>) {
	const store = configureStore({
		reducer: createReducer(rootReducer),
		preloadedState,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: false,
			}),
	});

	if (process.env.NODE_ENV !== 'production' && module.hot) {
		// @ts-ignore
		module.hot.accept('./reducers', () =>
			store.replaceReducer(createReducer(rootReducer))
		);
	}

	return store;
}

export const store = configureAppStore({});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
