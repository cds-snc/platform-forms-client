import React from "react";
import Markdown from "markdown-to-jsx";
export const RichText = ({ title, description }: { title: string; description: string }) => {
  return (
    <div>
      <h3>{title}</h3>
      <div className="mb-5">
        <Markdown options={{ forceBlock: true }}>{description}</Markdown>
      </div>
      <div className="mb-5">
        <ul>
          <li>Item a</li>
          <li>Item b</li>
          <li>Item c</li>
        </ul>
      </div>
      <div className="mb-5">
        <ol>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ol>
      </div>
    </div>
  );
};
