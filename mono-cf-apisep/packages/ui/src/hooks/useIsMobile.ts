import { useEffect, useState } from 'react'

export default function useIsMobile(mobileBreakpoint = 768) {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`)
    const updateIsMobile = () => setIsMobile(mediaQuery.matches)

    mediaQuery.addEventListener('change', updateIsMobile)
    updateIsMobile()

    return () => mediaQuery.removeEventListener('change', updateIsMobile)
  }, [mobileBreakpoint])

  return !!isMobile
}
