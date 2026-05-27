/** @type {import('next').NextConfig} */

// Project is served from https://viveknaskar.github.io/keysmith/ on GitHub Pages,
// so every asset and route must be prefixed with the repo name.
const basePath = process.env.NODE_ENV === 'production' ? '/keysmith' : '';

const nextConfig = {
  output: 'export',
  basePath,
  images: { unoptimized: true },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
