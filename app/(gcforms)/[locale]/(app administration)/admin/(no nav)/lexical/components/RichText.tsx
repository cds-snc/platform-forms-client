"use client";

import { Editor } from "@gcforms/editor";
import { useTranslation } from "@i18n/client";
import { useCallback, useState } from "react";
import { RichText as RichTextRenderer } from "@clientComponents/forms/RichText/RichText";

export const RichText = () => {
  const { i18n } = useTranslation();
  const [value, setValue] = useState("");
  const [enableDraggableBlocks, setEnableDraggableBlocks] = useState(true);
  const [enableMaxLength, setEnableMaxLength] = useState(false);
  const [maxLength, setMaxLength] = useState<number | undefined>(undefined);
  const [showTreeview, setShowTreeview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const updateValue = useCallback(
    (value: string) => {
      setValue(value);
    },
    [setValue]
  );

  return (
    <>
      <div className="flex flex-row gap-10">
        <div className="w-3/4">
          <Editor
            locale={i18n.language}
            content={value}
            contentLocale="en"
            className="gc-formview"
            onChange={updateValue}
            enableDraggableBlocks={enableDraggableBlocks}
            maxLength={enableMaxLength ? maxLength : undefined}
            showTreeview={showTreeview}
          />
          {showPreview && (
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-bold">Preview</h2>
              <div className="rounded-md border border-gray-300 p-4">
                <RichTextRenderer>{value}</RichTextRenderer>
              </div>
            </div>
          )}
        </div>
        <div className="flex-col">
          <div>
            <input
              type="checkbox"
              className="mr-2"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.checked;
                setEnableMaxLength(value);
              }}
            />
            <label htmlFor="maxLength">Max length</label>
            <input
              className="ml-4 rounded-md border border-gray-300 p-2"
              id="maxLength"
              type="number"
              value={maxLength || ""}
              disabled={enableMaxLength}
              onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setMaxLength(value ? parseInt(value, 10) : undefined);
              }, [])}
            />
          </div>
          <div className="my-4">
            <input
              type="checkbox"
              className="mr-2"
              checked={enableDraggableBlocks}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.checked;
                setEnableDraggableBlocks(value);
              }}
            />
            <label>Enable draggable blocks</label>
          </div>
          <div className="my-4">
            <input
              type="checkbox"
              className="mr-2"
              checked={showTreeview}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.checked;
                setShowTreeview(value);
              }}
            />
            <label>Show treeview</label>
            <div className="my-4">
              <input
                type="checkbox"
                className="mr-2"
                checked={showPreview}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.checked;
                  setShowPreview(value);
                }}
              />
              <label>Show preview</label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
