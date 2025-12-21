/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    experimental: {},
    turbopack: {
        root: __dirname
    }
};

module.exports = nextConfig;
