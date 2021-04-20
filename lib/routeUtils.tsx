import classnames from "classnames";
import { useRouter } from "next/router";
import { FormMetadataProperties, BrandProperties } from "./types";

export const getPageClassNames = (formMetadata: FormMetadataProperties) => {
  if (!formMetadata) return "";

  let pageNameUrl = getPageNameUrl();
  const brand: BrandProperties = formMetadata.brand;
  const classes = classnames(
    "outer-container",
    `page${pageNameUrl.replace(/\//g, "-")}`,
    brand.name
  );
  return classes;
};

export const getPageNameUrl = () => {
  const router = useRouter();
  let pageNameUrl = router && router.asPath ? router.asPath.split("?")[0] : "";
  if (pageNameUrl === "/") {
    pageNameUrl = "splash";
  }
  return pageNameUrl;
};
