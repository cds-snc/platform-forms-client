import { Button } from "@clientComponents/globals";
import { CancelIcon } from "@serverComponents/icons";
import { useState } from "react";

type DeleteConfirmProps = {
  callback: () => void;
};

export const DeleteConfirm = ({ callback }: DeleteConfirmProps) => {
  const [confirm, setConfirm] = useState(false);
  const handleOnClick = () => {
    setConfirm(false);
    callback();
  };
  return (
    <>
      {!confirm && (
        <button onClick={() => setConfirm(true)}>
          <CancelIcon />
        </button>
      )}
      {confirm && (
        <>
          <span>Are you sure?</span>
          <Button theme="destructive" className="px-2 py-0 ml-2" onClick={handleOnClick}>
            Remove
          </Button>
        </>
      )}
    </>
  );
};
