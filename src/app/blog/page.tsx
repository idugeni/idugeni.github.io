import Image from 'next/image'
import Link from 'next/link'
import blogsData from '@/data/blogs.json'

export const metadata = {
  title: 'Blog',
  description:
    'Discover insights, updates, and stories from IduGeni SabdoDadi.',
}

const Blog = () => {
  const blogs = blogsData

  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 text-base-content'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center text-primary'>
          Blog
        </h1>
        <p className='text-center mb-12'>
          Explore the latest insights, updates, and stories from IduGeni
          SabdoDadi.
        </p>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8'>
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className='card bg-base-100 shadow-lg transition-shadow duration-300 hover:shadow-2xl'
            >
              <figure className='relative'>
                <Image
                  src={blog.image}
                  alt={blog.title}
                  className='w-full h-48 object-cover rounded-t-lg'
                  width={500}
                  height={300}
                />
              </figure>
              <div className='card-body'>
                <h2 className='card-title text-lg font-semibold'>
                  {blog.title}
                </h2>
                <p className='text-sm mb-4'>{blog.date}</p>
                <p className='text-base mb-4'>{blog.excerpt}</p>
                <div className='card-actions mt-4'>
                  <Link
                    href={blog.url}
                    className='inline-block w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary text-white transition-all duration-300 hover:from-secondary hover:to-primary hover:text-black'
                  >
                    Read More
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

export default Blog
