import classnames from "classnames";
import { useRouter } from "next/router";
import { FormMetadataProperties } from "./types";

export const getPageClassNames = (
  formMetadata: FormMetadataProperties
): string => {
  const pageNameUrl = getPageNameUrl();
  const brandName =
    formMetadata && formMetadata.brand ? formMetadata.brand.name : "";
  const classes = classnames(
    "outer-container",
    `page${pageNameUrl.replace(/\//g, "-")}`,
    brandName
  );
  return classes;
};

export const getPageNameUrl = (): string => {
  const router = useRouter();
  let pageNameUrl =
    router && router.asPath ? router.asPath.split("?")[0] : "";
  if (pageNameUrl === "/") {
    pageNameUrl = "splash";
  }
  return pageNameUrl;
};

export const isSplashPage = (): boolean => {
  return getPageNameUrl() === "splash";
};
