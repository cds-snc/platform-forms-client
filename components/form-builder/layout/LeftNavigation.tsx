import React from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";

const Navigation = styled.div`
  &.start .start,
  &.create .create,
  &.preview .preview,
  &.translate .translate,
  &.save .save {
    font-weight: 700;
  }
`;

const Tab = styled.a`
  text-decoration: underline;
  cursor: pointer;
  display: block;
`;

export const LeftNavigation = ({
  currentTab,
  handleClick,
}: {
  currentTab: string;
  handleClick: (tabName: string) => (evt: React.MouseEvent<HTMLElement>) => void;
}) => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="col-span-2">
      <Navigation className={currentTab}>
        <Tab className="start" href="#" onClick={handleClick("start")}>
          {t("start")}
        </Tab>
        <Tab className="create" href="#" onClick={handleClick("create")}>
          {t("design")}
        </Tab>
        <Tab className="preview" href="#" onClick={handleClick("preview")}>
          {t("preview")}
        </Tab>
        <Tab className="save" href="#" onClick={handleClick("save")}>
          {t("save")}
        </Tab>
      </Navigation>
    </div>
  );
};
