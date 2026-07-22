import { useEffect, useRef } from 'react'

const LIGHT_SRC = '/assets/lidessa.mp4'
const DARK_SRC = '/assets/modooscuro.mp4'

export default function LogoRevealSection() {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const hasPlayedRef = useRef(false)

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
      { threshold: 0.5 }
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
      className="py-16 flex items-center justify-center"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        style={{ width: 'min(320px, 60vw)' }}
      />
    </section>
  )
}
