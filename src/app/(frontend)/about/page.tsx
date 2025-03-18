'use client'
import { MotionWrapper } from '../../../components/MotionWrapper'
export default function AboutPage() {
  return (
    <div className="container mx-auto p-4">
      <MotionWrapper>
        <h1 className="text-3xl font-bold mb-6">About Me</h1>
        <div className="max-w-3xl">
          <p className="mb-4">
            I&apos;m a multidisciplinary artist and creative technologist with a background in
            theatre and a passion for building interactive experiences.
          </p>
          <p className="mb-4">
            When I&apos;m not talking to computers, I spend my time building interactive auditory
            worlds, both through theatre and technology.
          </p>
        </div>
      </MotionWrapper>
    </div>
  )
}
