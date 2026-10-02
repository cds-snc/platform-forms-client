import { pipeline, type ProgressInfo } from "@huggingface/transformers";

const MODEL_ID = process.env.NEXT_PUBLIC_SPEECH_MODEL ?? "onnx-community/whisper-tiny";

type WorkerRequest = {
  type: "transcribe";
  audio: Float32Array;
  language: string;
};

const postProgress = (info: ProgressInfo) => {
  if (info.status === "progress_total") {
    modelBytesLoaded = info.loaded;
    modelBytesTotal = info.total;
    self.postMessage({
      type: "progress",
      progress: info.progress,
      bytesLoaded: info.loaded,
      bytesTotal: info.total,
    });
  }
};

const createTranscriber = async () => {
  const startedAt = performance.now();
  const transcriber = await pipeline("automatic-speech-recognition", MODEL_ID, {
    device: "wasm",
    dtype: "q8",
    progress_callback: postProgress,
  });
  modelLoadMs = performance.now() - startedAt;
  return transcriber;
};

let transcriberPromise: ReturnType<typeof createTranscriber> | undefined;
let modelLoadMs: number | null = null;
let modelBytesLoaded = 0;
let modelBytesTotal = 0;

const getTranscriber = async () => {
  const pipelineWasWarm = transcriberPromise !== undefined;
  transcriberPromise ??= createTranscriber().catch((error: unknown) => {
    transcriberPromise = undefined;
    throw error;
  });

  return {
    pipeline: await transcriberPromise,
    pipelineWasWarm,
  };
};

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  if (event.data.type !== "transcribe") {
    return;
  }

  try {
    const { pipeline: transcriber, pipelineWasWarm } = await getTranscriber();
    self.postMessage({
      type: "ready",
      modelLoadMs: pipelineWasWarm ? 0 : (modelLoadMs ?? 0),
      modelBytesLoaded,
      modelBytesTotal,
      pipelineWasWarm,
      modelId: MODEL_ID,
    });
    const startedAt = performance.now();
    const output = await transcriber(event.data.audio, {
      language: event.data.language,
      task: "transcribe",
    });

    self.postMessage({
      type: "result",
      text: output.text.trim(),
      durationMs: performance.now() - startedAt,
      audioDurationMs: (event.data.audio.length / 16000) * 1000,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown browser inference error";
    self.postMessage({ type: "error", message });
  }
};
