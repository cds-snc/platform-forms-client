import React from "react";
import { useTemplateStore } from "../../store/useTemplateStore";
import { useTranslation } from "next-i18next";
import { RichText } from "./RichText";
import { Title } from "./Title";
import { Description } from "./Description";
import { Options } from "./Options";
import { LocalizedElementProperties, LocalizedFormProperties } from "../../types";
import { DownloadCSV } from "./DownloadCSV";
import { RichTextEditor } from "../edit/elements/lexical-editor/RichTextEditor";
import { LanguageLabel } from "./LanguageLabel";
import { FieldsetLegend, SectionTitle } from ".";
import { formatEmailSubject } from "../edit/Edit";

export const Translate = () => {
  const { updateField, form, localizeField } = useTemplateStore((s) => ({
    updateField: s.updateField,
    form: s.form,
    localizeField: s.localizeField,
  }));
  const { t, i18n } = useTranslation("form-builder");

  // Set default left-hand language
  const primaryLanguage = "en";
  const secondaryLanguage = primaryLanguage === "en" ? "fr" : "en";

  let questionsIndex = 1;

  return (
    <>
      <div>
        <h1 className="border-0 mb-0">{t("translateTitle")}</h1>
        <p>{t("translateDescription")}</p>
        <br />

        <div className="lg:mt-4">
          <DownloadCSV />
        </div>

        <section>
          <SectionTitle>{t("start")}</SectionTitle>

          <fieldset>
            <FieldsetLegend>
              {t("formIntroduction")}: {t("title")}
            </FieldsetLegend>

            <div className="flex gap-px border border-gray-300 mb-10 divide-x-2">
              <label htmlFor="form-title-en" className="sr-only">
                {t(`${primaryLanguage}-text`)}
              </label>
              <div className="relative flex-1">
                <LanguageLabel id="form-title-en-language" lang={primaryLanguage}>
                  {t(primaryLanguage)}
                </LanguageLabel>
                <input
                  className="w-full p-4 h-full focus:outline-blue-focus"
                  id="form-title-en"
                  aria-describedby="form-title-en-language"
                  type="text"
                  value={form[localizeField(LocalizedFormProperties.TITLE, primaryLanguage)]}
                  onChange={(e) => {
                    updateField(
                      `form.${localizeField(LocalizedFormProperties.TITLE, primaryLanguage)}`,
                      e.target.value
                    );
                    // Temporary fix (see function `formatEmailSubject` in Edit.tsx file)
                    updateField(
                      `form.${localizeField(
                        LocalizedFormProperties.EMAIL_SUBJECT,
                        primaryLanguage
                      )}`,
                      formatEmailSubject(e.target.value, primaryLanguage)
                    );
                  }}
                  {...(i18n.language !== primaryLanguage && { lang: primaryLanguage })}
                />
              </div>
              <label
                htmlFor="form-title-fr"
                className="sr-only"
                {...(i18n.language !== secondaryLanguage && { lang: secondaryLanguage })}
              >
                {t(`${secondaryLanguage}-text`)}
              </label>
              <div className="relative flex-1">
                <LanguageLabel id="form-title-fr-language" lang={secondaryLanguage}>
                  {t(secondaryLanguage)}
                </LanguageLabel>
                <input
                  className="w-full p-4 h-full focus:outline-blue-focus"
                  id="form-title-fr"
                  aria-describedby="form-title-fr-language"
                  type="text"
                  value={form[localizeField(LocalizedFormProperties.TITLE, secondaryLanguage)]}
                  onChange={(e) => {
                    updateField(
                      `form.${localizeField(LocalizedFormProperties.TITLE, secondaryLanguage)}`,
                      e.target.value
                    );
                    // Temporary fix (see function `formatEmailSubject` in Edit.tsx file)
                    updateField(
                      `form.${localizeField(
                        LocalizedFormProperties.EMAIL_SUBJECT,
                        secondaryLanguage
                      )}`,
                      formatEmailSubject(e.target.value, secondaryLanguage)
                    );
                  }}
                  {...(i18n.language !== secondaryLanguage && { lang: secondaryLanguage })}
                />
              </div>
            </div>
          </fieldset>

          {(form.introduction?.descriptionEn || form.introduction?.descriptionFr) && (
            <fieldset>
              <FieldsetLegend>
                {t("formIntroduction")}: {t("description")}
              </FieldsetLegend>
              <div
                className="flex gap-px border border-gray-300 mb-10 divide-x-2"
                key={primaryLanguage}
              >
                <div className="w-1/2 flex-1 relative">
                  <LanguageLabel id="form-introduction-english-language" lang={primaryLanguage}>
                    {t(primaryLanguage)}
                  </LanguageLabel>
                  <RichTextEditor
                    autoFocusEditor={false}
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
                    ariaLabel={t("formIntroduction")}
                    ariaDescribedBy="form-introduction-english-language"
                  />
                </div>
                <div className="w-1/2 flex-1 relative">
                  <LanguageLabel id="form-introduction-french-language" lang={secondaryLanguage}>
                    {t(secondaryLanguage)}
                  </LanguageLabel>
                  <RichTextEditor
                    autoFocusEditor={false}
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
                    ariaLabel={t("formIntroduction")}
                    ariaDescribedBy="form-introduction-french-language"
                  />
                </div>
              </div>
            </fieldset>
          )}
        </section>

        <section>
          {form.elements.map((element, index) => {
            return (
              <div className="section" key={`section-${index}`} id={`section-${index}`}>
                <SectionTitle>
                  {element.type === "richText" && <>{t("pageText")}</>}
                  {element.type !== "richText" && <>{"Question " + questionsIndex++}</>}
                </SectionTitle>

                {element.type === "richText" && (
                  <RichText primaryLanguage={primaryLanguage} element={element} index={index} />
                )}

                {["radio", "checkbox", "dropdown"].includes(element.type) && (
                  <>
                    <Title primaryLanguage={primaryLanguage} element={element} index={index} />
                    {(element.properties.descriptionEn || element.properties.descriptionFr) && (
                      <Description
                        primaryLanguage={primaryLanguage}
                        element={element}
                        index={index}
                      />
                    )}
                    <Options primaryLanguage={primaryLanguage} element={element} index={index} />
                  </>
                )}

                {["textField", "textArea"].includes(element.type) && (
                  <>
                    <Title primaryLanguage={primaryLanguage} element={element} index={index} />
                    {(element.properties.descriptionEn || element.properties.descriptionFr) && (
                      <Description
                        primaryLanguage={primaryLanguage}
                        element={element}
                        index={index}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </section>

        <section>
          <SectionTitle>{t("privacyStatement")}</SectionTitle>
          <fieldset>
            <FieldsetLegend>
              {t("pageText")}: {t("description")}
            </FieldsetLegend>

            <div
              className="flex gap-px border border-gray-300 mb-10 divide-x-2"
              key={primaryLanguage}
            >
              <div className="w-1/2 flex-1 relative">
                <LanguageLabel
                  id={`privacyPolicy-${primaryLanguage}-language`}
                  lang={primaryLanguage}
                >
                  {t(primaryLanguage)}
                </LanguageLabel>
                <RichTextEditor
                  autoFocusEditor={false}
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
              <div className="w-1/2 flex-1 relative">
                <LanguageLabel
                  id={`privacyPolicy-${secondaryLanguage}->language`}
                  lang={secondaryLanguage}
                >
                  {t(secondaryLanguage)}
                </LanguageLabel>
                <RichTextEditor
                  autoFocusEditor={false}
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

        <section>
          <SectionTitle>{t("confirmationMessage")}</SectionTitle>
          <fieldset>
            <FieldsetLegend>
              {t("pageText")}: {t("description")}
            </FieldsetLegend>
            <div
              className="flex gap-px border border-gray-300 mb-10 divide-x-2"
              key={primaryLanguage}
            >
              <div className="w-1/2 flex-1 relative">
                <LanguageLabel id={`endpage-${primaryLanguage}-language`} lang={primaryLanguage}>
                  {t(primaryLanguage)}
                </LanguageLabel>
                <RichTextEditor
                  autoFocusEditor={false}
                  path={`form.endPage.${localizeField(
                    LocalizedElementProperties.DESCRIPTION,
                    primaryLanguage
                  )}`}
                  content={
                    form.endPage?.[
                      localizeField(LocalizedElementProperties.DESCRIPTION, primaryLanguage)
                    ] ?? ""
                  }
                  lang={primaryLanguage}
                  ariaLabel={t("confirmationMessage")}
                  ariaDescribedBy={`endpage-${primaryLanguage}-language`}
                />
              </div>
              <div className="w-1/2 flex-1 relative">
                <LanguageLabel
                  id={`endpage-${secondaryLanguage}-language`}
                  lang={secondaryLanguage}
                >
                  {t(secondaryLanguage)}
                </LanguageLabel>
                <RichTextEditor
                  autoFocusEditor={false}
                  path={`form.endPage.${localizeField(
                    LocalizedElementProperties.DESCRIPTION,
                    secondaryLanguage
                  )}`}
                  content={
                    form.endPage?.[
                      localizeField(LocalizedElementProperties.DESCRIPTION, secondaryLanguage)
                    ] ?? ""
                  }
                  lang={secondaryLanguage}
                  ariaLabel={t("confirmationMessage")}
                  ariaDescribedBy={`endpage-${secondaryLanguage}-language`}
                />
              </div>
            </div>
          </fieldset>
        </section>
      </div>
    </>
  );
};
