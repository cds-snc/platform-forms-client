import React from "react";

interface LoaderProps {
  message: string;
}

export const Loader = ({ message }: LoaderProps): React.ReactElement => {
  return (
    <div data-testid="loading-spinner" role="status" className="text-center">
      <p className="pb-8">{message}</p>
      <div className="flex items-center justify-center">
        <div className="w-40 h-40 border-t-4 border-b-4 border-green-default rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default Loader;
