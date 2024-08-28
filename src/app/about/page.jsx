import { FaCircleInfo } from 'react-icons/fa6'

export const metadata = {
  title: 'About Us',
  description:
    'Learn more about IduGeni SabdoDadi, our mission, and what we do.',
}

const AboutPage = () => {
  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 text-base-content'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center text-primary'>
          About Us
        </h1>
        <p className='text-lg text-center mb-12'>
          Showcasing innovation and excellence in personal and professional
          projects.
        </p>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-6'>
            Our Mission
          </h2>
          <p>
            At IduGeni SabdoDadi, our mission is to drive progress and inspire
            creativity through innovative solutions. We are dedicated to
            delivering excellence in every project, whether it's a personal
            endeavor or a professional collaboration. Our commitment to quality
            and innovation is at the core of everything we do.
          </p>
        </section>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-6'>
            What We Do
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='bg-base-100 p-6 rounded-lg shadow-md'>
              <h3 className='text-lg md:text-xl lg:text-2xl font-semibold mb-4'>
                Personal Projects
              </h3>
              <p>
                We explore creative ideas and turn them into reality. From
                individual hobbies to personal goals, our personal projects
                reflect our passion for innovation and design.
              </p>
            </div>
            <div className='bg-base-100 p-6 rounded-lg shadow-md'>
              <h3 className='text-lg md:text-xl lg:text-2xl font-semibold mb-4'>
                Professional Projects
              </h3>
              <p>
                In the professional realm, we tackle complex challenges and
                deliver high-quality solutions. Our expertise spans various
                industries, and we pride ourselves on exceeding client
                expectations.
              </p>
            </div>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-6'>
            Our Values
          </h2>
          <div className='space-y-4'>
            <div className='flex items-center'>
              <FaCircleInfo className='mr-2 text-blue-600' />
              <span>
                Innovation: We embrace new ideas and technologies to drive
                progress.
              </span>
            </div>
            <div className='flex items-center'>
              <FaCircleInfo className='mr-2 text-blue-600' />
              <span>
                Excellence: We strive for perfection in every project we
                undertake.
              </span>
            </div>
            <div className='flex items-center'>
              <FaCircleInfo className='mr-2 text-blue-600' />
              <span>
                Collaboration: We believe in the power of teamwork and open
                communication.
              </span>
            </div>
          </div>
        </section>

        <section className='text-center'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-6'>
            Get in Touch
          </h2>
          <p className='mb-4'>
            Interested in collaborating with us or learning more about our
            projects? Feel free to reach out and connect with us. We’re always
            excited to explore new opportunities and ideas.
          </p>
          <a
            href='/contact'
            className='inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition'
          >
            Contact Us
          </a>
        </section>
      </div>
    </section>
  )
}

export default AboutPage
