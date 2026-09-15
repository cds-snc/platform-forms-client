"use client";

import React, { useRef, useState } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals/Buttons";

interface SpeechInputProps {
  lang?: string;
  onTranscript: (transcript: string) => void;
}

type RecordingState = "idle" | "recording" | "processing" | "error";

const getSupportedMimeType = (): string | undefined => {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }

  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) =>
    MediaRecorder.isTypeSupported(type)
  );
};

export const SpeechInput = ({ lang, onTranscript }: SpeechInputProps): React.ReactElement => {
  const { t } = useTranslation("common", { lng: lang });
  const [state, setState] = useState<RecordingState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const handleRecording = async () => {
    if (state === "recording") {
      mediaRecorderRef.current?.stop();
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState("error");
      return;
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setState("error");
      return;
    }

    try {
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
      recorder.onstop = async () => {
        stopStream();
        setState("processing");

        try {
          const audio = new Blob(chunksRef.current, { type: mimeType });
          const formData = new FormData();
          formData.append("audio", audio, "speech.webm");
          formData.append("language", lang || "");

          const response = await fetch("/api/speech-to-text", {
            method: "POST",
            body: formData,
          });
          if (!response.ok) {
            throw new Error("Speech service failed");
          }

          const result = (await response.json()) as { text?: unknown };
          if (typeof result.text !== "string" || !result.text.trim()) {
            throw new Error("Speech service returned no text");
          }

          onTranscript(result.text.trim());
          setState("idle");
        } catch {
          setState("error");
        }
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
      : state === "processing"
        ? t("speechInput.processing")
        : t("speechInput.start");

  return (
    <div>
      <Button
        theme="secondary"
        onClick={handleRecording}
        disabled={state === "processing"}
        aria-pressed={state === "recording"}
      >
        {label}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "error" ? t("speechInput.error") : ""}
      </span>
    </div>
  );
};
