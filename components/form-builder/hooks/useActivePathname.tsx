import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export const cleanPath = (path = "") => {
  // remove id from path
  const idRegex = /\/[a-zA-Z0-9]{25}$/;
  if (path && path.match(idRegex)) {
    return path.substring(0, path.lastIndexOf("/"));
  }
  return path;
};

export const useActivePathname = () => {
  const { asPath, isReady } = useRouter();
  const [activePathname, setActivePathname] = useState("");

  useEffect(() => {
    if (isReady) {
      setActivePathname(cleanPath(asPath));
    }
  }, [asPath, isReady, setActivePathname]);

  return { isReady, asPath, activePathname, currentPage: activePathname.split("/").pop() };
};
