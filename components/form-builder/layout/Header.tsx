import React from "react";
import LanguageToggle from "../../globals/LanguageToggle";
import { DownloadFileButton } from "./DownloadFileButton";
import LoginMenu from "../../auth/LoginMenu";
import { useSession } from "next-auth/react";
import styled from "styled-components";
import useNavigationStore from "../store/useNavigationStore";
import { useAllowPublish } from "../hooks/useAllowPublish";
import useTemplateStore from "../store/useTemplateStore";

const StyledH2 = styled.h2`
  display: inline-block;
  margin-right: 40px;
`;

export const Header = () => {
  const { status } = useSession();
  const { form } = useTemplateStore();
  const { isSaveable } = useAllowPublish(form);
  const { currentTab } = useNavigationStore();
  return (
    <div className="border-b-3 border-blue-dark mt-10 mb-10">
      <div className="container--wet">
        <div className="flex" style={{ justifyContent: "space-between" }}>
          <div className="">
            <StyledH2>GC Forms</StyledH2>
            {currentTab !== "start" && isSaveable() && <DownloadFileButton />}
          </div>
          <div className="inline-flex">
            {<LoginMenu isAuthenticated={status === "authenticated"} />}
            {<LanguageToggle />}
          </div>
        </div>
      </div>
    </div>
  );
};
