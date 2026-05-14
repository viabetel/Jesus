"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

/**
 * RouteChangeHandler — global component that runs on every route change.
 *
 * Responsibilities:
 * - Scroll to top on page navigation
 * - Pause any playing videos/media
 * - Close any open drawers/menus (via custom event)
 * - Reset scroll position reliably
 */
export function RouteChangeHandler() {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })

      // Pause all playing videos
      document.querySelectorAll("video").forEach(v => {
        if (!v.paused) v.pause()
      })

      // Dispatch custom event for drawers/menus to close
      window.dispatchEvent(new CustomEvent("route-change"))

      prevPathname.current = pathname
    }
  }, [pathname])

  return null
}
