'use client';

import { ThemeProvider } from 'next-themes';

export default function RedirectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        {children}
      </div>
    </ThemeProvider>
  );
}