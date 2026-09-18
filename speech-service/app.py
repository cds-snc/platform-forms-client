import asyncio
import io
import os
from contextlib import asynccontextmanager
from dataclasses import dataclass

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from faster_whisper import WhisperModel
from huggingface_hub import snapshot_download


SUPPORTED_AUDIO_TYPES = {
    "audio/mp4",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
    "audio/x-wav",
}
SUPPORTED_LANGUAGES = {"en", "fr"}


@dataclass(frozen=True)
class Settings:
    model: str = os.getenv("WHISPER_MODEL", "Systran/faster-whisper-small")
    model_revision: str | None = os.getenv("WHISPER_MODEL_REVISION")
    device: str = os.getenv("WHISPER_DEVICE", "cpu")
    compute_type: str = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
    max_audio_bytes: int = int(os.getenv("MAX_AUDIO_BYTES", str(25 * 1024 * 1024)))
    max_transcription_seconds: float = float(os.getenv("MAX_TRANSCRIPTION_SECONDS", "120"))


settings = Settings()


def load_model() -> WhisperModel:
    model_source = settings.model
    if settings.model_revision:
        model_source = snapshot_download(repo_id=settings.model, revision=settings.model_revision)

    return WhisperModel(
        model_source,
        device=settings.device,
        compute_type=settings.compute_type,
    )


@asynccontextmanager
async def lifespan(application: FastAPI):
    application.state.model = load_model()
    yield
    application.state.model = None


app = FastAPI(title="GC Forms speech-to-text POC", lifespan=lifespan)


@app.get("/health")
async def health() -> dict[str, str]:
    if getattr(app.state, "model", None) is None:
        raise HTTPException(status_code=503, detail="Speech model is not ready")

    return {"status": "ok"}


async def read_audio(audio: UploadFile) -> bytes:
    content_type = (audio.content_type or "").split(";", maxsplit=1)[0].lower()
    if content_type not in SUPPORTED_AUDIO_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported audio type")

    chunks: list[bytes] = []
    size = 0
    while chunk := await audio.read(1024 * 1024):
        size += len(chunk)
        if size > settings.max_audio_bytes:
            raise HTTPException(status_code=413, detail="Audio payload is too large")
        chunks.append(chunk)

    if not chunks:
        raise HTTPException(status_code=400, detail="Audio payload is empty")

    return b"".join(chunks)


def transcribe_audio(model: WhisperModel, audio: bytes, language: str | None) -> str:
    segments, _ = model.transcribe(
        io.BytesIO(audio),
        language=language,
        beam_size=5,
        vad_filter=True,
    )
    return " ".join(segment.text.strip() for segment in segments).strip()


@app.post("/transcribe")
async def transcribe(
    audio: UploadFile | None = File(default=None),
    language: str | None = Form(default=None),
) -> dict[str, str]:
    if audio is None:
        raise HTTPException(status_code=400, detail="Audio payload is required")

    normalized_language = language.strip().lower() if language else None
    if normalized_language and normalized_language not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail="Language must be en or fr")

    model = getattr(app.state, "model", None)
    if model is None:
        raise HTTPException(status_code=503, detail="Speech model is not ready")

    try:
        audio_bytes = await read_audio(audio)
    finally:
        await audio.close()

    try:
        text = await asyncio.wait_for(
            asyncio.to_thread(transcribe_audio, model, audio_bytes, normalized_language),
            timeout=settings.max_transcription_seconds,
        )
    except TimeoutError as error:
        raise HTTPException(status_code=504, detail="Transcription timed out") from error
    except Exception as error:
        raise HTTPException(status_code=502, detail="Transcription failed") from error

    return {"text": text}