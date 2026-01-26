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

interface TestResult {
  feature: string;
  status: "pass" | "fail" | "pending" | "not-applicable";
  message: string;
}

const TEST_FILENAME = ".gcforms-test-write.txt";
const TEST_CONTENT = "GCForms File API Test - " + new Date().toISOString();

export const FileAPITestComponent = ({ locale }: { locale: string }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState<FileSystemDirectoryHandle | null>(
    null
  );

  const { t } = useTranslation("browser-check", { lang: locale });

  const updateResult = (feature: string, status: TestResult["status"], message: string) => {
    setResults((prev) => {
      const filtered = prev.filter((r) => r.feature !== feature);
      return [...filtered, { feature, status, message }];
    });
  };

  const runTests = useCallback(async () => {
    setIsRunning(true);
    setResults([]);

    const hasFileSystemAPI = !!window.showDirectoryPicker;
    updateResult(
      "File System Access API Available",
      hasFileSystemAPI ? "pass" : "fail",
      hasFileSystemAPI ? "File System Access API is available" : "Not available"
    );

    if (!hasFileSystemAPI) {
      setIsRunning(false);
      return;
    }

    let dirHandle: FileSystemDirectoryHandle | null = null;
    try {
      dirHandle = await window.showDirectoryPicker();
      if (dirHandle) {
        updateResult("Directory Picker", "pass", `Selected: ${dirHandle.name}`);
        setSelectedDirectory(dirHandle);
      }
    } catch (error) {
      const err = error as Error;
      updateResult(
        "Directory Picker",
        err.name === "AbortError" ? "not-applicable" : "fail",
        err.message
      );
      setIsRunning(false);
      return;
    }

    if (!dirHandle) {
      setIsRunning(false);
      return;
    }

    const hasReadwrite = await verifyPermission(dirHandle, "readwrite");
    updateResult(
      "ReadWrite Permission",
      hasReadwrite ? "pass" : "fail",
      hasReadwrite ? "You have readwrite permissions" : "No readwrite permission"
    );

    if (!hasReadwrite) {
      const hasRead = await verifyPermission(dirHandle, "read");
      updateResult(
        "Read-Only Permission",
        hasRead ? "pass" : "fail",
        hasRead ? "Read-only available" : "No permissions"
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
      updateResult("Create File", "pass", `Created: ${TEST_FILENAME}`);
    } catch (error) {
      const err = error as Error;
      updateResult("Create File", "fail", err.message);
      setIsRunning(false);
      return;
    }

    try {
      const writable = await testFileHandle.createWritable();
      await writable.write(TEST_CONTENT);
      await writable.close();
      updateResult("Write to File", "pass", `Wrote ${TEST_CONTENT.length} bytes`);
    } catch (error) {
      const err = error as DOMException;
      let message = err.message;
      if (err.name === "NoModificationAllowedError") message = "File is locked";
      else if (err.name === "QuotaExceededError") message = "Not enough storage";
      updateResult("Write to File", "fail", message);
      setIsRunning(false);
      return;
    }

    try {
      const file = await testFileHandle.getFile();
      const text = await file.text();
      updateResult(
        "Read from File",
        text === TEST_CONTENT ? "pass" : "fail",
        `Read ${text.length} bytes`
      );
    } catch (error) {
      const err = error as Error;
      updateResult("Read from File", "fail", err.message);
    }

    try {
      if (dirHandle) {
        await dirHandle.removeEntry(TEST_FILENAME);
      }
      updateResult("Clean Up", "pass", "Test file deleted");
    } catch (error) {
      const err = error as Error;
      updateResult("Clean Up", "fail", err.message);
    }

    setIsRunning(false);
  }, []);

  return (
    <div data-locale={locale}>
      <div className="mb-6">
        <div className="mb-6 font-semibold text-[#1B00C2]">{t("pilot", "browser-check")}</div>

        <h1 className="[&:after]:!content-none">{t("title", "browser-check")}</h1>
        <p className="mb-4 text-slate-700">
          {t(
            "description",
            "Test if your browser supports File API needed for bulk response downloads."
          )}
        </p>
        <ol className="mb-6 list-inside list-decimal space-y-1 text-slate-700">
          <li>{t("step1", "Select a folder")}</li>
          <li>{t("step2", 'Allow "This site to view and copy files"')}</li>
          <li>{t("step3", "Save changes to the folder")}</li>
        </ol>
        {!selectedDirectory && (
          <div className="mb-6">
            <Button onClick={runTests} disabled={isRunning} theme="secondary">
              {isRunning ? t("running", "Running...") : t("selectDirectory", "Select a folder")}
            </Button>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result) => (
            <TestResultItem key={result.feature} result={result} />
          ))}
          <TestSummary results={results} />

          {selectedDirectory && (
            <div className="mt-6">
              <Button onClick={runTests} disabled={isRunning} theme="secondary">
                {isRunning ? t("running", "Running...") : t("runTests", "Run test again")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TestResultItem = ({ result }: { result: TestResult }) => {
  const configs = {
    pass: {
      className: "border border-green-200 bg-green-50",
      badge: "✓",
      badgeClass: "text-green-600",
    },
    fail: {
      className: "border border-red-200 bg-red-50",
      badge: "✗",
      badgeClass: "text-red-600",
    },
    pending: {
      className: "border border-yellow-200 bg-yellow-50",
      badge: "⏳",
      badgeClass: "text-yellow-600",
    },
    "not-applicable": {
      className: "border border-slate-200 bg-slate-50",
      badge: "○",
      badgeClass: "text-slate-500",
    },
  };
  const config = configs[result.status];
  return (
    <div className={`rounded p-3 ${config.className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium">{result.feature}</p>
          <p className="mt-1 text-xs text-slate-600">{result.message}</p>
        </div>
        <span className={`ml-3 text-lg font-bold ${config.badgeClass}`}>{config.badge}</span>
      </div>
    </div>
  );
};

const TestSummary = ({ results }: { results: TestResult[] }) => {
  const { t } = useTranslation("browser-check");

  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const allPassed = failed === 0 && passed === results.length;

  return (
    <div
      className={`rounded border p-3 ${allPassed ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}`}
    >
      <p className="text-sm font-medium">
        {allPassed ? t("allPassed", "✓ All Passed") : `${t("failed", "✗ Failed")} - ${failed}`}
      </p>
      <p className="mt-1 text-xs text-slate-600">
        {passed}/{results.length} {t("testsPassedSummary", "tests passed")}
      </p>
    </div>
  );
};
