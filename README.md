# SEmmn15

Web-Based SE Practice Tool — **Unit Test Generator**: paste a JavaScript/TypeScript function, get a Vitest test suite (standard, edge, partition, and guideline-based tests) generated via the Gemini API.

---
# Phase 1: Requirements Engineering

**Product:** Unit Test Generator — Single-page web application that generates Vitest test suites from pasted JavaScript/TypeScript functions.

**Constraints:** Single-page application; runs locally on localhost; English only.

---

## 1. Functional Requirements

- **FR-1** The application shall provide a single page where the user can input or paste JavaScript or TypeScript function code.
- **FR-2** The application shall accept only one function per submission (the pasted code shall represent a single function to be tested).
- **FR-3** The application shall validate that the pasted input is syntactically valid JavaScript/TypeScript before generating tests.
- **FR-4** The application shall generate a complete Vitest test suite from the submitted function.
- **FR-5** The generated test suite shall include tests for standard (happy-path) cases.
- **FR-6** The generated test suite shall include tests for edge cases (e.g., empty inputs, boundaries, null/undefined where applicable).
- **FR-7** The generated test suite shall apply partition testing (equivalence classes) where relevant to input domains.
- **FR-8** The generated test suite shall follow guideline-based testing (e.g., coverage of return paths, error handling, typical usage patterns).
- **FR-9** The application shall display the generated test code to the user in a readable, copyable format.
- **FR-10** The application shall allow the user to copy the generated test suite (e.g., via a copy-to-clipboard action).
- **FR-11** The application shall handle invalid or unsupported input gracefully and show a clear error message in English.
- **FR-12** The application shall run entirely in the browser or via a local server on localhost with no external deployment or cloud dependency.
- **FR-13** All user-facing text, labels, messages, and documentation shall be in English.

---

## 2. Acceptance Criteria

### UI interaction

- **AC-UI-1** The main page contains a clearly labeled input area (e.g., text area or code editor) for pasting the function.
- **AC-UI-2** The main page provides a single, clearly labeled control (e.g., button) to trigger test generation.
- **AC-UI-3** The UI indicates loading or processing state while generation is in progress (e.g., spinner or “Generating…”).
- **AC-UI-4** The UI provides a dedicated, clearly labeled area for displaying the generated test suite.
- **AC-UI-5** The UI provides a way to copy the generated test code (e.g., “Copy” button) that copies the full output to the clipboard.
- **AC-UI-6** All labels, buttons, placeholders, and instructions are in English.
- **AC-UI-7** Navigation does not leave the single page (no multi-page routing for core flow).

### Backend / processing

- **AC-BE-1** On “Generate” (or equivalent), the application parses the pasted input and identifies exactly one function.
- **AC-BE-2** If the input is not valid JavaScript/TypeScript or does not contain exactly one function, the application returns a clear error message and does not generate tests.
- **AC-BE-3** The generated test file is valid Vitest syntax and can be run with Vitest without syntax errors.
- **AC-BE-4** The generated tests include at least one standard-case test that exercises the function with typical inputs.
- **AC-BE-5** The generated tests include at least one edge-case test (e.g., boundary, empty, or null/undefined as appropriate).
- **AC-BE-6** The generated tests reflect partition testing where the function has clear input partitions (e.g., numeric ranges, empty vs non-empty).
- **AC-BE-7** The generated tests follow testing guidelines (e.g., descriptive test names, arrange–act–assert structure, one logical assertion focus per test where reasonable).

### Output display

- **AC-OUT-1** The generated test suite is shown in full in the designated output area.
- **AC-OUT-2** The output is formatted (e.g., indentation, line breaks) so that it is readable and directly usable as a test file.
- **AC-OUT-3** When an error occurs (invalid input or processing failure), an error message is shown in the output area or a dedicated error area, in English.
- **AC-OUT-4** After successful generation, the user can copy the entire displayed test code via the provided copy action.

---


# Phase 2: Architecture

### 1. Overall Architecture

The application uses a **client–server** model:

- **Client:** A single-page React (Vite) app served on `localhost`. The user never calls external APIs directly from the browser.
- **Server:** A Node.js app (e.g. Express) on `localhost` that exposes a REST API and is the **only** component that talks to the Gemini API.
- **External service:** Google Gemini API is the “Feature LLM”: it receives the user’s function and instructions and returns generated Vitest test code. All Gemini communication and the API key stay on the Node server.

### 2. Technology Stack

| Layer        | Technology   | Role |
|-------------|--------------|------|
| Frontend    | React + Vite | Single-page UI: input, generate button, loading, output, copy. |
| Backend     | Node.js      | HTTP API, validation, prompt building, Gemini calls. |
| LLM         | Google Gemini API | Generates Vitest test suite from the user’s function. |
| Test output | Vitest       | Generated code is Vitest syntax; the app only produces the file content. |

### 3. Frontend vs Backend Responsibilities

- **Frontend (React):** Renders input area, “Generate” button, loading state, output area, and “Copy” control. Sends user code to the backend via `POST`; displays returned test code or error. No API keys, no direct Gemini calls.
- **Backend (Node.js):** Exposes `POST /api/generate-tests`. Validates input (syntax, single function). Builds the Gemini prompt (user code + Vitest/testing instructions). Calls Gemini, extracts/sanitizes the generated test code. Returns JSON `{ success, testCode }` or `{ success, error }`. Keeps `GEMINI_API_KEY` in server environment only.

