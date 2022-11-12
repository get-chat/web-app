const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	entry: './src/index.js',
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, '../build'),
		clean: true,
	},
	resolve: {
		extensions: ['.js', '.jsx', '.css', '.json'],
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
				use: ['style-loader', 'css-loader'],
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
		new HtmlWebpackPlugin({
			title: 'Output Management',
			template: path.resolve(__dirname, '../public/index.html'),
		}),
	],
	devServer: {
		static: {
			directory: path.resolve(__dirname, '../public'),
		},
		historyApiFallback: true,
		compress: true,
		port: 9000,
		open: true,
	},
};
