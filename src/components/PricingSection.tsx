import { memo } from 'react'
import { FaCheck } from 'react-icons/fa6'
import Link from 'next/link'
import plans from '@/data/plans.json'

interface Plan {
  name: string
  price: string
  features: string[]
  link: string
}

const PlanCard = memo(({ plan }: { plan: Plan }) => (
  <div
    key={plan.name}
    className='bg-base-100 rounded-xl shadow-xl overflow-hidden flex flex-col items-center'
  >
    <div className='p-8 flex-1 text-center'>
      <h3 className='text-xl sm:text-2xl font-semibold mb-4 text-white'>
        {plan.name}
      </h3>
      <p className='text-lg sm:text-xl font-bold mb-6 text-primary'>
        {plan.price}
      </p>
      <div className='border-t border-gray-500 my-4'></div>
      <ul className='space-y-4'>
        {plan.features.map((feature, index) => (
          <li
            key={index}
            className='flex items-center justify-center space-x-3'
          >
            <FaCheck className='w-5 h-5 text-primary' />
            <span className='text-gray-400'>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className='p-8 w-full'>
      <Link
        href={plan.link}
        className='bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-full py-3 px-6 flex items-center justify-center shadow-md transition-colors duration-300 hover:from-blue-600 hover:to-teal-600'
      >
        Get Started
      </Link>
    </div>
  </div>
))

export default function PricingSection () {
  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 border-b border-gray-700'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <h2 className='text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center text-primary'>
          Pricing Plans
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {plans.map((plan: Plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  )
}
