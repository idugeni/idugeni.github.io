import Image from 'next/image'
import { FaRocket, FaBook } from 'react-icons/fa6'
import Link from 'next/link'

export default function HeroSection () {
  return (
    <section className='relative w-full h-screen overflow-hidden'>
      <div className='absolute inset-0'>
        <Image
          src='/images/hero-background.jpeg'
          alt='Background Image'
          fill
          className='object-cover'
          priority
        />
      </div>
      <div className='relative flex items-center justify-center w-full h-full bg-black bg-opacity-60 text-white'>
        <div className='text-center max-w-4xl px-4'>
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
          <div className='flex justify-center gap-4'>
            <Link
              href='/get-started'
              className='relative flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-8 py-3 transition duration-300 ease-in-out hover:bg-gradient-to-r hover:from-indigo-600 hover:to-blue-600'
            >
              <FaRocket className='h-5 w-5 mr-2' />
              <span>Get Started</span>
            </Link>
            <Link
              href='/documentation'
              className='relative flex items-center justify-center bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full px-8 py-3 transition duration-300 ease-in-out hover:bg-gradient-to-r hover:from-teal-600 hover:to-green-600'
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
