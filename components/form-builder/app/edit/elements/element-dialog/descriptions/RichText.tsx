import React from "react";
import Markdown from "markdown-to-jsx";
import { ExampleWrapper } from "./ExampleWrapper";
export const RichText = ({ title, description }: { title: string; description: string }) => {
  return (
    <div>
      <h3>{title}</h3>

      <ExampleWrapper className="mt-4">
        <div className="mb-5">
          <Markdown options={{ forceBlock: true }}>{description}</Markdown>
        </div>

        <div className="mb-5">
          <ul>
            <li>Item</li>
            <li>Item</li>
            <li>Item</li>
          </ul>
        </div>
        <div className="mb-5">
          <ol>
            <li>Item</li>
            <li>Item</li>
            <li>Item</li>
          </ol>
        </div>
      </ExampleWrapper>
    </div>
  );
};
