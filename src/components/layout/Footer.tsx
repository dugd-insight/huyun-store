import Link from 'next/link'

export function Footer() {
  const footerLinks = {
    shop: [
      { name: '全部作品', href: '/products' },
      { name: '新品上市', href: '/products?sort=newest' },
      { name: '精选推荐', href: '/products?featured=true' },
    ],
    about: [
      { name: '关于我们', href: '/about' },
      { name: '工艺故事', href: '/stories' },
      { name: '联系方式', href: '/contact' },
    ],
    support: [
      { name: '配送说明', href: '/shipping' },
      { name: '退换政策', href: '/returns' },
      { name: '常见问题', href: '/faq' },
    ],
  }

  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-light text-white tracking-tight">
                葫韵
              </span>
              <span className="ml-2 text-xs text-stone-500 tracking-widest">
                HUYUN
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed max-w-sm">
              传承千年葫芦工艺，将东方美学带入现代生活。每一件作品都承载着匠人的心血与智慧。
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="#"
                className="text-stone-400 hover:text-white transition-colors"
                aria-label="微信"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-stone-400 hover:text-white transition-colors"
                aria-label="微博"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.18.573h.014zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.405-.649.388-1.032.428-1.923.008-2.557-.786-1.187-2.936-1.123-5.41-.032 0 0-.775.34-.577-.277.381-1.205.324-2.215-.27-2.8-1.348-1.32-4.93.048-8.01 3.055C1.019 10.729 0 13.347 0 15.565c0 4.247 5.443 6.832 10.766 6.832 6.976 0 11.613-4.053 11.613-7.272 0-1.943-1.64-3.042-3.32-3.476z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-stone-400 hover:text-white transition-colors"
                aria-label="小红书"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14h-9a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-medium mb-4">商店</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="text-white font-medium mb-4">关于</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-medium mb-4">帮助</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} 葫韵 HUYUN. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-sm hover:text-white transition-colors"
            >
              隐私政策
            </Link>
            <Link
              href="/terms"
              className="text-sm hover:text-white transition-colors"
            >
              使用条款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
