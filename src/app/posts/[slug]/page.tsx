import { getPostBySlug } from '@/lib/posts'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface PostProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return { title: 'Not Found', description: 'Article not found' }
  }

  return {
    title: post.metadata.title,
    description: post.metadata.excerpt || 'No description available',
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.excerpt,
      images: [
        {
          url: post.metadata.image,
          width: 1200,
          height: 675,
          alt: post.metadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metadata.title,
      description: post.metadata.excerpt,
      image: post.metadata.image,
    },
  }
}

const BlogPost = async ({ params }: PostProps) => {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 text-base-content'>
      <article className='container mx-auto px-4 md:px-6 lg:px-8'>
        {/* Breadcrumb */}
        <nav className='text-sm breadcrumbs mb-6'>
          <ul>
            <li>
              <Link href='/' className='text-primary'>
                Home
              </Link>
            </li>
            <li>
              <Link href='/blog' className='text-primary' prefetch={false}>
                Blog
              </Link>
            </li>
            <li className='text-secondary'>{post.metadata.title}</li>
          </ul>
        </nav>

        {/* Title and Date */}
        <header className='mb-6'>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-center text-white drop-shadow-lg'>
            {post.metadata.title}
          </h1>
          <div className='flex flex-col md:flex-row justify-between items-center mb-4'>
            <p className='text-sm sm:text-base mb-2 md:mb-0'>
              Author:{' '}
              <span className='badge badge-primary'>
                {post.metadata.author}
              </span>
            </p>
            <p className='text-sm sm:text-base'>
              Published on:{' '}
              <span className='badge badge-primary'>
                {new Date(post.metadata.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </p>
          </div>
        </header>

        {/* Featured Image */}
        <figure className='mb-6'>
          <Image
            src={post.metadata.image}
            alt={post.metadata.title}
            className='w-full h-auto rounded-lg shadow-lg object-cover'
            width={1200}
            height={675}
            priority
          />
        </figure>

        {/* Content */}
        <section className='prose prose-lg mb-6'>
          <MDXRemote source={post.content} />
        </section>

        {/* Metadata */}
        <footer className='mt-8'>
          <div className='stats stats-vertical lg:stats-horizontal w-full mx-auto bg-base-100 shadow-md rounded-lg'>
            {/* Category Stat */}
            <div className='stat text-center'>
              <div className='stat-title'>Category</div>
              <div className='stat-value font-semibold'>
                {post.metadata.category}
              </div>
            </div>

            {/* Tags Stat */}
            <div className='stat text-center'>
              <div className='stat-title mb-2 md:mb-4'>Tags</div>
              <div className='stat-value flex flex-wrap justify-center items-center gap-2'>
                {post.metadata.tags.map((tag: string, index: number) => (
                  <span key={index} className='badge badge-secondary'>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Read Count Stat */}
            <div className='stat text-center'>
              <div className='stat-title'>Read Count</div>
              <div className='stat-value font-semibold'>
                {post.metadata.readers}
              </div>
            </div>
          </div>
        </footer>
      </article>
    </section>
  )
}

export default BlogPost
