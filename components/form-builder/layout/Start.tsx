import React, { useState } from "react";
import styled from "styled-components";
import { useTemplateStore } from "../store/useTemplateStore";
import { useTranslation } from "next-i18next";
import { DesignIcon, ExternalLinkIcon } from "../icons";
import { validateTemplate } from "../validate";
import { sortByLayout } from "../util";

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  .box {
    background-color: #ebebeb;
    border: 3px solid #000000;
    border-radius: 10px;
    height: 320px;
    width: 320px;
    margin: 0 1rem;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
    padding: 110px 20px 0 25px;
    text-align: left;

    &:first-child svg {
      transform: scale(1.33);
    }

    &:hover,
    &:focus {
      cursor: pointer;
      background-color: #d7d9db;

      h2 {
        text-decoration: underline;
      }
    }

    &:focus {
      outline: 3px solid #303fc3;
      outline-offset: 2px;
    }

    h2,
    p {
      margin: 0;
      margin-bottom: 5px;
      padding: 0;
    }

    svg {
      margin-bottom: 10px;
    }

    p {
      font-size: 16px;
    }
  }

  #file-upload {
    display: none;
  }
`;

export const Start = ({ changeTab }: { changeTab: (tab: string) => void }) => {
  const { t } = useTranslation("form-builder");

  const importTemplate = useTemplateStore((s) => s.importTemplate);
  const [errors, setErrors] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target || !e.target.files) {
      return;
    }
    try {
      const fileReader = new FileReader();

      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        if (!e.target || !e.target.result || typeof e.target.result !== "string") return;
        let data;

        try {
          data = JSON.parse(e.target.result);
        } catch (e) {
          if (e instanceof SyntaxError) {
            setErrors(t("startErrorParse"));
            return;
          }
        }

        if (!validateTemplate(data)) {
          setErrors(t("startErrorValidation"));
          return;
        }

        // ensure elements follow layout array order
        data.form.elements = sortByLayout(data.form);
        importTemplate(data);
        changeTab("preview");
      };
    } catch (e) {
      if (e instanceof Error) {
        setErrors(e.message);
      }
    }
  };

  /* eslint-disable */
  return (
    <>
      {errors && <div className="pt-2 pb-2 mt-4 mb-4 text-lg text-red-700">{errors}</div>}
      <StyledContainer>
        <button
          className="box"
          onClick={(e) => {
            e.preventDefault();
            changeTab("create");
          }}
        >
          <DesignIcon />
          <h2>{t("startH2")}</h2>
          <p>{t("startP1")}</p>
        </button>
        <label
          className="box"
          htmlFor="file-upload"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const uploadButton = document.getElementById("file-upload");
              if (uploadButton) uploadButton.click();
            }
          }}
          tabIndex={0}
        >
          <ExternalLinkIcon />
          <h2>{t("startH3")}</h2>
          <p>{t("startP2")}</p>
        </label>
        <input id="file-upload" type="file" onChange={handleChange} />
      </StyledContainer>
    </>
  );
};