### 4. LLM Integration Model

- **Who:** Only the Node.js backend talks to Gemini; the React app does not.
- **How:** Backend uses the **Google Generative AI SDK** (`@google/generative-ai`) for Node.js. The server loads `GEMINI_API_KEY` from environment (e.g. `.env` via `dotenv`) and creates the client at startup.
- **Flow:** Backend receives user code → builds a prompt (function + instructions for Vitest: standard cases, edge cases, partition testing, guideline-based tests) → calls `model.generateContent(prompt)` → extracts generated text (optionally strips markdown fences) → returns test code or a user-friendly error to the frontend.

### 5. Data Flow (User Input → Displayed Test Result)

1. User pastes a JS/TS function and clicks “Generate tests”.
2. Frontend sends `POST /api/generate-tests` with `{ code }`; shows loading.
3. Backend validates input; if invalid, returns `{ success: false, error }`.
4. Backend builds Gemini prompt and calls the API.
5. Backend parses response and returns `{ success: true, testCode }` or `{ success: false, error }`.
6. Frontend hides loading; displays `testCode` in the output area or shows `error`.
7. User reads the test suite and can use “Copy” to copy it.

### 6. File Structure

```
SEmmn15/
├── README.md
├── docs/
│   ├── phase1-requirements-engineering.md
│   └── phase2-architecture.md
├── client/                     # React (Vite) frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/         # CodeInput, GenerateButton, TestOutput, CopyButton
│       └── api/                # generateTests.js — HTTP client
└── server/                     # Node.js backend
    ├── package.json
    ├── .env.example            # GEMINI_API_KEY=...
    ├── index.js                # Express app, routes
    ├── routes/                 # generateTests route
    ├── services/               # geminiService.js — Gemini client & prompt
    └── utils/                  # optional validation
```

### 7. Third-Party Libraries

| Where   | Package                | Purpose |
|---------|------------------------|---------|
| Client  | `react`, `react-dom`, `vite` | UI and build. |
| Client  | `axios` (or `fetch`)   | HTTP client for `POST /api/generate-tests`. |
| Server  | `express`              | HTTP server and routing. |
| Server  | `cors`                 | Allow requests from Vite dev origin. |
| Server  | `@google/generative-ai`| Call Gemini API from Node.js. |
| Server  | `dotenv`               | Load `GEMINI_API_KEY` from `.env`. |

The generated output is **Vitest** test code; the app does not run tests — the user copies the code into their own Vitest project.

---

Full architecture details: [docs/phase2-architecture.md](docs/phase2-architecture.md).

---

## Phase 3: Key Files

| File Name | Description |
|-----------|-------------|
| [server/index.js](server/index.js) | Express app entry point; CORS, JSON body, and `POST /api/generate-tests` route. |
| [server/routes/generateTests.js](server/routes/generateTests.js) | Handler for `POST /api/generate-tests`; delegates to Gemini service and returns JSON. |
| [server/services/geminiService.js](server/services/geminiService.js) | Gemini API client; builds prompt (Vitest, mocks, exception testing), calls API, strips markdown from response. |
| [server/.env.example](server/.env.example) | Example environment file for `GEMINI_API_KEY` and `PORT`. |
| [client/index.html](client/index.html) | Single HTML entry for the Vite React app. |
| [client/vite.config.js](client/vite.config.js) | Vite config; React plugin and proxy of `/api` to the Node backend. |
| [client/src/main.jsx](client/src/main.jsx) | React root; mounts `App` with StrictMode. |
| [client/src/App.jsx](client/src/App.jsx) | Main app: state, generate flow, wiring of input, button, output, and copy. |
| [client/src/App.css](client/src/App.css) | Global and component styles for the single-page UI. |
| [client/src/api/generateTests.js](client/src/api/generateTests.js) | HTTP client; `POST /api/generate-tests` with user code, returns result. |
| [client/src/components/CodeInput.jsx](client/src/components/CodeInput.jsx) | Textarea for pasting the JavaScript/TypeScript function. |
| [client/src/components/GenerateButton.jsx](client/src/components/GenerateButton.jsx) | Button to trigger test generation; shows loading state. |
| [client/src/components/TestOutput.jsx](client/src/components/TestOutput.jsx) | Read-only area displaying generated test code or error message. |
| [client/src/components/CopyButton.jsx](client/src/components/CopyButton.jsx) | Button to copy the generated test suite to the clipboard. |
| [playwright.config.js](playwright.config.js) | Playwright E2E config; base URL, webServer for client. |
| [e2e/generate-tests.spec.js](e2e/generate-tests.spec.js) | System test: navigate, paste function, generate, assert generated test code is visible. |

**How to run:** Copy `server/.env.example` to `server/.env` and set `GEMINI_API_KEY`. From repo root run `npm run install:all`, then start the backend (`npm run dev:server`) and frontend (`npm run dev:client`) in two terminals. Open http://localhost:5173. For E2E: install browsers once with `npx playwright install`; with the backend already running, run `npm run test:e2e` (Playwright starts the client automatically).
