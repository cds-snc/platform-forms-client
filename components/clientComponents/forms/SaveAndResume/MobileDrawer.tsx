import Drawer from "react-bottom-drawer";
import { SaveProgressIcon, UploadIcon } from "@serverComponents/icons";
import { Button } from "@clientComponents/globals";

export const MobileDrawer = ({
  drawerOpen,
  setDrawerOpen,
}: {
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <Drawer isVisible={drawerOpen} onClose={() => setDrawerOpen(false)} className="">
      <h2>More</h2>
      <div className="flex flex-col gap-4">
        <Button
          theme="secondary"
          className="flex w-full items-center justify-center rounded-full border border-slate-900 bg-slate-100 py-4"
        >
          <>
            <SaveProgressIcon className="mr-4 size-8" />
            Save to device
          </>
        </Button>
        <Button
          theme="secondary"
          className="flex w-full items-center justify-center rounded-full border border-slate-900 bg-slate-100 py-4"
        >
          <>
            <UploadIcon className="mr-4 size-8" />
            Load answers
          </>
        </Button>
      </div>
      <p className="my-6 px-4">
        Protect your data by keeping the downloaded file in a safe place on a trusted device.
      </p>

      <div className="sticky bottom-0 border-gcds-blue-900 bg-gcds-blue-100 p-4">
        <Button
          theme="secondary"
          className="rounded-full bg-white"
          onClick={() => setDrawerOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </Drawer>
  );
};
