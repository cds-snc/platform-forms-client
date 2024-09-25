import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { CancelIcon } from "@serverComponents/icons";
import { useEffect, useRef, useState } from "react";

type ConfirmActionProps = {
  callback: () => Promise<boolean>;
  icon?: React.ReactElement;
  confirmString: string;
  buttonLabel: string;
  buttonTheme?: "primary" | "secondary" | "destructive" | "link";
  children?: JSX.Element | string;
};

export const ConfirmAction = ({
  callback,
  icon = <CancelIcon />,
  confirmString,
  buttonLabel,
  buttonTheme = "destructive",
  children,
}: ConfirmActionProps) => {
  const { t } = useTranslation("manage-form-access");
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const handleOnClick = async () => {
    setError("");
    setConfirm(false);
    if (!(await callback())) {
      setError(t("confirmError"));
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
          dataTestId="button"
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
          <Button
            dataTestId="confirm"
            theme={buttonTheme}
            className="px-2 py-0"
            onClick={handleOnClick}
          >
            {buttonLabel}
          </Button>
        </>
      )}
    </div>
  );
};
