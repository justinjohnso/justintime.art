/**
 * This is an example of a standalone script that loads in the Payload config
 * and uses the Payload Local API to query the database.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { categories } from '../../webflow/My Portfolio - Categories_Formatted.json'

async function run() {
  try {
    const payload = await getPayload({ config })

    for (const category of categories) {
      // Map the "name" field to "title" (since the JSON doesn't include a "title" property)
      const mappedCategory = {
        title: category.name,
        description: category.description || '',
        // If a slug is provided in the JSON, include it; otherwise, Payload can auto-generate one.
        slug: category.slug || undefined,
      }

      await payload.create({
        collection: 'categories',
        data: mappedCategory,
      })
    }
  } catch (error) {
    console.error(JSON.stringify(error))
    process.exit(1)
  }

  process.exit(0)
}

await run()
