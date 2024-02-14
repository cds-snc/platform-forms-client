import React from "react";

interface LoaderProps {
  message?: string;
}

export const Loader = ({ message }: LoaderProps): React.ReactElement => {
  return (
    <div
      id="react-hydration-loader"
      data-testid="loading-spinner"
      role="status"
      className="text-center"
    >
      {message && <p className="pb-8">{message}</p>}
      <div className="flex items-center justify-center">
        <div className="h-40 w-40 animate-spin rounded-full border-y-4 border-indigo-700"></div>
      </div>
    </div>
  );
};

export default Loader;
