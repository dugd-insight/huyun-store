'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Slide {
  image: string
  badge: string
  title: string
  subtitle: string
  cta: string
  ctaLink: string
}

interface HeroCarouselProps {
  slides: Slide[]
  autoPlayInterval?: number
}

export function HeroCarousel({ slides, autoPlayInterval = 5000 }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(nextSlide, autoPlayInterval)
    return () => clearInterval(timer)
  }, [isAutoPlaying, nextSlide, autoPlayInterval])

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides */}
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
          />
          <div className="hero-slide-overlay" />
        </div>
      ))}

      {/* Content */}
      <div className="hero-content">
        <div className="hero-badge">{slides[currentSlide].badge}</div>
        <h1 className="hero-title">{slides[currentSlide].title}</h1>
        <p className="hero-subtitle">{slides[currentSlide].subtitle}</p>
        <a href={slides[currentSlide].ctaLink} className="hero-cta">
          {slides[currentSlide].cta}
        </a>
      </div>

      {/* Navigation Arrows */}
      <button
        className="carousel-arrow carousel-arrow-prev"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        className="carousel-arrow carousel-arrow-next"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="carousel-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
