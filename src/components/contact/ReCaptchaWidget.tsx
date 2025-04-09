'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface ReCaptchaWidgetProps {
  onVerify: (token: string | null) => void;
}

const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), {
  ssr: false,
});

const ReCaptchaWidget: React.FC<ReCaptchaWidgetProps> = ({ onVerify }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check theme on client-side only
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // Optional: Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setTheme(isDark ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex justify-center items-center w-full rounded-[var(--radius)] bg-background transition-all duration-300 sm:transform-none sm:max-w-none sm:overflow-visible transform scale-90 origin-center max-w-full overflow-hidden">
      <ReCAPTCHA
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
        onChange={onVerify}
        theme={theme}
        size="normal"
      />
    </div>
  );
};

export default ReCaptchaWidget;