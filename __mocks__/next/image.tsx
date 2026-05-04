/**
 * Mock for next/image module for testing
 * Replaces Next.js Image component with a simple img element
 */

import React from "react";

export interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  "aria-hidden"?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, width, height, className, ...props }, ref) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
    />
  )
);

Image.displayName = "Image";

export default Image;
