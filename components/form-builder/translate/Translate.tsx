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

const SwitchLanguageButton = styled.button`
  color: #fff;

  align-items: center;
  padding: 10px 25px;
  margin: 0 10px;

  background: #26374a;
  border: 2px solid #284162;
  border-radius: 10px;

  svg {
    width: 40px;
    margin-left: 4px;
  }
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
    display: flex;
    align-items: flex-end;
    margin-bottom: 20px;
    border: 1px solid #cacaca;

    > * {
      flex: 1;
    }

    > div:first-of-type {
      border-right: 1px solid black;
    }

    input,
    textarea {
      width: 100%;
      padding: 8px;
      margin-top: 5;
    }

    span {
      display: inline-block;
      margin-right: 10px;
      padding: 8px 6px;
      background: #e9ecef;
      &:first-of-type {
        background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), #e9ecef;
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
        <div>
          {translationLanguagePriority === "en" ? "English" : "French"}
          <SwitchLanguageButton onClick={switchLanguage}>
            <span>{t("Switch")}</span>
            <SwapHoriz />
          </SwitchLanguageButton>
          {translationLanguagePriority === "en" ? "French" : "English"}
        </div>

        <SectionDiv>
          <div className="section-title">
            <h2>{t("Start")}</h2>
            <hr />
          </div>

          <DownloadCSV />

          <div className="text-entry">
            <div>
              <span>{t("Form introduction")}</span>
              <span>{t("Title")}</span>
              <input
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
            </div>
            <div>
              <input
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
          </div>

          {(form.introduction.descriptionEn || form.introduction.descriptionFr) && (
            <div className="text-entry">
              <div>
                <span>{t("Form introduction")}</span>
                <span>{t("Description")}</span>
                <textarea
                  value={
                    form.introduction[
                      localizeField(
                        LocalizedElementProperties.DESCRIPTION,
                        translationLanguagePriority
                      )
                    ]
                  }
                  onChange={(e) => {
                    updateField(
                      `form.introduction.${localizeField(
                        LocalizedElementProperties.DESCRIPTION,
                        translationLanguagePriority
                      )}`,
                      e.target.value
                    );
                  }}
                ></textarea>
              </div>
              <div>
                <textarea
                  value={
                    form.introduction[
                      localizeField(
                        LocalizedElementProperties.DESCRIPTION,
                        translationLanguagePriorityAlt
                      )
                    ]
                  }
                  onChange={(e) => {
                    updateField(
                      `form.introduction.${localizeField(
                        LocalizedElementProperties.DESCRIPTION,
                        translationLanguagePriorityAlt
                      )}`,
                      e.target.value
                    );
                  }}
                ></textarea>
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
            <div>
              <span>{t("Page text")}</span>
              <span>{t("Description")}</span>
              <textarea
                value={
                  form.privacyPolicy[
                    localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriority
                    )
                  ]
                }
                onChange={(e) => {
                  updateField(
                    `form.privacyPolicy.${localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriority
                    )}`,
                    e.target.value
                  );
                }}
              ></textarea>
            </div>
            <div>
              <textarea
                value={
                  form.privacyPolicy[
                    localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriorityAlt
                    )
                  ]
                }
                onChange={(e) => {
                  updateField(
                    `form.privacyPolicy.${localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriorityAlt
                    )}`,
                    e.target.value
                  );
                }}
              ></textarea>
            </div>
          </div>
        </SectionDiv>

        <SectionDiv>
          <div className="section-title">
            <h2>{t("Confirmation message")}</h2>
            <hr />
          </div>
          <div className="text-entry">
            <div>
              <span>{t("Page text")}</span>
              <span>{t("Description")}</span>

              <textarea
                value={
                  form.endPage[
                    localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriority
                    )
                  ]
                }
                onChange={(e) => {
                  updateField(
                    `form.endPage.${localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriority
                    )}`,
                    e.target.value
                  );
                }}
              ></textarea>
            </div>
            <div>
              <textarea
                value={
                  form.endPage[
                    localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriorityAlt
                    )
                  ]
                }
                onChange={(e) => {
                  updateField(
                    `form.endPage.${localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriorityAlt
                    )}`,
                    e.target.value
                  );
                }}
              ></textarea>
            </div>
          </div>
        </SectionDiv>
      </div>
    </>
  );
};
