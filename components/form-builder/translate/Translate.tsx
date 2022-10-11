import React from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { useTranslation } from "next-i18next";

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

    input {
      width: 100%;
      padding: 4px 8px;
      margin-top: 5;
    }

    span {
      display: inline-block;
      border: 1px solid grey;
      margin-right: 4px;
      padding: 1px 4px;
      background: #e9e9e9;
    }
  }
`;

export const Translate = () => {
  const { updateField, form } = useTemplateStore();

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
              <span>Form title</span>
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
              <span>Form title</span>
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

          {form.elements.map((element, index) => (
            <div className="section" key={`section-${index}`} id={`section-${index}`}>
              <div className="section-title">
                <h2>Section: Question {index + 1}</h2>
                <hr />
              </div>

              <div className="text-entry">
                <div>
                  <span>{element.type}</span>
                  <span>Question title</span>
                  <input
                    type="text"
                    value={element.properties.titleEn}
                    onChange={(e) => {
                      updateField(`form.elements[${index}].properties.titleEn`, e.target.value);
                    }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={element.properties.titleFr}
                    onChange={(e) => {
                      updateField(`form.elements[${index}].properties.titleFr`, e.target.value);
                    }}
                  />
                </div>
              </div>

              {(element.properties.descriptionEn || element.properties.descriptionFr) && (
                <div className="text-entry">
                  <div>
                    <span>Short answer</span>
                    <span>Description</span>
                    <input
                      type="text"
                      value={form.elements[index].properties.descriptionEn}
                      onChange={(e) => {
                        updateField(
                          `form.elements[${index}].properties.descriptionEn`,
                          e.target.value
                        );
                      }}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={form.elements[index].properties.descriptionFr}
                      onChange={(e) => {
                        updateField(
                          `form.elements[${index}].properties.descriptionFr`,
                          e.target.value
                        );
                      }}
                    />
                  </div>
                </div>
              )}

              {element.type !== "textField" &&
                element.properties.choices &&
                element.properties.choices.length && (
                  <div>
                    {element.properties.choices.map((choice, choiceIndex) => (
                      <div
                        className="choice"
                        key={`choice-${choiceIndex}`}
                        id={`choice-${choiceIndex}`}
                      >
                        <div className="text-entry">
                          <div>
                            <span>{element.type}</span>
                            <span>Option {choiceIndex + 1}</span>
                            <input
                              type="text"
                              value={choice.en}
                              onChange={(e) => {
                                updateField(
                                  `form.elements[${index}].properties.choices[${choiceIndex}].en`,
                                  e.target.value
                                );
                              }}
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={choice.fr}
                              onChange={(e) => {
                                updateField(
                                  `form.elements[${index}].properties.choices[${choiceIndex}].fr`,
                                  e.target.value
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </SectionDiv>
      </div>
    </>
  );
};
