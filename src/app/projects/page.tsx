import Image from 'next/image'
import Link from 'next/link'
import projectsData from '@/data/projects.json'

export const metadata = {
  title: 'Projects',
  description: 'Explore the innovative projects by IduGeni SabdoDadi.',
}

const Projects = () => {
  const projects = projectsData

  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 text-base-content'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-center text-primary'>
          Our Projects
        </h1>
        <p className='text-center text-base md:text-lg lg:text-xl mb-8'>
          Explore the innovative projects by IduGeni SabdoDadi, showcasing
          groundbreaking ideas and cutting-edge solutions across various
          industries.
        </p>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8'>
          {projects.map((project) => (
            <div
              key={project.id}
              className='card bg-base-100 shadow-lg transition-shadow duration-300 hover:shadow-2xl'
            >
              <figure className='relative'>
                <Image
                  src={project.image}
                  alt={project.title}
                  className='w-full h-48 object-cover rounded-t-lg'
                  width={500}
                  height={300}
                />
              </figure>
              <div className='card-body'>
                <h2 className='card-title text-lg font-semibold'>
                  {project.title}
                </h2>
                <p className='text-base mb-4'>{project.description}</p>
                <div className='card-actions mt-4'>
                  <Link
                    href={project.url}
                    className='block w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary text-white transition-all duration-300 hover:from-secondary hover:to-primary hover:text-black'
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
