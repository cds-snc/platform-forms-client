import { serverTranslation } from "@i18n";
import { getUnprocessedSubmissionsForTemplate, authCheck } from "../../actions";
import { OverdueStatus } from "./OverdueStatus";
import { LinkButton } from "@serverComponents/globals";
import { MoreMenu } from "../client/MoreMenu";

export const FormCard = async ({
  id,
  titleEn,
  titleFr,
  isPublished,
}: {
  id: string;
  titleEn: string;
  titleFr: string;
  isPublished: boolean;
}) => {
  const backgroundColor = isPublished ? "#95CCA2" : "#FEE39F";
  const borderColor = isPublished ? "#95CCA2" : "#FFD875";
  const {
    t,
    i18n: { language },
  } = await serverTranslation("admin-forms");
  const overdue = await getUnprocessedSubmissionsForTemplate(id);
  const ability = await authCheck();
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

      {overdue && <OverdueStatus level={overdue.level} />}
      {/* linking to existing page for now */}
      <div className="mt-10 flex flex-row items-end justify-between">
        <div>
          <LinkButton.Secondary
            href={`/${language}/form-builder/${id}/settings/manage?backLink=${ability.userID}`}
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
