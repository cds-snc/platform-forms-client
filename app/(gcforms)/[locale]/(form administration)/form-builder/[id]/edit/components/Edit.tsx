"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import debounce from "lodash.debounce";
import { useTranslation } from "@i18n/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Language, LocalizedFormProperties } from "@lib/types/form-builder-types";
import { ElementPanel, ConfirmationDescription, PrivacyDescription } from ".";
import { RefsProvider } from "./RefsContext";
import { RichTextLocked } from "./elements";
import { ExpandingInput } from "@formBuilder/components/shared";
import { useTemplateStore } from "@lib/store";
import { getQuestionNumber, sortByLayout } from "@lib/utils/form-builder";
import { SettingsPanel } from "./settings/SettingsPanel";
import { cleanInput } from "@lib/utils/form-builder";
import { SaveButton } from "@formBuilder/components/shared/SaveButton";
import { useRehydrate } from "@lib/hooks/form-builder";

export const Edit = ({ formId }: { formId: string }) => {
  const router = useRouter();
  const { t, i18n } = useTranslation("form-builder");
  const {
    title,
    layout,
    elements,
    localizeField,
    updateField,
    translationLanguagePriority,
    getLocalizationAttribute,
  } = useTemplateStore((s) => ({
    title:
      s.form[s.localizeField(LocalizedFormProperties.TITLE, s.translationLanguagePriority)] ?? "",
    layout: s.form.layout,
    elements: s.form.elements,
    localizeField: s.localizeField,
    updateField: s.updateField,
    translationLanguagePriority: s.translationLanguagePriority,
    getLocalizationAttribute: s.getLocalizationAttribute,
  }));

  const [value, setValue] = useState<string>(title);
  const searchParams = useSearchParams();
  const focusTitle = searchParams.get("focusTitle") ? true : false;
  const titleInput = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(title);
  }, [title]);

  const { isPublished } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
  }));

  useEffect(() => {
    if (isPublished) {
      router.replace(`/${i18n.language}/form-builder/${formId}/settings/`);
      return;
    }
  }, [router, isPublished, formId, i18n.language]);

  const _debounced = debounce(
    useCallback(
      (val: string, lang: Language) => {
        updateField(`form.${localizeField(LocalizedFormProperties.TITLE, lang)}`, val);
      },
      [updateField, localizeField]
    ),
    100
  );

  const sortedElements = sortByLayout({ layout, elements: [...elements] });

  // grab only the data we need to render the question number
  const elementTypes = sortedElements.map((element) => ({
    id: element.id,
    type: element.type,
  }));

  const updateValue = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      // update the data-value attribute on the title input
      // so that the question number can be updated
      if (titleInput?.current) {
        titleInput.current.dataset.value = value;
      }
      _debounced(e.target.value, translationLanguagePriority);
    },
    // exclude _debounced from the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue, translationLanguagePriority]
  );

  useEffect(() => {
    if (focusTitle) {
      titleInput && titleInput.current && titleInput.current?.focus();
    }
  }, [focusTitle]);

  const hasHydrated = useRehydrate();

  if (isPublished) {
    return <div />;
  }

  return (
    <>
      <h1 className="visually-hidden">{t("edit")}</h1>
      <div className="mb-4">
        <SaveButton />
      </div>
      <SettingsPanel />

      <RichTextLocked
        hydrated={hasHydrated}
        className="rounded-t-lg"
        beforeContent={
          <>
            <label htmlFor="formTitle" className="visually-hidden" {...getLocalizationAttribute()}>
              {t("formTitle")}
            </label>
            <div className="my-2 mb-4">
              <ExpandingInput
                id="formTitle"
                wrapperClassName="w-full laptop:w-3/4 mt-2 laptop:mt-0 font-bold laptop:text-3xl"
                className="font-bold placeholder:text-slate-500 laptop:text-4xl"
                ref={titleInput}
                placeholder={t("placeHolderFormTitle")}
                value={value}
                onBlur={() => {
                  setValue(cleanInput(value));
                }}
                onChange={updateValue}
                {...getLocalizationAttribute()}
              />
            </div>
            <p className="mb-4 text-sm">{t("startFormIntro")}</p>
          </>
        }
        addElement={true}
        schemaProperty="introduction"
        ariaLabel={t("richTextIntroTitle")}
      />

      <RefsProvider>
        {layout.length >= 1 &&
          layout.map((id, index) => {
            const element = sortedElements.find((element) => element.id === id);

            if (element) {
              const questionNumber = getQuestionNumber(element, elementTypes);
              const item = { ...element, index, questionNumber };
              return <ElementPanel elements={sortedElements} item={item} key={item.id} />;
            }
          })}
      </RefsProvider>
      <>
        <div id="privacy-text">
          <RichTextLocked
            hydrated={hasHydrated}
            addElement={false}
            schemaProperty="privacyPolicy"
            ariaLabel={t("richTextPrivacyTitle")}
          >
            <div>
              <h2 className="mt-4 text-2xl laptop:mt-0">{t("richTextPrivacyTitle")}</h2>
              <PrivacyDescription />
            </div>
          </RichTextLocked>
        </div>

        <div id="confirmation-text">
          <RichTextLocked
            hydrated={hasHydrated}
            className="rounded-b-lg"
            addElement={false}
            schemaProperty="confirmation"
            ariaLabel={t("richTextConfirmationTitle")}
          >
            <div>
              <h2 className="mt-4 text-2xl laptop:mt-0">{t("richTextConfirmationTitle")}</h2>
              <ConfirmationDescription />
            </div>
          </RichTextLocked>
        </div>
      </>
    </>
  );
};
