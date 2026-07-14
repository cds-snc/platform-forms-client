type Translate = (key: string) => string;
import { Button } from "@clientComponents/globals";

export const EditPublished = ({ t }: { t: Translate }) => {
  return (
    <div className="mt-5 border-t border-slate-200 pt-4">
      <p className="mb-2 text-sm font-semibold text-slate-900">{t("publishViewEdit.title")}</p>
      <p className="mb-4 text-sm text-slate-600">{t("publishViewEdit.description")}</p>
      <Button
        theme="secondary"
        className="px-2 py-1 text-sm font-medium text-slate-700! no-underline"
      >
        {t("publishViewEdit.button")}
      </Button>
    </div>
  );
};
