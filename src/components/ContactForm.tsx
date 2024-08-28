import { useMemo } from 'react'
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMap,
  FaPaperPlane,
} from 'react-icons/fa6'
import contactData from '@/data/contactInfo.json'

type IconName = 'FaEnvelope' | 'FaPhone' | 'FaMap'

const iconMap: Record<IconName, React.ComponentType<{ className?: string }>> = {
  FaEnvelope: FaEnvelope,
  FaPhone: FaPhone,
  FaMap: FaMap,
}

export default function ContactForm () {
  const contactInfo = useMemo(() => contactData.contactInfo, [])

  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <h2 className='text-xl md:text-2xl lg:text-3xl font-bold mb-8 text-center text-primary'>
          Contact Us
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* Contact Form */}
          <div className='bg-base-300 p-8 rounded-lg shadow-lg'>
            <form method='POST' className='flex flex-col space-y-6'>
              {/* Name Field */}
              <div className='form-control'>
                <label htmlFor='name' className='label'>
                  <span className='label-text'>Name</span>
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    placeholder='Enter your full name here'
                    autoComplete='name'
                    className='input input-bordered w-full pl-12'
                  />
                  <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                    <FaUser className='w-5 h-5 text-gray-500' />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className='form-control'>
                <label htmlFor='email' className='label'>
                  <span className='label-text'>Email</span>
                </label>
                <div className='relative'>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    placeholder='Enter your email address'
                    autoComplete='email'
                    className='input input-bordered w-full pl-12'
                  />
                  <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                    <FaEnvelope className='w-5 h-5 text-gray-500' />
                  </div>
                </div>
              </div>

              {/* Phone Field */}
              <div className='form-control'>
                <label htmlFor='phone' className='label'>
                  <span className='label-text'>Phone (Optional)</span>
                </label>
                <div className='relative'>
                  <input
                    type='tel'
                    id='phone'
                    name='phone'
                    placeholder='Enter your phone number (optional)'
                    autoComplete='tel'
                    className='input input-bordered w-full pl-12'
                  />
                  <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                    <FaPhone className='w-5 h-5 text-gray-500' />
                  </div>
                </div>
              </div>

              {/* Message Field */}
              <div className='form-control'>
                <label htmlFor='message' className='label'>
                  <span className='label-text'>Message</span>
                </label>
                <textarea
                  id='message'
                  name='message'
                  placeholder='Type your message here'
                  rows={4}
                  autoComplete='off'
                  className='textarea textarea-bordered resize-none'
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                className='w-full bg-primary text-base-100 py-3 rounded-full flex items-center justify-center gap-2 shadow-md hover:bg-primary-dark hover:text-white focus:outline-none'
              >
                <FaPaperPlane className='w-5 h-5' />
                <span>Send Message</span>
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className='bg-base-300 p-8 rounded-lg shadow-lg'>
            <h3 className='text-center text-xl font-semibold text-gray-100 mb-4'>
              Our Contact Information
            </h3>
            <ul className='space-y-4'>
              {contactInfo.map((info, index) => {
                const IconComponent = iconMap[info.icon as IconName]
                return (
                  <li key={index} className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-neutral rounded-full flex items-center justify-center'>
                      <IconComponent className='w-6 h-6 text-gray-400' />
                    </div>
                    <span className='text-gray-300'>{info.value}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
