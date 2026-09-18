# Speech service POC

This is the minimal private HTTP service for the GC Forms speech input proof of concept.
It wraps faster-whisper and does not write audio or transcripts to disk. The service is
intentionally limited to English and French and is not a production deployment.

## Run locally

Create an environment and install the development dependencies:

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements-dev.txt
```

Run the service on CPU:

```sh
WHISPER_DEVICE=cpu WHISPER_COMPUTE_TYPE=int8 \
  uvicorn app:app --host 127.0.0.1 --port 8080
```

The first start downloads the configured model from Hugging Face. Set
`WHISPER_MODEL_REVISION` to a model commit when reproducible model selection is required.
The default model is `Systran/faster-whisper-small`.

Check readiness and send a recording:

```sh
curl http://127.0.0.1:8080/health
curl -F audio=@sample.webm -F language=en http://127.0.0.1:8080/transcribe
```

The container uses a pinned CUDA runtime image and defaults to GPU execution. GPU
deployment is intentionally deferred until the local service contract is validated.

Run the contract tests with:

```sh
pytest
```