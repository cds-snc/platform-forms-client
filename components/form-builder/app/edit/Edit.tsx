import React, { useState, useCallback, useEffect, useContext, useRef } from "react";
import debounce from "lodash.debounce";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { Language, LocalizedFormProperties } from "../../types";
import { ElementPanel, ConfirmationDescription, PrivacyDescription } from ".";
import { RefsProvider } from "./RefsContext";
import { RichTextLocked } from "./elements";
import { ExpandingInput } from "../shared";
import { useTemplateStore } from "../../store";
import { FormElement } from "@lib/types";
import { getQuestionNumber, sortByLayout } from "../../util";
import { TemplateStoreContext } from "@components/form-builder/store";

export const Edit = () => {
  const { t } = useTranslation("form-builder");
  const {
    title,
    layout,
    localizeField,
    updateField,
    translationLanguagePriority,
    getLocalizationAttribute,
    getName,
  } = useTemplateStore((s) => ({
    title:
      s.form[s.localizeField(LocalizedFormProperties.TITLE, s.translationLanguagePriority)] ?? "",
    layout: s.form.layout,
    localizeField: s.localizeField,
    updateField: s.updateField,
    translationLanguagePriority: s.translationLanguagePriority,
    getLocalizationAttribute: s.getLocalizationAttribute,
    getName: s.getName,
  }));

  const store = useContext(TemplateStoreContext);

  // https://docs.pmnd.rs/zustand/recipes/recipes#transient-updates-(for-frequent-state-changes)
  const elements = useRef(store ? store.getState().form.elements : []) as React.MutableRefObject<
    FormElement[]
  >;

  useEffect(() => {
    if (!store) return;
    store.subscribe((state) => (elements.current = state.form.elements)), [];
  });

  const [value, setValue] = useState<string>(title);
  const { query } = useRouter();
  const focusTitle = query.focusTitle ? true : false;
  const titleInput = useRef<HTMLTextAreaElement>(null);

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

  // grab only the data we need to render the question number
  const elementTypes = sortByLayout({ layout, elements: [...elements.current] }).map((element) => ({
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

  const updateName = useCallback(() => {
    if (getName() === "") {
      updateField("name", value);
    }
  }, [value, getName, updateField]);

  useEffect(() => {
    if (focusTitle) {
      titleInput && titleInput.current && titleInput.current?.focus();
    }
  }, [focusTitle]);

  return (
    <>
      <h1 className="visually-hidden">{t("edit")}</h1>
      <RichTextLocked
        beforeContent={
          <>
            <label htmlFor="formTitle" className="visually-hidden" {...getLocalizationAttribute()}>
              {t("formTitle")}
            </label>
            <div className="mb-4 my-2">
              <ExpandingInput
                id="formTitle"
                wrapperClassName="w-full laptop:w-3/4 mt-2 laptop:mt-0 font-bold laptop:text-3xl"
                className="font-bold laptop:text-3xl"
                ref={titleInput}
                placeholder={t("placeHolderFormTitle")}
                value={value}
                onChange={updateValue}
                onBlur={updateName}
                {...getLocalizationAttribute()}
              />
            </div>
            <p className="text-sm mb-4">{t("startFormIntro")}</p>
          </>
        }
        addElement={true}
        schemaProperty="introduction"
        ariaLabel={t("richTextIntroTitle")}
      />
      <RefsProvider>
        {layout.map((id, index) => {
          const element = elements.current.find((element) => element.id === id);
          if (element) {
            const questionNumber = getQuestionNumber(element, elementTypes);
            const item = { ...element, index, questionNumber };
            return <ElementPanel elements={elements.current} item={item} key={item.id} />;
          }
        })}
      </RefsProvider>
      <>
        <RichTextLocked
          addElement={false}
          schemaProperty="privacyPolicy"
          ariaLabel={t("richTextPrivacyTitle")}
        >
          <div id="privacy-text">
            <h2 className="mt-4 laptop:mt-0 text-h3 pb-3">{t("richTextPrivacyTitle")}</h2>
            <PrivacyDescription />
          </div>
        </RichTextLocked>
        <RichTextLocked
          addElement={false}
          schemaProperty="confirmation"
          ariaLabel={t("richTextConfirmationTitle")}
        >
          <div id="confirmation-text">
            <h2 className="mt-4 laptop:mt-0 text-h3 pb-3">{t("richTextConfirmationTitle")}</h2>
            <ConfirmationDescription />
          </div>
        </RichTextLocked>
      </>
    </>
  );
};
