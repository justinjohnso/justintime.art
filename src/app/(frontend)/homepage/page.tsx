import { GetStaticProps } from 'next'
import { useEffect, useState } from 'react'
import payload from 'payload'
import { Project } from '@/payload-types'

const HomePage = ({ projects }: { projects: Project[] }) => {
  return (
    <div>
      <h1>Homepage</h1>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>{project.title}</li>
        ))}
      </ul>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const projects = await payload.find({
    collection: 'projects',
  })

  return {
    props: {
      projects: projects.docs,
    },
  }
}

export default HomePage
