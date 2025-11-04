import React from "react";

interface MapleLeafLoaderProps {
  message?: string;
  className?: string;
  width?: number;
  height?: number;
}

export const MapleLeafLoader = ({
  message,
  className = "",
  width = 180,
  height = 200,
}: MapleLeafLoaderProps): React.ReactElement => {
  return (
    <div data-testid="maple-leaf-loader" role="status" className={`text-center ${className}`}>
      <div className="flex flex-col items-start">
        <div>
          <svg
            width={width}
            height={height}
            viewBox="0 0 38 43"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="maple-leaf-loader"
              strokeWidth={1}
              fill="none"
              stroke="#000"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.195 42l-.315-8.915c.024-.77.685-.77 1.638-.532l7.71 1.407-.764-2.367c-.315-.984-.607-1.253.237-2.127L37 22.416l-1.426-.716c-.74-.324-.424-.88-.267-1.546v-.11l1.347-5.106-4.01.85c-.691.128-1.213.232-1.56-.483l-1.03-2.366-3.883 4.182c-1.062 1.174-2.038.666-1.668-1.064l1.771-8.81-2.724 1.356c-.63.318-.952.373-1.347-.293L19.036 2l-3.142 6.414c-.291.556-.795.477-1.268.183l-2.985-1.73 1.93 9.55c.315 1.223-.692 1.78-1.402.93l-4.016-4.525-1.135 2.342c-.291.612-.606.88-1.74.612L1.211 14.9l1.584 5.167c.236.776.212 1.143-.237 1.492L1 22.52l8.427 6.952c.716.611.63 1.223.315 2.127l-.922 2.367 7.153-1.382c1.559-.324 2.22-.349 2.22.526L17.878 42z"
            />
          </svg>
        </div>
        {message && (
          <div>
            <p className="mt-4 pb-4">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapleLeafLoader;
