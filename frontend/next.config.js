/** @type {import('next').NextConfig} */
const frontendStage = process.env.FRONTEND_STAGE || '';
const basePath = frontendStage ? `/${frontendStage}` : '';

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
