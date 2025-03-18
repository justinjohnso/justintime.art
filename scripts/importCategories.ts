import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import payload from 'payload'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const importCategories = async () => {
  try {
    // Use a type assertion to bypass TypeScript's property checking
    await (payload.init as any)({
      secret: process.env.PAYLOAD_SECRET || '',
      local: true, // Run in local mode
    })

    const categoriesFilePath = path.resolve(__dirname, '../webflow/My Portfolio - Categories.csv')

    return new Promise<void>((resolve, reject) => {
      const categories: any[] = []

      fs.createReadStream(categoriesFilePath)
        .pipe(csv())
        .on('data', (row) => {
          categories.push(row)
        })
        .on('end', async () => {
          console.log('CSV file successfully processed')

          for (const category of categories) {
            const { Name, Slug, Description, Color } = category

            try {
              // Use type assertion to bypass type checking
              await payload.create({
                collection: 'categories' as any,
                data: {
                  title: Name,
                  slug: Slug,
                  description: Description,
                  color: Color,
                } as any,
              })

              console.log(`Category ${Name} imported successfully`)
            } catch (error) {
              console.error(`Error importing category ${Name}:`, error)
            }
          }

          console.log('All categories imported!')
          resolve()
        })
        .on('error', (error) => {
          console.error('Error processing CSV:', error)
          reject(error)
        })
    })
  } catch (error) {
    console.error('Error initializing Payload:', error)
  }
}

// Execute the function
importCategories()
  .then(() => {
    console.log('Import completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Import failed:', error)
    process.exit(1)
  })
