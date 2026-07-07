"use client";
import { useState, useEffect } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { logMessage } from "@lib/logger";
import { Button } from "@clientComponents/globals/Buttons/Button";

export const CaptchaDebugPanel = ({
  hCaptchaRef,
  captchaTokenRef,
  doHCaptchaFlow,
  hasFatalErrorRef,
  onErrorCallback,
  resetToken,
  hCaptchaDebugEnabled,
}: {
  hCaptchaRef: React.RefObject<HCaptcha | null>;
  captchaTokenRef: React.RefObject<string> | undefined;
  doHCaptchaFlow: boolean;
  hasFatalErrorRef: React.RefObject<boolean>;
  onErrorCallback: (code: string) => void;
  resetToken: () => void;
  hCaptchaDebugEnabled: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [stateSnapshot, setStateSnapshot] = useState({
    hasFatalError: false,
    hasRef: false,
    hasToken: false,
  });

  // Poll related refs to get updates
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setStateSnapshot({
          hasFatalError: hasFatalErrorRef.current,
          hasRef: !!hCaptchaRef.current,
          hasToken: !!captchaTokenRef?.current,
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isOpen, hasFatalErrorRef, hCaptchaRef, captchaTokenRef]);

  // Only show if enabled (app setting) and NEVER in production (or all forms will see button)
  if (!hCaptchaDebugEnabled || process.env.NEXT_PUBLIC_APP_ENV === "production") {
    return null;
  }

  const handleSimulateError = (errorCode: string) => {
    logMessage.info(`[Debug] Simulating hCaptcha error: ${errorCode}`);
    onErrorCallback(errorCode);
  };

  const handleClearToken = () => {
    logMessage.info("[Debug] Clearing captcha token");
    if (captchaTokenRef) {
      (captchaTokenRef as React.MutableRefObject<string>).current = "";
    }
    resetToken();
  };

  const handleInvalidateToken = () => {
    logMessage.info("[Debug] Setting invalid token");
    if (captchaTokenRef) {
      (captchaTokenRef as React.MutableRefObject<string>).current = "invalid-debug-token-12345";
    }
  };

  const handleClearRef = () => {
    logMessage.info("[Debug] Clearing hCaptcha ref (will restore on next render)");
    if (hCaptchaRef) {
      (hCaptchaRef as React.MutableRefObject<HCaptcha | null>).current = null;
    }
  };

  return (
    <div
      data-testid="captcha-debug-panel"
      className={`fixed right-2 bottom-2 z-99999 max-h-[500px] min-h-12 w-[300px] rounded-lg border-3 border-indigo-500 bg-white p-3 font-sans shadow-lg ${isOpen ? "overflow-auto" : "overflow-hidden"}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="my-0! py-0! text-sm! font-bold">hCaptcha Debug</h3>
        <Button theme="secondary" onClick={() => setIsOpen(!isOpen)} className="p-2! text-xs!">
          {isOpen ? "-" : "+"}
        </Button>
      </div>

      {isOpen && (
        <>
          <h4 className="my-0! py-0! text-sm! font-bold">How to use?</h4>
          <ol className="mb-2 ml-4 p-2 text-xs">
            <li className="mb-2">Trigger an error by clicking one of the buttons below</li>
            <li className="mb-2">Submit the form to see how the error is handled</li>
          </ol>

          <h4 className="my-0! py-0! text-sm! font-bold">Current State:</h4>
          <ul className="mb-2 list-none rounded bg-gray-100 p-2 text-xs">
            <li>doHCaptchaFlow: {String(doHCaptchaFlow)}</li>
            <li>hasFatalError: {String(stateSnapshot.hasFatalError)}</li>
            <li>hasRef: {String(stateSnapshot.hasRef)}</li>
            <li>token: {stateSnapshot.hasToken ? "Set" : "Empty"}</li>
          </ul>

          <h4 className="my-0! py-0! text-sm! font-bold">Simulate Error Codes:</h4>
          <ul className="mb-2 list-none p-2 text-xs">
            <li className="mb-2">
              <Button
                theme="destructive"
                onClick={() => handleSimulateError("network-error")}
                className="p-2! text-xs!"
              >
                network-error
              </Button>
            </li>
            <li className="mb-2">
              <Button
                theme="destructive"
                onClick={() => handleSimulateError("invalid-sitekey")}
                className="p-2! text-xs!"
              >
                invalid-sitekey
              </Button>
            </li>
            <li className="mb-2">
              <Button
                theme="destructive"
                onClick={() => handleSimulateError("missing-sitekey")}
                className="p-2! text-xs!"
              >
                missing-sitekey
              </Button>
            </li>
            <li className="mb-2">
              <Button
                theme="destructive"
                onClick={() => handleSimulateError("invalid-data")}
                className="p-2! text-xs!"
              >
                invalid-data
              </Button>
            </li>
            <li className="mb-2">
              <Button
                theme="destructive"
                onClick={() => handleSimulateError("invalid-input-response")}
                className="p-2! text-xs!"
              >
                invalid-input-response
              </Button>
            </li>
            <li className="mb-2">
              <Button
                theme="destructive"
                onClick={() => handleSimulateError("challenge-closed")}
                className="p-2! text-xs!"
              >
                challenge-closed
              </Button>
            </li>
          </ul>

          <h4 className="my-0! py-0! text-sm! font-bold">Test Error Scenarios:</h4>
          <ul className="mb-2 list-none p-2 text-xs">
            <li className="mb-2">
              <Button theme="destructive" onClick={handleClearRef} className="p-2! text-xs!">
                Clear hCaptcha Ref
              </Button>
            </li>
          </ul>

          <h4 className="my-0! py-0! text-sm! font-bold">Token Manipulation:</h4>
          <ul className="mb-2 list-none p-2 text-xs">
            <li className="mb-2">
              <Button theme="destructive" onClick={handleClearToken} className="p-2! text-xs!">
                Clear Token
              </Button>
            </li>
            <li className="mb-2">
              <Button theme="destructive" onClick={handleInvalidateToken} className="p-2! text-xs!">
                Set Invalid Token
              </Button>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};
