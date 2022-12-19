import classnames from "classnames";
import { useRouter } from "next/router";
import { PublicFormRecord } from "@lib/types";

export const getPageClassNames = (formRecord: PublicFormRecord): string => {
  const pageNameUrl = getPageNameUrl();
  const brandName = formRecord?.form?.brand ? formRecord.form.brand.name : "";
  return classnames("outer-container", `page${pageNameUrl.replace(/\//g, "-")}`, brandName);
};

export const getPageNameUrl = (): string => {
  const router = useRouter();
  let pageNameUrl = router && router.asPath ? router.asPath.split("?")[0] : "";
  if (pageNameUrl === "/") {
    pageNameUrl = "splash";
  }
  return pageNameUrl;
};

export const isSplashPage = (): boolean => {
  return getPageNameUrl() === "splash";
};
