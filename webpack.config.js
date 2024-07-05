const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    // your existing webpack config
    resolve: {
        fallback: {
            "url": require.resolve("url/"),
            // add other Node.js core modules here if needed
        }
    },
    plugins: [
        new NodePolyfillPlugin(),
        new webpack.IgnorePlugin({
            resourceRegExp: /^node:/,
        }),
        // other plugins
    ]
};
