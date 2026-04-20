/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      '/api/openers': ['./prompts/**/*'],
    },
  },
};

module.exports = nextConfig;
