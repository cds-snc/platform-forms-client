interface Window {
  dataLayer: Array<unknown>;
  grecaptcha: {
    // Maybe a better way to do this
    execute: (arg1: string | undefined, arg2: Record<string, unknown>) => Promise<string>;
    ready: (arg: () => void) => void;
  };
}
