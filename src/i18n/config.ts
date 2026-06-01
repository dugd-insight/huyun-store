export type Locale = 'zh' | 'en' | 'ja' | 'ko'

export const locales: Locale[] = ['zh', 'en', 'ja', 'ko']
export const defaultLocale: Locale = 'zh'

export const localeLabels: Record<Locale, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
}
