module.exports = {
	testEnvironment: 'jsdom',
	moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
	moduleNameMapper: {
		'^@src/(.*)$': '<rootDir>/src/$1',
		'\\.(pcss|less|scss|css|less|scss|sass)$': 'identity-obj-proxy',
		'\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
	},
	transform: {
		'^.+\\.(js|jsx)$': 'babel-jest',
		// `esModuleInterop` is off in tsconfig.json, so `import moment from
		// 'moment'` (and other default imports of CommonJS modules) compiles to
		// `require('moment').default`, which is undefined. The real build does
		// not hit this because babel-loader adds the interop helper; ts-jest
		// needs to be told, otherwise any test touching such a module throws
		// "Cannot read properties of undefined".
		'^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { esModuleInterop: true } }],
	},
	testMatch: ['**/*.(test|spec).(js|jsx|ts|tsx)'],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	transformIgnorePatterns: [
		'/node_modules/(?!(react-use-navigate-list)/)',
		'/node_modules/(?!(react|react-dom|@testing-library)/)',
	],
	// FIX: Ignore Playwright test files so Jest doesn't try to run them
	testPathIgnorePatterns: ['/node_modules/', '/playwright/'],
};
