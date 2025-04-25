"use client";

import { Editor } from "@gcforms/editor";
import { useTranslation } from "@i18n/client";
import { useCallback, useState } from "react";

export const RichText = () => {
  const { i18n } = useTranslation();
  const [value, setValue] = useState("");
  const [enableDraggableBlocks, setEnableDraggableBlocks] = useState(true);
  const [enableMaxLength, setEnableMaxLength] = useState(false);
  const [maxLength, setMaxLength] = useState<number | undefined>(undefined);
  const [showTreeview, setShowTreeview] = useState(false);

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
            className="gc-formview gc-richText"
            onChange={updateValue}
            enableDraggableBlocks={enableDraggableBlocks}
            maxLength={enableMaxLength ? maxLength : undefined}
            showTreeview={showTreeview}
          />
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
          </div>
        </div>
      </div>
    </>
  );
};
