"use client";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Language } from "@lib/types/form-builder-types";

// This component is used to wait for the id to be set in the template store
// and then redirect to the path
export const WaitForId = ({ path, locale }: { locale: Language; path: string }) => {
  const { id } = useTemplateStore((s) => ({
    id: s.id,
  }));

  if (id) {
    // Redirect to the path
    // Not router push here ...
    // It causes set state issues elsewhere in the app
    window.location.href = `/${locale}/form-builder/${id}/${path}`;
  }

  // Show loading spinner while waiting for id
  return (
    <div className="flex w-1/2 items-center justify-center">
      <div className="mt-6 size-20 animate-spin rounded-full border-y-4 border-indigo-700"></div>
    </div>
  );
};
