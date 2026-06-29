import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */

// The browser always talks to the Next.js origin; we proxy /bff/* to the
// NestJS API. This keeps a single same-origin surface for the client and
// means the backend's CORS policy (origin:false) never needs to change.
const API_ORIGIN = process.env.API_ORIGIN ?? 'http://localhost:4000';

const nextConfig = {
  reactStrictMode: true,
  // Hide the Next.js dev-tools indicator (the "N" badge) in the bottom corner.
  devIndicators: false,
  transpilePackages: ['@moderns-milk/contracts'],
  // Self-contained server bundle for Docker/Node hosts. Ignored by Vercel.
  output: 'standalone',
  // Trace files from the monorepo root so workspace deps are bundled.
  outputFileTracingRoot: path.join(__dirname, '../../'),
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
