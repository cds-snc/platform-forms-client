import { useState } from "react";
import { FormElement } from "@lib/types";
import { useTranslation } from "@i18n/client";
import { FILE_GROUPS } from "@lib/fileInput/constants";

import { fileTypesToFileGroups } from "@lib/fileInput/fileTypesToFileGroups";
import { fileGroupsToFileTypes } from "@lib/fileInput/fileGroupsToFileTypes";

export const FILE_GROUP_KEYS = Object.keys(FILE_GROUPS) as (keyof typeof FILE_GROUPS)[];

export const FileTypeOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");

  // item.properties.fileType = types of files ["xls","xlsx","csv"]
  // First ensure fileType is an array
  const fileTypes: string[] = Array.isArray(item.properties.fileType)
    ? item.properties.fileType
    : item.properties.fileType
      ? [item.properties.fileType]
      : [];

  // Convert file types to file groups ["documents", "images", "spreadsheets"]
  const [selectedGroups, setSelectedGroups] = useState<string[]>(fileTypesToFileGroups(fileTypes));

  // If the item is not a fileInput, return null
  if (item.type !== "fileInput") {
    return null;
  }

  // Function to handle checkbox changes
  const handleCheckboxChange = (type: string, checked: boolean) => {
    let fileGroups = selectedGroups;

    if (checked) {
      if (type) {
        fileGroups = [...fileGroups, type];
      }
    } else {
      fileGroups = fileGroups.filter((t) => t !== type);
    }

    // Update the state with the new file groups
    setSelectedGroups(fileGroups);

    setItem({
      ...item,
      properties: {
        ...item.properties,
        // Convert file groups back array of file types ["pdf"] etc...
        fileType: fileGroupsToFileTypes(fileGroups),
      },
    });
  };

  return (
    <section className="mb-4">
      <div className="mb-2">
        <h3>{t("fileTypes.more.label")}</h3>
      </div>
      <div className="">
        {/* Render checkboxes for each file group */}
        {FILE_GROUP_KEYS.map((type) => (
          <div className="gc-input-checkbox" key={type}>
            <input
              id={`file-type-checkbox-${type}`}
              type="checkbox"
              checked={selectedGroups.includes(type)}
              onChange={(e) => handleCheckboxChange(type, e.target.checked)}
              className="gc-input-checkbox__input"
              data-testid={`file-type-checkbox-${type}`}
            />
            <label key={type} className="gc-checkbox-label" htmlFor={`file-type-checkbox-${type}`}>
              <div className="checkbox-label-text">
                {t(`fileTypes.more.${type}.label`)}
                <span className="relative block text-base font-normal text-slate-700">
                  {t(`fileTypes.more.${type}.description`)}
                </span>
              </div>
            </label>
          </div>
        ))}
      </div>
    </section>
  );
};
