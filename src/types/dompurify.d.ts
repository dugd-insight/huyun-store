/**
 * TypeScript 类型声明 - isomorphic-dompurify
 *
 * 当 @types/dompurify 未安装时提供基本类型定义。
 * 安装 @types/dompurify 后可删除此文件。
 */
declare module 'isomorphic-dompurify' {
  interface Config {
    ALLOWED_TAGS?: string[]
    ALLOWED_ATTR?: string[]
    ALLOW_DATA_ATTR?: boolean
    ADD_TAGS?: string[]
    ADD_ATTR?: string[]
    FORBID_TAGS?: string[]
    FORBID_ATTR?: string[]
    USE_PROFILES?: { html?: boolean; svg?: boolean; svgFilters?: boolean; mathMl?: boolean }
    RETURN_DOM?: boolean
    RETURN_DOM_FRAGMENT?: boolean
    RETURN_TRUSTED_TYPE?: boolean
    FORCE_BODY?: boolean
    SANITIZE_DOM?: boolean
    KEEP_CONTENT?: boolean
    IN_PLACE?: boolean
  }

  interface DOMPurifyI {
    sanitize(source: string | Node, config?: Config & { RETURN_TRUSTED_TYPE?: false }): string
    sanitize(source: string | Node, config: Config & { RETURN_DOM: true }): HTMLElement
    sanitize(source: string | Node, config: Config & { RETURN_DOM_FRAGMENT: true }): DocumentFragment
    sanitize(source: string | Node, config: Config): string | HTMLElement | DocumentFragment
    setConfig(cfg: Config): void
    clearConfig(): void
    isValidAttribute(tag: string, attr: string, value: string): boolean
    addHook(entryPoint: string, hookFunction: (currentNode: Element, data: Attr, config: Config) => void): void
    removeHook(entryPoint: string): void
    removeHooks(entryPoint: string): void
    removeAllHooks(): void
  }

  const DOMPurify: DOMPurifyI
  export default DOMPurify
}
