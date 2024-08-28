import features from '@/data/features.json'
import { FaShieldCat, FaMobile, FaCommentDots } from 'react-icons/fa6'

type Feature = {
  id: string
  title: string
  description: string
  icon: string
}

const iconMap = {
  FaShieldCat,
  FaMobile,
  FaCommentDots,
}

const FeaturesSection = () => {
  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 border-b border-neutral'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <h2 className='text-xl md:text-2xl lg:text-3xl font-bold mb-8 text-center text-primary'>
          Our Features
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
          {features.map((feature: Feature) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            return (
              <div
                key={feature.id}
                className='bg-gradient-to-r from-indigo-700 to-blue-600 rounded-lg shadow-lg p-6 flex flex-col items-center transition-transform duration-300 ease-in-out hover:shadow-2xl hover:bg-base-800 group'
              >
                <div className='flex items-center justify-center mb-6 w-14 h-14 rounded-full bg-neutral text-primary transition-colors duration-300 ease-in-out group-hover:bg-primary'>
                  <Icon className='w-8 h-8 text-primary transition-colors duration-300 ease-in-out group-hover:text-base-100' />
                </div>
                <h3 className='text-xl md:text-2xl font-semibold mb-4 text-neutral transition-colors duration-300 ease-in-out group-hover:text-base-100'>
                  {feature.title}
                </h3>
                <p className='text-neutral-400 transition-colors duration-300 ease-in-out group-hover:text-neutral-300'>
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
