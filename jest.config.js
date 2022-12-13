module.exports = {
	testEnvironment: 'jsdom',
	moduleFileExtensions: ['js', 'jsx'],
	moduleDirectories: ['node_modules'],
	moduleNameMapper: {
		'^@src/(.*)$': '<rootDir>/src/$1',
		'\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
			'<rootDir>/__mocks__/fileMock.js',
		'\\./recorder/worker': '<rootDir>/__mocks__/workerMock.js',
		'\\.css$': 'identity-obj-proxy',
	},
	transform: {
		'\\.jsx?$': 'babel-jest',
	},
};
