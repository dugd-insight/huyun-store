'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Slide {
  image: string
  badge: string
  title: string
  subtitle?: string
  description: string
  cta: string
  ctaLink: string
}

interface HeroCarouselProps {
  slides: Slide[]
  autoPlayInterval?: number
}

export function HeroCarousel({ slides, autoPlayInterval = 6000 }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const nextSlide = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setTimeout(() => setIsTransitioning(false), 1200)
  }, [slides.length, isTransitioning])

  const prevSlide = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setTimeout(() => setIsTransitioning(false), 1200)
  }, [slides.length, isTransitioning])

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return
    setIsTransitioning(true)
    setCurrentSlide(index)
    setTimeout(() => setIsTransitioning(false), 1200)
  }, [currentSlide, isTransitioning])

  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(nextSlide, autoPlayInterval)
    return () => clearInterval(timer)
  }, [isAutoPlaying, nextSlide, autoPlayInterval])

  const currentSlideData = slides[currentSlide]

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides with Ken Burns Effect */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="hero-slide-image"
            priority={index === 0}
            sizes="100vw"
            quality={90}
          />
          <div className="hero-slide-overlay" />
        </div>
      ))}

      {/* Premium Content with Staggered Animation */}
      <div className="hero-content">
        {/* Badge with decorative lines */}
        <div 
          key={`badge-${currentSlide}`}
          className="hero-badge animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          {currentSlideData.badge}
        </div>
        
        {/* Main Title with calligraphy style */}
        <h1 
          key={`title-${currentSlide}`}
          className="hero-title animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          {currentSlideData.title}
          {currentSlideData.subtitle && (
            <em>{currentSlideData.subtitle}</em>
          )}
        </h1>
        
        {/* Description */}
        <p 
          key={`desc-${currentSlide}`}
          className="hero-subtitle animate-fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          {currentSlideData.description}
        </p>
        
        {/* CTA Buttons */}
        <div 
          key={`cta-${currentSlide}`}
          className="carousel-cta animate-fade-in-up"
          style={{ animationDelay: '0.8s' }}
        >
          <a 
            href={currentSlideData.ctaLink} 
            className="hero-cta"
          >
            {currentSlideData.cta}
          </a>
          <a 
            href="/products" 
            className="hero-cta-secondary"
          >
            浏览全部
          </a>
        </div>
      </div>

      {/* Navigation Arrows with enhanced hover effects */}
      <button
        className="carousel-arrow carousel-arrow-prev"
        onClick={prevSlide}
        aria-label="Previous slide"
        disabled={isTransitioning}
      >
        <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
      </button>
      <button
        className="carousel-arrow carousel-arrow-next"
        onClick={nextSlide}
        aria-label="Next slide"
        disabled={isTransitioning}
      >
        <ChevronRight className="w-6 h-6" strokeWidth={1.5} />
      </button>

      {/* Dots with progress indicator */}
      <div className="carousel-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            disabled={isTransitioning}
          >
            {index === currentSlide && isAutoPlaying && (
              <span 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(var(--color-cinnabar) var(--progress, 0%), transparent var(--progress, 0%))',
                  animation: `progress ${autoPlayInterval}ms linear forwards`,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 z-20 hidden md:flex items-center gap-3 text-white/60 text-sm font-medium tracking-wider">
        <span className="text-white text-lg font-serif">{String(currentSlide + 1).padStart(2, '0')}</span>
        <span className="w-8 h-px bg-white/30"></span>
        <span>{String(slides.length).padStart(2, '0')}</span>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            --progress: 0%;
          }
          to {
            --progress: 100%;
          }
        }
        
        @property --progress {
          syntax: '<percentage>';
          inherits: false;
          initial-value: 0%;
        }
      `}</style>
    </div>
  )
}
