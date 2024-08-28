'use client'

import { useState, useEffect, memo } from 'react'
import {
  FaChevronLeft,
  FaChevronRight,
  FaStar as FaStarSolid,
} from 'react-icons/fa6'
import {
  FaRegStar as FaStarOutline,
  FaRegStarHalfStroke,
} from 'react-icons/fa6'
import testimonials from '@/data/testimonials.json'

type Testimonial = {
  quote: string
  name: string
  position: string
  photo: string
  rating: number
}

type TestimonialCardProps = {
  testimonial: Testimonial
}

const TestimonialCard: React.FC<TestimonialCardProps> = memo(
  ({ testimonial }) => {
    const renderStars = (rating: number) => {
      const fullStars = Math.floor(rating)
      const hasHalfStar = rating % 1 !== 0

      return (
        <div className='flex mb-4 justify-center'>
          {[...Array(5)].map((_, i) => {
            if (i < fullStars) {
              return <FaStarSolid key={i} className='h-5 w-5 text-yellow-500' />
            } else if (i === fullStars && hasHalfStar) {
              return (
                <FaRegStarHalfStroke
                  key={i}
                  className='h-5 w-5 text-yellow-500'
                />
              )
            } else {
              return (
                <FaStarOutline key={i} className='h-5 w-5 text-yellow-500' />
              )
            }
          })}
        </div>
      )
    }

    return (
      <div className='w-full bg-base-100 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg flex flex-col items-center text-center'>
        <img
          src={testimonial.photo}
          alt={testimonial.name}
          className='w-24 h-24 md:w-20 md:h-20 rounded-full mb-4'
        />
        {renderStars(testimonial.rating)}
        <p className='text-base md:text-lg mb-4'>"{testimonial.quote}"</p>
        <h4 className='font-semibold text-lg md:text-xl mb-1'>
          {testimonial.name}
        </h4>
        <p className='text-gray-600 mb-0'>{testimonial.position}</p>
      </div>
    )
  }
)

export default function TestimonialsSection () {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isPaused])

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    )
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <h2 className='text-xl md:text-2xl lg:text-3xl font-bold mb-8 text-center text-primary'>
          Testimonials
        </h2>
        <div
          className='relative max-w-4xl md:max-w-7xl mx-auto'
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className='flex items-center justify-between space-x-4'>
            <button
              className='btn btn-sm btn-circle btn-neutral transition-colors duration-300 hover:bg-neutral-focus'
              onClick={handlePrev}
              aria-label='Previous testimonial'
            >
              <FaChevronLeft className='h-4 w-4' />
            </button>
            <TestimonialCard testimonial={testimonials[currentIndex]} />
            <button
              className='btn btn-sm btn-circle btn-neutral transition-colors duration-300 hover:bg-neutral-focus'
              onClick={handleNext}
              aria-label='Next testimonial'
            >
              <FaChevronRight className='h-4 w-4' />
            </button>
          </div>
          <div className='flex justify-center mt-6 space-x-2'>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-2 w-8 rounded-full transition-colors duration-300 ${
                  currentIndex === index ? 'bg-primary' : 'bg-neutral'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
