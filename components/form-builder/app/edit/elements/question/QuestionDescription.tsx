import React from "react";

export const QuestionDescription = ({
  description,
  itemIndex,
}: {
  description: string | undefined;
  itemIndex: number;
}) => {
  return (
    <>
      {description && (
        <div
          data-testid="description-text"
          className="description-text mt-5 cursor-not-allowed rounded-sm p-2 bg-gray-100 text-gray-600"
          id={`item${itemIndex}-describedby`}
        >
          {description}
        </div>
      )}
    </>
  );
};
