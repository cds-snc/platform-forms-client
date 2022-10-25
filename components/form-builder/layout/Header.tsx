import React from "react";
import LanguageToggle from "../../globals/LanguageToggle";
import LoginMenu from "../../auth/LoginMenu";
import { useSession } from "next-auth/react";
export const Header = () => {
  const { status } = useSession();
  return (
    <div className="border-b-3 border-blue-dark mt-10 mb-10">
      <div className="md:mx-8 lg:mx-16 xl:mx-32 xxl:mx-48 mx-64">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-end-1">
            <h2>GC Forms</h2>
          </div>
          <div className="inline-flex col-start-10 col-end-12">
            {<LoginMenu isAuthenticated={status === "authenticated"} />}
            {<LanguageToggle />}
          </div>
        </div>
      </div>
    </div>
  );
};
