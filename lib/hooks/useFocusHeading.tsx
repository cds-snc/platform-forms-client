import { useEffect } from "react";
import { focusHeading } from "../client/clientHelpers";

// Util to focus a React heading element on load or "page" update
export const useFocusHeading = (headingRef: React.MutableRefObject<HTMLHeadingElement | null>) => {
    useEffect(() => {
        if (!headingRef || !headingRef.current) {
            return;
        } 
        focusHeading(headingRef.current);
    }, [headingRef]);
}
