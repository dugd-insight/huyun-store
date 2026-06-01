import { StoryForm } from '@/lib/admin/StoryForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditStoryPage({ params }: PageProps) {
  const { id } = await params
  return <StoryForm storyId={id} />
}
