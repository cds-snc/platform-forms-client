"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@clientComponents/globals/Buttons";
import { decodeToMono16k, getAudioSignalMetrics, getSupportedMimeType } from "./browserSpeechAudio";

const MODEL_ID = process.env.NEXT_PUBLIC_SPEECH_MODEL ?? "onnx-community/whisper-tiny";

type Language = "english" | "french";
type DemoState = "idle" | "recording" | "loading" | "transcribing" | "error";

type WorkerResponse =
  | { type: "progress"; progress: number; bytesLoaded: number; bytesTotal: number }
  | {
      type: "ready";
      modelLoadMs: number;
      modelBytesLoaded: number;
      modelBytesTotal: number;
      pipelineWasWarm: boolean;
      modelId: string;
    }
  | { type: "result"; text: string; durationMs: number; audioDurationMs: number }
  | { type: "error"; message: string };

type Measurements = {
  modelAssetBytes: number | null;
  modelLoadMs: number | null;
  pipelineWasWarm: boolean;
  inferenceMs: number | null;
  audioDurationMs: number | null;
  audioRms: number | null;
  audioPeak: number | null;
  observedHeapBytes: number | null;
};

type EnvironmentMetrics = {
  hardwareConcurrency: number | null;
  deviceMemoryGb: number | null;
  webGpuAvailable: boolean;
};

const getUsedHeapBytes = (): number | null => {
  const performanceWithMemory = performance as Performance & {
    memory?: { usedJSHeapSize: number };
  };

  return performanceWithMemory.memory?.usedJSHeapSize ?? null;
};

