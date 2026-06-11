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
		// disableDotRule is required so deep links whose path contains a dot
		// (e.g. BSUID chat ids like /main/chat/US.123456789012345678) fall back
		// to index.html instead of being treated as a static file request.
		historyApiFallback: {
			disableDotRule: true,
		},
		compress: true,
		port: 3000,
		open: true,
	},
});
