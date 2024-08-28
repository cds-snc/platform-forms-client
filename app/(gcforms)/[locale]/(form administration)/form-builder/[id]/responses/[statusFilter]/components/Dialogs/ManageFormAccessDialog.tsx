import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";
import { useCallback, useEffect, useRef, useState } from "react";

export const ManageFormAccessDialog = () => {
  const dialogRef = useDialogRef();

  // @TODO: maybe move the follwoing to Dialog ala useDialogRef()
  const documentRef = useRef<Document | null>(null);

  if (typeof window !== "undefined") {
    documentRef.current = window.document;
  }

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  function isCustomEvent(event: Event): event is CustomEvent {
    return "detail" in event;
  }

  const handleOpenDialog = useCallback((e: Event) => {
    if (isCustomEvent(e)) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    documentRef.current &&
      documentRef.current.addEventListener("open-form-access-dialog", handleOpenDialog);

    return () => {
      documentRef.current &&
        documentRef.current.removeEventListener("open-form-access-dialog", handleOpenDialog);
    };
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
