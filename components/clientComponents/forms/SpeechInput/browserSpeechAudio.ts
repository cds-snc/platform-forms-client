export const getSupportedMimeType = (): string | undefined => {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }

  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) =>
    MediaRecorder.isTypeSupported(type)
  );
};

export const isBrowserSpeechSupported = (): boolean => {
  if (
    typeof navigator === "undefined" ||
    typeof Worker === "undefined" ||
    typeof AudioContext === "undefined" ||
    typeof WebAssembly === "undefined" ||
    typeof navigator.mediaDevices?.getUserMedia !== "function"
  ) {
    return false;
  }

  return getSupportedMimeType() !== undefined;
};

export type AudioSignalMetrics = {
  rms: number;
  peak: number;
};

export const getAudioSignalMetrics = (audio: Float32Array): AudioSignalMetrics => {
  let sumOfSquares = 0;
  let peak = 0;

  for (const sample of audio) {
    sumOfSquares += sample * sample;
    peak = Math.max(peak, Math.abs(sample));
  }

  return {
    rms: audio.length > 0 ? Math.sqrt(sumOfSquares / audio.length) : 0,
    peak,
  };
};

export const decodeToMono16k = async (audioBlob: Blob): Promise<Float32Array> => {
  const audioContext = new AudioContext();

  try {
    const audioBuffer = await audioContext.decodeAudioData(await audioBlob.arrayBuffer());
    const monoSamples = new Float32Array(audioBuffer.length);

    for (let channelIndex = 0; channelIndex < audioBuffer.numberOfChannels; channelIndex += 1) {
      const channelSamples = audioBuffer.getChannelData(channelIndex);
      for (let sampleIndex = 0; sampleIndex < audioBuffer.length; sampleIndex += 1) {
        monoSamples[sampleIndex] += channelSamples[sampleIndex] / audioBuffer.numberOfChannels;
      }
    }

    if (audioBuffer.sampleRate === 16000) {
      return monoSamples;
    }

    const outputLength = Math.round((monoSamples.length * 16000) / audioBuffer.sampleRate);
    const resampledSamples = new Float32Array(outputLength);
    const sampleRateRatio = audioBuffer.sampleRate / 16000;

    for (let outputIndex = 0; outputIndex < outputLength; outputIndex += 1) {
      const inputPosition = outputIndex * sampleRateRatio;
      const lowerInputIndex = Math.floor(inputPosition);
      const upperInputIndex = Math.min(lowerInputIndex + 1, monoSamples.length - 1);
      const interpolation = inputPosition - lowerInputIndex;

      resampledSamples[outputIndex] =
        monoSamples[lowerInputIndex] * (1 - interpolation) +
        monoSamples[upperInputIndex] * interpolation;
    }

    return resampledSamples;
  } finally {
    await audioContext.close();
  }
};
