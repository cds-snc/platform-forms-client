import { useEffect } from "react";

// Update the document title in a React component client-side
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
