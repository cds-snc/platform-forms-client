"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import { Alert, Button } from "@clientComponents/globals";
import {
  getThrottling,
  permanentThrottling,
  resetThrottling,
  scheduledThrottling,
} from "@lib/cache/throttlingCache";
import { Checkbox } from "@formBuilder/components/shared/MultipleChoice";
import { Input } from "@formBuilder/components/shared/Input";
import { toast, ToastContainer } from "@formBuilder/components/shared/Toast";
import { getSecondsInWeeks, getWeeksInSeconds } from "@lib/utils/date/dateConversions";
import { SubmitButton } from "@clientComponents/globals/Buttons/SubmitButton";

export const ThrottlingRate = ({ formId }: { formId: string }) => {
  const { t } = useTranslation("admin-settings");
  const [loading, setLoading] = useState(false);
  const [weeks, setWeeks] = useState("");
  const [weeksDisabled, setWeeksDisabled] = useState(false);
  const [permanent, setPermanent] = useState(false);
  const [success, setSuccess] = useState("");

  const formatDate = (weeks: number) => {
    const weeksInSeconds = getWeeksInSeconds(weeks);
    const futureTimeInSeconds = Date.now() + weeksInSeconds;
    const date = new Date(futureTimeInSeconds);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (permanent) {
        await permanentThrottling(formId);
        setSuccess("permanent");
        return;
      }

      if (weeks) {
        await scheduledThrottling(formId, Number(weeks));
        setSuccess("weeks");
        return;
      }

      // Reset throttling back to default
      await resetThrottling(formId);
      setSuccess("reset");
    } catch (error) {
      toast.error(t("throttling.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getThrottlingSetting = async () => {
      try {
        const { rate, expires } = await getThrottling(formId);
        if (rate && expires < 0) {
          setWeeksDisabled(true);
          setPermanent(true);
        }
        if (rate && expires > 0) {
          const secondsAsWeeks = getSecondsInWeeks(expires - Date.now());
          setWeeks(String(secondsAsWeeks));
        }
      } catch (error) {
        toast.error(t("throttling.error"));
      }
    };
    getThrottlingSetting();
  }, [formId, t]);

  return (
    <div className="mb-20">
      <form onSubmit={handleSubmit}>
        <h2>{t("throttling.title")}</h2>
        <p>
          <strong>{t("throttling.description")}</strong>
        </p>
        <div className="mb-2">
          <Input
            className={`w-16 ${weeksDisabled && "bg-slate-100"}`}
            id="throttling-weeks"
            name="throttling-weeks"
            value={weeks}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeeks(e.target.value)}
            {...{ disabled: weeksDisabled }}
            type="number"
            min="1"
            max="12"
          />
          <label className="ml-4" htmlFor="throttling-weeks">
            {t("throttling.weeks")}
          </label>
        </div>
        <div role="alert">
          {success && (success === "weeks" || success === "permanent") && (
            <Alert.Success
              focussable={true}
              title={t("throttling.succcessUpdate.title")}
              className="mb-2"
            >
              <p>
                {t("throttling.succcessUpdate.description", {
                  success: success === "weeks" ? formatDate(Number(weeks)) : success,
                })}
              </p>
            </Alert.Success>
          )}
          {success && success === "reset" && (
            <Alert.Success
              focussable={true}
              title={t("throttling.succcessReset.title")}
              className="mb-2"
            />
          )}
        </div>
        <div className="mb-4 flex align-middle">
          <Checkbox
            data-testid="required"
            id="throttling-permanent"
            name="throttling-permanent"
            checked={permanent}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setWeeks("");
              setWeeksDisabled(e.target.checked ? true : false);
              setPermanent(e.target.checked);
            }}
          ></Checkbox>
          <label htmlFor="throttling-permanent">{t("throttling.permanent")}</label>
        </div>
        <div className="flex">
          <SubmitButton dataTestId="increase-throttle" theme="secondary" loading={loading}>
            {t("throttling.updateRate")}
          </SubmitButton>
          <Button
            className="ml-4"
            dataTestId="reset-throttle"
            theme="link"
            type="submit"
            onClick={() => {
              setWeeks("");
              setPermanent(false);
              setWeeksDisabled(false);
            }}
          >
            {t("throttling.resetRate")}
          </Button>
        </div>
      </form>

      <div className="sticky top-0">
        <ToastContainer autoClose={false} containerId="throttling" />
      </div>
    </div>
  );
};
