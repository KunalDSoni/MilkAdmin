/** @type {import('next').NextConfig} */

// The browser always talks to the Next.js origin; we proxy /bff/* to the
// NestJS API. This keeps a single same-origin surface for the client and
// means the backend's CORS policy (origin:false) never needs to change.
const API_ORIGIN = process.env.API_ORIGIN ?? 'http://localhost:4000';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@moderns-milk/contracts'],
  async rewrites() {
    return [
      {
        source: '/bff/:path*',
        destination: `${API_ORIGIN}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
