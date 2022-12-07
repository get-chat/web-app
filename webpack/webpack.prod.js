const path = require('path');
const { merge } = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const commonWebpackConfig = require('./webpack.common.js');

module.exports = merge(commonWebpackConfig, {
	mode: 'production',
	stats: 'normal',
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'static/css/[name].[contenthash:8].css',
		}),
		new CopyPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, '../public'),
					to: path.resolve(__dirname, '../build'),
					globOptions: {
						ignore: ['**/index.html'],
					},
				},
			],
		}),
	],
});
