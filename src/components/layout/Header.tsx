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
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled ? 'nav-solid' : 'nav-transparent'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 nav-brand">
              <span
                className="w-9 h-9 flex items-center justify-center text-white font-serif text-lg font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--color-cinnabar) 0%, var(--color-cinnabar-dark) 100%)',
                }}
              >
                葫
              </span>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-semibold tracking-wide nav-brand">
                  葫韵
                </span>
                <span
                  className="text-[0.5625rem] tracking-[0.25em] uppercase nav-brand"
                  style={{ opacity: 0.6 }}
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
                    className="nav-link px-3 py-2 text-sm tracking-wider transition-colors flex items-center gap-1"
                  >
                    {item.name}
                    {item.dropdown && (
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    )}
                  </Link>

                  {/* Dropdown */}
                  {item.dropdown && openDropdown === item.name && (
                    <div className="absolute top-full left-0 mt-0 bg-white border border-[var(--color-cloud)] shadow-lg py-2 min-w-[180px] animate-slide-in-down">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="block px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-parchment)] hover:text-[var(--color-cinnabar)] transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <div className="hidden md:block">
                <LanguageSwitcher currentLocale={locale} onLocaleChange={setLocale} />
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 nav-cart-icon transition-colors"
                aria-label="购物车"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--color-cinnabar)] text-white text-[0.5625rem] flex items-center justify-center rounded-full font-medium">
                  0
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 nav-cart-icon transition-colors"
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[var(--color-cloud)] animate-slide-in-down">
            <div className="max-w-[1280px] mx-auto px-4 py-4 space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 px-2 text-sm text-[var(--color-ink)] hover:text-[var(--color-cinnabar)] transition-colors tracking-wider"
                  >
                    {item.name}
                  </Link>
                  {item.dropdown && (
                    <div className="pl-4 space-y-1">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="block py-2 px-2 text-sm text-[var(--color-ink)] opacity-70 hover:opacity-100 hover:text-[var(--color-cinnabar)] transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {/* Mobile Language Switcher */}
              <div className="pt-4 border-t border-[var(--color-cloud)]">
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
