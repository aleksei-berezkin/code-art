const base = require('./webpack.config');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    ...base,
    plugins: [
        ...base.plugins,
        new BundleAnalyzerPlugin(),
    ],
};
