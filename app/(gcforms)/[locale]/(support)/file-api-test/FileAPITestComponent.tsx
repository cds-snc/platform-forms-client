"use client";
import { useState, useCallback, useLayoutEffect } from "react";
import { Button, Alert } from "@clientComponents/globals";
import { DownloadIcon, UploadIcon } from "@serverComponents/icons";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { verifyPermission } from "@responses-pilot/lib/fileSystemHelpers";

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
    <div className="max-w-2xl" data-locale={locale}>
      <div className="mb-6">
        <h2 className="mb-3 text-xl font-bold">File System Access API Test</h2>
        <p className="mb-4 text-slate-700">
          Test if your browser supports File API needed for bulk response downloads.
        </p>
        {!selectedDirectory && (
          <div className="rounded bg-slate-100 p-4">
            <div className="flex items-start gap-4">
              <Button onClick={runTests} disabled={isRunning} theme="primary">
                {isRunning ? "Running..." : "Select a directory"}
              </Button>
              <p className="mt-2.5 text-sm text-slate-700">
                Click to select a directory for testing. You will be prompted to grant permissions.
              </p>
            </div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <BrowserInfo />
          <h3 className="font-bold">Results</h3>
          {results.map((result) => (
            <TestResultItem key={result.feature} result={result} />
          ))}
          <TestSummary results={results} />

          {selectedDirectory && (
            <div className="rounded bg-slate-100 p-4">
              <Button onClick={runTests} disabled={isRunning} theme="primary">
                {isRunning ? "Running..." : "Run Tests Again"}
              </Button>
            </div>
          )}
        </div>
      )}

      <AdditionalResources />
    </div>
  );
};

const TestResultItem = ({ result }: { result: TestResult }) => {
  const configs = {
    pass: {
      className: "border-l-4 border-green-600 bg-green-50",
      badge: "✓",
      badgeClass: "bg-green-600 text-white",
    },
    fail: {
      className: "border-l-4 border-red-600 bg-red-50",
      badge: "✗",
      badgeClass: "bg-red-600 text-white",
    },
    pending: {
      className: "border-l-4 border-yellow-600 bg-yellow-50",
      badge: "⏳",
      badgeClass: "bg-yellow-600 text-white",
    },
    "not-applicable": {
      className: "border-l-4 border-slate-400 bg-slate-50",
      badge: "○",
      badgeClass: "bg-slate-400 text-white",
    },
  };
  const config = configs[result.status];
  return (
    <div className={`rounded p-4 ${config.className}`}>
      <div className="flex justify-between">
        <div>
          <p className="font-bold">{result.feature}</p>
          <p className="mt-1 text-sm">{result.message}</p>
        </div>
        <span className={`rounded px-2 py-1 text-sm font-bold ${config.badgeClass}`}>
          {config.badge}
        </span>
      </div>
    </div>
  );
};

const TestSummary = ({ results }: { results: TestResult[] }) => {
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const allPassed = failed === 0 && passed === results.length;

  return (
    <Alert.Info className={allPassed ? "bg-green-50" : "bg-yellow-50"}>
      <Alert.Title headingTag="h3">{allPassed ? "✓ All Passed" : `✗ ${failed} Failed`}</Alert.Title>
      <p className="mt-2 text-sm">
        {passed}/{results.length} tests passed
      </p>
    </Alert.Info>
  );
};

const BrowserInfo = () => {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Alert.Info className="bg-blue-50">
        <Alert.Title headingTag="h3">Browser: Loading...</Alert.Title>
      </Alert.Info>
    );
  }

  // Detect browser
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isChrome = /Chrome/.test(userAgent) && !/Edge|Edg/.test(userAgent);
  const isEdge = /Edge|Edg/.test(userAgent);

  let browserName = "Unknown Browser";
  let settingsUrl = "";

  if (isChrome) {
    browserName = "Google Chrome";
    settingsUrl = "chrome://settings/content/filesystem";
  } else if (isEdge) {
    browserName = "Microsoft Edge";
    settingsUrl = "edge://settings/privacy/sitePermissions/allPermissions/fileEditing";
  }

  return (
    <Alert.Info className="bg-blue-50">
      <Alert.Title headingTag="h3">{`Browser: ${browserName}`}</Alert.Title>
      <p className="mt-2 text-sm">
        {settingsUrl ? (
          <>
            To manage File System Access permissions, visit your browser settings:{" "}
            <a
              href={settingsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-600 hover:underline"
            >
              {settingsUrl}
            </a>
          </>
        ) : (
          "Browser detection unavailable. Please check your browser documentation for File System Access settings."
        )}
      </p>
    </Alert.Info>
  );
};

const AdditionalResources = () => {
  const resources = [
    {
      title: "MDN Web Docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/File_System_API",
      description: "Comprehensive documentation on the File System API",
    },
    {
      title: "Web.dev Guide",
      url: "https://web.dev/file-system-access/",
      description: "Google's guide with practical examples and best practices",
    },
  ];

  const itResources = [
    {
      title: "Microsoft Edge - File System Read Ask For URLs",
      url: "https://learn.microsoft.com/en-us/deployedge/microsoft-edge-browser-policies/filesystemreadaskforurls",
      description:
        "Allow GC Forms to ask for read access to files. Configure in Group Policy under Administrative Templates > Microsoft Edge > Content settings.",
      icon: <DownloadIcon className="size-10" />,
    },
    {
      title: "Microsoft Edge - File System Write Ask For URLs",
      url: "https://learn.microsoft.com/en-us/deployedge/microsoft-edge-browser-policies/filesystemwriteaskforurls",
      description:
        "Allow GC Forms to ask for write access to files. Configure in Group Policy under Administrative Templates > Microsoft Edge > Content settings.",
      icon: <UploadIcon className="size-10" />,
    },
  ];

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="mb-4 text-lg font-bold">For IT Administrators</h3>
      <div className="grid gap-3">
        {itResources.map((resource) => (
          <div
            key={resource.title}
            className="grid grid-cols-[80px_1fr] gap-4 rounded border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100"
          >
            <div className="flex items-start justify-center text-blue-600">{resource.icon}</div>
            <div>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 hover:underline"
              >
                {resource.title}
              </a>
              <p className="mt-1 text-sm text-slate-600">{resource.description}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-4 mt-6 text-base font-bold">Additional Resources</h3>
      <div className="grid gap-3">
        {resources.map((resource) => (
          <div
            key={resource.title}
            className="rounded border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100"
          >
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-600 hover:underline"
            >
              {resource.title}
            </a>
            <p className="mt-1 text-sm text-slate-600">{resource.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
