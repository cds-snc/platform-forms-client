import { NextResponse } from "next/server";

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request) {
  const endpoint = process.env.SPEECH_TO_TEXT_URL;
  if (!endpoint) {
    return NextResponse.json({ error: "Speech input is not configured" }, { status: 503 });
  }

  const requestFormData = await request.formData();
  const audio = requestFormData.get("audio");
  if (!(audio instanceof File) || audio.size === 0 || audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "Invalid audio payload" }, { status: 400 });
  }

  const upstreamFormData = new FormData();
  upstreamFormData.append("audio", audio, audio.name || "speech.webm");
  const language = requestFormData.get("language");
  if (typeof language === "string" && language) {
    upstreamFormData.append("language", language);
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: upstreamFormData,
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Speech service unavailable" }, { status: 502 });
    }

    const result: unknown = await response.json();
    if (
      typeof result !== "object" ||
      result === null ||
      !("text" in result) ||
      typeof result.text !== "string"
    ) {
      return NextResponse.json({ error: "Invalid speech service response" }, { status: 502 });
    }

    return NextResponse.json({ text: result.text });
  } catch {
    return NextResponse.json({ error: "Speech service unavailable" }, { status: 502 });
  }
}
