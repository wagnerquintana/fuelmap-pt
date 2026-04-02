'use client'

import { useEffect, useState } from 'react'

const SESSION_KEY = 'fuelmap_exit_shown'
const MOBILE_TIMEOUT = 45000 // 45s

export function useExitIntent(): boolean {
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return

    let mobileTimer: ReturnType<typeof setTimeout>

    // Desktop: cursor sai pelo topo
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 5) {
        sessionStorage.setItem(SESSION_KEY, '1')
        setTriggered(true)
      }
    }

    // Mobile: inatividade 45s
    function resetTimer() {
      clearTimeout(mobileTimer)
      mobileTimer = setTimeout(() => {
        if (!sessionStorage.getItem(SESSION_KEY)) {
          sessionStorage.setItem(SESSION_KEY, '1')
          setTriggered(true)
        }
      }, MOBILE_TIMEOUT)
    }

    const isMobile = window.innerWidth < 768

    if (isMobile) {
      resetTimer()
      window.addEventListener('touchstart', resetTimer)
      window.addEventListener('touchmove', resetTimer)
    } else {
      document.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      clearTimeout(mobileTimer)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('touchstart', resetTimer)
      window.removeEventListener('touchmove', resetTimer)
    }
  }, [])

  return triggered
}
