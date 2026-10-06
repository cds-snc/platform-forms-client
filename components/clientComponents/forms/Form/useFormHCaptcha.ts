import { useHCaptcha } from "@gcforms/hcaptcha/client";

import { logMessage } from "@lib/logger";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { shouldCheckCaptcha } from "@lib/utils/shouldCheckCaptcha";

import type { CaptchaSubmitControls } from "./submitFormValues";

type UseFormHCaptchaOptions = {
  isPublished: boolean;
  language: string;
  setCaptchaFail?: React.Dispatch<React.SetStateAction<boolean>>;
  onCaptchaCancelled: () => void;
};

export type UseFormHCaptchaResult = {
  captcha: React.ReactNode;
  captchaEnabled: boolean;
  captchaControls: CaptchaSubmitControls;
};

export const useFormHCaptcha = ({
  isPublished,
  language,
  setCaptchaFail,
  onCaptchaCancelled,
}: UseFormHCaptchaOptions): UseFormHCaptchaResult => {
  const { hCaptchaEnabledSetting } = useGCFormsContext();

  const captchaRequired = shouldCheckCaptcha(isPublished, hCaptchaEnabledSetting);
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY?.trim() ?? "";
  // Avoid a hCaptcha browser error by checking for the required siteKey as well
  const captchaEnabled = captchaRequired && Boolean(siteKey);

  const { captcha, execute, reset } = useHCaptcha({
    enabled: captchaEnabled,
    language,
    logger: logMessage,
    onSuspiciousError: () => setCaptchaFail?.(true),
    siteKey,
  });

  return {
    captcha,
    captchaEnabled,
    captchaControls: {
      captchaEnabled,
      executeCaptcha: execute,
      resetCaptcha: reset,
      onCaptchaCancelled,
    },
  };
};
