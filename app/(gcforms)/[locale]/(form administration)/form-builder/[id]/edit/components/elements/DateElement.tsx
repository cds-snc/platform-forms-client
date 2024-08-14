"use client";
import React from "react";

export const DateElement = ({ ...props }) => {
  return (
    <div {...props} className="my-4 flex flex-row gap-2 text-lg opacity-65">
      <div>
        Year
        <div className="gc-input-text w-28 border-gray-400">YYYY</div>
      </div>
      <div>
        Month
        <div className="gc-input-text w-16 border-gray-400">MM</div>
      </div>
      <div>
        Day
        <div className="gc-input-text w-16 border-gray-400">DD</div>
      </div>
    </div>
  );
};
