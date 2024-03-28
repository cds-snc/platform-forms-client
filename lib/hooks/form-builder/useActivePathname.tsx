"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
export const cleanPath = (path = "") => {
  // remove id from path
  const idRegex = /\/[a-zA-Z0-9]{25}$/;

  const langRegex = /\/(en|fr)\//;
  path = path.replace(langRegex, "/");

  if (path && path.match(idRegex)) {
    return path.substring(0, path.lastIndexOf("/"));
  }
  return path;
};

export const useActivePathname = () => {
  const asPath = usePathname();
  const [activePathname, setActivePathname] = useState("");

  useEffect(() => {
    setActivePathname(cleanPath(asPath));
  }, [asPath, setActivePathname]);

  return { asPath, activePathname, currentPage: activePathname.split("/").pop() };
};
