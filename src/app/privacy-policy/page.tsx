import { FaEnvelope, FaPhone, FaMap } from 'react-icons/fa6'
import contactData from '@/data/contact.json'

export const metadata = {
  title: 'Privacy Policy',
  description:
    'Learn about how IduGeni SabdoDadi handles your personal information and privacy.',
}

type IconName = 'FaEnvelope' | 'FaPhone' | 'FaMap'

const iconMap: Record<IconName, React.ComponentType<{ className?: string }>> = {
  FaEnvelope: FaEnvelope,
  FaPhone: FaPhone,
  FaMap: FaMap,
}

const PrivacyPolicy = () => {
  const contact = contactData.contact

  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 text-base-content'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center text-primary'>
          Privacy Policy
        </h1>

        <div className='mb-8'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-4'>
            Introduction
          </h2>
          <p className='text-base-content'>
            Welcome to IduGeni SabdoDadi's Privacy Policy. We value your privacy
            and are committed to protecting your personal information. This
            policy outlines how we collect, use, and safeguard your data.
          </p>
        </div>

        <div className='mb-8'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-4'>
            Information We Collect
          </h2>
          <p className='text-base-content'>
            We collect various types of information, including personal
            identification information, contact details, and usage data. This
            information helps us improve our services and ensure a better user
            experience.
          </p>
        </div>

        <div className='mb-8'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-4'>
            How We Use Your Information
          </h2>
          <p className='text-base-content'>
            The information we collect is used to personalize your experience,
            improve our website, and communicate with you regarding updates and
            promotions. We do not share your information with third parties
            without your consent.
          </p>
        </div>

        <div className='mb-8'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-4'>
            Your Rights
          </h2>
          <p className='text-base-content'>
            You have the right to access, correct, or delete your personal
            information. If you wish to exercise these rights or have any
            questions about our privacy practices, please contact us.
          </p>
        </div>

        <div className='mb-8'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-4'>
            Contact Us
          </h2>
          <div className='flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0'>
            {contact.map((info, index) => {
              const IconComponent = iconMap[info.icon as IconName]
              return (
                <div
                  key={index}
                  className='card bg-neutral text-neutral-content flex-1'
                >
                  <div className='card-body flex flex-row items-center'>
                    <div className='w-12 h-12 bg-base-100 rounded-full flex items-center justify-center'>
                      <IconComponent className='w-6 h-6 text-primary' />
                    </div>
                    <span className='ml-4 text-base-content'>{info.value}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className='mb-8'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-4'>
            Changes to This Policy
          </h2>
          <p className='text-base-content'>
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new policy on this page. You are
            advised to review this policy periodically for any changes.
          </p>
        </div>
      </div>
    </section>
  )
}

export default PrivacyPolicy
