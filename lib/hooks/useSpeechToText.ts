import { logMessage } from "@lib/logger";
import { useEffect, useRef } from "react";

const getSRInstance = () => {
  const SR =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition ||
    window.oSpeechRecognition;
  const sr = new SR();
  sr.continuous = false; // Set to true to keep going, but then will need a stop button or something
  sr.lang = "en-US";
  sr.interimResults = false;
  sr.maxAlternatives = 1;
  return sr;
};

export const useSpeechToText = ({
  elRef,
  callback,
}: {
  elRef: React.MutableRefObject<null | HTMLInputElement | HTMLTextAreaElement>;
  callback;
}) => {
  const sr = getSRInstance();
  const refAdded = useRef(false);
  let started = false;

  const start = () => {
    if (!started) {
      sr.start(); // NOTE: async api if needed
    }
  };

  sr.onstart = function () {
    started = true;
    logMessage.info("started converting speech to text");
  };

  sr.onspeechend = function () {
    sr.stop();
    started = false;
    logMessage.info("ended converting speech to text");
  };

  sr.onresult = function (e) {
    // NOTE: Could add a confidence check so e.g. below 70% ask to try again
    // if (sr.results[0][0].confidence < .70) { do something }
    const result = e.results[0][0].transcript;
    const el = elRef?.current;
    if (!el) {
      return;
    }
    if (callback) {
      callback(result);
    } else {
      el.value = el.value === "" ? result : " " + result;
    }
  };

  sr.onnomatch = function () {
    logMessage.info("I didn't get that could you try again and speek slower.");
  };

  useEffect(() => {
    const el = elRef?.current;
    if (!el) {
      return;
    }
    if (refAdded.current) {
      return;
    }
    refAdded.current = true;

    const focusListener = el.addEventListener("focus", (e) => {
      logMessage.info("hi");
      start();
    });

    const clickListener = el.addEventListener("click", (e) => {
      logMessage.info("hi click");
      start();
    });

    return () => {
      el.removeEventListener("focus", focusListener);
      el.removeEventListener("click", clickListener);
    };
  }, [elRef]);
};
