[La version française suit.](#---------------------------------------------------------------------)

# Platform - GC Forms

This repository is the web application for the GC Forms platform product.

- Explore it here: [https://forms-staging.cdssandbox.xyz/](https://forms-staging.cdssandbox.xyz/).

## Built with

This is a [Next.js](https://nextjs.org/) and is built with:

- Next.js >= 16.x
- Sass (Syntactically Awesome Style Sheets) for reusable styles
- [Tailwindcss](https://tailwindcss.com/) a utility-first css framework for rapidly building custom designs
- [PostCSS](https://postcss.org/)
- [Prisma](https://www.prisma.io/)

## Running locally

### Infrastructure setup

Clone the [forms-terraform repository](https://github.com/cds-snc/forms-terraform) and follow the instructions in our [README](https://github.com/cds-snc/forms-terraform/blob/develop/README.md) to launch the Localstack infrastructure locally.

```sh
git clone https://github.com/cds-snc/forms-terraform.git
```

### Web application setup

Clone this repository

```sh
git clone https://github.com/cds-snc/platform-forms-client.git
```

Install dependencies

```sh
cd platform-forms-client
yarn install
```

### Set your environment variables

Create an `.env.yarn` file at the root of the project and use the `.env.example` as a template. If you want you can find a ready to use version of the `.env` file in 1Password > Local Development .ENV secure note

### Run the web application in development mode

```sh
yarn dev
```

Browse web application on `http://localhost:3000`.

### Speech input proof of concept

This experiment answers the question: can a respondent record a short answer in the
browser and receive a usable English or French transcription through a self-hosted service?

The proof of concept records audio in the browser and sends it to the application's
`/api/speech-to-text` route. That route forwards the request to a service you operate;
audio is never sent to the browser's Web Speech provider. The initial scope is one real
public form text field and a working end-to-end request. Production rollout, broad field
coverage, GPU infrastructure, monitoring, retention policy, and polished accessibility
or error-recovery flows are intentionally out of scope until the path is shown to work.

Enable it with these server environment variables:

```sh
NEXT_PUBLIC_ENABLE_SPEECH_INPUT=true
SPEECH_TO_TEXT_URL=http://your-private-stt-service/transcribe
```

The speech service must accept multipart form data with an `audio` file and optional
`language` field, and return JSON in the form `{ "text": "..." }`. The prototype limits
audio uploads to 25 MB and does not log audio or transcripts in this application.
The local service implementation and setup instructions are in `speech-service/README.md`.

#### Proof-of-concept steps

The smallest useful implementation has two steps:

1. Run a pinned faster-whisper service locally or in a disposable development environment,
	connect it through the proxy, and verify a real English and French answer reaches one
	public form text field.
2. If the software path works, run the same service as one private, development-only CDS
	workload and verify private connectivity, health checks, and one transcription request.

The first step does not require Terraform, GPU capacity, service discovery, an internal
load balancer, or deployment automation. Those become relevant only to the second step,
and only as much as needed to validate the private deployment. Autoscaling, production
hardening, dashboards, and broad form-field rollout are outside this proof of concept.

#### Browser-based alternative

Whisper is the AI speech-recognition model. `faster-whisper` is the server-side runtime
used by this proof of concept. The default `Systran/faster-whisper-small` model is
multilingual and can transcribe English and French; Whisper also has English-only model
variants such as those with an `.en` suffix. Larger models generally improve accuracy,
especially with noise, accents, and difficult speech, but require more download size,
memory, processing time, and battery. Model size is therefore an accuracy trade-off, not
the only factor determining accuracy.

A browser-based implementation could avoid AWS GPU costs by running a quantized,
multilingual Whisper model on the user's device. The existing Python service cannot run
directly in a browser; a browser-compatible runtime such as ONNX Runtime Web or
`whisper.cpp` compiled to WebAssembly/WebGPU would be required.

For this experiment, use `@huggingface/transformers` with ONNX Runtime Web and the
`onnx-community/whisper-tiny` model. This is the multilingual ONNX form of OpenAI's
Whisper Tiny model and is suitable for English and French transcription. Start with
`q8` quantization for the browser POC, then measure whether `q4` provides a useful
download-size reduction without unacceptable accuracy loss. The model card identifies
the original Whisper Tiny model as Apache-2.0; the converted model repository's license
and redistribution terms must be confirmed before any wider release.

The browser worker defaults to Tiny. To compare another compatible ONNX model, set the public
client variable before starting Next.js, for example:

```sh
NEXT_PUBLIC_SPEECH_MODEL=onnx-community/whisper-small
```

The configured model is displayed on the isolated probe. Model assets are cached by the browser,
so use a fresh browser profile or clear the site cache when comparing cold-download behavior.

The browser alternative can be explored one step at a time:

1. Select `@huggingface/transformers` and `onnx-community/whisper-tiny`; confirm the
	model files, quantization options, and license for the intended use.
2. Build an isolated browser test that records a short sample, converts it to the model's
	expected 16 kHz mono audio, runs inference in a Web Worker, and displays the result.
	The first probe is available at `/:locale/speech-poc` and uses WASM with `q8` quantization;
	it does not call the server speech proxy.
3. Measure first-load download size, warm-start latency, peak browser memory, CPU/battery
	impact, and English/French transcription quality on a desktop browser. The probe now reports
	model asset size, cold versus warm setup time, inference time, audio duration, best-effort
	main-thread heap usage, browser capabilities, and decoded audio RMS/peak signal levels. CPU/
	battery impact and real-speech quality still require manual runs with representative English and
	French recordings.
4. Integrate the working browser transcription into one public form text field behind the
	existing feature flag. The first integration uses browser transcription for `TextInput` while
	`TextArea` remains on the server-backed control for comparison. Audio remains in the browser
	and does not use the proxy.
5. Add capability detection and a manual-entry fallback for browsers that lack suitable
	WebGPU/WASM performance. The public control now checks microphone, recording, Web Audio,
	Worker, and WebAssembly support before creating the inference worker; the regular text input
	remains available when voice input is unavailable.
6. Compare the browser result with the existing server POC before deciding between a
	browser-only, hybrid, or private server deployment.

For a repeatable phrase-level comparison, record the same short phrases in English and French on
the same browser and device. Run each phrase once with a cold page load and once with the warm
model, then record the transcript, model setup time, inference time, audio duration, asset size,
and observed heap peak from the probe. Repeat the phrases against the server POC and compare
transcript accuracy, latency, and device resource impact. The browser probe does not currently
upload or retain recordings, so an exact same-file comparison requires a later recording-export
or dual-transcription step.

Initial qualitative observation: on three manual English recordings of “Testing testing 123”,
Tiny produced unrelated or highly repetitive hallucinations in all three runs. Small produced two
near-exact transcripts and one transcript with an extra introductory phrase. The Small runs took
approximately 8 seconds each on the test desktop. This is useful directional evidence, not a
controlled accuracy benchmark; the probe's cold and warm timing measurements should be recorded
alongside future samples.

### Edit `@gcforms/core` styles locally

If you are changing styles in `packages/core/src/styles`, use the local `yalc` workflow to test the built package the same way it will be consumed after publish.

Build `@gcforms/core`, publish it to your local `yalc` store, and add or update it in this app:

```sh
yarn local:publish:core
```

If you see the following message after running that command, it is expected and no cause for concern:

```
Did not find package @gcforms/core in lockfile, please use 'add' command to add it explicitly.
Removing installation of @gcforms/core in /Users/dave.samojlenko/Code/gcdigital/forms-client
```

Recommended review loop:

1. Edit the SCSS source in `packages/core/src/styles`.
2. Start the app with `yarn dev` if it is not already running.
3. Run `yarn local:publish:core` to rebuild and refresh the local published package.
4. Refresh the app and review the change in the browser.

Notes:

- This flow tests the built `@gcforms/core` package, not the workspace source directly.
- Generated files under `packages/core/styles/` are ignored by git and do not need to be committed.
- If the app is already running, use `yarn local:publish:core`; you do not need to restart `yarn dev` for every change unless Next fails to pick up the updated package.

### How to access databases

#### PostgreSQL GUI

A GUI manager is installed with prisma and can be launched with `yarn prisma:studio`
For more information about developing with prisma migrate please visit: https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate

You can optionally install a GUI manager like pgAdmin4 ([MacOS download link](https://www.postgresql.org/ftp/pgadmin/pgadmin4/v8.4/macos/)) if you would like.
Here are the credentials to access your local PostgreSQL instance:

```
Hostname/Address: 127.0.0.1
Port: 4510
Maintenance database: forms
Username: localstack_postgres
Password: chummy
```

#### Redis GUI

You can download RedisInsight (see download link at the bottom of this [page](https://redis.com/redis-enterprise/redis-insight/)).

Here are the credentials to access your local Redis instance:

```
Host: localhost
Port: 6379
```

## Grant yourself admin access locally

There are several ways to connect to the database, but here's how to do it through Prisma Studio:

- Login using your Staging account
- Launch prisma studio with `yarn prisma:studio` or if you have prisma installed globally `prisma studio`
- A browser window will open at `localhost:5555`. Open the model `User`
- A table will appear. Find your username and add all the privileges under the `privileges` column.
- Click on "Save Change" button in the top menu bar once completed.

Once the change is made, you will need to 'Log Out' and log back in. Alternatively, if you want to avoid logging out, you can open RedisInsight and delete the key named `auth:privileges:<your_user_id>`. Then you just need to refresh the web application for the new privileges to be applied.

## Testing

See package.json scripts for vitest and playwright

### Local Playwright setup

For local development, the local Playwright scripts install Chromium automatically before running.

Playwight is configured to run "yarn build:test && yarn start:test" for the web server

### Running Playwright without resetting your dev schema

Local Playwright defaults to the isolated database path. The local scripts run `yarn db:test`, but they do it against a separate Playwright schema instead of your normal local development schema. That means your long-lived local users, templates, and feature flags are left alone. Use the local Playwright scripts:

```sh
yarn playwright:ui:local
```

or headless:

```sh
yarn playwright:headless:local
```

Those commands set `PLAYWRIGHT_ISOLATE_DB=true`, which keeps the same PostgreSQL server but rewrites the Prisma connection to use a separate schema named `playwright` by default. Your normal development schema is left alone.

These local scripts install Chromium first and then run Playwright against the local isolated-db mode. The remaining `playwright:headless:ci` script is kept for CI-style headless runs.

Reference:
Prisma PostgreSQL connection string arguments: https://www.prisma.io/docs/orm/overview/databases/postgresql
Prisma multi-schema support: https://www.prisma.io/docs/orm/prisma-schema/data-model/multi-schema

If you want a different schema name, set `PLAYWRIGHT_DB_SCHEMA`:

```sh
PLAYWRIGHT_DB_SCHEMA=your_schema yarn playwright:headless:local
```

To run a single Playwright test file:

```sh
yarn playwright:headless:local tests/e2e/smoke.spec.ts

```

or multiple

```bash
yarn playwright:headless:local tests/e2e/forms/required-attributes.spec.ts tests/e2e/navigation-focus.spec.ts tests/e2e/forms/attestation.spec.ts
```

To run a single test by name:

```sh
yarn playwright:headless:local --grep "should load the homepage and display expected content"
```

### Updating Browserslist data

If you see a Browserslist warning about stale `caniuse-lite` data, update it with:

```sh
npx update-browserslist-db@latest
```

This updates the dependency data in `yarn.lock`, so include the lockfile change in your commit.