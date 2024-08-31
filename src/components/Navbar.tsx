'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaBars, FaGithub } from 'react-icons/fa6'
import brand from '@/data/brand.json'
import menuData from '@/data/menu.json'
import { useEffect } from 'react'

export default function Navbar () {
  const logo = brand
  const menuItems = menuData.items

  useEffect(() => {
    const handleResize = () => {
      const drawerToggle = document.getElementById(
        'drawer-toggle'
      ) as HTMLInputElement | null
      if (drawerToggle && window.innerWidth >= 1024 && drawerToggle.checked) {
        drawerToggle.checked = false
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const closeDrawer = () => {
    const drawerToggle = document.getElementById(
      'drawer-toggle'
    ) as HTMLInputElement | null
    if (drawerToggle) {
      drawerToggle.checked = false
    }
  }

  return (
    <div className='drawer drawer-mobile'>
      {/* Drawer Toggle for Mobile */}
      <input id='drawer-toggle' type='checkbox' className='drawer-toggle' />

      <div className='drawer-content flex flex-col'>
        {/* Navbar */}
        <div className='navbar bg-base-300 w-full flex items-center justify-between px-4 py-2 relative z-30'>
          <div className='flex-none lg:hidden'>
            <label
              htmlFor='drawer-toggle'
              aria-label='open sidebar'
              className='btn btn-square btn-ghost'
            >
              <FaBars className='inline-block h-6 w-6 stroke-current' />
            </label>
          </div>
          <Link
            href={logo.url}
            className='btn btn-ghost flex items-center gap-2 text-lg text-primary hover:text-primary-focus'
          >
            <Image
              alt={logo.alt}
              src={logo.logo}
              width={32}
              height={32}
              className='w-10 h-10'
            />
            <span className='font-bold absolute left-1/2 transform -translate-x-1/2 lg:static lg:transform-none'>
              {logo.name}
            </span>
          </Link>
          <div className='hidden lg:flex flex-1 items-center justify-end ml-auto'>
            <ul className='menu menu-horizontal px-1 flex items-center space-x-4'>
              {menuItems.map((item, index) => (
                <li key={index} className='relative flex items-center'>
                  {item.text === 'GitHub' ? (
                    <a
                      href={item.href}
                      className='btn btn-neutral rounded-full bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2 px-4 py-2 ml-4'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <FaGithub />
                      <span className='hidden lg:inline'>{item.text}</span>
                    </a>
                  ) : item.submenu ? (
                    <details className='group'>
                      <summary className='cursor-pointer flex items-center gap-1 text-primary hover:text-primary-focus'>
                        {item.text}
                      </summary>
                      <ul className='dropdown-content menu bg-base-100 p-4 rounded-box shadow-lg w-56 mt-2 absolute right-0 top-full z-50 space-y-2'>
                        {item.submenu.map((subitem, subindex) => (
                          <li key={subindex}>
                            <Link
                              href={subitem.href}
                              className='text-primary hover:text-primary-focus'
                              onClick={closeDrawer}
                            >
                              {subitem.text}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <Link
                      href={item.href}
                      className='py-2 px-4 rounded hover:bg-primary-focus text-primary hover:text-white transition-colors duration-300'
                      onClick={closeDrawer}
                    >
                      {item.text}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Drawer Side for Mobile */}
      <div className='drawer-side z-40'>
        <label
          htmlFor='drawer-toggle'
          aria-label='close sidebar'
          className='drawer-overlay'
        ></label>
        <ul className='menu bg-base-200 min-h-full w-80 p-4 z-50 space-y-4'>
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.text === 'GitHub' ? (
                <a
                  href={item.href}
                  className='flex items-center p-4 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-300'
                  target='_blank'
                  rel='noopener noreferrer'
                  onClick={closeDrawer}
                >
                  <FaGithub className='text-3xl mr-4' />
                  <div className='flex flex-col'>
                    <span className='text-xl font-semibold'>{item.text}</span>
                    <p className='text-sm mt-1'>{item.description}</p>
                  </div>
                </a>
              ) : item.submenu ? (
                <details className='group'>
                  <summary className='cursor-pointer flex items-center justify-between w-full text-primary hover:text-primary-focus'>
                    <span>{item.text}</span>
                  </summary>
                  <ul className='list-disc ml-4 mt-2 space-y-1'>
                    {item.submenu.map((subitem, subindex) => (
                      <li key={subindex}>
                        <Link
                          href={subitem.href}
                          className='text-primary hover:text-primary-focus'
                          onClick={closeDrawer}
                        >
                          {subitem.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <Link
                  href={item.href}
                  className='block py-2 px-4 rounded hover:bg-primary-focus text-primary hover:text-white transition-colors duration-300'
                  onClick={closeDrawer}
                >
                  {item.text}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
