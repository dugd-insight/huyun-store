'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Menu, X, ChevronDown } from 'lucide-react'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { type Locale } from '@/i18n/config'

const navigation = [
  { name: '首页', href: '/' },
  {
    name: '工艺分类',
    href: '/products',
    dropdown: [
      { name: '烙画葫芦', href: '/products?category=pyrography' },
      { name: '雕刻葫芦', href: '/products?category=carved' },
      { name: '彩绘葫芦', href: '/products?category=painted' },
      { name: '素葫芦', href: '/products?category=natural' },
      { name: '葫芦茶具', href: '/products?category=teaset' },
    ],
  },
  { name: '精选作品', href: '/products' },
  {
    name: '葫芦故事',
    href: '/stories',
    dropdown: [
      { name: '熊猫酒葫芦', href: '/stories/panda-wine-gourd' },
      { name: '诗仙李白', href: '/stories/li-bai' },
      { name: '武松打虎', href: '/stories/wu-song' },
      { name: '八仙传说', href: '/stories/eight-immortals' },
      { name: '纣王酒池', href: '/stories/zhou-xin' },
    ],
  },
  { name: '匠心传承', href: '/#heritage' },
  { name: '聊城之源', href: '/#origin' },
  { name: '联系我们', href: '/#footer' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [locale, setLocale] = useState<Locale>('zh')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          isScrolled ? 'nav-solid' : 'nav-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 md:h-22">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 nav-brand group">
              <span
                className="w-11 h-11 flex items-center justify-center text-white font-calligraphy text-xl font-normal rounded-full transition-all duration-300 group-hover:scale-105 group-hover:rotate-3"
                style={{
                  background: 'linear-gradient(135deg, var(--color-cinnabar) 0%, var(--color-cinnabar-dark) 100%)',
                  boxShadow: '0 4px 15px rgba(156, 42, 42, 0.25)',
                }}
              >
                葫
              </span>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-semibold tracking-wide nav-brand">
                  葫韵
                </span>
                <span
                  className="text-[0.5rem] tracking-[0.3em] uppercase nav-brand"
                  style={{ opacity: 0.7 }}
                >
                  HUYUN
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setOpenDropdown(item.name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="nav-link px-4 py-2.5 text-sm tracking-wider transition-all duration-300 flex items-center gap-1 relative"
                  >
                    {item.name}
                    {item.dropdown && (
                      <ChevronDown className="w-3 h-3 opacity-60 transition-transform duration-300" />
                    )}
                    {/* Hover underline effect */}
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[var(--color-cinnabar)] transition-all duration-300 -translate-x-1/2 group-hover:w-full" />
                  </Link>

                  {/* Premium Dropdown */}
                  {item.dropdown && openDropdown === item.name && (
                    <div className="absolute top-full left-0 mt-2 bg-white/98 border border-[var(--color-cloud)] shadow-xl rounded-xl py-3 min-w-[200px] animate-slide-in-down backdrop-blur-xl">
                      {item.dropdown.map((sub, idx) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="block px-5 py-2.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-cinnabar-muted)] hover:text-[var(--color-cinnabar)] transition-all duration-200 relative"
                          style={{ 
                            animationDelay: `${idx * 0.05}s`,
                            animation: 'fadeInUp 0.3s ease-out forwards'
                          }}
                        >
                          {/* Left accent line */}
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 group-hover:h-4 bg-[var(--color-cinnabar)] transition-all duration-300 rounded-r" />
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Language Switcher */}
              <div className="hidden md:block">
                <LanguageSwitcher currentLocale={locale} onLocaleChange={setLocale} />
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 nav-cart-icon transition-all duration-300 hover:bg-white/10 rounded-full"
                aria-label="购物车"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[var(--color-cinnabar)] text-white text-[0.625rem] flex items-center justify-center rounded-full font-semibold shadow-md">
                  0
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 nav-cart-icon transition-all duration-300 hover:bg-white/10 rounded-full"
                aria-label="菜单"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Premium Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/98 border-t border-[var(--color-cloud)] animate-slide-in-down backdrop-blur-xl">
            <div className="max-w-[1400px] mx-auto px-4 py-5 space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3.5 px-3 text-sm text-[var(--color-ink)] hover:text-[var(--color-cinnabar)] hover:bg-[var(--color-cinnabar-muted)] transition-all duration-200 tracking-wider rounded-lg"
                  >
                    {item.name}
                  </Link>
                  {item.dropdown && (
                    <div className="pl-5 space-y-1 mt-1">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="block py-2.5 px-3 text-sm text-[var(--color-ink)] opacity-70 hover:opacity-100 hover:text-[var(--color-cinnabar)] transition-all duration-200 rounded-md hover:bg-[var(--color-cinnabar-muted)]"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {/* Mobile Language Switcher */}
              <div className="pt-4 mt-3 border-t border-[var(--color-cloud)]">
                <LanguageSwitcher currentLocale={locale} onLocaleChange={setLocale} />
              </div>
            </div>
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
