"use client";
import { useState } from "react";
import { useTranslation } from "@i18n/client";
import { StatusBadge } from "./StatusBadge";
import { SupportForm } from "./SupportForm";

interface TestError {
  error: string;
  message: string;
}

type TestResult = true | TestError;

interface OverallResultProps {
  tests: TestResult[];
  testResults: {
    readWritePermission: TestResult | null;
    readOnlyPermission: TestResult | null;
    createFile: TestResult | null;
    writeFile: TestResult | null;
    readFile: TestResult | null;
  };
  locale: string;
  userEmail?: string;
}

export const OverallResult = ({ tests, testResults, locale, userEmail }: OverallResultProps) => {
  const { t } = useTranslation("browser-check", { lang: locale });
  const [submitted, setSubmitted] = useState(false);

  const passed = tests.filter((test) => test === true).length;
  const failed = tests.filter((test) => test !== true).length;
  const allPassed = failed === 0 && passed === tests.length;

  // Check if all expected tests have completed for success
  // For success, we need: FileAPI + DirectoryPicker + ReadWrite + CreateFile + WriteFile + ReadFile + CleanUp = 7 tests
  const allTestsCompleted = tests.length >= 7;
  const shouldShowSuccess = allPassed && allTestsCompleted;

  // Check if the failure is due to user cancellation
  const failedTests = tests.filter((test): test is TestError => test !== true);
  const isUserCancelled = failedTests.some(
    (test) => test.message === "Directory selection was cancelled"
  );

  const handleSubmitSuccess = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4">
        <div className="mb-2 flex items-start gap-2">
          <span className="gcds-icon gcds-icon-checkmark-circle mt-0.5 text-green-600"></span>
          <h3 className="text-lg font-semibold text-green-600">{t("supportForm.successTitle")}</h3>
        </div>
        <p className="text-slate-700">{t("supportForm.successMessage")}</p>
      </div>
    );
  }

  return (
    <div>
      <StatusBadge
        isSuccess={shouldShowSuccess}
        title={shouldShowSuccess ? t("success") : t("failed")}
        message={
          shouldShowSuccess
            ? t("successMessage")
            : isUserCancelled
              ? t("testCancelled")
              : t("cannotDownload")
        }
      />
      <p className="text-left text-slate-700">
        {shouldShowSuccess
          ? t("successMessage")
          : isUserCancelled
            ? t("testCancelled")
            : t("cannotDownload")}
      </p>

      {!shouldShowSuccess && !isUserCancelled && (
        <SupportForm
          locale={locale}
          userEmail={userEmail}
          testResults={testResults}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
};
