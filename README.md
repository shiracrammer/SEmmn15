# SEmmn15

Web-Based SE Practice Tool — **Unit Test Generator**: paste a JavaScript/TypeScript function, get a Vitest test suite (standard, edge, partition, and guideline-based tests) generated via the Gemini API.

---

## Architecture

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
