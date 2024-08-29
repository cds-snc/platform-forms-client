import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";
import { useEvent } from "@lib/hooks/useEvent";
import { useEffect, useState } from "react";

export const ManageFormAccessDialog = () => {
  const dialogRef = useDialogRef();
  const { Event } = useEvent();

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    Event.on("open-form-access-dialog", handleOpenDialog);

    return () => {
      Event.on("open-form-access-dialog", handleOpenDialog);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleOpenDialog]);

  const dialogActions = (
    <div className="flex flex-row gap-4">
      <Button theme="secondary">Cancel</Button>
      <Button theme="primary">Next</Button>
    </div>
  );

  return (
    <>
      {isOpen && (
        <Dialog
          dialogRef={dialogRef}
          handleClose={handleClose}
          title={"Manage form access"}
          actions={dialogActions}
        >
          <div className="p-4">
            <section>
              <label htmlFor="emailSearch">Add people to share access</label>
              <p>
                They must already have an account - <a href="">Invite to create an account</a>
              </p>
              <input id="emailSearch" type="text" className="gc-input-text" />
            </section>

            <section className="mt-4">
              <h3>People with access</h3>
              <div className="border-1 border-black p-4">
                <div className="flex flex-row py-2">
                  <div className="grow">dave.samojlenko@cds-snc.ca</div>
                  <div className="">Owner</div>
                </div>
                <div className="flex flex-row py-2">
                  <div className="grow">tim.arney@cds-snc.ca</div>
                  <div>
                    <button>X</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </Dialog>
      )}
    </>
  );
};
