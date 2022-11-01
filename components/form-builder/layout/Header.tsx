import React from "react";
import LanguageToggle from "../../globals/LanguageToggle";
import { DownloadFileButton } from "./DownloadFileButton";
import LoginMenu from "../../auth/LoginMenu";
import { useSession } from "next-auth/react";
import styled from "styled-components";
import { useNavigationStore } from "../store/useNavigationStore";
import { useAllowPublish } from "../hooks/useAllowPublish";

const StyledH2 = styled.h2`
  display: inline-block;
  margin-right: 40px;
`;

export const Header = () => {
  const { status } = useSession();
  const { isSaveable } = useAllowPublish();
  const currentTab = useNavigationStore((s) => s.currentTab);
  const setTab = useNavigationStore((s) => s.setTab);

  const handleClick = (tab: string) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      setTab(tab);
    };
  };

  return (
    <div className="border-b-3 border-blue-dark mt-10 mb-10">
      <div className="container--wet">
        <div className="flex" style={{ justifyContent: "space-between" }}>
          <div className="">
            <StyledH2>
              <button onClick={handleClick("start")}>GC Forms</button>
            </StyledH2>
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
