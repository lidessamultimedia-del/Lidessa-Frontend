import { useEffect, useRef } from 'react'
import { useIsDarkTheme } from '@/shared/hooks/useIsDarkTheme'
import { useElementReveal } from '@/shared/hooks/useScrollReveal'

const LIGHT_SRC = '/assets/lidessa.mp4'
const DARK_SRC = '/assets/modooscuro-logo.mp4'

export default function LogoRevealSection() {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const hasPlayedRef = useRef(false)
  const isDark = useIsDarkTheme()
  const revealRef = useElementReveal()

  useEffect(() => {
    const section = sectionRef.current
    const video = videoRef.current
    if (!section || !video) return

    const playForCurrentTheme = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const nextSrc = isDark ? DARK_SRC : LIGHT_SRC
      if (video.getAttribute('data-src') === nextSrc) return
      video.setAttribute('data-src', nextSrc)
      video.src = nextSrc
      video.currentTime = 0
      video.load()
      video.play()
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasPlayedRef.current = true
          playForCurrentTheme()
        }
      },
      { threshold: 0.1 }
    )
    intersectionObserver.observe(section)

    // Switch instantly if the user toggles light/dark after the video already played
    const themeObserver = new MutationObserver(() => {
      if (hasPlayedRef.current) playForCurrentTheme()
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      intersectionObserver.disconnect()
      themeObserver.disconnect()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-3 flex items-center justify-center"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div
        ref={revealRef}
        className="reveal"
        style={{ backgroundColor: 'var(--background)', transitionDuration: '1.1s' }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          style={{ width: 'min(220px, 40vw)', mixBlendMode: isDark ? 'screen' : 'multiply', display: 'block' }}
        />
      </div>
    </section>
  )
}
