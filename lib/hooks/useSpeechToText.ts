import { logMessage } from "@lib/logger";
import { useEffect, useRef } from "react";

class SR {
  started = false;

  constructor({ continuous, lang, callback }) {
    this.sr = this.createSR();

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

    this.callback = callback;

    // Keeps recording ongoing until stop triggered
    this.sr.continuous = continuous === true ? true : false;

    this.sr.lang = lang || "en-US";

    // Gives more immediate results vs until when stopped
    this.sr.interimResults = false;

    this.sr.maxAlternatives = 1;

    this.behaviorSR();
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

  behaviorSR() {
    this.sr.onstart = function () {
      logMessage.info("SR started.");
    };

    this.sr.onspeechend = function () {
      this.stop();
    }.bind(this);

    this.sr.onresult = function (e) {
      // NOTE: Could add a confidence check so e.g. below 70% ask to try again
      // if (sr.results[0][0].confidence < .70) { do something }
      const result = e.results[0][0].transcript;
      this.callback(result);
    }.bind(this);

    this.sr.onnomatch = function () {
      logMessage.info("SR failed to confidently convert speech to text.");
    };
  }

  start() {
    if (this.started) {
      return;
    }
    this.started = true;
    this.sr.start(); // NOTE: async api if needed
  }

  stop() {
    if (!this.started) {
      return;
    }
    this.sr.stop();
    this.started = false;
    logMessage.info("SR finished.");
  }

  abort() {
    this.sr.abort();
  }
}

export const useSpeechToText = ({
  elRef,
}: // callback,
{
  elRef: React.MutableRefObject<null | HTMLInputElement | HTMLTextAreaElement>;
  // callback;
}) => {
  const sr = useRef(
    new SR({
      continuous: false,
      lang: "en-US",
      callback: (result) => {
        logMessage.info(result);
        const el = elRef?.current;
        el.value = el.value === "" ? result : el.value + " " + result;
      },
    })
  );

  useEffect(() => {
    const el = elRef?.current;
    if (!el) {
      return;
    }

    const focusListener = el.addEventListener("focus", (e) => {
      sr.current.start();
    });

    const clickListener = el.addEventListener("click", (e) => {
      sr.current.start();
    });

    const blurListener = el.addEventListener("blur", (e) => {
      sr.current.stop();
    });

    return () => {
      el.removeEventListener("focus", focusListener);
      el.removeEventListener("click", clickListener);
      el.removeEventListener("blur", blurListener);
    };
  }, [elRef]);
};
