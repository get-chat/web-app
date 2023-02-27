module.exports = {
	parser: require('postcss-safe-parser'),
	plugins: [
		require('postcss-preset-env')({ stage: 0 }),
		require('postcss-nested'),
		require('autoprefixer'),
	],
};
