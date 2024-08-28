import { FaEnvelope } from 'react-icons/fa6'

export default function NewsletterSignup () {
  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 border-b border-gray-700'>
      <div className='flex flex-col md:flex-row items-center justify-center gap-8 px-4 md:px-6 lg:px-8'>
        <div className='flex-1 text-center md:text-left'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-primary'>
            Stay Updated with Our Newsletter
          </h2>
          <p className='mb-6'>
            Subscribe to receive the latest updates, news, and special offers
            directly to your inbox. Stay in the loop with everything that's
            happening.
          </p>
        </div>

        <div className='flex-1 w-full'>
          <div className='bg-base-100 shadow-lg rounded-lg w-full'>
            <div className='p-4 md:p-6 flex flex-col justify-center items-center w-full'>
              <div className='flex items-center mb-4'>
                <h3 className='text-lg font-semibold'>
                  Subscribe to Our Newsletter
                </h3>
              </div>
              <input
                type='email'
                placeholder='Enter your email address'
                aria-label='Email address'
                className='input input-bordered w-full mb-4 focus:outline-none focus:ring-0'
              />
              <button
                type='submit'
                className='bg-primary text-white border border-transparent rounded-md py-2 px-4 w-full text-center flex items-center justify-center transition-colors duration-300 hover:bg-secondary hover:text-gray-900'
              >
                <FaEnvelope className='text-inherit text-lg mr-2' />
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
