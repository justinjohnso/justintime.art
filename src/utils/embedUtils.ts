/**
 * Utility functions for handling media embeds (Vimeo, YouTube, SoundCloud)
 */

export interface EmbedInfo {
  type: 'vimeo' | 'youtube' | 'soundcloud' | 'unknown'
  embedUrl: string
  aspectRatio: string
}

/**
 * Detects the embed type and generates the appropriate embed URL
 */
export function getEmbedInfo(url: string): EmbedInfo | null {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()

    // Vimeo
    if (hostname.includes('vimeo.com')) {
      const videoId = urlObj.pathname.split('/').filter(Boolean).pop()
      if (videoId) {
        return {
          type: 'vimeo',
          embedUrl: `https://player.vimeo.com/video/${videoId}`,
          aspectRatio: '16/9',
        }
      }
    }

    // YouTube
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      let videoId: string | null = null

      if (hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1)
      } else if (urlObj.searchParams.has('v')) {
        videoId = urlObj.searchParams.get('v')
      }

      if (videoId) {
        return {
          type: 'youtube',
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          aspectRatio: '16/9',
        }
      }
    }

    // SoundCloud
    if (hostname.includes('soundcloud.com')) {
      // Clean URL by removing query parameters that might interfere
      const cleanUrl = `${urlObj.origin}${urlObj.pathname}`
      return {
        type: 'soundcloud',
        embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(cleanUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`,
        aspectRatio: '16/9',
      }
    }

    return null
  } catch (error) {
    console.error('Error parsing embed URL:', error)
    return null
  }
}
