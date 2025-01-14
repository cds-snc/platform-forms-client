import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { CancelIcon } from "@serverComponents/icons";
import { useEffect, useRef, useState, type JSX } from "react";

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
  icon = (
    <CancelIcon className="rounded-full border-1.5 border-transparent hover:border-blue-focus" />
  ),
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

  const handleOnBlur = () => {
    setConfirm(false);
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
        <button
          data-testid="actionButton"
          onClick={() => {
            setConfirm(true);
            setError("");
          }}
        >
          <>{children || icon}</>
        </button>
      )}
      {confirm && (
        <>
          {confirmString && <span className="pr-2">{confirmString}</span>}
          <Button
            dataTestId="confirm"
            theme={buttonTheme}
            className="px-2 py-0"
            onClick={handleOnClick}
            onBlur={handleOnBlur}
          >
            {buttonLabel}
          </Button>
        </>
      )}
    </div>
  );
};