const formatBytes = (bytes: number | null): string => {
  if (bytes === null || bytes === 0) {
    return "Not available";
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDuration = (durationMs: number | null): string =>
  durationMs === null ? "Not available" : `${(durationMs / 1000).toFixed(1)} seconds`;

const formatSignal = (rms: number | null, peak: number | null): string =>
  rms === null || peak === null
    ? "Not available"
    : `${rms.toFixed(4)} RMS / ${peak.toFixed(4)} peak`;

const getEnvironmentMetrics = (): EnvironmentMetrics => {
  const navigatorWithMetrics = navigator as Navigator & {
    deviceMemory?: number;
    gpu?: unknown;
  };

  return {
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    deviceMemoryGb: navigatorWithMetrics.deviceMemory ?? null,
    webGpuAvailable: navigatorWithMetrics.gpu !== undefined,
  };
};

export const BrowserSpeechDemo = (): React.ReactElement => {
  const [language, setLanguage] = useState<Language>("english");
  const [state, setState] = useState<DemoState>("idle");
  const [progress, setProgress] = useState<number | null>(null);
  const [measurements, setMeasurements] = useState<Measurements | null>(null);
  const [environmentMetrics, setEnvironmentMetrics] = useState<EnvironmentMetrics | null>(null);
  const [transcript, setTranscript] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "The model loads on the first transcription and is cached by the browser."
  );
  const [errorMessage, setErrorMessage] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const memoryMonitorRef = useRef<number | null>(null);
  const memoryPeakRef = useRef<number | null>(null);
  const audioSignalRef = useRef<{ rms: number; peak: number } | null>(null);

  const startMemoryMonitoring = () => {
    memoryPeakRef.current = getUsedHeapBytes();
    memoryMonitorRef.current = window.setInterval(() => {
      const usedHeapBytes = getUsedHeapBytes();
      if (
        usedHeapBytes !== null &&
        (memoryPeakRef.current === null || usedHeapBytes > memoryPeakRef.current)
      ) {
        memoryPeakRef.current = usedHeapBytes;
      }
    }, 250);
  };

  const stopMemoryMonitoring = (): number | null => {
    if (memoryMonitorRef.current !== null) {
      window.clearInterval(memoryMonitorRef.current);
      memoryMonitorRef.current = null;
    }

    const usedHeapBytes = getUsedHeapBytes();
    if (
      usedHeapBytes !== null &&
      (memoryPeakRef.current === null || usedHeapBytes > memoryPeakRef.current)
    ) {
      memoryPeakRef.current = usedHeapBytes;
    }

    return memoryPeakRef.current;
  };

  useEffect(() => {
    const worker = new Worker(new URL("./browserSpeech.worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;

      if (message.type === "progress") {
        setState("loading");
        setProgress(message.progress);
        setStatusMessage("Loading the browser model...");
      } else if (message.type === "ready") {
        setProgress(100);
        setMeasurements((currentMeasurements) => ({
          modelAssetBytes: message.modelBytesTotal || currentMeasurements?.modelAssetBytes || null,
          modelLoadMs: message.modelLoadMs,
          pipelineWasWarm: message.pipelineWasWarm,
          inferenceMs: currentMeasurements?.inferenceMs ?? null,
          audioDurationMs: currentMeasurements?.audioDurationMs ?? null,
          audioRms: currentMeasurements?.audioRms ?? null,
          audioPeak: currentMeasurements?.audioPeak ?? null,
          observedHeapBytes: currentMeasurements?.observedHeapBytes ?? null,
        }));
        setState("transcribing");
        setStatusMessage("Transcribing locally...");
      } else if (message.type === "result") {
        const observedHeapBytes = stopMemoryMonitoring();
        setEnvironmentMetrics(getEnvironmentMetrics());
        setTranscript(message.text);
        setProgress(null);
        setMeasurements((currentMeasurements) => ({
          modelAssetBytes: currentMeasurements?.modelAssetBytes ?? null,
          modelLoadMs: currentMeasurements?.modelLoadMs ?? null,
          pipelineWasWarm: currentMeasurements?.pipelineWasWarm ?? false,
          inferenceMs: message.durationMs,
          audioDurationMs: message.audioDurationMs,
          audioRms: audioSignalRef.current?.rms ?? null,
          audioPeak: audioSignalRef.current?.peak ?? null,
          observedHeapBytes,
        }));
        audioSignalRef.current = null;
        setState("idle");
        setStatusMessage(
          `Transcribed locally in ${(message.durationMs / 1000).toFixed(1)} seconds. Audio was not uploaded.`
        );
      } else {
        stopMemoryMonitoring();
        setProgress(null);
        setState("error");
        setErrorMessage(message.message);
        setStatusMessage("The browser transcription test failed.");
      }
    };

    worker.onerror = () => {
      stopMemoryMonitoring();
      setProgress(null);
      setState("error");
      setErrorMessage("The browser worker could not start.");
      setStatusMessage("The browser transcription test failed.");
    };

    return () => {
      stopMemoryMonitoring();
      worker.terminate();
      workerRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleRecordedAudio = async (audioBlob: Blob, selectedLanguage: Language) => {
    const worker = workerRef.current;
    if (!worker) {
      setState("error");
      setErrorMessage("The browser worker is not available.");
      return;
    }

    setState("transcribing");
    setProgress(null);
    setErrorMessage("");
    setStatusMessage("Preparing audio for local transcription...");

    try {
      const audio = await decodeToMono16k(audioBlob);
      audioSignalRef.current = getAudioSignalMetrics(audio);
      startMemoryMonitoring();
      worker.postMessage({ type: "transcribe", audio, language: selectedLanguage }, [audio.buffer]);
    } catch {
      audioSignalRef.current = null;
      setState("error");
      setErrorMessage("The recording could not be decoded by this browser.");
      setStatusMessage("The browser transcription test failed.");
    }
  };

  const handleRecording = async () => {
    if (state === "recording") {
      mediaRecorderRef.current?.stop();
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState("error");
      setErrorMessage("This browser does not provide microphone access.");
      return;
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setState("error");
      setErrorMessage("This browser does not provide a supported recording format.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setTranscript("");
      setErrorMessage("");
      setStatusMessage("Recording from the microphone...");

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setState("error");
        setErrorMessage("The browser could not record audio.");
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        void handleRecordedAudio(audioBlob, language);
      };
      recorder.start();
      setState("recording");
    } catch {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setState("error");
      setErrorMessage("Microphone access was denied or unavailable.");
    }
  };

  const isBusy = state === "loading" || state === "transcribing";
  const buttonLabel = state === "recording" ? "Stop recording" : "Start recording";

  return (
    <section className="tablet:p-8 max-w-3xl border border-gray-300 bg-white p-6 shadow-sm">
      <div className="tablet:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] tablet:items-end mb-6 grid gap-5">
        <div>
          <label className="mb-2 block font-semibold" htmlFor="speech-poc-language">
            Spoken language
          </label>
          <select
            id="speech-poc-language"
            className="w-full border border-gray-500 bg-white px-3 py-2"
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
            disabled={state === "recording" || isBusy}
          >
            <option value="english">English</option>
            <option value="french">French</option>
          </select>
        </div>
        <p className="text-gray-text m-0 text-sm">
          WASM runtime, q8 quantization, and the multilingual {MODEL_ID} model. Keep the sample
          short while measuring this proof of concept.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          theme="primary"
          onClick={handleRecording}
          disabled={isBusy}
          aria-pressed={state === "recording"}
        >
          {buttonLabel}
        </Button>
        <span className="text-sm" role="status" aria-live="polite">
          {statusMessage}
        </span>
      </div>

      {state === "loading" && progress !== null && (
        <div className="mt-5">
          <progress className="h-2 w-full" max={100} value={progress}>
            {progress}%
          </progress>
          <p className="text-gray-text mt-2 text-sm">{Math.round(progress)}% loaded</p>
        </div>
      )}

      {errorMessage && (
        <p className="border-red mt-5 border-l-4 bg-red-50 p-3 text-red-800" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="mt-8">
        <label className="mb-2 block font-semibold" htmlFor="speech-poc-transcript">
          Local transcript
        </label>
        <textarea
          id="speech-poc-transcript"
          className="min-h-32 w-full resize-y border border-gray-500 bg-gray-50 p-3"
          value={transcript}
          readOnly
          placeholder="Your local transcript will appear here."
        />
      </div>

      {measurements && (
        <div className="mt-8 border-t border-gray-300 pt-6">
          <h2 className="mb-4 text-xl font-bold">Latest measurements</h2>
          <dl className="tablet:grid-cols-2 grid gap-4">
            <div>
              <dt className="text-gray-text text-sm">Model assets</dt>
              <dd className="m-0 font-semibold">{formatBytes(measurements.modelAssetBytes)}</dd>
            </div>
            <div>
              <dt className="text-gray-text text-sm">Model setup</dt>
              <dd className="m-0 font-semibold">
                {formatDuration(measurements.modelLoadMs)}
                {measurements.pipelineWasWarm ? " (warm pipeline)" : " (cold pipeline)"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-text text-sm">Inference</dt>
              <dd className="m-0 font-semibold">{formatDuration(measurements.inferenceMs)}</dd>
            </div>
            <div>
              <dt className="text-gray-text text-sm">Audio processed</dt>
              <dd className="m-0 font-semibold">{formatDuration(measurements.audioDurationMs)}</dd>
            </div>
            <div>
              <dt className="text-gray-text text-sm">Audio signal</dt>
              <dd className="m-0 font-semibold">
                {formatSignal(measurements.audioRms, measurements.audioPeak)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-text text-sm">Observed main-thread heap peak</dt>
              <dd className="m-0 font-semibold">{formatBytes(measurements.observedHeapBytes)}</dd>
            </div>
          </dl>
          {environmentMetrics && (
            <p className="text-gray-text mt-5 text-sm">
              Environment: {environmentMetrics.hardwareConcurrency ?? "unknown"} logical cores;{" "}
              {environmentMetrics.deviceMemoryGb
                ? `${environmentMetrics.deviceMemoryGb} GB reported device memory`
                : "device memory not reported"}
              ; WebGPU {environmentMetrics.webGpuAvailable ? "available" : "not available"}.
            </p>
          )}
          <p className="text-gray-text mt-3 text-sm">
            Heap usage is best effort and excludes worker/WASM memory. CPU and battery impact need
            manual comparison on representative devices because browsers do not expose reliable,
            portable readings for them.
          </p>
        </div>
      )}
    </section>
  );
};
