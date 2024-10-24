import { InfoDetails, Radio } from "@formBuilder/components/shared";
import { useTranslation } from "@i18n/client";
import { FormElementWithIndex } from "@lib/types/form-builder-types";

export const FormattedDateOptions = ({
  item,
  setItem,
}: {
  item: FormElementWithIndex;
  setItem: (item: FormElementWithIndex) => void;
}) => {
  const { t } = useTranslation("form-builder");
  return (
    <section className="mb-4">
      <h3>{t("moreDialog.date.dateOptions")}</h3>
      <p className="mt-4 font-semibold">{t("moreDialog.date.typeOfDate")}</p>

      <Radio
        className="mt-2"
        name="autoComplete"
        id="autoComplete-general"
        label={t("moreDialog.date.generalDateLabel")}
        value=""
        checked={!item.properties.autoComplete}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setItem({
            ...item,
            properties: {
              ...item.properties,
              ...{ autoComplete: e.target.value },
            },
          });
        }}
      />
      <Radio
        className="mt-2"
        name="autoComplete"
        id="autoComplete-bday"
        label={t("moreDialog.date.birthDateLabel")}
        value="bday"
        checked={item.properties.autoComplete === "bday"}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setItem({
            ...item,
            properties: {
              ...item.properties,
              ...{ autoComplete: e.target.value },
            },
          });
        }}
      />

      <p className="mt-4 font-semibold">{t("moreDialog.date.selectFormat")}</p>
      <Radio
        className="mt-2"
        name="dateFormat"
        id="dateFormat-iso"
        label={t("moreDialog.date.isoFormatLabel")}
        value="YYYY-MM-DD"
        checked={!item.properties.dateFormat || item.properties.dateFormat === "YYYY-MM-DD"}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setItem({
            ...item,
            properties: {
              ...item.properties,
              ...{ dateFormat: e.target.value },
            },
          });
        }}
      />
      <Radio
        className="mt-2"
        name="dateFormat"
        id="dateFormat-ddmmyyyy"
        label={t("moreDialog.date.ddmmyyyyFormatLabel")}
        value="DD-MM-YYYY"
        checked={item.properties.dateFormat === "DD-MM-YYYY"}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setItem({
            ...item,
            properties: {
              ...item.properties,
              ...{ dateFormat: e.target.value },
            },
          });
        }}
      />
      <Radio
        className="mt-2"
        name="dateFormat"
        id="dateFormat-mmddyyyy"
        label={t("moreDialog.date.mmddyyyyFormatLabel")}
        value="MM-DD-YYYY"
        checked={item.properties.dateFormat === "MM-DD-YYYY"}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setItem({
            ...item,
            properties: {
              ...item.properties,
              ...{ dateFormat: e.target.value },
            },
          });
        }}
      />

      <InfoDetails summary={t("moreDialog.date.infoBox")} className="my-4">
        <div className="ml-2 border-l-2 border-gray-500 pl-4">
          <p className="my-4">{t("moreDialog.date.infoLine1")}</p>
          <p className="my-4">{t("moreDialog.date.infoLine2")}</p>
        </div>
      </InfoDetails>
    </section>
  );
};
