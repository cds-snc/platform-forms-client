import { serverTranslation } from "@i18n";
import { authCheckAndRedirect } from "@lib/actions";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { getMetrics } from "./actions";

export default async function Page() {
  const { t } = await serverTranslation("admin-metrics");

  const { ability } = await authCheckAndRedirect();
  const metrics = await getMetrics();

  checkPrivilegesAsBoolean(ability, [{ action: "update", subject: "FormRecord" }], {
    redirect: true,
  });
  return (
    <>
      <h1>{t("metrics.title")}</h1>

      <div>
        <div className="flex flex-row mt-8">
          <label>{t("data.formCount")}</label>
          <div className="ml-6">{metrics.formCount}</div>
        </div>
      </div>
    </>
  );
}
