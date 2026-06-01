import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'

export const metadata: Metadata = {
  title: '葫韵 HUYUN - 传统葫芦工艺品',
  description: '传承千年葫芦工艺，将东方美学带入现代生活',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
