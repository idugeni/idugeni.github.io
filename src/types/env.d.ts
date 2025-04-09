// env.d.ts

export {};

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      render: (container: HTMLElement | string, parameters?: {
        sitekey: string;
        callback?: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
        size?: 'invisible' | 'compact' | 'normal';
        theme?: 'light' | 'dark';
        badge?: 'bottomright' | 'inline' | 'bottomleft';
      }) => string | number;
      execute: (siteKey?: string, options?: { action?: string }) => Promise<string>;
      reset: (opt?: { id?: string | number }) => void;
    };
  }
}
