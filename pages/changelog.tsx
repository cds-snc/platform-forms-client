import React, { useEffect, useState } from "react";
import { RichText } from "@components/forms/RichText/RichText";
import axios from "axios";
import { logMessage } from "@lib/logger";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const Changelog = (): React.ReactElement => {
  const [version, setVersion] = useState<string>("unavailable");
  const [changelog, setChangelog] = useState<string>("unavailable");

  useEffect(() => {
    const updateContent = async () => {
      try {
        const serverResponse = await axios({
          url: "/api/version",
          method: "GET",
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        });
        setVersion(serverResponse.data.version);
        setChangelog(serverResponse.data.changeLog);
      } catch (err) {
        logMessage.error(err as Error);
      }
    };

    updateContent();
  }, []);

  return (
    <>
      <h2 className="gc-h2">Version: {version}</h2>
      <br />
      <RichText>{changelog}</RichText>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.locale) {
    return {
      props: { ...(await serverSideTranslations(context.locale, ["common"])) },
    };
  }

  return { props: {} };
};

export default Changelog;
