export const Hint = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p {...props} className="mb-5 leading-snug">
    {children}
  </p>
);
