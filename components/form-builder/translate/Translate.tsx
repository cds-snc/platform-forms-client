import React from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { useTranslation } from "next-i18next";
import { RichText } from "./RichText";
import { SwapHoriz } from "@styled-icons/material/SwapHoriz";
import { Title } from "./Title";
import { Description } from "./Description";
import { Options } from "./Options";
import { LocalizedElementProperties } from "../types";
import { DownloadCSV } from "./DownloadCSV";
import { RichTextEditor } from "../lexical-editor/RichTextEditor";
import { Button } from "../shared/Button";

const FlexDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LangSpan = styled.span`
  width: 70px;
`;

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
      border: 1px solid #cacaca;

      &.section-text--rich-text > div {
        .editor-input {
          height: calc(100% - 90px);
        }

        @media (min-width: 992px) {
          .editor-input {
            height: calc(100% - 56px);
          }
        }

        &:first-of-type {
          border-right: 1px solid black;
        }

        &:last-of-type {
          border-left: 1px solid black;
          margin-left: -1px;
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

        &:first-of-type {
          border-right: 1px solid black;
        }

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
  const {
    updateField,
    form,
    toggleTranslationLanguagePriority,
    translationLanguagePriority,
    localizeField,
  } = useTemplateStore();
  const { t } = useTranslation("form-builder");

  const translationLanguagePriorityAlt = translationLanguagePriority === "en" ? "fr" : "en";

  const switchLanguage = () => {
    toggleTranslationLanguagePriority();
  };

  let questionsIndex = 1;

  return (
    <>
      <h1 className="border-0 mb-0">{t("translateTitle")}</h1>
      <div>
        <p>
          Translate your form content side by side to provide a bilingual experience to those
          filling out your form.
        </p>
        <br />

        <FlexDiv>
          <FlexDiv>
            <LangSpan>{translationLanguagePriority === "en" ? "English" : "French"}</LangSpan>
            <Button
              className="mx-4"
              onClick={switchLanguage}
              icon={<SwapHoriz className="fill-white-default" />}
            >
              {t("Switch")}
            </Button>
            <LangSpan>{translationLanguagePriority === "en" ? "French" : "English"}</LangSpan>
          </FlexDiv>
          <DownloadCSV />
        </FlexDiv>

        <SectionDiv>
          <div className="section-title">
            <h2>{t("Start")}</h2>
            <hr />
          </div>

          <fieldset className="text-entry">
            <legend className="section-heading">
              {t("Form introduction")}: {t("Title")}
            </legend>
            <div className="section-text">
              <label htmlFor="form-title-en" className="sr-only">
                {t(`${translationLanguagePriority}-text`)}
              </label>
              <input
                id="form-title-en"
                type="text"
                value={
                  form[localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)]
                }
                onChange={(e) => {
                  updateField(
                    `form.${localizeField(
                      LocalizedElementProperties.TITLE,
                      translationLanguagePriority
                    )}`,
                    e.target.value
                  );
                }}
              />
              <label htmlFor="form-title-fr" className="sr-only">
                {t(`${translationLanguagePriorityAlt}-text`)}
              </label>
              <input
                id="form-title-fr"
                type="text"
                value={
                  form[
                    localizeField(LocalizedElementProperties.TITLE, translationLanguagePriorityAlt)
                  ]
                }
                onChange={(e) => {
                  updateField(
                    `form.${localizeField(
                      LocalizedElementProperties.TITLE,
                      translationLanguagePriorityAlt
                    )}`,
                    e.target.value
                  );
                }}
              />
            </div>
          </fieldset>

          {(form.introduction.descriptionEn || form.introduction.descriptionFr) && (
            <div className="text-entry">
              <div className="section-heading">
                {t("Form introduction")}: {t("Description")}
              </div>
              <div className="section-text section-text--rich-text">
                <RichTextEditor
                  autoFocusEditor={false}
                  path={`form.introduction.${localizeField(
                    LocalizedElementProperties.DESCRIPTION,
                    translationLanguagePriority
                  )}`}
                  content={
                    form.introduction[
                      localizeField(
                        LocalizedElementProperties.DESCRIPTION,
                        translationLanguagePriority
                      )
                    ]
                  }
                  lang={translationLanguagePriority}
                />
                <RichTextEditor
                  autoFocusEditor={false}
                  path={`form.introduction.${localizeField(
                    LocalizedElementProperties.DESCRIPTION,
                    translationLanguagePriorityAlt
                  )}`}
                  content={
                    form.introduction[
                      localizeField(
                        LocalizedElementProperties.DESCRIPTION,
                        translationLanguagePriorityAlt
                      )
                    ]
                  }
                  lang={translationLanguagePriorityAlt}
                />
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
                    {element.type === "richText" && <>Page text</>}
                  </h2>
                  <hr />
                </div>

                {element.type === "richText" && (
                  <RichText
                    translationLanguagePriority={translationLanguagePriority}
                    element={element}
                    index={index}
                  />
                )}

                {["radio", "checkbox", "dropdown"].includes(element.type) && (
                  <>
                    <Title
                      translationLanguagePriority={translationLanguagePriority}
                      element={element}
                      index={index}
                    />
                    {(element.properties.descriptionEn || element.properties.descriptionFr) && (
                      <Description
                        translationLanguagePriority={translationLanguagePriority}
                        element={element}
                        index={index}
                      />
                    )}
                    <Options
                      translationLanguagePriority={translationLanguagePriority}
                      element={element}
                      index={index}
                    />
                  </>
                )}

                {["textField", "textArea"].includes(element.type) && (
                  <>
                    <Title
                      translationLanguagePriority={translationLanguagePriority}
                      element={element}
                      index={index}
                    />
                    {(element.properties.descriptionEn || element.properties.descriptionFr) && (
                      <Description
                        translationLanguagePriority={translationLanguagePriority}
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
            <h2>{t("Privacy statement")}</h2>
            <hr />
          </div>
          <div className="text-entry">
            <div className="section-heading">
              {t("Page text")}: {t("Description")}
            </div>

            <div className="section-text section-text--rich-text">
              <RichTextEditor
                autoFocusEditor={false}
                path={`form.privacyPolicy.${localizeField(
                  LocalizedElementProperties.DESCRIPTION,
                  translationLanguagePriority
                )}`}
                content={
                  form.privacyPolicy[
                    localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriority
                    )
                  ]
                }
                lang={translationLanguagePriority}
              />
              <RichTextEditor
                autoFocusEditor={false}
                path={`form.privacyPolicy.${localizeField(
                  LocalizedElementProperties.DESCRIPTION,
                  translationLanguagePriorityAlt
                )}`}
                content={
                  form.privacyPolicy[
                    localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriorityAlt
                    )
                  ]
                }
                lang={translationLanguagePriorityAlt}
              />
            </div>
          </div>
        </SectionDiv>

        <SectionDiv>
          <div className="section-title">
            <h2>{t("Confirmation message")}</h2>
            <hr />
          </div>
          <div className="text-entry">
            <div className="section-heading">
              {t("Page text")}: {t("Description")}
            </div>
            <div className="section-text section-text--rich-text">
              <RichTextEditor
                autoFocusEditor={false}
                path={`form.endPage.${localizeField(
                  LocalizedElementProperties.DESCRIPTION,
                  translationLanguagePriority
                )}`}
                content={
                  form.endPage[
                    localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriority
                    )
                  ]
                }
                lang={translationLanguagePriority}
              />
              <RichTextEditor
                autoFocusEditor={false}
                path={`form.endPage.${localizeField(
                  LocalizedElementProperties.DESCRIPTION,
                  translationLanguagePriorityAlt
                )}`}
                content={
                  form.endPage[
                    localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriorityAlt
                    )
                  ]
                }
                lang={translationLanguagePriorityAlt}
              />
            </div>
          </div>
        </SectionDiv>
      </div>
    </>
  );
};
