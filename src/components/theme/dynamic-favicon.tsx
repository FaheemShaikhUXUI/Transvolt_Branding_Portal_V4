"use client"

import * as React from "react"

// SVG State 1: Left = Solid White (#FFFFFF), Right = Transvolt Blue (#4472C4)
const SVG_STATE_1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1340 1070" width="32" height="32"><polygon points="0,0 395.83,0 778.77,534.52 395.83,1069.04 0,1069.04 382.93,534.52" fill="%23FFFFFF"/><polygon points="561.05,0 956.89,0 1339.8,534.52 956.89,1069.04 561.05,1069.04 943.97,534.52" fill="%234472C4"/></svg>`

// SVG State 2: Left = Transvolt Green (#548235), Right = Solid White (#FFFFFF)
const SVG_STATE_2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1340 1070" width="32" height="32"><polygon points="0,0 395.83,0 778.77,534.52 395.83,1069.04 0,1069.04 382.93,534.52" fill="%23548235"/><polygon points="561.05,0 956.89,0 1339.8,534.52 956.89,1069.04 561.05,1069.04 943.97,534.52" fill="%23FFFFFF"/></svg>`

const URI_1 = `data:image/svg+xml;utf8,${SVG_STATE_1}`
const URI_2 = `data:image/svg+xml;utf8,${SVG_STATE_2}`

export function DynamicFavicon() {
  React.useEffect(() => {
    if (typeof window === "undefined") return

    // Remove any default static icon links in head
    document.querySelectorAll("link[rel*='icon']").forEach((el) => {
      try {
        if (el.id !== "tv-tab-favicon") {
          el.remove()
        }
      } catch (e) {}
    })

    let isState1 = true

    const updateTabIcon = () => {
      const activeUri = isState1 ? URI_1 : URI_2
      isState1 = !isState1

      // Create new link node and replace to force Chrome tab bar to repaint
      const newLink = document.createElement("link")
      newLink.id = "tv-tab-favicon"
      newLink.rel = "icon"
      newLink.type = "image/svg+xml"
      newLink.href = activeUri

      const oldLink = document.getElementById("tv-tab-favicon")
      if (oldLink && oldLink.parentNode) {
        oldLink.parentNode.replaceChild(newLink, oldLink)
      } else {
        document.head.appendChild(newLink)
      }
    }

    // Set initial icon immediately
    updateTabIcon()

    // Shift one by one in same place every 1.2s
    const interval = setInterval(updateTabIcon, 1200)

    return () => {
      clearInterval(interval)
      const link = document.getElementById("tv-tab-favicon")
      if (link && link.parentNode) {
        link.parentNode.removeChild(link)
      }
    }
  }, [])

  return null
}
