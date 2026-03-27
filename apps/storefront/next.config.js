/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.storage.yandexcloud.net',
      },
    ],
  },
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  },
  // Отключаем статическую генерацию для страниц с client components
  output: 'standalone',
};

export default nextConfig;
