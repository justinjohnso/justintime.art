/**
 * This script imports media files from URLs defined in data.json
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import imageData from '../../webflow/data.json' assert { type: 'json' }

async function run() {
  try {
    const payload = await getPayload({ config })
    console.log('Payload initialized')

    // Process images sequentially to avoid overwhelming the server
    for (const item of imageData) {
      try {
        // Fetch the image from the URL
        console.log(`Fetching image from ${item.url}`)
        const response = await fetch(item.url)

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`)
        }

        // Get the binary data and content type
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const contentType = response.headers.get('content-type') || 'image/jpeg'

        // Create the media document
        await payload.create({
          collection: 'media',
          data: {
            alt: item.fileName || 'Image',
          },
          file: {
            data: buffer,
            size: buffer.length,
            mimetype: contentType,
            name: item.fileName || `image-${Date.now()}.jpg`,
          },
        })

        console.log(`Imported: ${item.fileName}`)
      } catch (error) {
        console.error(`Error importing ${item.fileName}:`, error)
      }
    }

    console.log('Media import completed')
    process.exit(0)
  } catch (error) {
    console.error('Import error:', error)
    process.exit(1)
  }
}

await run()
