/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    // Lint during builds so generated projects catch issues early.
    dirs: ['src', 'pages', 'app'],
  },
  images: {
    // Keep unoptimized for static export compatibility; consumers who switch
    // to a server runtime should set this to false and add an image loader.
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
