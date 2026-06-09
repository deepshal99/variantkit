import { useEffect } from 'react'

// DialKit reads its theme from data-theme on every .dialkit-root panel. This applies the
// chosen theme to all panels (there's one per element) and to any that mount later.
export function useDialkitTheme(theme: 'light' | 'dark') {
  useEffect(() => {
    const apply = () =>
      document.querySelectorAll('.dialkit-root').forEach((el) => el.setAttribute('data-theme', theme))
    apply()
    const mo = new MutationObserver(apply)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [theme])
}
