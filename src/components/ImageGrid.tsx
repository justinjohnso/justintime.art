import React from 'react'
import Image from 'next/image'
import { Media } from '@/payload-types'

interface ImageObject {
  image: {
    url: string
    alt?: string
  }
}

interface ImageGridProps {
  images: ImageObject[]
  title: string
}

/**
 * ImageGrid component for displaying images in a collage layout.
 * Gaps between images have been removed to achieve a seamless look.
 */
const ImageGrid: React.FC<ImageGridProps> = ({ images, title }) => {
  if (!images || images.length === 0) return null

  // Single image row: use 16:9 aspect ratio.
  if (images.length === 1) {
    return (
      <div className="animate-fade-in">
        <div className="relative aspect-[16/9]">
          <Image
            src={images[0]!.image.url}
            alt={images[0]!.image.alt || `${title} image`}
            fill
            className="object-cover transition-all duration-300"
          />
        </div>
      </div>
    )
  }

  // Two-image row: each image uses a 3:2 aspect ratio.
  if (images.length === 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {images.map((img, index) => (
          <div key={index} className="animate-fade-in delay-[100ms]">
            <div className="relative aspect-[3/2]">
              <Image
                src={img.image.url}
                alt={img.image.alt || `${title} image ${index + 1}`}
                fill
                className="object-cover transition-all duration-300"
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Three-image row: each image uses a square (1:1) aspect ratio.
  if (images.length === 3) {
    return (
      <div className="grid grid-cols-3 gap-0">
        {images.map((img, index) => (
          <div key={index} className="animate-fade-in delay-[100ms]">
            <div className="relative aspect-[4/3]">
              <Image
                src={img.image.url}
                alt={img.image.alt || `${title} image ${index + 1}`}
                fill
                className="object-cover transition-all duration-300"
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // For four or more images, fall back on a full grid.
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
      {images.map((img, index) => (
        <div key={index} className="animate-fade-in group">
          <div className="relative w-full h-full">
            <Image
              src={img.image.url}
              alt={img.image.alt || `${title} image ${index + 1}`}
              fill
              className="object-cover transition-all duration-300 group-hover:opacity-90"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default ImageGrid
