'use client'

import { useState, memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import projectData from '@/data/projects.json'

interface Project {
  id: number
  title: string
  description: string
  image: string
  url: string
}

const ProjectCard = memo(({ project }: { project: Project }) => (
  <div
    key={project.id}
    className='bg-base-100 rounded-lg shadow-lg overflow-hidden flex flex-col'
  >
    <Image
      src={project.image}
      alt={project.title}
      width={600}
      height={400}
      className='w-full h-48 object-cover'
    />
    <div className='flex-1 p-6'>
      <h3 className='text-xl font-semibold mb-2'>{project.title}</h3>
      <p className='text-gray-300 mb-4'>{project.description}</p>
    </div>
    <div className='p-6'>
      <Link
        href={project.url}
        className='inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded'
      >
        Learn More
      </Link>
    </div>
  </div>
))

export default function ProjectsSection () {
  const [visibleCount, setVisibleCount] = useState(6)

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 6)
  }

  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 border-b border-gray-700'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <div className='text-center mb-8'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-primary'>
            Our Projects
          </h2>
          <p className='text-lg mb-8 max-w-7xl mx-auto'>
            Explore some of our standout projects that showcase our innovation
            and expertise across various domains. Each project reflects our
            commitment to excellence and cutting-edge technology.
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {projectData.slice(0, visibleCount).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {visibleCount < projectData.length && (
          <div className='text-center mt-8'>
            <button
              onClick={handleLoadMore}
              className='inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded'
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
