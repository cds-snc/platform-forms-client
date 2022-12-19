import React, { useEffect, useState } from "react";
import { RichText } from "@components/forms";
import axios from "axios";
import { logMessage } from "@lib/logger";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";

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
      <Head>
        <title>Changelog</title>
      </Head>
      <h2>Version: {version}</h2>
      <br />
      <RichText>{changelog}</RichText>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: { ...(context.locale && (await serverSideTranslations(context.locale, ["common"]))) },
  };
};

export default Changelog;
