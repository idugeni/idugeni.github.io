'use client'

import { useState, memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import blogData from '@/data/blogs.json'

interface Blog {
  id: number
  title: string
  date: string
  excerpt: string
  url: string
  image: string
}

const BlogCard = memo(({ blog }: { blog: Blog }) => (
  <div
    key={blog.id}
    className='bg-base-100 rounded-lg shadow-lg overflow-hidden flex flex-col'
  >
    <Image
      src={blog.image}
      alt={blog.title}
      width={600}
      height={400}
      className='w-full h-48 object-cover'
    />
    <div className='flex-1 p-6'>
      <h3 className='text-xl font-semibold mb-2'>{blog.title}</h3>
      <p className='text-sm text-neutral-500 mb-4'>{blog.date}</p>
      <p className='text-neutral-300 mb-4'>{blog.excerpt}</p>
    </div>
    <div className='p-6'>
      <Link
        href={blog.url}
        className='inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-4 rounded transition-colors duration-300 ease-in-out hover:from-blue-600 hover:to-purple-600 hover:text-neutral-300 focus:outline-none'
      >
        Read More
      </Link>
    </div>
  </div>
))

export default function BlogsSection () {
  const [visibleCount, setVisibleCount] = useState(6)

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 6)
  }

  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 text-base-content border-b border-neutral'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <div className='text-center mb-8'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-primary'>
            Our Blogs
          </h2>
          <p className='text-lg mb-8 max-w-7xl mx-auto'>
            Discover our latest blog posts where we share insights, tips, and
            updates about our industry. Stay informed with our expert opinions
            and analyses.
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {blogData.slice(0, visibleCount).map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

        {visibleCount < blogData.length && (
          <div className='text-center mt-8'>
            <button
              onClick={handleLoadMore}
              className='inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-4 rounded transition-all duration-300 ease-in-out hover:from-blue-600 hover:to-purple-600 hover:text-neutral-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
