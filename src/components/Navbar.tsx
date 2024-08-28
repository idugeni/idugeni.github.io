'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaBars, FaGithub } from 'react-icons/fa6';
import brand from '@/data/brand.json';
import menuData from '@/data/menuData.json';
import { useEffect } from 'react';

type MenuItem = {
  text: string;
  href: string;
  submenu?: MenuItem[];
  btn?: boolean;
  icon?: string;
  description?: string;
  external?: boolean;
};

type Brand = {
  alt: string;
  logo: string;
  name: string;
  description: string;
  url: string;
};

export default function Navbar() {
  const logo: Brand = brand;
  const menuItems: MenuItem[] = menuData.items;

  useEffect(() => {
    const handleResize = () => {
      const drawerToggle = document.getElementById('drawer-toggle') as HTMLInputElement;
      if (window.innerWidth >= 1024 && drawerToggle.checked) {
        drawerToggle.checked = false; // Close drawer on desktop view
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="drawer drawer-mobile">
      {/* Drawer Toggle for Mobile */}
      <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="navbar bg-base-300 w-full flex items-center justify-between px-4 py-2 relative z-30">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="drawer-toggle"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <FaBars className="inline-block h-6 w-6 stroke-current" />
            </label>
          </div>
          <Link
            href={logo.url}
            className="btn btn-ghost flex items-center gap-2 text-lg text-primary hover:text-primary-focus z-30"
          >
            <Image
              alt={logo.alt}
              src={logo.logo}
              width={32}
              height={32}
              className="w-10 h-10"
            />
            <span className="hidden lg:inline font-bold">{logo.name}</span>
          </Link>
          <div className="hidden lg:flex flex-none items-center justify-center">
            <ul className="menu menu-horizontal px-1">
              {menuItems.map((item, index) => (
                <li key={index} className="relative">
                  {item.text === "GitHub" ? (
                    <a
                      href={item.href}
                      className="btn btn-neutral rounded-full bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2 px-4 py-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaGithub />
                      <span className="hidden lg:inline">{item.text}</span>
                    </a>
                  ) : item.submenu ? (
                    <details className="group">
                      <summary className="cursor-pointer flex items-center gap-1 text-primary hover:text-primary-focus">
                        {item.text}
                      </summary>
                      <ul className="dropdown-content menu bg-base-200 p-4 rounded-box shadow-lg w-56 mt-2 absolute right-0 top-full z-50 space-y-2">
                        {item.submenu.map((subitem, subindex) => (
                          <li key={subindex}>
                            <Link
                              href={subitem.href}
                              className="text-primary hover:text-primary-focus"
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
                      className="py-2 px-4 rounded hover:bg-primary-focus text-primary hover:text-white transition-colors duration-300"
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
      <div className="drawer-side z-40">
        <label htmlFor="drawer-toggle" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu bg-base-200 min-h-full w-80 p-4 z-50">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.text === "GitHub" ? (
                <a
                  href={item.href}
                  className="py-4 px-6 rounded-lg bg-gray-800 text-white flex items-center gap-2 hover:bg-gray-700 transition-colors duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub className="text-xl" />
                  <div>
                    <span className="block font-bold">GitHub</span>
                    <p className="mt-2 text-sm">{item.description}</p>
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
                >
                  {item.text}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
