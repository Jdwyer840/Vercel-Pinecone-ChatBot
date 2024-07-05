// next.config.js
const customWebpackConfig = require('./webpack.config.js');

module.exports = {
    webpack: (config, { isServer }) => {
        // Merge the custom webpack config with Next.js's default config
        return {
            ...config,
            plugins: [
                ...config.plugins,
                ...customWebpackConfig.plugins,
            ],
            resolve: {
                ...config.resolve,
                ...customWebpackConfig.resolve,
            },
        };
    },
};
