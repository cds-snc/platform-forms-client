import { cn } from "@lib/utils";
import { AddElementButton } from "./elements/element-dialog/AddElementButton";
import { useHandleAdd } from "@lib/hooks/form-builder/useHandleAdd";
import { useTranslation } from "@i18n/client";
import { FormElementTypes } from "@lib/types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { SectionTitle } from "./SectionTitle";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";
import { ExitBadge } from "@formBuilder/components/shared/ExitBadge";
import { ExitButtonElement } from "@formBuilder/[id]/edit/components/ExitButtonElement";

const AddElement = () => {
  const { t } = useTranslation("form-builder");
  const { handleAddElement } = useHandleAdd();
  return (
    <AddElementButton
      handleAdd={(type?: FormElementTypes) => {
        handleAddElement(-1, type);
      }}
      text={t("addElement")}
    />
  );
};

const EmptySection = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="flex flex-col items-center">
      <h2>{t("groups.addElement.empty.title")}</h2>
      <p>{t("groups.addElement.empty.text1")}</p>
    </div>
  );
};

const AddElementEmpty = () => {
  return (
    <div className="mt-6 flex max-w-[800px] flex-col items-center">
      <div className="my-10 block h-1 w-full border-b-1 border-dashed border-slate-500"></div>
      <EmptySection />
      <div className="my-4">
        <AddElement />
      </div>
    </div>
  );
};

export const Section = ({ groupId }: { groupId: string }) => {
  const { groups } = useTemplateStore((s) => ({
    groups: s.form.groups,
  }));

  const { translationLanguagePriority, localizeField } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const localizedTitle = localizeField(
    LocalizedElementProperties.TITLE,
    translationLanguagePriority
  );

  const groupTitle = groups?.[groupId]?.[localizedTitle] || "";

  const localizedUrl = localizeField("exitUrl", translationLanguagePriority);

  const exitButtonUrl = groups?.[groupId]?.[localizedUrl] || "";

  if (groupId === "start" || groupId === "end" || groupId === "review") {
    return null;
  }

  if (!groups) return null;

  const noElements = !groups[groupId]?.elements || groups[groupId]?.elements.length === 0;

  const nextAction = groups[groupId]?.nextAction;

  return (
    <div
      className={cn(
        "flex max-w-[800px] flex-col rounded-t-lg border-x-1 border-t-1 border-slate-700 bg-white py-5 px-5",
        noElements ? "border-b-1 rounded-b-lg" : "last:border-b-1"
      )}
    >
      <>
        {nextAction === "exit" && (
          <div>
            <ExitBadge />
          </div>
        )}
        <SectionTitle groupTitle={groupTitle} groupId={groupId} />
        {nextAction === "exit" && (
          <ExitButtonElement
            key={`exit-url-${groupId}-${translationLanguagePriority}`}
            groupId={groupId}
            exitButtonUrl={exitButtonUrl}
          />
        )}
      </>
      {noElements ? (
        <AddElementEmpty />
      ) : (
        <div className="mt-10">
          <div className="relative m-4 flex items-center justify-center border-t-1 border-slate-700">
            <div className="absolute -bottom-5 left-1/2 z-10 -translate-x-1/2">
              <AddElement />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
