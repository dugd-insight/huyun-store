import { AdminLayout } from '@/lib/admin/components'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
