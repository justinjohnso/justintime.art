import { parse, CsvError } from 'csv-parse'
import fs from 'fs'
import path from 'path'
import payload from 'payload'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Define types for CSV records
interface ProjectRecord {
  Name: string
  Slug: string
  Description: string
  Image: string
  Category: string
  [key: string]: string // Allow other fields
}

const importProjects = async () => {
  try {
    // Use type assertion to bypass TypeScript's property checking
    await (payload.init as any)({
      secret: process.env.PAYLOAD_SECRET || '',
      local: true, // Run in local mode
    })

    const filePath = path.resolve(__dirname, '../webflow/My Portfolio - Projects.csv')
    const fileContent = fs.readFileSync(filePath, 'utf-8')

    // Create a Promise to handle the async parse operation
    return new Promise<void>((resolve, reject) => {
      // Fix the callback parameter types to match csv-parse expectations
      parse(
        fileContent,
        {
          columns: true,
          skip_empty_lines: true,
        },
        // Use CsvError | undefined instead of Error | null
        async (err: CsvError | undefined, records: ProjectRecord[]) => {
          if (err) {
            console.error('Error parsing CSV:', err)
            reject(err)
            return
          }

          try {
            for (const record of records) {
              const { Name, Slug, Description, Image, Category } = record

              try {
                // Use type assertions to bypass TypeScript's checking
                await payload.create({
                  collection: 'projects' as any, // Type assertion for collection slug
                  data: {
                    title: Name,
                    slug: Slug,
                    description: Description,
                    image: Image,
                    category: Category,
                  } as any, // Type assertion for data object
                })
                console.log(`Imported project: ${Name}`)
              } catch (error) {
                console.error(`Error importing project ${Name}:`, error)
              }
            }

            console.log('All projects imported!')
            resolve()
          } catch (error) {
            reject(error)
          }
        },
      )
    })
  } catch (error) {
    console.error('Error initializing Payload:', error)
    throw error
  }
}

// Execute the function
importProjects()
  .then(() => {
    console.log('Import completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Import failed:', error)
    process.exit(1)
  })
