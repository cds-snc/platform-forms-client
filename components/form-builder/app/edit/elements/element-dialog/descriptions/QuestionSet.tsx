import React from "react";
import Image from "next/image";

export const QuestionSet = ({ title, description }: { title: string; description: string }) => {
  return (
    <div>
      <div className="text-[1.5rem] font-bold">{title}</div>
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
