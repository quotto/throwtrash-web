/** @type {import('next').NextConfig} */
const frontStage = process.env.FRONT_STAGE || '';
const basePath = frontStage ? `/${frontStage}` : '';

const nextConfig = {
    output: 'export',
    basePath,
    assetPrefix: basePath || undefined,
    trailingSlash: true,
    experimental: {},
    turbopack: {
        root: __dirname
    }
};

module.exports = nextConfig;
