import desktopArtwork from '../assets/hero-hanbi-desktop.webp'
import mobileArtwork from '../assets/hero-hanbi-mobile.webp'

interface HanbiProps {
  className?: string
  alt?: string
}

export function Hanbi({ className, alt = '돋보기로 분실물을 찾는 한서대학교 캐릭터 한비' }: HanbiProps) {
  return (
    <picture className={className}>
      <source media="(max-width: 767px)" srcSet={mobileArtwork} width="180" height="160" />
      <img src={desktopArtwork} width="660" height="224" alt={alt} fetchPriority="high" />
    </picture>
  )
}
