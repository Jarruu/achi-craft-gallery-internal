import { createIsomorphicFn } from '@tanstack/react-start'

export const getSessionUser = createIsomorphicFn<[], Promise<string | null>>()
  .client(async () => {
    // Client-side execution
    const match = document.cookie.match(/(?:^|; )acg_session=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : null
  })
  .server(async () => {
    // Server-side execution
    try {
      const { getCookie } = await import('@tanstack/react-start/server')
      return getCookie('acg_session') || null
    } catch (e) {
      // Catch exceptions
    }
    return null
  })
