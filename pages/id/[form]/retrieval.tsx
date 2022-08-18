import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import React from "react";
import { UserRole } from "@prisma/client";

const retrieval = (): React.ReactElement => {
  return (
    <>
      <h1 className="gc-h1">{"Sample form Responses Retrieval page"}</h1>
      <div data-testid="formID" className="mb-4">
        Sample Form responses retrieval page
      </div>
    </>
  );
};

export const getServerSideProps = requireAuthentication(async (context) => {
  const agreed = context?.user?.acceptableuse as boolean;
  if (!agreed) {
    return {
      redirect: {
        //redirect user to the acceptable use page
        destination: `/${context.locale}/auth/policy`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(context.locale && (await serverSideTranslations(context?.locale, ["common"]))),
    },
  };
}, UserRole.PROGRAM_ADMINISTRATOR);

export default retrieval;
