import {
  FaEnvelope,
  FaPhone,
  FaMap,
  FaUser,
  FaPaperPlane,
  FaMessage,
} from 'react-icons/fa6'
import contactData from '@/data/contactInfo.json'

export const metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with IduGeni SabdoDadi for any inquiries or collaborations.',
}

const iconsMap = {
  FaEnvelope: <FaEnvelope />,
  FaPhone: <FaPhone />,
  FaMap: <FaMap />,
}

const ContactPage = () => {
  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 text-base-content'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center text-primary'>
          Contact Us
        </h1>
        <p className='text-lg text-center mb-12'>
          We’d love to hear from you! Whether you have a question, want to
          collaborate, or just want to say hello, feel free to reach out.
        </p>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-6 text-center'>
            How to Reach Us
          </h2>
          <div className='flex flex-col md:flex-row justify-center items-center gap-8'>
            {contactData.contactInfo.map((info, index) => (
              <div
                key={index}
                className='bg-base-100 p-6 rounded-lg shadow-md w-full md:w-1/3 text-center'
              >
                <div className='flex justify-center mb-4'>
                  <div className='text-primary text-4xl'>
                    {iconsMap[info.icon]}
                  </div>
                </div>
                <h3 className='text-lg md:text-xl lg:text-2xl font-semibold mb-4'>
                  {info.type}
                </h3>
                <p>{info.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className='text-center'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-6'>
            Send Us a Message
          </h2>
          <p className='mb-8'>
            Alternatively, you can fill out the contact form below, and we will
            get back to you as soon as possible.
          </p>
          <div className='max-w-2xl mx-auto bg-base-100 p-6 rounded-lg shadow-md'>
            <form>
              <div className='form-control mb-6'>
                <label htmlFor='name' className='label'>
                  <span className='label-text text-lg font-semibold text-left'>
                    Your Name
                  </span>
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    id='name'
                    className='input input-bordered bg-base-200 placeholder-base-content/50 w-full pl-10 border-none ring-none'
                    placeholder='Enter your name'
                    required
                  />
                  <FaUser className='absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5' />
                </div>
              </div>

              <div className='form-control mb-6'>
                <label htmlFor='email' className='label'>
                  <span className='label-text text-lg font-semibold text-left'>
                    Your Email
                  </span>
                </label>
                <div className='relative'>
                  <input
                    type='email'
                    id='email'
                    className='input input-bordered bg-base-200 placeholder-base-content/50 w-full pl-10 border-none ring-none'
                    placeholder='Enter your email'
                    required
                  />
                  <FaEnvelope className='absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5' />
                </div>
              </div>

              <div className='form-control mb-6'>
                <label htmlFor='message' className='label'>
                  <span className='label-text text-lg font-semibold text-left'>
                    Your Message
                  </span>
                </label>
                <div className='relative'>
                  <textarea
                    id='message'
                    rows='4'
                    className='textarea textarea-bordered bg-base-200 placeholder-base-content/50 w-full resize-none border-none ring-none'
                    placeholder='Enter your message'
                    required
                  />
                  <FaMessage className='absolute right-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5' />
                </div>
              </div>

              <button
                type='submit'
                className='inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition'
              >
                <FaPaperPlane />
                Send Message
              </button>
            </form>
          </div>
        </section>
      </div>
    </section>
  )
}

export default ContactPage
