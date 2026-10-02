import type { Metadata } from "next";
import { BrowserSpeechDemo } from "@clientComponents/forms/SpeechInput/BrowserSpeechDemo";

export const metadata: Metadata = {
  title: "Browser speech transcription POC",
};

export default function BrowserSpeechPocPage() {
  return (
    <div className="my-10">
      <h1>Browser speech transcription</h1>
      <p className="mb-8 max-w-3xl">
        Record a short sample and transcribe it locally with a browser model. The recording stays on
        this device and is not sent to the speech service.
      </p>
      <BrowserSpeechDemo />
    </div>
  );
}
