import React, { useState } from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { useTranslation } from "next-i18next";
import { RichText } from "./RichText";
import { MultipleOptions } from "./MultipleOptions";
import { TextField } from "./TextField";
import { TextArea } from "./TextArea";

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

  let questionsIndex = 1;

  return (
    <>
      <div>
        <p>
          Translate your form content side by side to provide a bilingual experience to those
          filling out your form.
        </p>
        <br />
        <SectionDiv>
          <div className="section-title">
            <h2>Section: Start</h2>
            <hr />
          </div>

          <div className="text-entry">
            <div>
              <span>{t("Form introduction")}</span>
              <span>Title</span>
              <input
                type="text"
                value={form.titleEn}
                onChange={(e) => {
                  updateField("form.titleEn", e.target.value);
                }}
              />
            </div>
            <div>
              <input
                type="text"
                value={form.titleFr}
                onChange={(e) => {
                  updateField("form.titleFr", e.target.value);
                }}
              />
            </div>
          </div>

          <div className="text-entry">
            <div>
              <span>{t("Form introduction")}</span>
              <span>Description</span>
              <input
                type="text"
                value={form.introduction.descriptionEn}
                onChange={(e) => {
                  updateField("form.introduction.descriptionEn", e.target.value);
                }}
              />
            </div>
            <div>
              <input
                type="text"
                value={form.introduction.descriptionFr}
                onChange={(e) => {
                  updateField("form.introduction.descriptionFr", e.target.value);
                }}
              />
            </div>
          </div>

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

                {element.type === "richText" && <RichText element={element} index={index} />}

                {["radio", "checkbox", "dropdown"].includes(element.type) && (
                  <MultipleOptions element={element} index={index} />
                )}

                {element.type === "textField" && <TextField element={element} index={index} />}

                {element.type === "textArea" && <TextArea element={element} index={index} />}
              </div>
            );
          })}
        </SectionDiv>
      </div>
    </>
  );
};
