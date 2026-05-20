"use client";

import { useActivePathname } from "@lib/hooks/form-builder/useActivePathname";
import { cn } from "@lib/utils";
import { Language } from "@lib/types/form-builder-types";
import { EditLockClient } from "@formBuilder/components/shared/edit-lock/EditLockClient";
import { RightPanel } from "@formBuilder/components/shared/right-panel/RightPanel";
import { FormBuilderContentShell } from "./FormBuilderContentShell";

export const FormBuilderWorkspace = ({
  id,
  lang,
  allowGroups,
  children,
}: {
  id: string;
  lang: Language;
  allowGroups: boolean;
  children: React.ReactNode;
}) => {
  const { activePathname } = useActivePathname();
  const isTranslatePage = activePathname.endsWith("/edit/translate");

  return (
    <div className={cn("relative flex w-full min-w-0", !isTranslatePage && "gap-7")}>
      <EditLockClient formId={id}>
        <FormBuilderContentShell>{children}</FormBuilderContentShell>
        {allowGroups && <RightPanel id={id} lang={lang} />}
      </EditLockClient>
    </div>
  );
};
