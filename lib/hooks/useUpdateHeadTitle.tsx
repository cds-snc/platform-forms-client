import { useEffect } from "react";

// Note: the <title>title</title> method would be preferred but this seems to get overridden by
// the Next.js generateMetadata() call
export const useUpdateHeadTitle = (title: string, condition = true) => {
  useEffect(() => {
    if (typeof document !== "undefined" && condition) {
      // Give the client update priority over the nextjs generateMetadata() call
      setTimeout(() => {
        document.title = title;
      }, 40);
    }
  }, [title, condition]);
};
