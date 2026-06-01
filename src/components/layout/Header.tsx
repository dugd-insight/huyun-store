'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingBag, Menu, X, User, Search } from 'lucide-react'
import { CartDrawer } from '@/components/cart/CartDrawer'

export function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const navigation = [
    { name: '首页', href: '/' },
    { name: '作品', href: '/products' },
    { name: '故事', href: '/stories' },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-light text-stone-900 tracking-tight">
                葫韵
              </span>
              <span className="ml-2 text-xs text-stone-500 tracking-widest">
                HUYUN
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <button
                className="p-2 text-stone-600 hover:text-stone-900 transition-colors"
                aria-label="搜索"
              >
                <Search className="h-5 w-5" />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-stone-600 hover:text-stone-900 transition-colors relative"
                aria-label="购物车"
              >
                <ShoppingBag className="h-5 w-5" />
              </button>

              {session ? (
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    href="/account"
                    className="flex items-center space-x-2 text-sm text-stone-600 hover:text-stone-900"
                  >
                    <User className="h-5 w-5" />
                    <span>{session.user?.name || session.user?.email}</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-stone-600 hover:text-stone-900"
                  >
                    退出
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="hidden md:flex items-center space-x-2 text-sm text-stone-600 hover:text-stone-900"
                >
                  <User className="h-5 w-5" />
                  <span>登录</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-stone-600 hover:text-stone-900"
                aria-label="菜单"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-stone-200">
            <div className="px-4 py-4 space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-stone-600 hover:text-stone-900 py-2"
                >
                  {item.name}
                </Link>
              ))}
              {!session && (
                <Link
                  href="/auth/signin"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-stone-600 hover:text-stone-900 py-2"
                >
                  登录
                </Link>
              )}
              {session && (
                <button
                  onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}
                  className="block text-stone-600 hover:text-stone-900 py-2 w-full text-left"
                >
                  退出
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
