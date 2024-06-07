"use client";
import React from "react";
import { useRehydrate, useTemplateStore } from "@lib/store/useTemplateStore";
import { useTranslation } from "@i18n/client";
import { RichText } from "./RichText";
import { Title } from "./Title";
import { Description } from "./Description";
import { Options } from "./Options";
import {
  LocalizedElementProperties,
  LocalizedFormProperties,
  LocalizedGroupProperties,
  Language,
} from "@lib/types/form-builder-types";
import { DownloadCSVWithGroups } from "./DownloadCSVWithGroups";
import { RichTextEditor } from "../../components/elements/lexical-editor/RichTextEditor";
import { LanguageLabel } from "./LanguageLabel";
import { FieldsetLegend, SectionTitle } from ".";
import { SaveButton } from "@formBuilder/components/shared/SaveButton";

import { FormElement } from "@lib/types";
import { alphabet } from "@lib/utils/form-builder";
import { sortGroup } from "@lib/utils/form-builder/groupedFormHelpers";
import { Group } from "@lib/formContext";

const GroupSection = ({
  groupId,
  group,
  primaryLanguage,
  secondaryLanguage,
}: {
  groupId: string;
  group: Group;
  primaryLanguage: Language;
  secondaryLanguage: Language;
}) => {
  const { t } = useTranslation("form-builder");
  const { updateField, localizeField } = useTemplateStore((s) => ({
    updateField: s.updateField,
    localizeField: s.localizeField,
  }));
  return (
    <>
      {(group.titleEn || group.titleFr) && (
        <fieldset>
          <FieldsetLegend>{t("sectionTitle")}</FieldsetLegend>
          <div
            className="mb-10 flex gap-px divide-x-2 border border-gray-300"
            key={primaryLanguage}
          >
            <div className="relative w-1/2 flex-1">
              <LanguageLabel id="form-introduction-english-language" lang={primaryLanguage}>
                <>{primaryLanguage}</>
              </LanguageLabel>
              <textarea
                className="h-full w-full p-4 focus:outline-blue-focus"
                id={`group-${groupId}-title-${primaryLanguage}`}
                aria-describedby={`group-${groupId}-title-${primaryLanguage}-language`}
                value={group[localizeField(LocalizedGroupProperties.TITLE, primaryLanguage)]}
                onChange={(e) => {
                  updateField(
                    `form.groups[${groupId}].${localizeField(
                      LocalizedFormProperties.TITLE,
                      primaryLanguage
                    )}`,
                    e.target.value
                  );
                }}
              />
            </div>
            <div className="relative w-1/2 flex-1">
              <LanguageLabel id="form-introduction-french-language" lang={secondaryLanguage}>
                <>{secondaryLanguage}</>
              </LanguageLabel>
              <textarea
                className="h-full w-full p-4 focus:outline-blue-focus"
                id={`group-${groupId}-title-${secondaryLanguage}`}
                aria-describedby={`group-${groupId}-title-${secondaryLanguage}-language`}
                value={group[localizeField(LocalizedGroupProperties.TITLE, secondaryLanguage)]}
                onChange={(e) => {
                  updateField(
                    `form.groups[${groupId}].${localizeField(
                      LocalizedFormProperties.TITLE,
                      secondaryLanguage
                    )}`,
                    e.target.value
                  );
                }}
              />
            </div>
          </div>
        </fieldset>
      )}
    </>
  );
};

const Element = ({
  element,
  index,
  primaryLanguage,
  questionNumber,
}: {
  element: FormElement;
  index: number;
  primaryLanguage: Language;
  questionNumber?: string;
}) => {
  let subElements;

  const { t } = useTranslation("form-builder");

  if (element.type === "dynamicRow") {
    let subElementIndex = -1;
    subElements = element.properties.subElements?.map((subElement) => {
      let questionNumber = t("pageText");
      if (subElement.type !== "richText") {
        subElementIndex++;
        questionNumber = alphabet[subElementIndex];
      }

      return (
        <Element
          key={subElement.id}
          element={subElement}
          index={subElement.id}
          questionNumber={questionNumber}
          primaryLanguage={primaryLanguage}
        />
      );
    });
  }
  return (
    <>
      {questionNumber && (
        <SectionTitle>
          {element.type === "richText" && <>{t("pageText")}</>}
          {element.type !== "richText" && <>{"Question " + questionNumber}</>}
        </SectionTitle>
      )}

      {element.type === "richText" && (
        <RichText primaryLanguage={primaryLanguage} element={element} index={index} />
      )}

      {["radio", "checkbox", "dropdown", "fileInput", "combobox"].includes(element.type) && (
        <>
          <Title primaryLanguage={primaryLanguage} element={element} />
          {(element.properties.descriptionEn || element.properties.descriptionFr) && (
            <Description primaryLanguage={primaryLanguage} element={element} />
          )}
          <Options primaryLanguage={primaryLanguage} element={element} index={index} />
        </>
      )}

      {["textField", "textArea"].includes(element.type) && (
        <>
          <Title primaryLanguage={primaryLanguage} element={element} />
          {(element.properties.descriptionEn || element.properties.descriptionFr) && (
            <Description primaryLanguage={primaryLanguage} element={element} />
          )}
        </>
      )}

      {subElements && (
        <>
          <Title primaryLanguage={primaryLanguage} element={element} />
          {(element.properties.descriptionEn || element.properties.descriptionFr) && (
            <Description primaryLanguage={primaryLanguage} element={element} />
          )}
          {subElements}
        </>
      )}
    </>
  );
};

