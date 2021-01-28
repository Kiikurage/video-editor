const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const renderer = {
    cache: true,
    target: 'electron-renderer',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: {
        renderer: path.resolve(__dirname, './src/renderer.tsx'),
    },
    output: {
        path: path.resolve(__dirname, './build'),
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        modules: [path.resolve(__dirname, './,src'), path.resolve(__dirname, './node_modules')],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [{ loader: 'babel-loader' }],
            },
            {
                test: /\.svg$/,
                use: [
                    { loader: 'babel-loader' },
                    {
                        loader: 'react-svg-loader',
                        options: {
                            jsx: true,
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpg|jpeg|gif|ico)$/,
                use: [{ loader: 'file-loader' }],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/static/index.html'),
        }),
        new ForkTsCheckerWebpackPlugin(),
    ],
};

module.exports = renderer;
