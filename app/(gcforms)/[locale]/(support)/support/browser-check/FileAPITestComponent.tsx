"use client";
import { useState, useCallback } from "react";
import { Button } from "@clientComponents/globals";
import { Label } from "@clientComponents/forms";
import { TextInput } from "../../components/client/TextInput";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { verifyPermission } from "@responses-pilot/lib/fileSystemHelpers";
import { isValidGovEmail } from "@lib/validation/validation";
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

declare global {
  interface Window {
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
  }
}

interface TestError {
  error: string;
  message: string;
}

interface ErrorStates {
  validationErrors: {
    fieldKey: string;
    fieldValue: string;
  }[];
  error?: string;
}

type TestResult = true | TestError;

const getBrowserInfo = () => {
  if (typeof window === "undefined") return null;

  const userAgent = navigator.userAgent;

  // Basic browser detection
  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor || "");
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor || "");
  const isEdge = /Edg/.test(userAgent);

  return {
    browser: isChrome
      ? "Chrome"
      : isFirefox
        ? "Firefox"
        : isSafari
          ? "Safari"
          : isEdge
            ? "Edge"
            : "Unknown",
    userAgent,
    hasFileSystemAccess: !!window.showDirectoryPicker,
  };
};

const TEST_FILENAME = ".gcforms-test-write.txt";
const TEST_CONTENT = "GCForms File API Test - " + new Date().toISOString();

export const FileAPITestComponent = ({ locale }: { locale: string }) => {
  const [fileSystemAPI, setFileSystemAPI] = useState<TestResult | null>(null);
  const [directoryPicker, setDirectoryPicker] = useState<TestResult | null>(null);
  const [readWritePermission, setReadWritePermission] = useState<TestResult | null>(null);
  const [readOnlyPermission, setReadOnlyPermission] = useState<TestResult | null>(null);
  const [createFile, setCreateFile] = useState<TestResult | null>(null);
  const [writeFile, setWriteFile] = useState<TestResult | null>(null);
  const [readFile, setReadFile] = useState<TestResult | null>(null);
  const [cleanUp, setCleanUp] = useState<TestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState<FileSystemDirectoryHandle | null>(
    null
  );

  const { t } = useTranslation("browser-check", { lang: locale });

  const runTests = useCallback(async () => {
    setIsRunning(true);
    // Reset all test results
    setFileSystemAPI(null);
    setDirectoryPicker(null);
    setReadWritePermission(null);
    setReadOnlyPermission(null);
    setCreateFile(null);
    setWriteFile(null);
    setReadFile(null);
    setCleanUp(null);

    const hasFileSystemAPI = !!window.showDirectoryPicker;
    setFileSystemAPI(
      hasFileSystemAPI
        ? true
        : {
            error: "Browser does not support File System Access API",
            message: "Not available",
          }
    );

    if (!hasFileSystemAPI) {
      setIsRunning(false);
      return;
    }

    let dirHandle: FileSystemDirectoryHandle | null = null;
    try {
      dirHandle = await window.showDirectoryPicker();
      if (dirHandle) {
        setDirectoryPicker(true);
        setSelectedDirectory(dirHandle);
      }
    } catch (error) {
      const err = error as Error;
      const isAborted = err.name === "AbortError";
      setDirectoryPicker({
        error: err.message,
        message: isAborted ? "Directory selection was cancelled" : "Failed to select directory",
      });
      setIsRunning(false);
      return;
    }

    if (!dirHandle) {
      setIsRunning(false);
      return;
    }

    const hasReadwrite = await verifyPermission(dirHandle, "readwrite");
    setReadWritePermission(
      hasReadwrite
        ? true
        : {
            error: "Insufficient permissions for file operations",
            message: "No readwrite permission",
          }
    );

    if (!hasReadwrite) {
      const hasRead = await verifyPermission(dirHandle, "read");
      setReadOnlyPermission(
        hasRead
          ? true
          : {
              error: "No read permissions available",
              message: "No permissions",
            }
      );
      setIsRunning(false);
      return;
    }

    let testFileHandle;
    if (!dirHandle) {
      setIsRunning(false);
      return;
    }
    try {
      testFileHandle = await dirHandle.getFileHandle(TEST_FILENAME, { create: true });
      setCreateFile(true);
    } catch (error) {
      const err = error as Error;
      setCreateFile({
        error: err.message,
        message: "Failed to create test file",
      });
      setIsRunning(false);
      return;
    }

    try {
      const writable = await testFileHandle.createWritable();
      await writable.write(TEST_CONTENT);
      await writable.close();
      setWriteFile(true);
    } catch (error) {
      const err = error as DOMException;
      let message = err.message;
      if (err.name === "NoModificationAllowedError") message = "File is locked";
      else if (err.name === "QuotaExceededError") message = "Not enough storage";
      setWriteFile({
        error: message,
        message: "Failed to write to file",
      });
      setIsRunning(false);
      return;
    }

    try {
      const file = await testFileHandle.getFile();
      const text = await file.text();
      const success = text === TEST_CONTENT;
      setReadFile(
        success
          ? true
          : {
              error: "File content mismatch",
              message: "Failed to read file correctly",
            }
      );
    } catch (error) {
      const err = error as Error;
      setReadFile({
        error: err.message,
        message: "Failed to read file",
      });
    }

    try {
      if (dirHandle) {
        await dirHandle.removeEntry(TEST_FILENAME);
      }
      setCleanUp(true);
    } catch (error) {
      const err = error as Error;
      setCleanUp({
        error: err.message,
        message: "Failed to clean up",
      });
    }

    setIsRunning(false);
  }, []);

  return (
    <div data-locale={locale}>
      <div className="mb-6">
        <div className="mb-6 font-semibold text-[#1B00C2]">{t("pilot")}</div>

        <h1 className="[&:after]:!content-none">{t("title")}</h1>
        <p className="mb-4 text-slate-700">{t("description")}</p>
        <ol className="mb-6 list-inside list-decimal space-y-1 text-slate-700">
          <li>{t("step1")}</li>
          <li>{t("step2")}</li>
          <li>{t("step3")}</li>
        </ol>
        {!selectedDirectory && (
          <div className="mb-6">
            <Button onClick={runTests} disabled={isRunning} theme="secondary">
              {isRunning ? t("running") : t("selectDirectory")}
            </Button>
          </div>
        )}
      </div>

      {(fileSystemAPI ||
        directoryPicker ||
        readWritePermission ||
        readOnlyPermission ||
        createFile ||
        writeFile ||
        readFile ||
        cleanUp) &&
        !isRunning && (
          <div>
            <div className="mb-6 border-t border-slate-200"></div>
            <OverallResult
              tests={[
                fileSystemAPI,
                directoryPicker,
                readWritePermission,
                readOnlyPermission,
                createFile,
                writeFile,
                readFile,
                cleanUp,
              ].filter((test): test is TestResult => test !== null)}
              testResults={{
                readWritePermission,
                readOnlyPermission,
                createFile,
                writeFile,
                readFile,
              }}
              locale={locale}
            />

            {(() => {
              // Check if the failure is due to user cancellation
              const allTests = [
                fileSystemAPI,
                directoryPicker,
                readWritePermission,
                readOnlyPermission,
                createFile,
                writeFile,
                readFile,
                cleanUp,
              ].filter((test): test is TestResult => test !== null);

              const failedTests = allTests.filter((test): test is TestError => test !== true);
              const isUserCancelled = failedTests.some(
                (test) => test.message === "Directory selection was cancelled"
              );

              return (
                isUserCancelled && (
                  <div className="mt-6">
                    <Button onClick={runTests} disabled={isRunning} theme="secondary">
                      {isRunning ? t("running") : t("runTests")}
                    </Button>
                  </div>
                )
              );
            })()}
          </div>
        )}
    </div>
  );
};

