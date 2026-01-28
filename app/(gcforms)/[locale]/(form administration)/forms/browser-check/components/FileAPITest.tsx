"use client";

import { useState, useCallback } from "react";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { verifyPermission } from "@responses-pilot/lib/fileSystemHelpers";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { OverallResult } from "./OverallResult";
import type { TestResult, TestError } from "../types";

declare global {
  interface Window {
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
  }
}

const TEST_FILENAME = ".gcforms-test-write.txt";
const TEST_CONTENT = "GCForms File API Test - " + new Date().toISOString();

export const FileAPITest = ({ locale, userEmail }: { locale: string; userEmail?: string }) => {
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

    // File System Access API availability
    const hasFileSystemAPI = !!window.showDirectoryPicker;
    setFileSystemAPI(hasFileSystemAPI ? true : { message: "Not available" });

    if (!hasFileSystemAPI) {
      setIsRunning(false);
      return;
    }

    // Directory Picker
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

    // Read/Write Permission
    const hasReadwrite = await verifyPermission(dirHandle, "readwrite");
    setReadWritePermission(hasReadwrite ? true : { message: "No readwrite permission" });

    if (!hasReadwrite) {
      const hasRead = await verifyPermission(dirHandle, "read");
      setReadOnlyPermission(hasRead ? true : { message: "No read permissions" });
      setIsRunning(false);
      return;
    }

    // Create, Write, Read, Clean Up Test File
    let testFileHandle;
    if (!dirHandle) {
      setIsRunning(false);
      return;
    }

    // Create file
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

    // Write to file
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

    // Read file
    try {
      const file = await testFileHandle.getFile();
      const text = await file.text();
      const success = text === TEST_CONTENT;
      setReadFile(success ? true : { message: "Failed to read file correctly" });
    } catch (error) {
      const err = error as Error;
      setReadFile({
        error: err.message,
        message: "Failed to read file",
      });
    }

    // Clean up - delete test file
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

  // Create array of all test results for reusability
  const allTests = [
    fileSystemAPI,
    directoryPicker,
    readWritePermission,
    readOnlyPermission,
    createFile,
    writeFile,
    readFile,
    cleanUp,
  ];

  // Filter to get only completed tests
  const completedTests = allTests.filter((test): test is TestResult => test !== null);

  // Check if user cancelled directory selection
  const failedTests = completedTests.filter((test): test is TestError => test !== true);
  const isUserCancelled = failedTests.some(
    (test) => test.message === "Directory selection was cancelled"
  );

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

        {/* Show select directory button if no directory selected yet */}
        {!selectedDirectory && (
          <div className="mb-6">
            <Button onClick={runTests} disabled={isRunning} theme="secondary">
              {isRunning ? t("running") : t("selectDirectory")}
            </Button>
          </div>
        )}
      </div>

      {allTests.some((test) => test !== null) && !isRunning && (
        <div>
          <div className="mb-6 border-t border-slate-200"></div>
          <OverallResult
            tests={completedTests}
            testResults={{
              readWritePermission,
              readOnlyPermission,
              createFile,
              writeFile,
              readFile,
            }}
            locale={locale}
            userEmail={userEmail}
          />

          {/* Show retry button if user cancelled directory selection */}
          {isUserCancelled && (
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
