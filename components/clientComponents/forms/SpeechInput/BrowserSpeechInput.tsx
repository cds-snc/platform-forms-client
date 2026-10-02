"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals/Buttons";
import {
  decodeToMono16k,
  getSupportedMimeType,
  isBrowserSpeechSupported,
} from "./browserSpeechAudio";

interface BrowserSpeechInputProps {
  lang?: string;
  onTranscript: (transcript: string) => void;
}

type RecordingState = "idle" | "recording" | "loading" | "processing" | "error" | "unsupported";

type WorkerResponse =
  | { type: "progress"; progress: number }
  | { type: "ready" }
  | { type: "result"; text: string }
  | { type: "error"; message: string };

const getModelLanguage = (lang?: string): "english" | "french" =>
  lang?.toLowerCase().startsWith("fr") ? "french" : "english";

export const BrowserSpeechInput = ({
  lang,
  onTranscript,
}: BrowserSpeechInputProps): React.ReactElement => {
  const { t } = useTranslation("common", { lng: lang });
  const [state, setState] = useState<RecordingState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const createWorker = () => {
    const worker = new Worker(new URL("./browserSpeech.worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;

      if (message.type === "progress") {
        setState("loading");
      } else if (message.type === "ready") {
        setState("processing");
      } else if (message.type === "result") {
        const transcript = message.text.trim();
        if (transcript) {
          onTranscriptRef.current(transcript);
          setState("idle");
        } else {
          setState("error");
        }
      } else {
        setState("error");
      }
    };

    worker.onerror = () => setState("error");
    return worker;
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const handleRecordedAudio = async (audioBlob: Blob, language: string) => {
    const worker = workerRef.current;
    if (!worker) {
      setState("error");
      return;
    }

    setState("processing");

    try {
      const audio = await decodeToMono16k(audioBlob);
      worker.postMessage({ type: "transcribe", audio, language }, [audio.buffer]);
    } catch {
      setState("error");
    }
  };

  const handleRecording = async () => {
    if (state === "recording") {
      mediaRecorderRef.current?.stop();
      return;
    }

    if (!isBrowserSpeechSupported()) {
      setState("unsupported");
      return;
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setState("error");
      return;
    }

    try {
      workerRef.current ??= createWorker();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onerror = () => {
        stopStream();
        setState("error");
      };
      recorder.onstop = () => {
        stopStream();
        const audio = new Blob(chunksRef.current, { type: mimeType });
        void handleRecordedAudio(audio, getModelLanguage(lang));
      };
      recorder.start();
      setState("recording");
    } catch {
      stopStream();
      setState("error");
    }
  };

  const label =
    state === "recording"
      ? t("speechInput.stop")
      : state === "loading" || state === "processing"
        ? t("speechInput.processing")
        : t("speechInput.start");
  const liveMessage = state === "error" ? t("speechInput.error") : "";

  if (state === "unsupported") {
    return (
      <p className="text-gray-text m-0 text-sm" role="status">
        {t("speechInput.unavailable")}
      </p>
    );
  }

  return (
    <div>
      <Button
        theme="secondary"
        onClick={handleRecording}
        disabled={state === "loading" || state === "processing"}
        aria-pressed={state === "recording"}
      >
        {label}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </span>
    </div>
  );
};
