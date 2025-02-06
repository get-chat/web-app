const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
require('dotenv').config();

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
		},
		fallback: {
			process: require.resolve('process/browser'),
			url: require.resolve('url/'),
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
		new webpack.DefinePlugin({
			'process.env.REACT_APP_LOGO_URL': JSON.stringify(
				process.env.REACT_APP_LOGO_URL
			),
			'process.env.REACT_APP_LOGO_BLACK_URL': JSON.stringify(
				process.env.REACT_APP_LOGO_BLACK_URL
			),
		}),
		new MiniCssExtractPlugin({
			filename: 'static/css/[name].[contenthash:8].css',
		}),
		new HtmlWebpackPlugin({
			title: 'Get.chat',
			template: path.resolve(__dirname, '../public/index.html'),
		}),
	],
};
