type CacheType = 'localStorage' | 'sessionStorage'

export const CACHE_KEY = {
  ROLE_ROUTERS: 'roleRouters',
  USER: 'user',
  VisitTenantId: 'visitTenantId',
  IS_DARK: 'isDark',
  LANG: 'lang',
  THEME: 'theme',
  LAYOUT: 'layout',
  DICT_CACHE: 'dictCache',
  LoginForm: 'loginForm',
  TenantId: 'tenantId'
}

export const useCache = (type: CacheType = 'localStorage') => {
  const storage = type === 'localStorage' ? localStorage : sessionStorage

  return {
    wsCache: {
      get: (key: string) => {
        const raw = storage.getItem(key)
        if (!raw) return null
        try { return JSON.parse(raw) } catch { return raw }
      },
      set: (key: string, value: any, options?: { exp: number }) => {
        storage.setItem(key, JSON.stringify(value))
      },
      delete: (key: string) => {
        storage.removeItem(key)
      }
    }
  }
}

export const deleteUserCache = () => {
  const { wsCache } = useCache()
  wsCache.delete(CACHE_KEY.USER)
  wsCache.delete(CACHE_KEY.ROLE_ROUTERS)
  wsCache.delete(CACHE_KEY.VisitTenantId)
}
