import { serverTranslation } from "@i18n";
import { authCheckAndThrow } from "@lib/actions";
import { Overdue } from "./Overdue";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { MoreMenu } from "../client/MoreMenu";

export const FormCard = async ({
  id,
  titleEn,
  titleFr,
  isPublished,
  overdue,
}: {
  id: string;
  titleEn: string;
  titleFr: string;
  isPublished: boolean;
  overdue: boolean;
}) => {
  const backgroundColor = isPublished ? "#95CCA2" : "#FEE39F";
  const borderColor = isPublished ? "#95CCA2" : "#FFD875";
  const {
    t,
    i18n: { language },
  } = await serverTranslation("admin-forms");
  const { ability } = await authCheckAndThrow();
  return (
    <li className="mb-4 max-w-2xl rounded-md border-2 border-black p-4" key={id} id={`form-${id}`}>
      <div className="flex flex-row items-start justify-between">
        <h2 className="mb-0 mr-2 overflow-hidden pb-0 text-base">
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
          className="block rounded px-2 py-1 "
          style={{
            backgroundColor: backgroundColor,
            border: `2px solid ${borderColor}`,
          }}
        >
          {isPublished ? t("published") : t("draft")}
        </span>
      </div>
      {overdue && <Overdue />}
      {/* linking to existing page for now */}
      <div className="mt-10 flex flex-row items-end justify-between">
        <div>
          <LinkButton.Secondary
            href={`/${language}/form-builder/${id}/settings/manage?backLink=${ability.user.id}`}
            className="mb-2 mr-3"
          >
            {t("manageOwnerships")}
          </LinkButton.Secondary>
          <LinkButton.Secondary
            href={`/${language}/form-builder/${id}/responses`}
            className="mb-2 mr-3"
          >
            {t("gotoResponses")}
          </LinkButton.Secondary>
        </div>
        <div>
          {ability?.can("update", "FormRecord") && <MoreMenu id={id} isPublished={isPublished} />}
        </div>
      </div>
    </li>
  );
};
