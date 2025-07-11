import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Announce } from "@gcforms/announce";

export const useAnnounce = () => {
  useEffect(() => {
    if (document.getElementById("gc-announce")) {
      // Announce component already mounted, skipping initialization
      return;
    }

    // Create a container div
    const announceContainer = document.createElement("div");
    announceContainer.id = "gc-announce";
    document.body.appendChild(announceContainer);

    // Render the Announce component
    const root = createRoot(announceContainer);
    root.render(<Announce />);

    // Cleanup on unmount
    return () => {
      root.unmount();
      document.body.removeChild(announceContainer);
    };
  }, []);
};
