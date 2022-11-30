const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	mode: 'none',
	entry: path.resolve(__dirname, '../src/index.js'),
	output: {
		path: path.resolve(__dirname, '../build'),
		filename: '[name].[contenthash:8].js',
		clean: true,
	},
	resolve: {
		extensions: ['.js', '.jsx', '.css', '.json'],
		alias: {
			'@src': path.resolve(__dirname, '../src'),
		},
		fallback: { "url": require.resolve("url/") }
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
				test: /\.jsx?$/,
				use: ['babel-loader'],
				exclude: '/node_modules/',
			},
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
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
		new webpack.DefinePlugin({
			'process.env.REACT_APP_LOGO_URL': JSON.stringify(
				process.env.REACT_APP_LOGO_URL
			),
			'process.env.REACT_APP_LOGO_BLACK_URL': JSON.stringify(
				process.env.REACT_APP_LOGO_BLACK_URL
			),
		}),
		new MiniCssExtractPlugin(),
		new HtmlWebpackPlugin({
			title: 'Get.chat',
			template: path.resolve(__dirname, '../public/index.html'),
		}),
	],
};
