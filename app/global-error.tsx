"use client";

// TODO: this should catch errors from the root layout but is not.
export default function GlobalError({
  // error,
  reset,
}: {
  // error: Error & { digest?: string }
  reset: () => void;
}) {
  // TODO: semantics, design and content

  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
