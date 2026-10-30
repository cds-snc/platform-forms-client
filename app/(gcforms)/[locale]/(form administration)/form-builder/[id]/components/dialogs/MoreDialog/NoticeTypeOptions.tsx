import { useTranslation } from "@i18n/client";
import { FormElement, FormElementTypes, NoticeType } from "@lib/types";
import { Label } from "./Label";

const noticeTypes = [
  NoticeType.INFO,
  NoticeType.WARNING,
  NoticeType.DANGER,
  NoticeType.SUCCESS,
] as const;

export const NoticeTypeOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");

  if (item.type !== FormElementTypes.notice) {
    return null;
  }

  return (
    <section className="mb-4">
      <Label htmlFor={`notice-type--modal--${item.id}`}>{t("moreDialog.notice.type")}</Label>
      <div className="gcds-select-wrapper">
        <select
          className="gc-dropdown mb-4 inline-block"
          id={`notice-type--modal--${item.id}`}
          value={item.properties.noticeType ?? NoticeType.INFO}
          onChange={(event) => {
            const selectedType = noticeTypes.find((type) => type === event.target.value);
            if (!selectedType) {
              return;
            }

            setItem({
              ...item,
              properties: {
                ...item.properties,
                noticeType: selectedType,
              },
            });
          }}
        >
          {noticeTypes.map((type) => (
            <option key={type} value={type}>
              {t(`moreDialog.notice.typeOptions.${type}`)}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};
