import React, { useRef, useState } from "react";
import { logMessage } from "@lib/logger";
import { useTranslation } from "next-i18next";
import { MicrophoneIcon } from "@components/form-builder/icons";

// NOTE: this began as a Hook where you'd pass in a ref to bind to. Then it added events to use in a
// useEffect. But since a static button is being used to control the speech -vs- enabled on any
// form input, a component probably makes the most sense.

interface SRProps {
  continuous?: boolean; // True keeps recording until stopped. False will end after a brief timeout.
  lang?: string;
  callback: (result: string) => void;
}

// TODO: add types https://www.npmjs.com/package/@types/dom-speech-recognition

// Singleton avoids creating more than one ScreenRecognition object.
const createSR = () => {
  // Note: other APIs exist but all supporting browser are using Webkits version so these are
  // redundant and removed: mozSpeechRecognition, msSpeechRecognition, oSpeechRecognition
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const sr = new SR();
  return sr;
};
let sr = null;
const getSR = () => {
  if (sr) {
    return sr;
  }
  sr = createSR();
  return sr;
};

class SR {
  constructor({ continuous, lang, callback }: SRProps) {
    try {
      this.sr = getSR();
    } catch (e) {
      // TODO error handling
      logMessage.error("SR failed to create");
    }

    if (!this.sr) {
      // TODO error handling
      logMessage.error("SR failed to create");
      return;
    }

    if (!callback || typeof callback !== "function") {
      // TODO error handling
      logMessage.error("SR requires a callback");
      return;
    }

    // API Docs: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
    this.sr.continuous = continuous === false ? false : true;
    this.sr.lang = lang || "en-US";
    this.sr.interimResults = true;
    this.sr.maxAlternatives = 1;
    this.callback = callback;

    this.addBehaviorSR();
  }

  addBehaviorSR() {
    this.sr.onstart = function () {
      logMessage.info("SR started.");
    };

    this.sr.onspeechend = function () {
      logMessage.info("SR stopped.");
    }.bind(this);

    this.sr.onresult = function (e) {
      // NOTE: Could add a confidence check so e.g. below 70% ask to try again
      // if (sr.results[0][0].confidence < .70) { do something }

      let result = "";

      // NOTE: Could work with interim results to show quicker results
      // e.g. if (e.results[i].isFinal) { .. } else { *here* }
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          result += e.results[i][0].transcript;
        }
      }

      this.callback(result);

      logMessage.info("SR result=" + result);
    }.bind(this);

    this.sr.onnomatch = function () {
      // TODO error handling
      logMessage.info("SR failed to confidently convert speech to text.");
    };
  }

  start() {
    try {
      this.sr.start();
    } catch (e) {
      // Error: probably already started
      logMessage.error(e);
    }
  }

  stop() {
    try {
      this.sr.stop();
    } catch (e) {
      // Error: probably not started
      logMessage.error(e);
    }
  }

  abort() {
    try {
      this.sr.abort();
      logMessage.info("SR aborted.");
    } catch (e) {
      logMessage.error(e);
    }
  }
}

interface SpeechToTextProps {
  callback: (result: string) => void;
  lang?: string;
}

// TODO: future refactor component to allow children to be passed instead of a button
/**
 * Example use:
 *   <SpeechToText lang={lang}
 *     callback={(result) => {
 *       if (ref && ref.current) { ref.current.value += result; }
 *     }}
 *   />
 */
export const SpeechToText = ({ callback, lang }: SpeechToTextProps) => {
  const { t, i18n } = useTranslation("common");
  const [recording, setRecording] = useState(false);

  const sr = useRef(
    new SR({
      continuous: true,
      lang: lang || i18n.language || "en-US",
      callback,
    })
  );

  const handleActivate = () => {
    if (!sr) {
      return;
    }

    if (recording) {
      sr.current.stop();
      setRecording(false);
      return;
    }

    sr.current.start();
    setRecording(true);
  };

  return (
    <div data-test-id="speech-to-text-button" className="relative">
      <button
        className={`absolute right-0`}
        onClick={handleActivate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleActivate();
            e.preventDefault();
          }
        }}
      >
        <MicrophoneIcon
          title={recording ? t("Stop") : t("Start")}
          className={`rounded-full ${recording ? "bg-red-500" : "bg-gray"}`}
        />
      </button>
    </div>
  );
};
