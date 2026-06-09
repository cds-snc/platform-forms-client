import { serverTranslation } from "@i18n";
import { authCheckAndThrow } from "@lib/actions";
import { Overdue } from "./Overdue";
import { themes } from "@serverComponents/globals/Buttons/LinkButton";
import { cn } from "@lib/utils";
import { MoreMenu } from "../client/MoreMenu";

export const FormCard = async ({
  id,
  titleEn,
  titleFr,
  isPublished,
  overdue,
  accountId,
}: {
  id: string;
  titleEn: string;
  titleFr: string;
  isPublished: boolean;
  overdue: boolean;
  accountId: string;
}) => {
  const backgroundColor = isPublished ? "#95CCA2" : "#FEE39F";
  const borderColor = isPublished ? "#95CCA2" : "#FFD875";
  const {
    t,
    i18n: { language },
  } = await serverTranslation("admin-forms");
  const { ability } = await authCheckAndThrow();

  const formTitle = language === "en" ? titleEn : titleFr;
  return (
    <li
      className="relative z-40 mb-4 max-w-2xl rounded-md border-2 border-black p-4"
      key={id}
      id={`form-${id}`}
    >
      <div className="flex flex-row items-start justify-between">
        <h2 className="mr-2 mb-0 overflow-hidden pb-0 text-base">
          {language === "en" ? (
            <>
              {titleEn} / <span lang="fr">{titleFr}</span>
            </>
          ) : (
            <>
              {titleFr} / <span lang="en">{titleEn}</span>
            </>
          )}
        </h2>

        <span
          className="block rounded px-2 py-1"
          style={{
            backgroundColor: backgroundColor,
            border: `2px solid ${borderColor}`,
          }}
        >
          {isPublished ? t("published") : t("draft")}
        </span>
      </div>

      <div className="text-xs">
        <p className="ml-4 italic">{id}</p>
      </div>

      {overdue && <Overdue />}
      <div className="mt-10 flex flex-row items-end justify-between">
        <div>
          <a
            href={`/${language}/admin/accounts/${accountId}/manage-forms?manageOwnership=${id}`}
            className={cn(
              "text-black-default visited:text-black-default active:text-black-default no-underline",
              themes.secondary,
              themes.base,
              "mr-3 mb-2"
            )}
          >
            {t("manageOwnerships")}
          </a>
        </div>
        <div>
          {ability?.can("update", "FormRecord") && (
            <MoreMenu formTitle={formTitle} id={id} isPublished={isPublished} />
          )}
        </div>
      </div>
    </li>
  );
};
