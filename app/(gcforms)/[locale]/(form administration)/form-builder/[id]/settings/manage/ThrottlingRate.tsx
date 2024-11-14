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
import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import { useRehydrate } from "@lib/store/useTemplateStore";
import Skeleton from "react-loading-skeleton";
import { formClosingDateEst } from "@lib/utils/date/utcToEst";
import { logMessage } from "@lib/logger";

export const ThrottlingRate = ({ formId }: { formId: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("admin-settings");
  const hasHydrated = useRehydrate();
  const [loading, setLoading] = useState(false);

  const [weeks, setWeeks] = useState("");
  const [weeksDisabled, setWeeksDisabled] = useState(false);
  const [permanent, setPermanent] = useState(false);
  const [success, setSuccess] = useState("");

  const dateFormat: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const formatDate = (weeks: number, language: string) => {
    try {
      const weeksInSeconds = getWeeksInSeconds(weeks);
      const futureTimeInSeconds = Date.now() + weeksInSeconds;
      const dateInUTC = new Date(futureTimeInSeconds).toUTCString();
      const { month, day, year } = formClosingDateEst(dateInUTC, language, dateFormat);

      if (day && month && year) {
        return `${year}-${month}-${day}`;
      }

      throw new Error("Failed to parse out day, month or year.");
    } catch (error) {
      logMessage.info("Unable to parse throttling in weeks", weeks);
      return null;
    }
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
          {hasHydrated ? (
            <>
              <Input
                className="w-16 disabled:bg-gray-light disabled:!border-none"
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
            </>
          ) : (
            <Skeleton className="w-16" count={2} />
          )}
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
                  success: success === "weeks" ? formatDate(Number(weeks), language) : success,
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
        <div className="mb-4 flex">
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
            label={t("throttling.permanent")}
          />
          <Tooltip.Info side="top" triggerClassName="mb-4">
            {t("throttling.tooltip")}
          </Tooltip.Info>
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
