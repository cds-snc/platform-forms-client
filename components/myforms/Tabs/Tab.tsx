import React from "react";
import { useRouter } from "next/router";

export interface TabProps {
  children: React.ReactNode;
  id: string;
  tabpanelId: string;
  url: string;
  isActive: boolean;
  callback?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Tab = (props: TabProps): React.ReactElement => {
  const {
    children,
    id,
    tabpanelId,
    url,
    isActive,
    callback = () => {
      // Note: shallow=true avoids a getServerSideProps call on component update
      router.push(url, undefined, { shallow: true });
    },
  } = props;
  const router = useRouter();

  return (
    <button
      id={id}
      className={`gc-button-link ${isActive ? " no-underline hover:underline" : ""}`}
      role="tab"
      aria-selected={isActive ? "true" : "false"}
      aria-controls={tabpanelId}
      onClick={callback}
      {...(!isActive && { tabIndex: "-1" })}
    >
      {children}
    </button>
  );
};
