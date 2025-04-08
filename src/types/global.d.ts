interface Turnstile {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
    }
  ) => void;
}

interface Window {
  turnstile?: Turnstile;
  __turnstileScriptLoaded?: boolean;
  onloadTurnstileCallback?: () => void;
}
