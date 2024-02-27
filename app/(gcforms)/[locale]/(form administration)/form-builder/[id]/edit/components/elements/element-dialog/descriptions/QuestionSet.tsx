"use client";
import React from "react";
import Image from "next/image";

export const QuestionSet = ({ title, description }: { title: string; description: string }) => {
  return (
    <div>
      <h3 className="mb-0">{title}</h3>
      <p className="mb-2">{description}</p>
      <Image
        layout="responsive"
        width={"558"}
        height={"313"}
        alt=""
        className="block w-full"
        src="/img/form-builder-dynamic-row.svg"
      />
    </div>
  );
};
