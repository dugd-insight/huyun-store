import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toast } from '@/components/ui/Toast'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-rice)' }}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toast />
    </div>
  )
}
