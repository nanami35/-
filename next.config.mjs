/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // 型チェックは `npm run typecheck` / CI で実施する
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
