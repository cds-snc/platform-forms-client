"use client";

import { useTranslation } from "@i18n/client";
import {
  buildTakeoverDiffRows,
  clearTakeoverDiffSnapshot,
  shouldRenderTakeoverDiffInline,
  TakeoverDiffSnapshot,
} from "@lib/utils/form-builder/takeoverDiff";
import { Button } from "@clientComponents/globals";

const lineNumberClassName =
  "w-12 shrink-0 border-r border-slate-200 px-3 py-1 text-right font-mono text-xs text-slate-500";
const markerClassName =
  "w-8 shrink-0 border-r border-slate-200 px-2 py-1 text-center font-mono text-xs font-semibold";
const codeCellClassName =
  "min-w-0 whitespace-pre-wrap break-words px-3 py-1 font-mono text-xs leading-5";

export const TakeoverDiffPanel = ({
  formId,
  snapshot,
  onDismiss,
}: {
  formId: string;
  snapshot: TakeoverDiffSnapshot;
  onDismiss: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  const rows = buildTakeoverDiffRows(snapshot);
  const canRenderInline = shouldRenderTakeoverDiffInline(snapshot);

  const dismiss = () => {
    clearTakeoverDiffSnapshot(formId);
    onDismiss();
  };

  return (
    <section className="mt-6 mb-6 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{t("editLock.diff.title")}</h2>
          <p className="mt-1 text-sm text-slate-700">{t("editLock.diff.description")}</p>
        </div>
        <Button
          theme="secondary"
          onClick={dismiss}
          className="self-start px-4 py-1.5 text-sm whitespace-nowrap"
        >
          {t("editLock.diff.dismiss")}
        </Button>
      </div>

      {canRenderInline && rows.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="grid min-w-[720px] grid-cols-[auto_auto_auto_minmax(0,1fr)] border-t border-slate-200 bg-slate-100 text-xs font-semibold tracking-wide text-slate-700 uppercase">
            <div className="border-r border-slate-200 px-3 py-2">
              {t("editLock.diff.beforeLine")}
            </div>
            <div className="border-r border-slate-200 px-3 py-2">
              {t("editLock.diff.afterLine")}
            </div>
            <div className="border-r border-slate-200 px-3 py-2">{t("editLock.diff.change")}</div>
            <div className="px-4 py-2">{t("editLock.diff.unified")}</div>
          </div>

          {rows.map((row, index) => {
            if (row.type === "skipped") {
              return (
                <div
                  key={`skipped-${index}`}
                  className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-center text-xs text-slate-600"
                >
                  {t("editLock.diff.skipped", { count: row.count })}
                </div>
              );
            }

            const tone =
              row.type === "remove"
                ? "bg-rose-50"
                : row.type === "add"
                  ? "bg-emerald-50"
                  : "bg-white";
            const marker = row.type === "remove" ? "-" : row.type === "add" ? "+" : " ";
            const markerTone =
              row.type === "remove"
                ? "text-rose-700"
                : row.type === "add"
                  ? "text-emerald-700"
                  : "text-slate-500";
            const text = row.type === "add" ? row.rightText : row.leftText;

            return (
              <div
                key={`${row.leftLineNumber ?? "n"}-${row.rightLineNumber ?? "n"}-${index}`}
                className={`grid min-w-[720px] grid-cols-[auto_auto_auto_minmax(0,1fr)] border-t border-slate-200 ${tone}`}
              >
                <div className={lineNumberClassName}>{row.leftLineNumber ?? ""}</div>
                <div className={lineNumberClassName}>{row.rightLineNumber ?? ""}</div>
                <div className={`${markerClassName} ${markerTone}`}>{marker}</div>
                <div className={codeCellClassName}>{text || " "}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-4 text-sm text-slate-700">{t("editLock.diff.tooLarge")}</div>
      )}
    </section>
  );
};
