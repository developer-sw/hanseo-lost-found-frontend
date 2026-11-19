import desktopArtwork from '../assets/hero-hanbi-desktop.webp'
import mobileArtwork from '../assets/hero-hanbi-mobile.webp'

interface HanbiProps {
  className?: string
  alt?: string
  compact?: boolean
}

export function Hanbi({ className, alt = '돋보기로 분실물을 찾는 한서대학교 캐릭터 한비', compact = false }: HanbiProps) {
  return (
    <picture className={className}>
      {!compact && <source media="(max-width: 767px)" srcSet={mobileArtwork} width="180" height="160" />}
      <img
        src={compact ? mobileArtwork : desktopArtwork}
        width={compact ? 180 : 660}
        height={compact ? 160 : 224}
        alt={alt}
        fetchPriority={compact ? undefined : 'high'}
      />
    </picture>
  )
}
