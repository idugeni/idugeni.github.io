interface ReCaptchaRenderParameters {
  sitekey: string;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  theme?: 'light' | 'dark';
}

interface ReCaptchaInstance {
  ready: (callback: () => void) => void;
  render: (container: HTMLElement | string, parameters: ReCaptchaRenderParameters) => number;
  reset: (widgetId?: number) => void;
  execute: (widgetId?: number) => Promise<string>;
  getResponse: (widgetId?: number) => string;
}

interface Window {
  grecaptcha: ReCaptchaInstance;
  onRecaptchaLoad?: () => void;
}
