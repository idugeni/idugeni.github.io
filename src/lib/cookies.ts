'use server';

import { cookies } from 'next/headers';

/**
 * Utility functions for managing cookies
 */

/**
 * Delete a cookie by setting its value to empty
 */
export async function deleteCookie(name: string) {
  cookies().set(name, '');
}

/**
 * Delete a cookie by setting maxAge to 0
 */
export async function deleteCookieWithMaxAge(name: string) {
  cookies().set(name, 'value', { maxAge: 0 });
}

/**
 * Delete a cookie by setting it to expire in the past
 */
export async function deleteCookieWithExpiry(name: string) {
  const oneDay = 24 * 60 * 60 * 1000;
  cookies().set(name, 'value', { expires: new Date(Date.now() - oneDay) });
}

/**
 * Delete multiple cookies at once
 */
export async function deleteMultipleCookies(names: string[]) {
  names.forEach(name => {
    cookies().delete(name);
  });
}