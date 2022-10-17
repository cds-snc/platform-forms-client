import React, { useState } from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { useTranslation } from "next-i18next";
import { RichText } from "./RichText";
import { SwapHoriz } from "@styled-icons/material/SwapHoriz";
import { Title } from "./Title";
import { Description } from "./Description";
import { Options } from "./Options";

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

const CopyFormContentButton = styled.button`
  border: 2px solid #26374a;
  border-radius: 10px;
  background: #fff;
  padding: 10px 25px;
  margin: 10px 0 30px 0;
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
  const { updateField, form } = useTemplateStore();
  const { t, i18n } = useTranslation("form-builder");
  const [languagePriority, setLanguagePriority] = useState(i18n.language);

  const switchLanguage = () => {
    const newLanguage = languagePriority === "en" ? "fr" : "en";
    setLanguagePriority(newLanguage);
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
          {languagePriority === "en" ? "English" : "French"}
          <SwitchLanguageButton onClick={switchLanguage}>
            <span>{t("Switch")}</span>
            <SwapHoriz />
          </SwitchLanguageButton>
          {languagePriority === "en" ? "French" : "English"}
        </div>

        <SectionDiv>
          <div className="section-title">
            <h2>{t("Start")}</h2>
            <hr />
          </div>

          <CopyFormContentButton>Copy form content</CopyFormContentButton>

          <div className="text-entry">
            <div>
              <span>{t("Form introduction")}</span>
              <span>{t("Title")}</span>
              <input
                type="text"
                value={languagePriority === "en" ? form.titleEn : form.titleFr}
                onChange={(e) => {
                  updateField(
                    languagePriority === "en" ? "form.titleEn" : "form.titleFr",
                    e.target.value
                  );
                }}
              />
            </div>
            <div>
              <input
                type="text"
                value={languagePriority === "en" ? form.titleFr : form.titleEn}
                onChange={(e) => {
                  updateField(
                    languagePriority === "en" ? "form.titleFr" : "form.titleEn",
                    e.target.value
                  );
                }}
              />
            </div>
          </div>

          <div className="text-entry">
            <div>
              <span>{t("Form introduction")}</span>
              <span>{t("Description")}</span>
              <input
                type="text"
                value={
                  languagePriority === "en"
                    ? form.introduction.descriptionEn
                    : form.introduction.descriptionFr
                }
                onChange={(e) => {
                  updateField(
                    languagePriority === "en"
                      ? "form.introduction.descriptionEn"
                      : "form.introduction.descriptionFr",
                    e.target.value
                  );
                }}
              />
            </div>
            <div>
              <input
                type="text"
                value={
                  languagePriority === "en"
                    ? form.introduction.descriptionFr
                    : form.introduction.descriptionEn
                }
                onChange={(e) => {
                  updateField(
                    languagePriority === "en"
                      ? "form.introduction.descriptionFr"
                      : "form.introduction.descriptionEn",
                    e.target.value
                  );
                }}
              />
            </div>
          </div>
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
                  <RichText languagePriority={languagePriority} element={element} index={index} />
                )}

                {["radio", "checkbox", "dropdown"].includes(element.type) && (
                  <>
                    <Title languagePriority={languagePriority} element={element} index={index} />
                    {(element.properties.descriptionEn || element.properties.descriptionFr) && (
                      <Description
                        languagePriority={languagePriority}
                        element={element}
                        index={index}
                      />
                    )}
                    <Options languagePriority={languagePriority} element={element} index={index} />
                  </>
                )}

                {["textField", "textArea"].includes(element.type) && (
                  <>
                    <Title languagePriority={languagePriority} element={element} index={index} />
                    {(element.properties.descriptionEn || element.properties.descriptionFr) && (
                      <Description
                        languagePriority={languagePriority}
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
              <input
                type="text"
                value={
                  languagePriority === "en"
                    ? form.privacyPolicy.descriptionEn
                    : form.privacyPolicy.descriptionFr
                }
                onChange={(e) => {
                  updateField(
                    languagePriority === "en"
                      ? "form.privacyPolicy.descriptionEn"
                      : "form.privacyPolicy.descriptionFr",
                    e.target.value
                  );
                }}
              />
            </div>
            <div>
              <input
                type="text"
                value={
                  languagePriority === "en"
                    ? form.privacyPolicy.descriptionFr
                    : form.privacyPolicy.descriptionEn
                }
                onChange={(e) => {
                  updateField(
                    languagePriority === "en"
                      ? "form.privacyPolicy.descriptionFr"
                      : "form.privacyPolicy.descriptionEn",
                    e.target.value
                  );
                }}
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
            <div>
              <span>{t("Page text")}</span>
              <span>{t("Description")}</span>
              <input
                type="text"
                value={
                  languagePriority === "en"
                    ? form.endPage.descriptionEn
                    : form.endPage.descriptionFr
                }
                onChange={(e) => {
                  updateField(
                    languagePriority === "en"
                      ? "form.endPage.descriptionEn"
                      : "form.endPage.descriptionFr",
                    e.target.value
                  );
                }}
              />
            </div>
            <div>
              <input
                type="text"
                value={
                  languagePriority === "en"
                    ? form.endPage.descriptionFr
                    : form.endPage.descriptionEn
                }
                onChange={(e) => {
                  updateField(
                    languagePriority === "en"
                      ? "form.endPage.descriptionFr"
                      : "form.endPage.descriptionEn",
                    e.target.value
                  );
                }}
              />
            </div>
          </div>
        </SectionDiv>
      </div>
    </>
  );
};
