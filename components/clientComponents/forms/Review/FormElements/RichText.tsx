import Markdown from "markdown-to-jsx";
import { removeMarkdown } from "@formBuilder/components/shared/right-panel/treeview/util/itemType";
import { Language } from "@lib/types/form-builder-types";
import { FormItem } from "../helpers";
import { getLocalizedProperty } from "@lib/utils";

export const RichText = ({
  formItem,
  language,
  stripMarkdown = false,
}: {
  formItem: FormItem | undefined;
  language: Language;
  stripMarkdown?: boolean;
}): React.ReactElement => {
  const text = formItem?.element?.properties?.[
    getLocalizedProperty("description", language)
  ] as string;

  if (!text) {
    return <></>;
  }

  return (
    <div className="mb-8 mb-2">
      {stripMarkdown ? (
        <div className="font-bold">{removeMarkdown(text)}</div>
      ) : (
        <Markdown options={{ forceBlock: true }}>{text}</Markdown>
      )}
    </div>
  );
};
