/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // 允许静态导出（Vercel部署不需要，但本地测试有用）
  images: {
    unoptimized: true,
  },
  
  // 优化构建
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 环境变量
  env: {
    NEXT_PUBLIC_APP_NAME: 'EC退货率Dashboard',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
}

module.exports = nextConfig
