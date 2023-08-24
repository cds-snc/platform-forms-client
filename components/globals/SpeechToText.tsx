import React, { useRef, useState } from "react";
import { logMessage } from "@lib/logger";
import { useTranslation } from "next-i18next";

// NOTE: this began as a Hook where you'd pass in a ref to bind to that added events to in on a use
// effect. But since a static button is being used to control the speech, a component probably
// makes the most sense.

// TODO: future refactor could allow children to be passed instead of a button

/**
 * continuous keeps recording until stopped, otherwise if false will end after a brief timeout
 * interimResults returns results as they are "parsed" vs waiting until the recording stopped
 */
class SR {
  constructor({ continuous, lang, callback }) {
    try {
      this.sr = this.createSR();
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

    this.sr.continuous = continuous === false ? false : true;
    this.sr.lang = lang || "en-US";
    this.sr.interimResults = true;
    this.sr.maxAlternatives = 1;
    this.callback = callback;

    this.addBehaviorSR();
  }

  createSR() {
    const SR =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition ||
      window.oSpeechRecognition;
    const sr = new SR();
    return sr;
  }

  addBehaviorSR() {
    // Handle case of speech going on for a while and eventually "timing out?"
    this.sr.onspeechend = function () {
      this.stop();
    }.bind(this);

    //
    // TODO PICK UP HERE. Now get the next results beyond [0][0]
    //
    this.sr.onresult = function (e) {
      // NOTE: Could add a confidence check so e.g. below 70% ask to try again
      // if (sr.results[0][0].confidence < .70) { do something }
      const result = e.results[0][0].transcript;
      this.callback(result);
    }.bind(this);

    this.sr.onnomatch = function () {
      // TODO error handling
      logMessage.info("SR failed to confidently convert speech to text.");
    };
  }

  start() {
    try {
      this.sr.start();
      logMessage.info("SR started.");
    } catch (e) {
      // probably already started
      logMessage.error(e);
    }
  }

  stop() {
    try {
      this.sr.stop();
      logMessage.info("SR stopped.");
    } catch (e) {
      // probably not started
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
}

export const SpeechToText = ({ callback }: SpeechToTextProps) => {
  const { t } = useTranslation("common");
  const [recording, setRecording] = useState(false);

  const sr = useRef(
    new SR({
      continuous: true,
      lang: "en-US", // TODO
      callback,
    })
  );

  // TODO hanlder for key down with space/button and double event fire
  const handleActivate = () => {
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
      <button className="absolute right-0" onClick={handleActivate} onKeyDown={handleActivate}>
        {recording ? t("Stop") : t("Start")}
      </button>
    </div>
  );
};
