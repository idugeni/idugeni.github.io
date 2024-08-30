'use client'

import { FaUserPlus } from 'react-icons/fa6'
import Link from 'next/link'
import Image from 'next/image'

export default function CallToAction () {
  return (
    <section className='relative py-8 md:py-12 lg:py-16 bg-cover bg-center'>
      <Image
        src='/images/underwater.jpg'
        alt='Underwater Background'
        fill
        className='absolute inset-0 z-0 object-cover'
      />
      <div className='absolute inset-0 bg-black bg-opacity-40 z-10'></div>
      <div className='relative container mx-auto px-4 md:px-6 lg:px-8 z-20'>
        <div className='max-w-2xl sm:max-w-7xl mx-auto text-center'>
          <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 md:mb-8 lg:mb-10 text-white drop-shadow-md'>
            Ready to Join Us?
          </h2>
          <p className='text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-white drop-shadow-md'>
            Become part of our community today and start transforming your
            projects with our innovative solutions.
          </p>
          <div className='flex justify-center'>
            <Link
              href='/join'
              className='relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-2 px-8 md:py-3 md:px-12 font-semibold text-base md:text-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-teal-500 hover:to-blue-500 hover:text-neutral-300 hover:shadow-lg'
            >
              <span className='relative flex items-center z-10'>
                <FaUserPlus className='h-5 w-5 md:h-6 md:w-6 mr-2 transition-colors duration-300' />
                <span className='transition-colors duration-300'>Join Us</span>
              </span>
              <span className='absolute inset-0 border-2 border-transparent rounded-full opacity-40 transition-opacity duration-300 hover:opacity-60'></span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
