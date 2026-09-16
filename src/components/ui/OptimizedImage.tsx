import { useState } from 'react'
import type { ImageType } from '../../types'
import './OptimizedImage.css'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  type?: ImageType
  priority?: boolean
  className?: string
  aspectRatio?: string
  fallbackEmoji?: string
  accentColor?: string
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  type = 'CONCEPT',
  priority = false,
  className = '',
  aspectRatio = '4/3',
  fallbackEmoji = '✨',
  accentColor = '#FF2D78',
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  if (hasError || !src) {
    return (
      <div
        className={`optimized-image-fallback ${className}`}
        style={
          {
            aspectRatio,
            '--accent-color': accentColor,
          } as React.CSSProperties
        }
        role="img"
        aria-label={alt}
      >
        <div className="optimized-image-fallback__shape">
          <span className="optimized-image-fallback__emoji" aria-hidden="true">
            {fallbackEmoji}
          </span>
        </div>
        <div className="optimized-image-fallback__label">
          <span>{type === 'REAL_PRODUCT' ? 'Fotografia indisponível' : 'Conceito em teste'}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`optimized-image-wrapper ${isLoaded ? 'is-loaded' : 'is-loading'} ${className}`}
      style={{ aspectRatio }}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className="optimized-image"
      />
    </div>
  )
}
