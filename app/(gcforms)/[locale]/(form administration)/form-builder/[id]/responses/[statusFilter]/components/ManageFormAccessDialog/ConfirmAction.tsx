import { Button } from "@clientComponents/globals";
import { CancelIcon } from "@serverComponents/icons";
import { useState } from "react";

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

  const handleOnClick = async () => {
    setError("");
    setConfirm(false);
    if (!(await callback())) {
      setError("There was an error");
    }
  };
  return (
    <>
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
          <Button theme={buttonTheme} className="ml-2 px-2 py-0" onClick={handleOnClick}>
            {buttonLabel}
          </Button>
        </>
      )}
    </>
  );
};