export const TranslateWithGroups = () => {
  const { updateField, form, groups, localizeField, getLocalizationAttribute } = useTemplateStore(
    (s) => ({
      updateField: s.updateField,
      form: s.form,
      groups: s.form.groups,
      localizeField: s.localizeField,
      getLocalizationAttribute: s.getLocalizationAttribute,
    })
  );
  const { t } = useTranslation("form-builder");

  // Set default left-hand language
  const primaryLanguage = "en";
  const secondaryLanguage = primaryLanguage === "en" ? "fr" : "en";
  const hasHydrated = useRehydrate();
  if (!hasHydrated) return null;

  return (
    <>
      <div className="mr-10">
        <h1 className="mb-0 mt-8 border-0">{t("translateTitle")}</h1>
        <p>{t("translateDescription")}</p>
        <br />

        <div className="mb-4">
          <SaveButton />
        </div>

        <div className="mb-8">
          <DownloadCSVWithGroups />
        </div>

        <section>
          <SectionTitle>{t("formIntroduction")}</SectionTitle>
          {/* FORM TITLE */}
          <fieldset>
            <FieldsetLegend>{t("title")}</FieldsetLegend>
            <div className="mb-10 flex gap-px divide-x-2 border border-gray-300">
              <label htmlFor="form-title-en" className="sr-only">
                <>{primaryLanguage}</>
              </label>
              <div className="relative flex-1">
                <LanguageLabel id="form-title-en-language" lang={primaryLanguage}>
                  <>{primaryLanguage}</>
                </LanguageLabel>
                <textarea
                  className="size-full p-4 focus:outline-blue-focus"
                  id="form-title-en"
                  aria-describedby="form-title-en-language"
                  value={form[localizeField(LocalizedFormProperties.TITLE, primaryLanguage)]}
                  onChange={(e) => {
                    updateField(
                      `form.${localizeField(LocalizedFormProperties.TITLE, primaryLanguage)}`,
                      e.target.value
                    );
                  }}
                  {...getLocalizationAttribute()}
                />
              </div>
              <label htmlFor="form-title-fr" className="sr-only" {...getLocalizationAttribute()}>
                {secondaryLanguage}
              </label>
              <div className="relative flex-1">
                <LanguageLabel id="form-title-fr-language" lang={secondaryLanguage}>
                  <>{secondaryLanguage}</>
                </LanguageLabel>
                <textarea
                  className="size-full p-4 focus:outline-blue-focus"
                  id="form-title-fr"
                  aria-describedby="form-title-fr-language"
                  value={form[localizeField(LocalizedFormProperties.TITLE, secondaryLanguage)]}
                  onChange={(e) => {
                    updateField(
                      `form.${localizeField(LocalizedFormProperties.TITLE, secondaryLanguage)}`,
                      e.target.value
                    );
                  }}
                  {...getLocalizationAttribute()}
                />
              </div>
            </div>
          </fieldset>
          {/* END FORM TITLE */}

          {/* INTRO */}
          {(form.introduction?.descriptionEn || form.introduction?.descriptionFr) && (
            <fieldset>
              <FieldsetLegend>{t("description")}</FieldsetLegend>
              <div
                className="mb-10 flex gap-px divide-x-2 border border-gray-300"
                key={primaryLanguage}
              >
                <div className="relative w-1/2 flex-1">
                  <LanguageLabel id="form-introduction-english-language" lang={primaryLanguage}>
                    <>{primaryLanguage}</>
                  </LanguageLabel>
                  <RichTextEditor
                    path={`form.introduction.${localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      primaryLanguage
                    )}`}
                    content={
                      form.introduction[
                        localizeField(LocalizedElementProperties.DESCRIPTION, primaryLanguage)
                      ]
                    }
                    lang={primaryLanguage}
                    ariaLabel={t("description")}
                    ariaDescribedBy="form-introduction-english-language"
                  />
                </div>
                <div className="relative w-1/2 flex-1">
                  <LanguageLabel id="form-introduction-french-language" lang={secondaryLanguage}>
                    <>{secondaryLanguage}</>
                  </LanguageLabel>
                  <RichTextEditor
                    path={`form.introduction.${localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      secondaryLanguage
                    )}`}
                    content={
                      form.introduction[
                        localizeField(LocalizedElementProperties.DESCRIPTION, secondaryLanguage)
                      ]
                    }
                    lang={secondaryLanguage}
                    ariaLabel={t("description")}
                    ariaDescribedBy="form-introduction-french-language"
                  />
                </div>
              </div>
            </fieldset>
          )}
          {/* END INTRO */}
        </section>

        {/* PRIVACY */}
        <section>
          <SectionTitle>{t("privacyStatement")}</SectionTitle>
          <fieldset>
            <FieldsetLegend>{t("pageText")}</FieldsetLegend>

            <div
              className="mb-10 flex gap-px divide-x-2 border border-gray-300"
              key={primaryLanguage}
            >
              <div className="relative w-1/2 flex-1">
                <LanguageLabel
                  id={`privacyPolicy-${primaryLanguage}-language`}
                  lang={primaryLanguage}
                >
                  <>{primaryLanguage}</>
                </LanguageLabel>
                <RichTextEditor
                  path={`form.privacyPolicy.${localizeField(
                    LocalizedElementProperties.DESCRIPTION,
                    primaryLanguage
                  )}`}
                  content={
                    form.privacyPolicy?.[
                      localizeField(LocalizedElementProperties.DESCRIPTION, primaryLanguage)
                    ] ?? ""
                  }
                  lang={primaryLanguage}
                  ariaLabel={t("privacyStatement")}
                  ariaDescribedBy={`privacyPolicy-${primaryLanguage}-language`}
                />
              </div>
              <div className="relative w-1/2 flex-1">
                <LanguageLabel
                  id={`privacyPolicy-${secondaryLanguage}->language`}
                  lang={secondaryLanguage}
                >
                  <>{secondaryLanguage}</>
                </LanguageLabel>
                <RichTextEditor
                  path={`form.privacyPolicy.${localizeField(
                    LocalizedElementProperties.DESCRIPTION,
                    secondaryLanguage
                  )}`}
                  content={
                    form.privacyPolicy?.[
                      localizeField(LocalizedElementProperties.DESCRIPTION, secondaryLanguage)
                    ] ?? ""
                  }
                  lang={secondaryLanguage}
                  ariaLabel={t("privacyStatement")}
                  ariaDescribedBy={`privacyPolicy-${secondaryLanguage}->language`}
                />
              </div>
            </div>
          </fieldset>
        </section>
        {/* END PRIVACY */}

        {/* ELEMENTS */}
        <section>
          {
            // Loop through each group and render the elements in the group
          }
          {groups &&
            Object.keys(groups).map((groupKey) => {
              const thisGroup = groups[groupKey];
              const groupName = thisGroup.name;
              if (groupKey == "review" || groupKey == "end") return null;
              return (
                <div key={groupKey}>
                  <SectionTitle>
                    {t("logic.sectionTitle")} <em>{groupName}</em>
                  </SectionTitle>
                  <GroupSection
                    group={thisGroup}
                    groupId={groupKey}
                    primaryLanguage={primaryLanguage}
                    secondaryLanguage={secondaryLanguage}
                  />
                  {sortGroup({ form, group: thisGroup }).map((element, index) => {
                    return (
                      <div className="section" id={`section-${index}`} key={element.id}>
                        <Element
                          index={index}
                          element={element}
                          primaryLanguage={primaryLanguage}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </section>
        {/* END ELEMENTS */}

        {/* CONFIRMATION */}
        <section>
          <SectionTitle>{t("confirmationMessage")}</SectionTitle>
          <fieldset>
            <FieldsetLegend>{t("pageText")}</FieldsetLegend>
            <div
              className="mb-10 flex gap-px divide-x-2 border border-gray-300"
              key={primaryLanguage}
            >
              <div className="relative w-1/2 flex-1">
                <LanguageLabel
                  id={`confirmation-${primaryLanguage}-language`}
                  lang={primaryLanguage}
                >
                  <>{primaryLanguage}</>
                </LanguageLabel>
                <RichTextEditor
                  path={`form.confirmation.${localizeField(
                    LocalizedElementProperties.DESCRIPTION,
                    primaryLanguage
                  )}`}
                  content={
                    form.confirmation?.[
                      localizeField(LocalizedElementProperties.DESCRIPTION, primaryLanguage)
                    ] ?? ""
                  }
                  lang={primaryLanguage}
                  ariaLabel={t("confirmationMessage")}
                  ariaDescribedBy={`confirmation-${primaryLanguage}-language`}
                />
              </div>
              <div className="relative w-1/2 flex-1">
                <LanguageLabel
                  id={`confirmation-${secondaryLanguage}-language`}
                  lang={secondaryLanguage}
                >
                  <>{secondaryLanguage}</>
                </LanguageLabel>
                <RichTextEditor
                  path={`form.confirmation.${localizeField(
                    LocalizedElementProperties.DESCRIPTION,
                    secondaryLanguage
                  )}`}
                  content={
                    form.confirmation?.[
                      localizeField(LocalizedElementProperties.DESCRIPTION, secondaryLanguage)
                    ] ?? ""
                  }
                  lang={secondaryLanguage}
                  ariaLabel={t("confirmationMessage")}
                  ariaDescribedBy={`confirmation-${secondaryLanguage}-language`}
                />
              </div>
            </div>
          </fieldset>
        </section>
        {/* END CONFIRMATION */}
      </div>
    </>
  );
};
