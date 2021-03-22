import React, { useEffect, useState } from "react";
import { RichText } from "../components/forms/RichText/RichText";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

const Terms = () => {
  const [content, setContent] = useState(null);
  const router = useRouter();

  // Load the markdown file based on the locale
  useEffect(() => {
    import(`../public/static/content/${router.locale}/terms.md`).then((module) =>
      setContent(module.default)
    );
  }, [content]);

  return (
    <>
      <RichText>{content}</RichText>
    </>
  );
};

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});
export default Terms;
