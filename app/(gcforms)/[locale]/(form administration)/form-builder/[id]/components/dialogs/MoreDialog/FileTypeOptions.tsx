import { FormElement } from "@lib/types";
import { useTranslation } from "@i18n/client";
import { ALLOWED_FILE_TYPES } from "@lib/validation/fileValidationClientSide";

export const FileTypeOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");

  if (item.type !== "fileInput") {
    return null;
  }

  // Ensure fileType is an array for multiple selections
  const selectedTypes: string[] = Array.isArray(item.properties.fileType)
    ? item.properties.fileType
    : item.properties.fileType
    ? [item.properties.fileType]
    : [];

  const handleCheckboxChange = (type: string, checked: boolean) => {
    let newTypes: string[];
    if (checked) {
      newTypes = [...selectedTypes, type];
    } else {
      newTypes = selectedTypes.filter((t) => t !== type);
    }
    setItem({
      ...item,
      properties: {
        ...item.properties,
        fileType: newTypes,
      },
    });
  };

  return (
    <section className="mb-4">
      <div className="mb-2">
        <h3>{t("fileTypes.more.label")}</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ALLOWED_FILE_TYPES.map((type) => (
          <div className="gc-input-checkbox" key={type.extensions[0]}>
            <input
              id={`file-type-checkbox-${type.extensions[0]}`}
              type="checkbox"
              checked={selectedTypes.includes(type.extensions[0])}
              onChange={(e) => handleCheckboxChange(type.extensions[0], e.target.checked)}
              className="gc-input-checkbox__input"
              data-testid={`file-type-checkbox-${type}`}
            />
            <label
              key={type.extensions[0]}
              className="gc-checkbox-label"
              htmlFor={`file-type-checkbox-${type.extensions[0]}`}
            >
              <span className="checkbox-label-text"> {type.extensions[0]}</span>
            </label>
          </div>
        ))}
      </div>
    </section>
  );
};
