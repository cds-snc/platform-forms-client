"use client";
import { useState } from "react";
import { Button } from "@clientComponents/globals";
import { Label } from "@clientComponents/forms";
import { TextInput } from "../../../../(support)/components/client/TextInput";
import { isValidGovEmail } from "@lib/validation/validation";
import { getBrowserInfo } from "../utils/browserUtils";
import {
  email,
  minLength,
  object,
  safeParse,
  string,
  toLowerCase,
  trim,
  pipe,
  check,
} from "valibot";
import { useTranslation } from "@i18n/client";

interface ErrorStates {
  validationErrors: {
    fieldKey: string;
    fieldValue: string;
  }[];
  error?: string;
}

interface TestError {
  error: string;
  message: string;
}

type TestResult = true | TestError;

interface TestResults {
  readWritePermission: TestResult | null;
  readOnlyPermission: TestResult | null;
  createFile: TestResult | null;
  writeFile: TestResult | null;
  readFile: TestResult | null;
}

interface SupportFormProps {
  locale: string;
  userEmail?: string;
  testResults: TestResults;
  onSubmitSuccess: () => void;
}

export const SupportForm = ({
  locale,
  userEmail,
  testResults,
  onSubmitSuccess,
}: SupportFormProps) => {
  const { t } = useTranslation("browser-check", { lang: locale });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ErrorStates>({ validationErrors: [] });

  const getError = (fieldKey: string) => {
    return errors.validationErrors.find((e) => e.fieldKey === fieldKey)?.fieldValue || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const emailValue = formData.get("email") as string;

    const formEntries = {
      email: emailValue,
      browserData: JSON.stringify({
        ...getBrowserInfo(),
        testResults,
      }),
    };

    const EmailSchema = object({
      email: pipe(
        string(),
        toLowerCase(),
        trim(),
        minLength(1, t("input-validation.required", { ns: "common" })),
        email(t("input-validation.email", { ns: "common" })),
        check(
          (email) => isValidGovEmail(email),
          t("input-validation.validGovEmail", { ns: "common" })
        )
      ),
    });

    const validateForm = safeParse(EmailSchema, { email: emailValue }, { abortPipeEarly: true });

    if (!validateForm.success) {
      setErrors({
        validationErrors: validateForm.issues.map((issue) => ({
          fieldKey: issue.path?.[0].key as string,
          fieldValue: issue.message,
        })),
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Import the server action dynamically
      const { browserCompatibilitySupport } = await import("../actions");
      const submitFormData = new FormData();
      Object.entries(formEntries).forEach(([key, value]) => {
        submitFormData.append(key, value);
      });

      const result = await browserCompatibilitySupport(locale, errors, submitFormData);

      if (result.error) {
        setErrors({ ...result });
        setIsSubmitting(false);
        return;
      }

      onSubmitSuccess();
    } catch (error) {
      setErrors({
        error: "Failed to send support request",
        validationErrors: [],
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="mt-6">
      <h3 className="mb-2 font-semibold">{t("supportForm.title")}</h3>
      <p className="mb-4 text-sm">{t("supportForm.description")}</p>

      {errors.error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-red-700">{errors.error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="gcds-input-wrapper mb-4">
          <Label id="label-email" htmlFor="email" className="required" required>
            {t("supportForm.email")}
          </Label>
          <TextInput
            type="email"
            id="email"
            name="email"
            className="required w-full max-w-md"
            error={getError("email")}
            defaultValue={userEmail || ""}
          />
        </div>
        <Button type="submit" disabled={isSubmitting} theme="primary">
          {isSubmitting ? t("supportForm.submitting") : t("supportForm.submit")}
        </Button>
      </form>
    </div>
  );
};
