const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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

module.exports = {
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
				use: ['babel-loader'],
				exclude: '/node_modules/',
			},
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.pcss/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
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
					MiniCssExtractPlugin.loader,
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
		new MiniCssExtractPlugin({
			filename: 'static/css/[name].[contenthash:8].css',
		}),
		new HtmlWebpackPlugin({
			title: 'Get.chat',
			template: path.resolve(__dirname, '../public/index.html'),
		}),
	],
};
