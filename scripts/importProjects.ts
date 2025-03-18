import { parse, CsvError } from 'csv-parse'
import fs from 'fs'
import path from 'path'
import payload from 'payload'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import payloadConfig from '../src/payload.config'

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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const importProjects = async () => {
  try {
    // Fix Error 1: Type assertion for payload.init
    await (payload.init as any)({
      secret: process.env.PAYLOAD_SECRET || '',
      local: true,
      config: payloadConfig,
    })

    const filePath = path.resolve(__dirname, '../../webflow/My Portfolio - Projects.csv')
    const fileContent = fs.readFileSync(filePath, 'utf-8')

    // Wrap in Promise to properly handle the async callback
    return new Promise<void>((resolve, reject) => {
      parse(
        fileContent,
        {
          columns: true,
          skip_empty_lines: true,
        },
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
                // Fix Errors 2 & 3: Type assertions for collection and data
                await payload.create({
                  // Fix Error 2: Type assertion for collection slug
                  collection: 'projects' as any,
                  // Fix Error 3: Type assertion for data object
                  data: {
                    title: Name,
                    slug: Slug,
                    description: Description,
                    image: Image,
                    category: Category,
                  } as any,
                })
                console.log(`Imported project: ${Name}`)
              } catch (error) {
                console.error(`Error importing project ${Name}:`, error)
              }
            }

            console.log('All projects imported!')
            resolve()
          } catch (error) {
            console.error('Error processing records:', error)
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
