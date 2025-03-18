import React, { Fragment } from 'react'
import { cn } from '../../utilities/cn' // Import the cn utility
import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const Tag = htmlElement || Fragment

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className,
          }
        : {})}
    >
      <div
        className={cn('transition-transform transform hover:scale-105 focus:scale-105', className)}
      >
        {isVideo ? <VideoMedia {...props} /> : <ImageMedia {...props} />}
      </div>
    </Tag>
  )
}
