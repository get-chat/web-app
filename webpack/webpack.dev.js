const path = require('path');
const { merge } = require('webpack-merge');
const commonWebpackConfig = require('./webpack.common.js');

module.exports = merge(commonWebpackConfig, {
	mode: 'development',
	stats: 'errors-warnings',
	devtool: 'inline-source-map',
	devServer: {
		allowedHosts: ['*'],
		static: {
			directory: path.resolve(__dirname, '../public'),
		},
		historyApiFallback: true,
		compress: true,
		port: 3000,
		open: true,
	},
});
