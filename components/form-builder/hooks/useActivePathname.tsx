import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export const useActivePathname = () => {
  const { asPath, isReady } = useRouter();
  const [activePathname, setActivePathname] = useState("");

  useEffect(() => {
    if (isReady) {
      let path = new URL(asPath, location.href).pathname;
      // TemplateId is always 25 characters long. If present, remove it from the activePathname.
      const end = path.substring(path.lastIndexOf("/") + 1);
      if (end.length === 25) {
        path = path.substring(0, path.lastIndexOf("/"));
      }

      setActivePathname(path);
    }
  }, [asPath, isReady, setActivePathname]);

  return { isReady, asPath, activePathname, currentPage: activePathname.split("/").pop() };
};