const OverallResult = ({
  tests,
  testResults,
  locale,
}: {
  tests: TestResult[];
  testResults: {
    readWritePermission: TestResult | null;
    readOnlyPermission: TestResult | null;
    createFile: TestResult | null;
    writeFile: TestResult | null;
    readFile: TestResult | null;
  };
  locale: string;
}) => {
  const { t } = useTranslation("browser-check", { lang: locale });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<ErrorStates>({ validationErrors: [] });

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

      setSubmitted(true);
    } catch (error) {
      setErrors({
        error: "Failed to send support request",
        validationErrors: [],
      });
    }

    setIsSubmitting(false);
  };

  const config = shouldShowSuccess
    ? {
        className: "border border-green-200 bg-green-50",
        badgeClass: "text-green-600",
        iconClass: "gcds-icon-checkmark-circle",
        title: t("success"),
        message: t("successMessage"),
      }
    : {
        className: "border border-red-200 bg-red-50",
        badgeClass: "text-red-600",
        iconClass: "gcds-icon-exclamation-circle",
        title: t("failed"),
        message: isUserCancelled ? t("testCancelled") : t("cannotDownload"),
      };

  if (submitted) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="gcds-icon gcds-icon-checkmark-circle text-green-600"></span>
          <h3 className="text-lg font-semibold text-green-600">{t("supportForm.successTitle")}</h3>
        </div>
        <p className="text-slate-700">{t("supportForm.successMessage")}</p>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`inline-flex items-center gap-1 rounded-2xl px-4 py-2 ${config.className} mb-6`}
      >
        <div
          className={`flex size-8 items-center justify-center ${allPassed ? "border-green-600" : "border-red-600"}`}
        >
          <span
            className={`gcds-icon ${config.iconClass} inline-block ${config.badgeClass}`}
          ></span>
        </div>
        <p className={`text-lg font-semibold ${config.badgeClass}`}>{config.title}</p>
      </div>
      <p className="text-left text-slate-700">{config.message}</p>

      {!shouldShowSuccess && !isUserCancelled && (
        <div className="mt-6">
          <h4 className="mb-2 font-semibold">{t("supportForm.title")}</h4>
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
              />
            </div>
            <Button type="submit" disabled={isSubmitting} theme="primary">
              {isSubmitting ? t("supportForm.submitting") : t("supportForm.submit")}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
