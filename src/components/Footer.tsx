'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaGithub,
  FaLinkedinIn,
  FaYoutube,
  FaPinterestP,
  FaTiktok,
  FaEnvelope,
  FaPhone,
  FaMap,
} from 'react-icons/fa6'

import brand from '@/data/brand.json'
import navigationLinks from '@/data/navigation.json'
import socialMedia from '@/data/socialMedia.json'
import contact from '@/data/contact.json'

// Define an enum for icon names
enum IconName {
  FaFacebookF = 'FaFacebookF',
  FaTwitter = 'FaTwitter',
  FaInstagram = 'FaInstagram',
  FaGithub = 'FaGithub',
  FaLinkedinIn = 'FaLinkedinIn',
  FaYoutube = 'FaYoutube',
  FaPinterestP = 'FaPinterestP',
  FaTiktok = 'FaTiktok',
  FaEnvelope = 'FaEnvelope',
  FaPhone = 'FaPhone',
  FaMap = 'FaMap',
}

const iconMap: { [key in IconName]: React.ElementType } = {
  [IconName.FaFacebookF]: FaFacebookF,
  [IconName.FaTwitter]: FaTwitter,
  [IconName.FaInstagram]: FaInstagram,
  [IconName.FaGithub]: FaGithub,
  [IconName.FaLinkedinIn]: FaLinkedinIn,
  [IconName.FaYoutube]: FaYoutube,
  [IconName.FaPinterestP]: FaPinterestP,
  [IconName.FaTiktok]: FaTiktok,
  [IconName.FaEnvelope]: FaEnvelope,
  [IconName.FaPhone]: FaPhone,
  [IconName.FaMap]: FaMap,
}

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-base-300 text-base-content border-t border-neutral'>
      <div className='container mx-auto py-10 px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12'>
          {/* Logo and Description */}
          <div className='text-center'>
            <Image
              src={brand.logo}
              alt={brand.alt}
              width={150}
              height={150}
              className='mx-auto mb-4'
            />
            <p className='mb-4'>{brand.description}</p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className='text-lg font-semibold mb-2 text-center lg:text-left'>
              Navigation
            </h3>
            <hr className='border-t-2 border-primary w-full mb-4' />
            <ul className='list-disc list-inside space-y-2'>
              {navigationLinks.links.map((link) => (
                <li key={link.url}>
                  <Link href={link.url} className='link link-hover'>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className='text-lg font-semibold mb-2 text-center lg:text-left'>
              Social Media
            </h3>
            <hr className='border-t-2 border-primary w-full mb-4' />
            <div className='grid grid-cols-2 gap-4'>
              {socialMedia.socialMedia.map((media) => {
                const IconComponent =
                  iconMap[media.icon as keyof typeof iconMap]
                return (
                  <Link key={media.url} href={media.url} className='block'>
                    <div className='flex flex-col items-center bg-base-100 p-4 rounded-lg shadow'>
                      <IconComponent className='text-primary text-3xl mb-2 transition-colors duration-300 hover:text-neutral-300' />
                      <p className='text-sm text-center'>{media.platform}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className='text-lg font-semibold mb-2 text-center lg:text-left'>
              Contact Us
            </h3>
            <hr className='border-t-2 border-primary w-full mb-4' />
            <div className='space-y-4'>
              {contact.contact.map((contact) => {
                const IconComponent =
                  iconMap[contact.icon as keyof typeof iconMap]
                return (
                  <div
                    key={contact.value}
                    className='flex items-center bg-base-100 p-4 rounded-lg shadow'
                  >
                    <IconComponent className='text-primary text-3xl mr-4 transition-colors duration-300 hover:text-neutral-300' />
                    <div>
                      <p className='font-semibold'>{contact.type}</p>
                      {contact.type === 'Email' ? (
                        <Link
                          href={`mailto:${contact.value}`}
                          className='link link-hover'
                        >
                          {contact.value}
                        </Link>
                      ) : (
                        <p>{contact.value}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className='border-t border-neutral mt-8 pt-4 text-center'>
          <p>
            &copy; {currentYear}{' '}
            <Link href={brand.url} className='link link-hover'>
              {brand.name}
            </Link>
            . All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
