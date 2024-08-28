'use client'

import Image from 'next/image'

interface Sponsor {
  name: string
  logo: string
  url: string
}

export default function SponsorsSection () {
  const sponsors: Sponsor[] = [
    {
      name: 'Next.js',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg',
      url: 'https://nextjs.org/',
    },
    {
      name: 'TypeScript',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/TypeScript_Logo_%28Blue%29.svg',
      url: 'https://www.typescriptlang.org/',
    },
    {
      name: 'GitHub',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/GitHub_logo_2013.svg',
      url: 'https://github.com/',
    },
    {
      name: 'Vercel',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Vercel_logo_black.svg',
      url: 'https://vercel.com/',
    },
    {
      name: 'Node.js',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Node.js_logo_2015.svg',
      url: 'https://nodejs.org/',
    },
  ]

  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 border-b border-gray-700'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <h2 className='text-xl md:text-2xl lg:text-3xl font-bold mb-8 text-center text-primary'>
          Our Sponsors
        </h2>
        <div className='flex justify-between items-center space-x-4 w-full'>
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.name}
              href={sponsor.url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex-1 flex justify-center filter invert hover:filter-none transition-all duration-300'
              aria-label={`Visit ${sponsor.name} website`}
            >
              <Image
                src={sponsor.logo}
                alt={`${sponsor.name} logo`}
                width={100}
                height={100}
                className='object-contain filter grayscale drop-shadow hover:grayscale-0'
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
