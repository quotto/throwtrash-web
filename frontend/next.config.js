/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: { enabled: true }
    },
    turbopack: {
        root: __dirname
    }
};

module.exports = nextConfig;
