import Image from 'next/image'
import { FaRocket, FaBook } from 'react-icons/fa'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className='relative w-full min-h-screen overflow-hidden flex items-center justify-center'>
      <div className='absolute inset-0'>
        <Image
          src='/images/bg-hero.webp'
          alt='Background Image'
          fill
          className='object-cover'
          priority
        />
      </div>
      <div className='relative flex flex-col items-center justify-center w-full h-full bg-black bg-opacity-60 text-white'>
        <div className='flex flex-col items-center justify-center w-full px-4 text-center max-w-4xl'>
          <div className='mb-4 flex flex-wrap justify-center gap-4'>
            <span className='badge badge-outline px-4 py-2 transition-all duration-300 hover:bg-primary hover:text-base-100'>
              Next.js
            </span>
            <span className='badge badge-outline px-4 py-2 transition-all duration-300 hover:bg-secondary hover:text-base-100'>
              GitHub Pages
            </span>
            <span className='badge badge-outline px-4 py-2 transition-all duration-300 hover:bg-accent hover:text-base-100'>
              Vercel
            </span>
          </div>
          <h1 className='text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 drop-shadow-lg'>
            Welcome to{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500'>
              IduGeni
            </span>
          </h1>
          <p className='mb-6 text-lg md:text-xl'>
            Showcasing innovation and excellence in personal and professional
            projects.
          </p>
          <div className='flex flex-col md:flex-row items-center justify-center gap-4 w-full'>
            <Link
              href='/get-started'
              className='relative flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-8 py-3 w-full md:w-auto transition duration-300 ease-in-out hover:bg-gradient-to-r hover:from-indigo-600 hover:to-blue-600'
            >
              <FaRocket className='h-5 w-5 mr-2' />
              <span>Get Started</span>
            </Link>
            <Link
              href='/documentation'
              className='relative flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-8 py-3 w-full md:w-auto transition duration-300 ease-in-out hover:bg-gradient-to-r hover:from-pink-600 hover:to-purple-600'
            >
              <FaBook className='h-5 w-5 mr-2' />
              <span>Documentation</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
