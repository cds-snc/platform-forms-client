import { serverTranslation } from "@i18n";
import { checkAll, checkCampaign } from "@lib/cache/flags";
import { UserAbility } from "@lib/types";
import { Flag } from "../client/Flag";
import { CampaignFlag } from "../client/CampaignFlag";

export const FlagList = async ({ ability }: { ability: UserAbility }) => {
  const { t } = await serverTranslation("admin-flags");
  const flags = await checkAll(ability);
  const campaign = await checkCampaign();

  return (
    <>
      <table className="table-auto border-4">
        <thead>
          <tr>
            <th className="border-2 p-2">{t("featureTitle")}</th>
            <th className="border-2 p-2">{t("featureStatus")}</th>
            <th className="border-2 p-2">{t("featureSwitch")}</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(flags).map(([key, value]) => (
            <Flag key={key} flagKey={key} value={value} />
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <CampaignFlag
          enAlert={campaign.enAlert}
          frAlert={campaign.frAlert}
          enText={campaign.en}
          frText={campaign.fr}
        />
      </div>
    </>
  );
};
