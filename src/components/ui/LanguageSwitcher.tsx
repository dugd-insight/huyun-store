'use client'

import { localeLabels, type Locale } from '@/i18n/config'

interface LanguageSwitcherProps {
  currentLocale: Locale
  onLocaleChange: (locale: Locale) => void
}

export function LanguageSwitcher({ currentLocale, onLocaleChange }: LanguageSwitcherProps) {
  const locales: Locale[] = ['zh', 'en', 'ja', 'ko']

  return (
    <div className="lang-switcher">
      {locales.map((locale) => (
        <button
          key={locale}
          className={`lang-btn ${currentLocale === locale ? 'active' : ''}`}
          onClick={() => onLocaleChange(locale)}
          aria-label={`Switch to ${localeLabels[locale]}`}
        >
          {localeLabels[locale]}
        </button>
      ))}
    </div>
  )
}
