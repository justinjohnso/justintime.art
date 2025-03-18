import { notFound } from 'next/navigation'
import Image from 'next/image'
import React from 'react'

type Props = {
  params: {
    slug: string
  }
}

// This will be replaced with a CMS query later
const getProject = (slug: string) => {
  // Temporary mock data
  const projects = {
    'the-tempest-arcade-controller': {
      title: 'The Tempest arcade controller',
      year: '2025',
      categories: ['Fabrication'],
      description:
        'A hand-made wooden arcade controller, built for a clone of the classic arcade game "Tempest".',
      materials: 'Cherry & poplar solid wood, acrylic, Teensy 4.0, arcade buttons, rotary encoder',
      images: ['/image-post1.webp'],
      content: `The prompt for this project was to fabricate something using primarily 2 different materials that are not acrylic or plywood. I created a retro-style arcade controller, intended to be paired with a clone of the old vector-graphics game Tempest that I made in Unity.`,
    },
    'look-listen': {
      title: 'Look/Listen',
      year: '2015',
      categories: ['Sound Design', 'Theatre'],
      description:
        'An interactive sound installation exploring the relationship between visual and auditory perception.',
      materials: 'Custom software, speakers, microphones',
      images: ['/image-post2.webp'],
      content: `Look/Listen is an interactive installation that explores how our visual and auditory senses interact with each other. Visitors experience a series of audio cues that change based on what they're looking at.`,
    },
    'finding-home': {
      title: 'Finding Home',
      year: '2015',
      categories: ['Sound Design', 'Installation'],
      description:
        'Finding Home is an interactive choose-your-own-adventure auditory gallery exhibit.',
      materials: 'Custom software, directional speakers, proximity sensors',
      images: ['/image-post3.webp'],
      content: `An immersive sound installation that takes participants on a journey through different sonic landscapes. Each choice the participant makes leads them down a different auditory path.`,
    },
  }
  return projects[slug as keyof typeof projects]
}

export default function ProjectPage({ params }: Props) {
  // Don't use React.use() - simply access params directly
  const project = getProject(params.slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
      <div className="mb-6">
        <span className="text-gray-600">{project.year}</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {project.categories.map((category) => (
            <span key={category} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
              {category}
            </span>
          ))}
        </div>
      </div>

      <p className="text-xl mb-8">{project.description}</p>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Materials</h2>
        <p>{project.materials}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">About the Project</h2>
        <p className="whitespace-pre-line">{project.content}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {project.images.map((image, index) => (
          <div key={index} className="aspect-video bg-gray-100 relative">
            <Image
              src={image}
              alt={`${project.title} - Image ${index + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
