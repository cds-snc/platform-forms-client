import { useEffect, useState } from "react";

export const useIsProduction = () => {
  const [state, setState] = useState<{ loading: boolean; isProduction: boolean }>({
    loading: true,
    isProduction: false,
  });

  useEffect(() => {
    const isProduction =
      window.location.origin.includes("forms-formulaires") &&
      window.location.origin.includes("canada.ca");

    setState({ loading: false, isProduction });
  }, []);
  return state;
};
