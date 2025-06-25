module.exports = {
	testEnvironment: 'jsdom',
	moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
	moduleNameMapper: {
		'^react$': '<rootDir>/node_modules/react',
		'^react-dom$': '<rootDir>/node_modules/react-dom',
		'^@src/(.*)$': '<rootDir>/src/$1',
		'\\.(pcss|less|scss|css|less|scss|sass)$': 'identity-obj-proxy',
		'\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
	},
	transform: {
		'^.+\\.(js|jsx)$': 'babel-jest',
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
	testMatch: [
		'**/*.(test|spec).(js|jsx|ts|tsx)'
	],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	transformIgnorePatterns: [
		'/node_modules/(?!(react|react-dom|@testing-library)/)',
	],
};
