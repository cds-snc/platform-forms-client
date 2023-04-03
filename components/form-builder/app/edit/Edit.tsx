import React, { useState, useCallback, useEffect } from "react";
import debounce from "lodash.debounce";
import { useTranslation } from "next-i18next";

import { Language, LocalizedFormProperties } from "../../types";
import { ElementPanel, ConfirmationDescription, PrivacyDescription } from ".";
import { RefsProvider } from "./RefsContext";
import { RichTextLocked } from "./elements";
import { Input } from "../shared";
import { useTemplateStore } from "../../store";

export const Edit = () => {
  const { t } = useTranslation("form-builder");
  const {
    title,
    elements,
    localizeField,
    updateField,
    translationLanguagePriority,
    getLocalizationAttribute,
    getName,
  } = useTemplateStore((s) => ({
    title:
      s.form[s.localizeField(LocalizedFormProperties.TITLE, s.translationLanguagePriority)] ?? "",
    elements: s.form.elements,
    localizeField: s.localizeField,
    updateField: s.updateField,
    translationLanguagePriority: s.translationLanguagePriority,
    getLocalizationAttribute: s.getLocalizationAttribute,
    getName: s.getName,
  }));

  const [value, setValue] = useState<string>(title);

  useEffect(() => {
    setValue(title);
  }, [title]);

  const _debounced = debounce(
    useCallback(
      (val: string, lang: Language) => {
        updateField(`form.${localizeField(LocalizedFormProperties.TITLE, lang)}`, val);
      },
      [updateField, localizeField]
    ),
    100
  );

  const updateValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      _debounced(e.target.value, translationLanguagePriority);
    },
    // exclude _debounced from the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue, translationLanguagePriority]
  );

  const updateName = useCallback(() => {
    if (getName() === "") {
      updateField("name", value);
    }
  }, [value, getName, updateField]);

  return (
    <>
      <h1 className="visually-hidden">{t("edit")}</h1>
      <RichTextLocked
        beforeContent={
          <>
            <label htmlFor="formTitle" className="visually-hidden" {...getLocalizationAttribute()}>
              {t("formTitle")}
            </label>
            <Input
              id="formTitle"
              placeholder={t("placeHolderFormTitle")}
              value={value}
              onChange={updateValue}
              className="w-full laptop:w-3/4 mt-2 laptop:mt-0 mb-4 !text-h2 !font-sans !pb-0.5 !pt-1.5"
              theme="title"
              onBlur={updateName}
              {...getLocalizationAttribute()}
            />
            <p className="text-sm mb-4">{t("startFormIntro")}</p>
          </>
        }
        addElement={true}
        schemaProperty="introduction"
        ariaLabel={t("richTextIntroTitle")}
      />
      <RefsProvider>
        {elements.map((element, index: number) => {
          const item = { ...element, index };
          return <ElementPanel item={item} key={item.id} />;
        })}
      </RefsProvider>

      {elements?.length >= 1 && (
        <>
          <RichTextLocked
            addElement={false}
            schemaProperty="privacyPolicy"
            ariaLabel={t("richTextPrivacyTitle")}
          >
            <div>
              <h2 className="mt-4 laptop:mt-0 text-h3 pb-3">{t("richTextPrivacyTitle")}</h2>
              <PrivacyDescription />
            </div>
          </RichTextLocked>
          <RichTextLocked
            addElement={false}
            schemaProperty="confirmation"
            ariaLabel={t("richTextConfirmationTitle")}
          >
            <div>
              <h2 className="mt-4 laptop:mt-0 text-h3 pb-3">{t("richTextConfirmationTitle")}</h2>
              <ConfirmationDescription />
            </div>
          </RichTextLocked>
        </>
      )}
    </>
  );
};
