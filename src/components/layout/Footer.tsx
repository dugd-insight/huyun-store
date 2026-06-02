import Link from 'next/link'

const footerCategories = [
  { name: '烙画葫芦', href: '/products?category=pyrography' },
  { name: '雕刻葫芦', href: '/products?category=carved' },
  { name: '彩绘葫芦', href: '/products?category=painted' },
  { name: '素葫芦', href: '/products?category=natural' },
  { name: '葫芦茶具', href: '/products?category=teaset' },
]

const footerStories = [
  { name: '熊猫酒葫芦', href: '/stories/panda-wine-gourd' },
  { name: '诗仙李白', href: '/stories/li-bai' },
  { name: '武松打虎', href: '/stories/wu-song' },
  { name: '八仙传说', href: '/stories/eight-immortals' },
  { name: '纣王酒池', href: '/stories/zhou-xin' },
]

const footerService = [
  { name: '配送说明', href: '#' },
  { name: '退换政策', href: '#' },
  { name: '常见问题', href: '#' },
  { name: '隐私政策', href: '#' },
]

export function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <span
                className="w-10 h-10 flex items-center justify-center text-white font-serif text-xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--color-cinnabar) 0%, var(--color-cinnabar-dark) 100%)',
                }}
              >
                葫
              </span>
              <div>
                <span className="footer-brand">葫韵</span>
                <span
                  className="block text-[0.5625rem] tracking-[0.25em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  HUYUN
                </span>
              </div>
            </Link>
            <p className="footer-tagline mt-4 max-w-xs">
              传承千年葫芦工艺，将东方美学带入现代生活。每一件作品都承载着匠人的心血与智慧，承载着中华文化的深厚底蕴。
            </p>
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-9 h-9 flex items-center justify-center border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm" aria-label="微信">
                微
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm" aria-label="微博">
                博
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm" aria-label="小红书">
                书
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm" aria-label="抖音">
                抖
              </a>
            </div>
          </div>

          {/* Categories Column */}
          <div>
            <h3 className="footer-column-title">工艺分类</h3>
            <ul className="space-y-0">
              {footerCategories.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stories Column */}
          <div>
            <h3 className="footer-column-title">葫芦故事</h3>
            <ul className="space-y-0">
              {footerStories.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service Column */}
          <div>
            <h3 className="footer-column-title">客户服务</h3>
            <ul className="space-y-0">
              {footerService.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="text-xs text-white/40 mb-1">联系邮箱</p>
              <a href="mailto:contact@huyun.com" className="footer-link text-[var(--color-gold)]">
                contact@huyun.com
              </a>
            </div>
            <div className="mt-3">
              <p className="text-xs text-white/40 mb-1">服务热线</p>
              <a href="tel:400-888-6666" className="footer-link text-[var(--color-gold)]">
                400-888-6666
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom flex flex-col md:flex-row justify-between items-center gap-4">
          <p>
            &copy; {new Date().getFullYear()} 葫韵 HUYUN. 传承千年，匠心独运.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-white/40 hover:text-white/70 transition-colors text-xs">
              隐私政策
            </Link>
            <Link href="#" className="text-white/40 hover:text-white/70 transition-colors text-xs">
              使用条款
            </Link>
            <Link href="#" className="text-white/40 hover:text-white/70 transition-colors text-xs">
              网站地图
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
