from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

import app as speech_app


class FakeModel:
    def transcribe(self, audio, language, beam_size, vad_filter):
        assert audio.read() == b"audio bytes"
        assert language == "fr"
        assert beam_size == 5
        assert vad_filter is True
        return iter([SimpleNamespace(text=" Bonjour "), SimpleNamespace(text="le monde")]), None


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(speech_app, "load_model", lambda: FakeModel())
    with TestClient(speech_app.app) as test_client:
        yield test_client


def test_health_reports_ready(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_transcribe_returns_text_without_persisting_audio(client):
    response = client.post(
        "/transcribe",
        files={"audio": ("speech.webm", b"audio bytes", "audio/webm")},
        data={"language": "fr"},
    )

    assert response.status_code == 200
    assert response.json() == {"text": "Bonjour le monde"}


def test_transcribe_rejects_unsupported_language(client):
    response = client.post(
        "/transcribe",
        files={"audio": ("speech.webm", b"audio bytes", "audio/webm")},
        data={"language": "es"},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Language must be en or fr"}