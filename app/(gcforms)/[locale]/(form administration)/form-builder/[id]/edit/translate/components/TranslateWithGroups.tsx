"use client";
import React from "react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useRehydrate } from "@lib/store/hooks/useRehydrate";
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
import { RichTextEditor } from "../../components/elements/RichTextEditor";
import { LanguageLabel } from "@formBuilder/components/shared/LanguageLabel";
import { FieldsetLegend, SectionTitle } from ".";
import { SaveButton } from "@formBuilder/components/shared/SaveButton";

import { FormElement, FormElementTypes } from "@lib/types";
import { SkipLinkReusable } from "@clientComponents/globals/SkipLinkReusable";
import { sortGroup } from "@lib/utils/form-builder/groupedFormHelpers";
import { Group } from "@lib/formContext";
import { TranslateCustomizeSet } from "./TranslateCustomizeSet";

import { ExitUrl } from "./ExitUrl";

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
          <FieldsetLegend>{t("logic.translateTitle")}</FieldsetLegend>
          <div
            className="mb-10 flex gap-px divide-x-2 border border-gray-300"
            key={primaryLanguage}
          >
            <div className="relative w-1/2 flex-1">
              <LanguageLabel
                id={`group-${groupId}-title-${primaryLanguage}-language`}
                lang={primaryLanguage}
              >
                <>{primaryLanguage}</>
              </LanguageLabel>
              <textarea
                className="size-full p-4 focus:outline-blue-focus"
                aria-label={group.name + " " + t("logic.translateTitle", { lng: primaryLanguage })}
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
              <LanguageLabel
                id={`group-${groupId}-title-${secondaryLanguage}-language`}
                lang={secondaryLanguage}
              >
                <>{secondaryLanguage}</>
              </LanguageLabel>

              <textarea
                className="size-full p-4 focus:outline-blue-focus"
                aria-label={
                  group.name + " " + t("logic.translateTitle", { lng: secondaryLanguage })
                }
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
  secondaryLanguage,
  questionNumber,
}: {
  element: FormElement;
  index: number;
  primaryLanguage: Language;
  secondaryLanguage: Language;
  questionNumber?: string;
}) => {
  let subElements;

  const { t } = useTranslation("form-builder");

  if (element.type === FormElementTypes.dynamicRow) {
    subElements = element.properties.subElements?.map((subElement) => {
      return (
        <Element
          key={subElement.id}
          element={subElement}
          index={subElement.id}
          primaryLanguage={primaryLanguage}
          secondaryLanguage={secondaryLanguage}
        />
      );
    });
  }
  return (
    <>
      {questionNumber && (
        <SectionTitle>
          {element.type === FormElementTypes.richText && <>{t("pageText")}</>}
          {element.type !== FormElementTypes.richText && <>{"Question " + questionNumber}</>}
        </SectionTitle>
      )}

      {element.type === FormElementTypes.richText && (
        <RichText primaryLanguage={primaryLanguage} element={element} index={index} />
      )}

      {[
        FormElementTypes.radio,
        FormElementTypes.checkbox,
        FormElementTypes.dropdown,
        FormElementTypes.combobox,
      ].includes(element.type) && (
        <>
          <Title primaryLanguage={primaryLanguage} element={element} />
          {(element.properties.descriptionEn || element.properties.descriptionFr) && (
            <Description primaryLanguage={primaryLanguage} element={element} />
          )}
          <Options primaryLanguage={primaryLanguage} element={element} index={index} />
        </>
      )}

      {[
        FormElementTypes.textField,
        FormElementTypes.textArea,
        FormElementTypes.formattedDate,
        FormElementTypes.addressComplete,
        FormElementTypes.fileInput,
      ].includes(element.type) && (
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
      {element.type === FormElementTypes.dynamicRow && (
        <>
          <TranslateCustomizeSet
            element={element}
            primaryLanguage={primaryLanguage}
            secondaryLanguage={secondaryLanguage}
          />
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
      <h1 className="sr-only">{t("edit")}</h1>
      <div className="mr-10">
        <div className="flex w-[700px]">
          <h2 id="editTranslationsHeading" className="whitespace-nowrap" tabIndex={-1}>
            {t("groups.editTranslationsHeading")}
          </h2>
          <div className="ml-5 mt-2">
            <SaveButton />
          </div>
        </div>
        <SkipLinkReusable anchor="#rightPanelTitle">
          {t("skipLink.translateSetup")}
        </SkipLinkReusable>
        <p className="mb-8">{t("translateDescription")}</p>

        <div>
          <SectionTitle>
            {t("logic.pageTitle")} <em>{t("logic.start")}</em>
          </SectionTitle>
        </div>

        <section>
          {/* FORM TITLE */}
          <fieldset>
            <FieldsetLegend>{t("formTitle")}</FieldsetLegend>
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
              <FieldsetLegend>{t("translations.formDescription")}</FieldsetLegend>
              <div
                className="mb-10 flex gap-px divide-x-2 border border-gray-300"
                key={primaryLanguage}
              >
                <div className="relative w-1/2 flex-1">
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
                  <LanguageLabel id="form-introduction-english-language" lang={primaryLanguage}>
                    <>{primaryLanguage}</>
                  </LanguageLabel>
                </div>
                <div className="relative w-1/2 flex-1">
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
                  <LanguageLabel id="form-introduction-french-language" lang={secondaryLanguage}>
                    <>{secondaryLanguage}</>
                  </LanguageLabel>
                </div>
              </div>
            </fieldset>
          )}
          {/* END INTRO */}
        </section>

        {/* PRIVACY */}
        <section>
          <fieldset>
            <FieldsetLegend>{t("privacyStatement")}</FieldsetLegend>

            <div
              className="mb-10 flex gap-px divide-x-2 border border-gray-300"
              key={primaryLanguage}
            >
              <div className="relative w-1/2 flex-1">
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
                <LanguageLabel
                  id={`privacyPolicy-${primaryLanguage}-language`}
                  lang={primaryLanguage}
                >
                  <>{primaryLanguage}</>
                </LanguageLabel>
              </div>
              <div className="relative w-1/2 flex-1">
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
                <LanguageLabel
                  id={`privacyPolicy-${secondaryLanguage}->language`}
                  lang={secondaryLanguage}
                >
                  <>{secondaryLanguage}</>
                </LanguageLabel>
              </div>
            </div>
          </fieldset>
        </section>
        {/* END PRIVACY */}

        <div key={"start"}>
          {groups &&
            sortGroup({ form, group: groups["start"] }).map((element, index) => {
              return (
                <div className="section" id={`section-${index}`} key={element.id}>
                  <Element
                    index={index}
                    element={element}
                    primaryLanguage={primaryLanguage}
                    secondaryLanguage={secondaryLanguage}
                  />
                </div>
              );
            })}
        </div>

        {/* ELEMENTS */}
        <section>
          {
            // Loop through each group and render the elements in the group
          }
          {groups &&
            Object.keys(groups).map((groupKey) => {
              const thisGroup = groups[groupKey];
              const groupName = thisGroup.name;

              const nextAction = groups[groupKey]?.nextAction;
              const isExitPage = nextAction === "exit" ? true : false;

              if (groupKey == "review" || groupKey == "end" || groupKey == "start") return null;
              return (
                <div key={groupKey}>
                  <SectionTitle>
                    {t("logic.pageTitle")} <em>{groupName}</em>
                  </SectionTitle>

                  <GroupSection
                    group={thisGroup}
                    groupId={groupKey}
                    primaryLanguage={primaryLanguage}
                    secondaryLanguage={secondaryLanguage}
                  />

                  {isExitPage ? (
                    <ExitUrl
                      groupId={groupKey}
                      group={thisGroup}
                      primaryLanguage={primaryLanguage}
                    />
                  ) : null}

                  {sortGroup({ form, group: thisGroup }).map((element, index) => {
                    return (
                      <div className="section" id={`section-${index}`} key={element.id}>
                        <Element
                          index={index}
                          element={element}
                          primaryLanguage={primaryLanguage}
                          secondaryLanguage={secondaryLanguage}
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
          <SectionTitle>
            {t("logic.pageTitle")} <em>{t("logic.end")}</em>
          </SectionTitle>
          <fieldset>
            <FieldsetLegend>{t("confirmationMessage")}</FieldsetLegend>
            <div
              className="mb-10 flex gap-px divide-x-2 border border-gray-300"
              key={primaryLanguage}
            >
              <div className="relative w-1/2 flex-1">
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
                <LanguageLabel
                  id={`confirmation-${primaryLanguage}-language`}
                  lang={primaryLanguage}
                >
                  <>{primaryLanguage}</>
                </LanguageLabel>
              </div>
              <div className="relative w-1/2 flex-1">
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
                <LanguageLabel
                  id={`confirmation-${secondaryLanguage}-language`}
                  lang={secondaryLanguage}
                >
                  <>{secondaryLanguage}</>
                </LanguageLabel>
              </div>
            </div>
          </fieldset>
        </section>
        {/* END CONFIRMATION */}
        <SkipLinkReusable anchor="#rightPanelTitle">
          {t("skipLink.translateSetup")}
        </SkipLinkReusable>
      </div>
    </>
  );
};
