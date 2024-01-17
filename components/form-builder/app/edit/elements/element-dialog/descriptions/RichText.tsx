import React from "react";
import Markdown from "markdown-to-jsx";
import { ExampleWrapper } from "./ExampleWrapper";
import { useTranslation } from "react-i18next";
export const RichText = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div>
      <h3 className="mb-0">{t("addElementDialog.richText.title")}</h3>

      <ExampleWrapper className="mt-4">
        <div className="mb-5">
          <Markdown options={{ forceBlock: true }}>
            {t("addElementDialog.richText.description")}
          </Markdown>
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
