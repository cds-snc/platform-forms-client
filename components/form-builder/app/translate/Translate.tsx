import React from "react";
import styled from "styled-components";
import { useTemplateStore } from "../../store/useTemplateStore";
import { useTranslation } from "next-i18next";
import { RichText } from "./RichText";
import { Title } from "./Title";
import { Description } from "./Description";
import { Options } from "./Options";
import { LocalizedElementProperties } from "../../types";
import { DownloadCSV } from "./DownloadCSV";
import { RichTextEditor } from "../edit/elements/lexical-editor/RichTextEditor";
import { LanguageLabel } from "./LanguageLabel";

const SectionDiv = styled.div`
  .section-title {
    display: flex;
    align-items: center;
    margin-top: 30px;
    margin-bottom: 20px;

    h2 {
      font-size: 24px;
      margin: 0;
      padding: 0;
      padding-right: 10px;
    }

    hr {
      flex-grow: 1;
      border-top: 2px dotted black;
    }
  }

  .text-entry {
    .section-heading {
      font-size: 16px;
      padding: 8px 6px;
      border: #dfdfdf 1px solid;
      border-bottom: none;
      background: #f5f5f5;
      width: 100%;
    }

    .section-text {
      display: grid;
      grid-auto-flow: column;
      margin-bottom: 20px;
      grid-auto-columns: minmax(0, 1fr);
      border: 1px solid #cacaca;

      &.section-text--rich-text > div {
        .editor {
          height: calc(100% - 90px);
        }

        @media (min-width: 992px) {
          .editor {
            height: calc(100% - 56px);
          }
        }

        .editor-input {
          height: 100%;
        }
      }

      > * {
        flex: 1;
      }

      input,
      textarea {
        width: 100%;
        padding: 8px;
        margin-top: 5;
        z-index: 1;

        &:focus {
          border-color: #303fc3;
          box-shadow: 0 0 0 2.5px #303fc3;
          outline: 0;
          z-index: 10;
        }
      }
    }
  }
`;

export const Translate = () => {
  const { updateField, form, localizeField } = useTemplateStore((s) => ({
    updateField: s.updateField,
    form: s.form,
    localizeField: s.localizeField,
  }));
  const { t } = useTranslation("form-builder");

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

        <SectionDiv>
          <div className="section-title">
            <h2>{t("start")}</h2>
            <hr />
          </div>

          <fieldset className="text-entry">
            <legend className="section-heading">
              {t("formIntroduction")}: {t("title")}
            </legend>
            <div className="section-text divide-x-2">
              <label htmlFor="form-title-en" className="sr-only">
                {t(`${primaryLanguage}-text`)}
              </label>
              <div className="relative pb-7">
                <LanguageLabel id="form-title-en-language" lang={primaryLanguage}>
                  {t(primaryLanguage)}
                </LanguageLabel>
                <input
                  id="form-title-en"
                  aria-describedby="form-title-en-language"
                  type="text"
                  value={form[localizeField(LocalizedElementProperties.TITLE, primaryLanguage)]}
                  onChange={(e) => {
                    updateField(
                      `form.${localizeField(LocalizedElementProperties.TITLE, primaryLanguage)}`,
                      e.target.value
                    );
                  }}
                />
              </div>
              <label htmlFor="form-title-fr" className="sr-only">
                {t(`${secondaryLanguage}-text`)}
              </label>
              <div className="relative">
                <LanguageLabel id="form-title-fr-language" lang={secondaryLanguage}>
                  {t(secondaryLanguage)}
                </LanguageLabel>
                <input
                  id="form-title-fr"
                  aria-describedby="form-title-fr-language"
                  type="text"
                  value={form[localizeField(LocalizedElementProperties.TITLE, secondaryLanguage)]}
                  onChange={(e) => {
                    updateField(
                      `form.${localizeField(LocalizedElementProperties.TITLE, secondaryLanguage)}`,
                      e.target.value
                    );
                  }}
                />
              </div>
            </div>
          </fieldset>

          {(form.introduction?.descriptionEn || form.introduction?.descriptionFr) && (
            <div className="text-entry">
              <div className="section-heading">
                {t("formIntroduction")}: {t("description")}
              </div>
              <div
                className="section-text section-text--rich-text divide-x-2"
                key={primaryLanguage}
              >
                <div className="relative">
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
                <div className="relative">
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
            </div>
          )}
        </SectionDiv>

        <SectionDiv>
          {form.elements.map((element, index) => {
            return (
              <div className="section" key={`section-${index}`} id={`section-${index}`}>
                <div className="section-title">
                  <h2>
                    {element.type !== "richText" && <>Question {questionsIndex++}</>}{" "}
                    {element.type === "richText" && <>{t("pageText")}</>}
                  </h2>
                  <hr />
                </div>

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
        </SectionDiv>

        <SectionDiv>
          <div className="section-title">
            <h2>{t("privacyStatement")}</h2>
            <hr />
          </div>
          <div className="text-entry">
            <div className="section-heading">
              {t("pageText")}: {t("description")}
            </div>

            <div className="section-text section-text--rich-text divide-x-2" key={primaryLanguage}>
              <div className="relative">
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
              <div className="relative">
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
          </div>
        </SectionDiv>

        <SectionDiv>
          <div className="section-title">
            <h2>{t("confirmationMessage")}</h2>
            <hr />
          </div>
          <div className="text-entry">
            <div className="section-heading">
              {t("pageText")}: {t("description")}
            </div>
            <div className="section-text section-text--rich-text divide-x-2" key={primaryLanguage}>
              <div className="relative">
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
              <div className="relative">
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
          </div>
        </SectionDiv>
      </div>
    </>
  );
};
