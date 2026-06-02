'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { StoryModal } from '@/components/ui/StoryModal'

const stories = [
  {
    id: '1',
    title: '熊猫酒葫芦',
    image: '/images/story-panda-wine-gourd.jpg',
    excerpt: '国宝熊猫与葫芦酒器的奇妙结合，展现中华文化的独特魅力。熊猫酒葫芦以精选天然葫芦为载体，经过匠人的精心设计和雕刻，将憨态可掬的熊猫形象栩栩如生地呈现在葫芦之上。',
    content: '<p>在中国传统文化中，葫芦一直被视为吉祥的象征。而熊猫作为国宝，更是中华文化的代表。当这两种元素巧妙结合，便诞生了独特的熊猫酒葫芦。</p><p>熊猫酒葫芦以精选天然葫芦为载体，经过匠人的精心设计和雕刻，将憨态可掬的熊猫形象栩栩如生地呈现在葫芦之上。每一个细节都经过反复推敲，力求完美。</p><p>这种独特的工艺品不仅具有实用价值，更是一件值得收藏的艺术品。它承载着匠人对传统文化的理解与创新，展现了中华工艺的博大精深。</p>',
    author: '葫韵工作室',
  },
  {
    id: '2',
    title: '诗仙李白',
    image: '/images/story-li-bai.jpg',
    excerpt: '诗仙李白与葫芦的千年情缘，酒中仙人的浪漫传说。李白常常腰挂葫芦，骑驴漫游天下，取葫芦饮酒，挥毫泼墨留下千古名篇。',
    content: '<p>李白，字太白，号青莲居士，被誉为"诗仙"。他一生嗜酒如命，而葫芦便是他最钟爱的酒器。</p><p>据传，李白常常腰挂葫芦，骑驴漫游天下。每至一处，便取葫芦饮酒，酒兴大发时便挥毫泼墨，留下千古名篇。葫芦之于李白，不仅是酒器，更是他自由不羁精神的象征。</p><p>在我们的葫芦工艺品中，匠人们以精湛的烙画技艺，将李白醉酒吟诗的场景刻画在葫芦之上，让千年前的浪漫在葫芦上重现。</p>',
    author: '葫韵工作室',
  },
  {
    id: '3',
    title: '武松打虎',
    image: '/images/story-wu-song.jpg',
    excerpt: '水浒英雄武松的经典故事，在葫芦上演绎传奇。匠人们以雕刻和彩绘相结合的技法，将武松打虎的精彩瞬间凝固在葫芦之上。',
    content: '<p>《水浒传》中武松打虎的故事家喻户晓。武松在景阳冈上赤手空拳打死猛虎的壮举，展现了中华民族勇武不屈的精神。</p><p>匠人们以雕刻和彩绘相结合的技法，将武松打虎的精彩瞬间凝固在葫芦之上。武松的英姿、猛虎的凶猛，都在方寸之间得到了完美的呈现。</p><p>这件作品不仅是对经典文学作品的致敬，更是对中华传统工艺的一次精彩演绎。</p>',
    author: '葫韵工作室',
  },
  {
    id: '4',
    title: '八仙传说',
    image: '/images/story-eight-immortals.jpg',
    excerpt: '八仙过海各显神通，葫芦承载着仙人的法力与智慧。铁拐李的葫芦中装有灵丹妙药，能治百病、起死回生。',
    content: '<p>八仙是中国神话传说中的八位仙人，他们各自拥有独特的法器和神通。其中，铁拐李的葫芦尤为著名——这个看似普通的葫芦，却蕴含着无穷的法力。</p><p>传说铁拐李的葫芦中装有灵丹妙药，能治百病、起死回生。在民间信仰中，葫芦也因此成为了消灾祛病、保佑平安的吉祥物。</p><p>我们的八仙系列葫芦工艺品，以八仙为主题，运用多种传统工艺技法，将八仙的形象和故事生动地呈现在葫芦之上。</p>',
    author: '葫韵工作室',
  },
  {
    id: '5',
    title: '纣王酒池',
    image: '/images/story-zhou-xin.jpg',
    excerpt: '商纣王酒池肉林的奢靡传说，葫芦见证千年兴衰。早在新石器时代，葫芦就已经被用作酒器和水器。',
    content: '<p>商朝末年，纣王沉迷酒色，以葫芦为酒器，建造了著名的"酒池肉林"。这段历史虽然以亡国告终，却也让葫芦作为酒器的历史更加悠久。</p><p>据考古发现，早在新石器时代，葫芦就已经被用作酒器和水器。在中国数千年的饮酒文化中，葫芦始终扮演着重要的角色。</p><p>我们的酒葫芦系列，正是对这一悠久历史的致敬。每一个酒葫芦都经过严格的选材和精湛的工艺制作，既是对传统的传承，也是对品质的坚持。</p>',
    author: '葫韵工作室',
  },
]

export default function StoriesPage() {
  const [selectedStory, setSelectedStory] = useState<typeof stories[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openStoryModal = (story: typeof stories[0]) => {
    setSelectedStory(story)
    setIsModalOpen(true)
  }

  const featuredStory = stories[4] // 纣王酒池
  const regularStories = stories.slice(0, 4)

  return (
    <div style={{ background: 'var(--color-rice)' }}>
      {/* Page Header */}
      <div className="py-12 md:py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-parchment)' }}>
        <div className="max-w-[1280px] mx-auto text-center">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[var(--color-ink)] mb-3">
            葫芦故事
          </h1>
          <p className="text-sm text-[var(--color-ink)] opacity-60 max-w-lg mx-auto">
            每一个葫芦背后都有一个故事，每一段故事都承载着文化的传承
          </p>
        </div>
      </div>

      {/* Featured Story */}
      <div className="py-12 md:py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-ink)' }}>
        <div className="max-w-[1280px] mx-auto">
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center cursor-pointer"
            onClick={() => openStoryModal(featuredStory)}
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={featuredStory.image}
                alt={featuredStory.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-gold)]">
                精选故事
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white mt-2 mb-4">
                {featuredStory.title}
              </h2>
              <p className="text-sm text-white/70 leading-relaxed mb-6">
                {featuredStory.excerpt}
              </p>
              <span className="inline-flex items-center gap-1 text-sm text-[var(--color-cinnabar-light)] hover:text-white transition-colors">
                阅读全文
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-[var(--color-ink)] mb-8">
            更多故事
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {regularStories.map((story) => (
              <div
                key={story.id}
                className="story-card cursor-pointer"
                onClick={() => openStoryModal(story)}
              >
                <div className="story-card-image-wrapper">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="story-card-image"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="story-card-overlay">
                    <h3 className="story-card-title">{story.title}</h3>
                    <p className="story-card-excerpt">{story.excerpt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Modal */}
      <StoryModal
        story={selectedStory}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
