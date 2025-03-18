import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import payload from 'payload'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const importProjects = async () => {
  try {
    // Use a type assertion to bypass TypeScript's property checking
    await (payload.init as any)({
      secret: process.env.PAYLOAD_SECRET || '',
      local: true, // Run in local mode
    })

    const projectsFilePath = path.resolve(__dirname, '../webflow/My Portfolio - Projects.csv')

    return new Promise<void>((resolve, reject) => {
      const projects: any[] = []

      fs.createReadStream(projectsFilePath)
        .pipe(csv())
        .on('data', (row) => {
          projects.push(row)
        })
        .on('end', async () => {
          console.log('CSV file successfully processed')

          for (const project of projects) {
            const { Name, Slug, Description, Category, Image } = project

            try {
              // Use type assertion to bypass type checking
              await payload.create({
                collection: 'projects' as any,
                data: {
                  title: Name,
                  slug: Slug,
                  description: Description,
                  category: Category,
                  image: Image,
                } as any,
              })

              console.log(`Project ${Name} imported successfully`)
            } catch (error) {
              console.error(`Error importing project ${Name}:`, error)
            }
          }

          console.log('All projects imported!')
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
importProjects()
  .then(() => {
    console.log('Import completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Import failed:', error)
    process.exit(1)
  })
