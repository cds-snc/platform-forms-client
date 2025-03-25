import * as React from "react";

function useEscButton(callback: () => void, enabled = true) {
    const callbackOnEsc = (ev: KeyboardEvent) => {
        if (ev.key !== "Escape") { return; }

        callback();
    };

    React.useEffect(() => {
        if (!enabled) { return; }

        window.addEventListener("keydown", callbackOnEsc);

        return () => {
            window.removeEventListener("keydown", callbackOnEsc);
        };
    });
}

export default useEscButton;
