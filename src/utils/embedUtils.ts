/**
 * Utility functions for handling media embeds (Vimeo, YouTube, SoundCloud)
 */

export interface EmbedInfo {
  type: 'vimeo' | 'youtube' | 'soundcloud' | 'audio' | 'unknown'
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

    // SoundCloud - convert track URLs to widget URLs
    if (hostname.includes('soundcloud.com')) {
      // If it's already a widget URL, use it directly
      if (hostname.includes('w.soundcloud.com')) {
        return {
          type: 'soundcloud',
          embedUrl: url,
          aspectRatio: '16/9',
        }
      }

      // Convert regular track URL to widget URL
      // For URLs with secret tokens, we need to convert them to the API format
      // e.g., https://soundcloud.com/user/track/s-TOKEN -> need to use API URL
      let apiUrl = url

      // Check if URL has a secret token (format: /s-XXXXX at the end)
      const secretMatch = url.match(/\/s-([a-zA-Z0-9]+)$/)
      if (secretMatch) {
        // Remove the /s-TOKEN part and add it as a query parameter
        const baseUrl = url.replace(/\/s-[a-zA-Z0-9]+$/, '')
        apiUrl = `${baseUrl}?secret_token=s-${secretMatch[1]}`
      }

      const trackUrl = encodeURIComponent(apiUrl)
      return {
        type: 'soundcloud',
        embedUrl: `https://w.soundcloud.com/player/?url=${trackUrl}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`,
        aspectRatio: '16/9',
      }
    }

    // Audio files (MP3, WAV, OGG, etc.)
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac']
    const pathname = urlObj.pathname.toLowerCase()
    if (audioExtensions.some(ext => pathname.endsWith(ext))) {
      return {
        type: 'audio',
        embedUrl: url,
        aspectRatio: '16/9',
      }
    }

    return null
  } catch (error) {
    console.error('Error parsing embed URL:', error)
    return null
  }
}
