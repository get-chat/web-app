const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const dotenv = require('dotenv');
const fs = require('fs');

// Load `.env` manually from the root
const envPath = path.resolve(__dirname, '../.env');

let envVars = {};
if (fs.existsSync(envPath)) {
	envVars = dotenv.parse(fs.readFileSync(envPath));
}

// Filter only REACT_APP_* vars and stringify them for DefinePlugin
const envKeys = Object.keys(envVars)
	.filter(key => key.startsWith('REACT_APP_'))
	.reduce((acc, key) => {
		acc[`process.env.${key}`] = JSON.stringify(envVars[key]);
		return acc;
	}, {});

module.exports = (isDevelopment) => {
	// In development, styles are injected by style-loader so they can be
	// hot-swapped without a page reload; in production they are extracted
	// to files by MiniCssExtractPlugin.
	const styleLoader = isDevelopment
		? 'style-loader'
		: MiniCssExtractPlugin.loader;

	return {
		mode: 'none',
		entry: path.resolve(__dirname, '../src/index.tsx'),
		output: {
			path: path.resolve(__dirname, '../build'),
			publicPath: '/',
			filename: 'static/js/[name].[contenthash:8].js',
			clean: true,
		},
		resolve: {
			extensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.json'],
			alias: {
				'@src': path.resolve(__dirname, '../src'),
				process: 'process/browser',
			},
			fallback: {
				'process/browser': require.resolve('process/browser'),
				url: require.resolve('url/')
			},
		},
		optimization: {
			runtimeChunk: 'single',
			splitChunks: {
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendors',
						chunks: 'all',
					},
				},
			},
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					// In development, babel additionally applies the React Fast
					// Refresh transform (hot component updates without losing
					// state); options are merged with babel.config.js
					use: isDevelopment
						? [
								{
									loader: 'babel-loader',
									options: { plugins: ['react-refresh/babel'] },
								},
						  ]
						: ['babel-loader'],
					exclude: '/node_modules/',
				},
				{
					test: /\.css$/i,
					use: [
						styleLoader,
						{
							loader: 'css-loader',
							options: {
								url: {
									// Root-relative urls point to files served from the
									// public folder; leave them to the browser instead of
									// resolving them as modules at build time
									filter: (url) => !url.startsWith('/'),
								},
							},
						},
					],
				},
				{
					test: /\.pcss/,
					use: [
						{
							loader: styleLoader,
						},
						{
							loader: 'css-loader',
							options: {
								importLoaders: 1,
								modules: true,
							},
						},
						{
							loader: 'postcss-loader',
						},
					],
				},

				{
					test: /\.modules.css$/i,
					use: [
						styleLoader,
						{
							loader: 'css-loader',
							options: {
								modules: true,
							},
						},
					],
				},
				{
					test: /\.(png|svg|jpg|jpeg|gif)$/i,
					type: 'asset/resource',
				},
				{
					test: /\.(woff|woff2|eot|ttf|otf)$/i,
					type: 'asset/resource',
				},
			],
		},
		plugins: [
			new webpack.ProvidePlugin({
				process: 'process/browser',
			}),
			new webpack.DefinePlugin(envKeys),
			// In production, MiniCssExtractPlugin is added by webpack.prod.js
			...(isDevelopment ? [new ReactRefreshWebpackPlugin()] : []),
			new HtmlWebpackPlugin({
				title: 'Get.chat',
				template: path.resolve(__dirname, '../public/index.html'),
			}),
		],
	};
};
