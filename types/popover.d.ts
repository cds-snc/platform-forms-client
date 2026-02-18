// Allowed custom attributes for the experimental Popover API used in some components
// This file augments React's HTML attributes so JSX accepts `popover` and `popovertarget`.

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      // allow passing these attributes to any intrinsic element
      popover?: boolean | string;
      popovertarget?: string;
      anchorName?: string;
    }
  }
}

export {};
