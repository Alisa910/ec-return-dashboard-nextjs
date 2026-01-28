import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EC OR Return Dashboard',
  description: '电商渠道退货率YOY对比分析系统 - 2025 vs 2024',
  keywords: ['退货率', 'YOY', '电商分析', 'Dashboard', 'MLB', 'Discovery'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
