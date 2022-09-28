import React from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";
import { DesignIcon, ExternalLinkIcon } from "../icons";

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

    &:hover {
      background-color: #d7d9db;

      h2 {
        text-decoration: underline;
      }
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
`;

export const Start = ({ createForm }: { createForm: (tab: string) => void }) => {
  const { t } = useTranslation("form-builder");

  return (
    <>
      <h1>{t("start")}</h1>
      <StyledContainer>
        <button
          className="box"
          onClick={(e) => {
            e.preventDefault();
            createForm("create");
          }}
        >
          <DesignIcon />
          <h2>Design a form</h2>
          <p>Create a new form from scratch</p>
        </button>
        <div className="box">
          <ExternalLinkIcon />
          <h2>Open a form file</h2>
          <p>Revisit and edit an existing form file you saved from your last session</p>
        </div>
      </StyledContainer>
    </>
  );
};
