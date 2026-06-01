import Link from 'next/link'
import Image from 'next/image'
import { Story } from '@/types'
import { formatDate } from '@/lib/utils'

interface StoryCardProps {
  story: Story
}

export function StoryCard({ story }: StoryCardProps) {
  const imageUrl = story.image || '/images/placeholder.jpg'

  return (
    <Link href={`/stories/${story.slug}`} className="group block">
      <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden mb-4">
        <Image
          src={imageUrl}
          alt={story.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          {story.author && <span>{story.author}</span>}
          {story.author && story.publishedAt && (
            <span className="w-1 h-1 rounded-full bg-stone-300" />
          )}
          {story.publishedAt && (
            <span>{formatDate(story.publishedAt)}</span>
          )}
        </div>
        <h3 className="text-lg font-medium text-stone-900 group-hover:text-stone-600 transition-colors">
          {story.title}
        </h3>
        {story.excerpt && (
          <p className="text-sm text-stone-600 line-clamp-2">{story.excerpt}</p>
        )}
      </div>
    </Link>
  )
}
