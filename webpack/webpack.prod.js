const path = require('path');
const { merge } = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const commonWebpackConfig = require('./webpack.common.js');
const SentryWebpackPlugin = require("@sentry/webpack-plugin");
const packageJson = require("../package.json");

module.exports = merge(commonWebpackConfig, {
	mode: 'production',
	stats: 'normal',
	devtool: 'source-map',
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
		new SentryWebpackPlugin({
			org: "getchat",
			project: "inbox-frontend",

			// Specify the directory containing build artifacts
			include: path.resolve(__dirname, '../build'),

			// Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
			// and needs the `project:releases` and `org:read` scopes
			authToken: process.env.SENTRY_AUTH_TOKEN,

			// Optionally uncomment the line below to override automatic release name detection
			release: packageJson.version,
		}),
	],
});
