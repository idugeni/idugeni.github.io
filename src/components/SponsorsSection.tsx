import Image from 'next/image'
import sponsorsData from '@/data/sponsors.json'

interface Sponsor {
  name: string
  logo: string
}

export default function SponsorsSection () {
  const sponsors: Sponsor[] = sponsorsData

  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 text-base-content border-b border-neutral'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <h2 className='text-xl md:text-2xl lg:text-3xl font-bold mb-8 text-center text-primary'>
          Our Sponsors
        </h2>
        <div className='flex flex-nowrap gap-4 overflow-hidden'>
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className='bg-neutral rounded shadow flex items-center justify-center'
              aria-label={`Visit ${sponsor.name} website`}
            >
              <figure className='p-4 flex items-center justify-center'>
                <Image
                  src={sponsor.logo}
                  alt={`${sponsor.name} logo`}
                  width={400}
                  height={200}
                  className='transition-all duration-300 filter brightness-0 invert hover:brightness-0 hover:invert-0'
                />
              </figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
