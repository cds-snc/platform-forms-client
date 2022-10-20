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
import { Editor } from "./Editor";
import { FancyButton } from "../panel/Button";

const SwitchLangButton = styled(FancyButton)`
  padding: 10px 20px;
  background: #26374a;
  color: white;
  margin: 0 10px;

  &:hover:not(:disabled),
  &:active,
  &:focus {
    color: #ffffff;
    background: #1c578a;
  }

  &:hover:active {
    background: #16446c;
  }

  svg {
    width: 30px;
  }
`;

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
      display: flex;
      align-items: flex-end;
      margin-bottom: 20px;
      border: 1px solid #cacaca;

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

      div[class^="Editor"]:first-of-type {
        border-right: 1px solid black;
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
      <div>
        <p>
          Translate your form content side by side to provide a bilingual experience to those
          filling out your form.
        </p>
        <br />

        <FlexDiv>
          <FlexDiv>
            <LangSpan>{translationLanguagePriority === "en" ? "English" : "French"}</LangSpan>
            <SwitchLangButton onClick={switchLanguage} icon={<SwapHoriz />}>
              {t("Switch")}
            </SwitchLangButton>
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
              <div className="section-text">
                <Editor
                  path={`form.introduction.${localizeField(
                    LocalizedElementProperties.DESCRIPTION,
                    translationLanguagePriority
                  )}`}
                  index="introduction"
                  content={
                    form.introduction[
                      localizeField(
                        LocalizedElementProperties.DESCRIPTION,
                        translationLanguagePriority
                      )
                    ]
                  }
                  language={translationLanguagePriority}
                />
                <Editor
                  path={`form.introduction.${localizeField(
                    LocalizedElementProperties.DESCRIPTION,
                    translationLanguagePriorityAlt
                  )}`}
                  index="introduction"
                  content={
                    form.introduction[
                      localizeField(
                        LocalizedElementProperties.DESCRIPTION,
                        translationLanguagePriorityAlt
                      )
                    ]
                  }
                  language={translationLanguagePriorityAlt}
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

            <div className="section-text">
              <Editor
                path={`form.privacyPolicy.${localizeField(
                  LocalizedElementProperties.DESCRIPTION,
                  translationLanguagePriority
                )}`}
                index="introduction"
                content={
                  form.privacyPolicy[
                    localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriority
                    )
                  ]
                }
                language={translationLanguagePriority}
              />
              <Editor
                path={`form.privacyPolicy.${localizeField(
                  LocalizedElementProperties.DESCRIPTION,
                  translationLanguagePriorityAlt
                )}`}
                index="introduction"
                content={
                  form.privacyPolicy[
                    localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriorityAlt
                    )
                  ]
                }
                language={translationLanguagePriorityAlt}
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
            <div className="section-text">
              <Editor
                path={`form.endPage.${localizeField(
                  LocalizedElementProperties.DESCRIPTION,
                  translationLanguagePriority
                )}`}
                index="introduction"
                content={
                  form.endPage[
                    localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriority
                    )
                  ]
                }
                language={translationLanguagePriority}
              />
              <Editor
                path={`form.endPage.${localizeField(
                  LocalizedElementProperties.DESCRIPTION,
                  translationLanguagePriorityAlt
                )}`}
                index="introduction"
                content={
                  form.endPage[
                    localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriorityAlt
                    )
                  ]
                }
                language={translationLanguagePriorityAlt}
              />
            </div>
          </div>
        </SectionDiv>
      </div>
    </>
  );
};
