import { ProductForm } from '@/lib/admin/ProductForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  return <ProductForm productId={id} />
}
