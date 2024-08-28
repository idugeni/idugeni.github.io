import Image from 'next/image'
import Link from 'next/link'
import { FaBars, FaChevronDown } from 'react-icons/fa6'
import brand from '@/data/brand.json'
import menuData from '@/data/menuData.json'

type MenuItem = {
  text: string
  href: string
  submenu?: MenuItem[]
  btn?: boolean
}

type Brand = {
  alt: string
  logo: string
  name: string
  description: string
  url: string
}

export default function Navbar () {
  const logo: Brand = brand
  const menuItems: MenuItem[] = menuData.items

  return (
    <nav className='navbar bg-base-300 shadow-md px-4 py-2 flex items-center justify-between'>
      <Link
        href={logo.url}
        className='btn btn-neutral flex items-center gap-2 text-lg text-primary hover:text-primary-focus'
      >
        <Image
          alt={logo.alt}
          src={logo.logo}
          width={24}
          height={24}
          className='w-8'
        />
        <span className='font-bold'>{logo.name}</span>
      </Link>

      <div className='dropdown dropdown-end sm:hidden'>
        <button className='text-lg text-primary hover:text-primary-focus'>
          <FaBars />
        </button>

        <ul
          tabIndex={0}
          className='dropdown-content menu bg-base-200 p-4 rounded-box shadow-lg w-64 mt-2 z-10 space-y-2'
        >
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.submenu ? (
                <>
                  <h2 className='font-semibold'>{item.text}</h2>
                  <ul className='space-y-1 ml-4'>
                    {item.submenu.map((subitem, subindex) => (
                      <li key={subindex}>
                        <Link
                          href={subitem.href}
                          className='text-primary hover:text-primary-focus'
                        >
                          {subitem.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Link
                  href={item.href}
                  className='block py-2 px-4 rounded hover:bg-primary-focus text-primary hover:text-white transition-colors duration-300'
                >
                  {item.text}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className='hidden sm:flex gap-4 items-center'>
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={item.submenu ? 'dropdown dropdown-end' : undefined}
          >
            {item.submenu ? (
              <>
                <button className='flex items-center gap-1 text-primary hover:text-primary-focus'>
                  {item.text}
                  <FaChevronDown />
                </button>
                <ul
                  tabIndex={0}
                  className='dropdown-content menu bg-base-200 p-6 rounded-box shadow-lg w-56 mt-2 z-10 space-y-2'
                >
                  {item.submenu.map((subitem, subindex) => (
                    <li key={subindex}>
                      <Link
                        href={subitem.href}
                        className='text-primary hover:text-primary-focus'
                      >
                        {subitem.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Link
                href={item.href}
                className='py-2 px-4 rounded hover:bg-primary-focus text-primary hover:text-white transition-colors duration-300'
              >
                {item.text}
              </Link>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}
