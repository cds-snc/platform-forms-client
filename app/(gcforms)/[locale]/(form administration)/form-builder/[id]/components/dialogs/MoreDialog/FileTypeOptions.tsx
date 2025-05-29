import { FormElement } from "@lib/types";
import { useTranslation } from "@i18n/client";

// import { ALLOWED_FILE_TYPES } from "@lib/validation/fileValidationClientSide";

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

  return (
    <section className="mb-4">
      <div className="mb-2">
        <h3>{t("fileTypeOptions")}</h3>
      </div>
      <div className="gcds-select-wrapper">
        <select
          data-testid="file-type"
          className="gc-dropdown mb-4 inline-block"
          id={`file-type--modal--${item.id}`}
          value={item.properties.fileType || ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setItem({
              ...item,
              properties: {
                ...item.properties,
                fileType: e.target.value,
              },
            });
          }}
        >
          <option value="">{t("selectFileType")}</option>
          <option value="image">{t("image")}</option>
          <option value="document">{t("document")}</option>
          <option value="audio">{t("audio")}</option>
          <option value="video">{t("video")}</option>
        </select>
      </div>
    </section>
  );
};
