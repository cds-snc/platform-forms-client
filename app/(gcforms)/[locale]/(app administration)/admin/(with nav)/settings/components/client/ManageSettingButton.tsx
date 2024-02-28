"use client";
import { Button } from "@clientComponents/globals";

export const ManageSettingButton = ({
  children,
  clearSelection,
}: {
  children: string;
  clearSelection: () => Promise<void>;
}) => {
  return (
    <Button type="reset" theme="secondary" onClick={() => clearSelection()}>
      {children}
    </Button>
  );
};
