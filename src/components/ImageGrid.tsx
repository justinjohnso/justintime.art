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

  // Destructure first image after ensuring the array is non-empty.
  const firstImage = images[0]!

  // Single image – full width without any gap.
  if (images.length === 1) {
    return (
      <div className="animate-fade-in">
        <div className="relative aspect-[16/10] md:aspect-[16/9]">
          <Image
            src={firstImage.image.url}
            alt={firstImage.image.alt || `${title} image`}
            fill
            className="object-cover shadow-lg transition-all duration-300"
          />
        </div>
      </div>
    )
  }

  if (images.length === 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="animate-fade-in delay-100">
          <div className="relative aspect-[3/4] md:aspect-[4/5]">
            <Image
              src={images[0]!.image.url}
              alt={images[0]!.image.alt || `${title} image 1`}
              fill
              className="object-cover shadow-lg transition-all duration-300"
            />
          </div>
        </div>
        <div className="animate-fade-in delay-200">
          <div className="relative aspect-[1/1] md:aspect-[4/3]">
            <Image
              src={images[1]!.image.url}
              alt={images[1]!.image.alt || `${title} image 2`}
              fill
              className="object-cover shadow-lg transition-all duration-300"
            />
          </div>
        </div>
      </div>
    )
  }

  // Three images – 2+1 layout, no gaps between them.
  if (images.length === 3) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
        <div className="md:col-span-8 animate-fade-in delay-100">
          <div className="relative aspect-[16/9] md:aspect-[16/10]">
            <Image
              src={images[0]!.image.url}
              alt={images[0]!.image.alt || `${title} image 1`}
              fill
              className="object-cover shadow-lg transition-all duration-300"
            />
          </div>
        </div>
        <div className="md:col-span-4 grid grid-cols-1 gap-0">
          <div className="animate-fade-in delay-200">
            <div className="relative aspect-[4/3]">
              <Image
                src={images[1]!.image.url}
                alt={images[1]!.image.alt || `${title} image 2`}
                fill
                className="object-cover shadow-lg transition-all duration-300"
              />
            </div>
          </div>
          <div className="animate-fade-in delay-300">
            <div className="relative aspect-[1/1]">
              <Image
                src={images[2]!.image.url}
                alt={images[2]!.image.alt || `${title} image 3`}
                fill
                className="object-cover shadow-lg transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // For four or more images – a full collage grid with no gaps.
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
      {images.map((item, index) => (
        <div key={index} className={`animate-fade-in delay-${((index % 5) + 1) * 100} group`}>
          <div className="relative w-full h-full">
            <Image
              src={item.image.url}
              alt={item.image.alt || `${title} image ${index + 1}`}
              fill
              className="object-cover shadow-lg transition-all duration-300 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ImageGrid
