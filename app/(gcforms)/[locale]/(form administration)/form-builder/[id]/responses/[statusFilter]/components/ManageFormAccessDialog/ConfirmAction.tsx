import { Button } from "@clientComponents/globals";
import { CancelIcon } from "@serverComponents/icons";
import { useEffect, useRef, useState } from "react";

type ConfirmActionProps = {
  callback: () => Promise<boolean>;
  icon?: React.ReactElement;
  confirmString?: string;
  buttonLabel?: string;
  buttonTheme?: "primary" | "secondary" | "destructive" | "link";
  children?: JSX.Element | string;
};

export const ConfirmAction = ({
  callback,
  icon = <CancelIcon />,
  confirmString = "Are you sure?",
  buttonLabel = "Remove",
  buttonTheme = "destructive",
  children,
}: ConfirmActionProps) => {
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const handleOnClick = async () => {
    setError("");
    setConfirm(false);
    if (!(await callback())) {
      setError("There was an error");
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setConfirm(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="inline-block" ref={ref}>
      {error && <span className="px-2 text-red-700">{error}</span>}
      {!confirm && (
        <Button
          className="bg-none"
          {...(children ? { theme: "link" } : { icon: icon, theme: "icon" })}
          onClick={() => {
            setConfirm(true);
            setError("");
          }}
        >
          <>{children}</>
        </Button>
      )}
      {confirm && (
        <>
          <span>{confirmString}</span>
          <Button theme={buttonTheme} className="px-2 py-0" onClick={handleOnClick}>
            {buttonLabel}
          </Button>
        </>
      )}
    </div>
  );
};
