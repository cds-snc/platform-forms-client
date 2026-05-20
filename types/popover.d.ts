/* eslint-disable @typescript-eslint/no-unused-vars */

// Allowed custom attributes for the experimental Popover API used in some components
// This file augments React's HTML attributes so JSX accepts Popover API attributes.

declare module "react" {
  interface HTMLAttributes<T> {
    popover?: boolean | string;
    anchorName?: string;
  }

  interface ButtonHTMLAttributes<T> {
    popovertarget?: string;
    popovertargetaction?: string;
    interestfor?: string;
  }
}

export {};
