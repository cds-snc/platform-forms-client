import React from "react";
export const RepeatableQuestionSet = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div>
      <div className="font-bold text-[1.5rem]">{title}</div>
      <p>{description}</p>
    </div>
  );
};
