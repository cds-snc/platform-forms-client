"use client";
import { useState, useCallback } from "react";
import { Button } from "@clientComponents/globals";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { verifyPermission } from "@responses-pilot/lib/fileSystemHelpers";

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

type TestResult = true | TestError;

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
              locale={locale}
            />

            {selectedDirectory && (
              <div className="mt-6">
                <Button onClick={runTests} disabled={isRunning} theme="secondary">
                  {isRunning ? t("running") : t("runTests")}
                </Button>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

const OverallResult = ({ tests, locale }: { tests: TestResult[]; locale: string }) => {
  const { t } = useTranslation("browser-check", { lang: locale });

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

  const config = shouldShowSuccess
    ? {
        className: "border border-green-200 bg-green-50",
        badge: "✓",
        badgeClass: "text-green-600",
        title: t("success"),
        message: t("successMessage"),
      }
    : {
        className: "border border-red-200 bg-red-50",
        badge: "✗",
        badgeClass: "text-red-600",
        title: t("failed"),
        message: isUserCancelled ? t("testCancelled") : t("cannotDownload"),
      };

  return (
    <div>
      <div
        className={`inline-flex items-center gap-3 rounded-2xl px-4 py-3 ${config.className} mb-6`}
      >
        <div
          className={`flex size-8 items-center justify-center rounded-full border-2 ${allPassed ? "border-green-600" : "border-red-600"}`}
        >
          <span className={`text-sm font-bold ${config.badgeClass}`}>{config.badge}</span>
        </div>
        <p className={`text-lg font-semibold ${config.badgeClass}`}>{config.title}</p>
      </div>
      <p className="text-left text-slate-700">{config.message}</p>
    </div>
  );
};
