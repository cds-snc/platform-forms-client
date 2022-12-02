import React, { useState, useCallback, useEffect } from "react";
import debounce from "lodash.debounce";
import { useTranslation } from "next-i18next";

import { LocalizedElementProperties, LocalizedFormProperties } from "../../types";
import { useTemplateStore } from "../../store";
import { RichTextLocked } from "./elements";
import { ElementPanel, ConfirmationDescription, PrivacyDescription } from ".";
import { Input } from "../shared";

export const Edit = () => {
  const { t } = useTranslation("form-builder");
  const { title, elements, introduction, endPage, privacyPolicy, localizeField, updateField } =
    useTemplateStore((s) => ({
      title: s.form[s.localizeField(LocalizedFormProperties.TITLE)] ?? "",
      elements: s.form.elements,
      introduction: s.form.introduction,
      endPage: s.form.endPage,
      privacyPolicy: s.form.privacyPolicy,
      localizeField: s.localizeField,
      updateField: s.updateField,
    }));

  const [value, setValue] = useState<string>(title);

  const _debounced = useCallback(
    debounce((val: string | boolean) => {
      updateField(`form.${localizeField(LocalizedFormProperties.TITLE)}`, val);
    }, 100),
    []
  );

  useEffect(() => {
    setValue(title);
  }, [title]);

  const updateValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      _debounced(e.target.value);
    },
    [setValue]
  );

  const introTextPlaceholder =
    introduction?.[localizeField(LocalizedElementProperties.DESCRIPTION)] ?? "";

  const confirmTextPlaceholder =
    endPage?.[localizeField(LocalizedElementProperties.DESCRIPTION)] ?? "";

  const policyTextPlaceholder =
    privacyPolicy?.[localizeField(LocalizedElementProperties.DESCRIPTION)] ?? "";

  return (
    <>
      <h1 className="visually-hidden">{t("edit")}</h1>
      <RichTextLocked
        beforeContent={
          <>
            <label htmlFor="formTitle" className="visually-hidden">
              {t("formTitle")}
            </label>
            <Input
              id="formTitle"
              placeholder={t("placeHolderFormTitle")}
              value={value}
              onChange={updateValue}
              className="w-3/4 mb-4 !text-h2 !font-sans !pb-0.5 !pt-1.5"
              theme="title"
            />
            <p className="text-sm mb-4">{t("startFormIntro")}</p>
          </>
        }
        addElement={true}
        initialValue={introTextPlaceholder}
        schemaProperty="introduction"
        ariaLabel={t("richTextIntroTitle")}
      />
      {elements.map((element, index: number) => {
        const item = { ...element, index };
        return <ElementPanel item={item} key={item.id} />;
      })}
      {elements?.length >= 1 && (
        <>
          <RichTextLocked
            addElement={false}
            initialValue={policyTextPlaceholder}
            schemaProperty="privacyPolicy"
            ariaLabel={t("richTextPrivacyTitle")}
          >
            <div>
              <h2 className="text-h3 pb-3">{t("richTextPrivacyTitle")}</h2>
              <PrivacyDescription />
            </div>
          </RichTextLocked>
          <RichTextLocked
            addElement={false}
            initialValue={confirmTextPlaceholder}
            schemaProperty="endPage"
            ariaLabel={t("richTextConfirmationTitle")}
          >
            <div>
              <h2 className="text-h3 pb-3">{t("richTextConfirmationTitle")}</h2>
              <ConfirmationDescription />
            </div>
          </RichTextLocked>
        </>
      )}
    </>
  );
};
