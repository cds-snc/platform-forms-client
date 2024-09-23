import { Button } from "@clientComponents/globals";
import { CancelIcon } from "@serverComponents/icons";
import { useState } from "react";

type DeleteConfirmProps = {
  callback: () => Promise<boolean>;
};

export const DeleteConfirm = ({ callback }: DeleteConfirmProps) => {
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
        <button
          onClick={() => {
            setConfirm(true);
            setError("");
          }}
        >
          <CancelIcon />
        </button>
      )}
      {confirm && (
        <>
          <span>Are you sure?</span>
          <Button theme="destructive" className="ml-2 px-2 py-0" onClick={handleOnClick}>
            Remove
          </Button>
        </>
      )}
    </>
  );
};
