import classnames from "classnames";
import { useRouter } from "next/router";
import { FormConfigProperties } from "./types";

export const getPageClassNames = (formConfig: FormConfigProperties): string => {
  const pageNameUrl = getPageNameUrl();
  const brandName = formConfig && formConfig.brand ? formConfig.brand.name : "";
  const classes = classnames(
    "outer-container",
    `page${pageNameUrl.replace(/\//g, "-")}`,
    brandName
  );
  return classes;
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
