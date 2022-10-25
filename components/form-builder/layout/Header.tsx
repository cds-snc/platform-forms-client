import React from "react";
import LanguageToggle from "../../globals/LanguageToggle";
import LoginMenu from "../../auth/LoginMenu";
import { useSession } from "next-auth/react";
export const Header = () => {
  const { status } = useSession();
  return (
    <div className="grid grid-cols-12 gap-4 mt-10 mb-10 border-b-3 border-blue-dark">
      <div className="col-start-2 col-end-4">
        <h2>GC Forms</h2>
      </div>
      <div className="inline-flex col-start-10 col-end-12">
        {<LoginMenu isAuthenticated={status === "authenticated"} />}
        {<LanguageToggle />}
      </div>
    </div>
  );
};
