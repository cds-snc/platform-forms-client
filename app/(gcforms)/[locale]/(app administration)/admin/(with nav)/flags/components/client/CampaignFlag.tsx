"use client";
import { useState } from "react";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { saveCampaignText } from "../../actions";

export const CampaignFlag = ({
  enText,
  frText,
  enAlert,
  frAlert,
}: {
  enText: string;
  frText: string;
  enAlert: string;
  frAlert: string;
}) => {
  const { t } = useTranslation("admin-flags");
  const [englishCampaign, setEnglishCampaign] = useState(enText);
  const [frenchCampaign, setFrenchCampaign] = useState(frText);
  const [englishAlert, setEnglishAlert] = useState(enAlert);
  const [frenchAlert, setFrenchAlert] = useState(frAlert);

  const updateEnglishValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnglishCampaign(e.target.value);
  };

  const updateFrenchValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrenchCampaign(e.target.value);
  };

  const updateEnglishAlert = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnglishAlert(e.target.value);
  };

  const updateFrenchAlert = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrenchAlert(e.target.value);
  };

  const SaveCampaign = async () => {
    await saveCampaignText(englishAlert, frenchAlert, englishCampaign, frenchCampaign);
  };

  return (
    <div>
      <table className="table-auto border-4">
        <thead>
          <tr>
            <th className="border-2 p-2">{t("features.campaign.englishAlert")}</th>
            <th className="border-2 p-2">{t("features.campaign.frenchAlert")}</th>
            <th className="border-2 p-2">{t("features.campaign.englishCampaign")}</th>
            <th className="border-2 p-2">{t("features.campaign.frenchCampaign")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-2 p-2">
              <input
                id="campaignEnglishText"
                name="campaignEnglishText"
                type="text"
                onChange={updateEnglishAlert}
                value={englishAlert}
              />
            </td>
            <td className="border-2 p-2">
              <input
                id="campaignFrenchText"
                name="campaignFrenchText"
                type="text"
                onChange={updateFrenchAlert}
                value={frenchAlert}
              />
            </td>
            <td className="border-2 p-2">
              <input
                id="campaignEnglishText"
                name="campaignEnglishText"
                type="text"
                onChange={updateEnglishValue}
                value={englishCampaign}
              />
            </td>
            <td className="border-2 p-2">
              <input
                id="campaignFrenchText"
                name="campaignFrenchText"
                type="text"
                onChange={updateFrenchValue}
                value={frenchCampaign}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <Button type="submit" theme="primary" className="mr-4 mt-4" onClick={SaveCampaign}>
        {t("features.campaign.save")}
      </Button>
    </div>
  );
};
