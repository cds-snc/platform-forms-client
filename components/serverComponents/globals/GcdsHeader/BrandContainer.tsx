export const BrandContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="gcds-header__brand">
      <div className="brand__container">{children}</div>
    </div>
  );
};
