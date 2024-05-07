import React from "react";

interface LoaderProps {
  message?: string;
  className?: string;
}

export const Loader = ({ message, className }: LoaderProps): React.ReactElement => {
  return (
    <div
      id="react-hydration-loader"
      data-testid="loading-spinner"
      role="status"
      className={className}
    >
      <div className="text-center">
        {message && <p className="pb-8">{message}</p>}
        <div className="flex items-center justify-center">
          <div className="size-40 animate-spin rounded-full border-y-4 border-indigo-700"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
