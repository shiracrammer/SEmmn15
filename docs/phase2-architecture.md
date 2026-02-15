# Phase 2: Architecture

**Product:** Unit Test Generator — Single-page web application that generates Vitest test suites via the Gemini API.

**Architecture summary:** React (Vite) frontend runs in the browser; Node.js backend runs locally and acts as the only client of the Gemini API. The backend receives user code, builds a prompt, calls Gemini, and returns the generated test code to the frontend.

---

## 1. Overall Architecture

The application uses a **client–server architecture**:

- **Client:** A single-page React application (Vite) served over `localhost`. The user interacts only with this UI; no direct calls to external APIs from the browser.
- **Server:** A Node.js application (e.g. Express) running on `localhost`. It exposes a small REST API (e.g. `POST /api/generate-tests`) and is the only component that talks to the Gemini API.
- **External service:** Google’s Gemini API is used as the “Feature LLM”: it receives the user’s function code and instructions, and returns generated Vitest test code. All communication with Gemini is from the Node.js backend; the Gemini API key is never exposed to the frontend.

This keeps API keys and prompt logic on the server and gives a clear separation: UI (React), orchestration and validation (Node), and test generation (Gemini).

---

## 2. Technology Stack

| Layer        | Technology | Role |
|-------------|------------|------|
| **Frontend** | React + Vite | Single-page UI: input area, generate action, loading state, output display, copy-to-clipboard. |
| **Backend**  | Node.js     | Local HTTP server, request validation, prompt construction, Gemini API calls, response formatting. |
| **LLM**      | Google Gemini API | Generation of Vitest test suites from the user’s function (standard, edge, partition, guideline-based tests). |
| **Test output** | Vitest   | The generated code is a Vitest test suite; the app does not run tests, only produces the file content. |

---

## 3. Frontend vs Backend Responsibilities

### Frontend (React app)

- Render a single page with:
  - An input area (e.g. textarea or code editor) for pasting one JavaScript/TypeScript function.
  - A “Generate tests” (or equivalent) button.
  - A loading indicator while the request is in progress.
  - An output area for the generated test code or error message.
  - A “Copy” control to copy the generated test suite to the clipboard.
- On “Generate”: send the pasted code to the backend (e.g. `POST` with JSON body).
- Handle response: display generated test code or show an error message in English.
- Optional: minimal client-side checks (e.g. non-empty input) before sending; no API keys or Gemini calls.

### Backend (Node.js server)

- Expose an API endpoint (e.g. `POST /api/generate-tests`) that accepts the user’s function code.
- Optionally validate input (syntax, “single function” constraint) and return a clear error if invalid.
- Build a structured prompt for Gemini (user code + instructions for Vitest, standard/edge/partition/guideline-based tests).
- Call the Gemini API with that prompt and obtain the generated test text.
- Optionally sanitize or validate the model output (e.g. strip markdown fences, basic syntax check).
- Respond to the frontend with JSON: either `{ success: true, testCode: "..." }` or `{ success: false, error: "..." }`.
- Keep the Gemini API key in server-side environment variables only; never send it to the client.

---

## 4. LLM Integration Model

- **Who talks to Gemini:** Only the Node.js backend. The React app never calls Gemini.
- **How:** The backend uses the **Google Generative AI SDK** for Node.js (`@google/generative-ai`). The server is configured with `GEMINI_API_KEY` (e.g. from `process.env`) and instantiates the client once at startup.
- **Request flow:**
  1. Backend receives the user’s function code in the HTTP request body.
  2. Backend builds a single prompt (or a short conversation) that includes:
     - The user’s function code.
     - Instructions to generate a **Vitest** test suite that includes:
       - Standard (happy-path) cases.
       - Edge cases (e.g. empty input, boundaries, null/undefined where relevant).
       - Partition testing (equivalence classes) where applicable.
       - Guideline-based testing (clear test names, arrange–act–assert, one logical assertion per test where reasonable).
     - Output format: plain Vitest test code, no extra commentary in the returned snippet (or with clear delimiters so the backend can extract only the code).
  3. Backend calls the SDK (e.g. `model.generateContent(prompt)`), waits for the response, and extracts the generated text.
  4. Backend optionally strips markdown code fences or other wrappers so the frontend receives only runnable Vitest code.
- **Error handling:** If Gemini fails (rate limit, network, invalid response), the backend maps the failure to a user-friendly English message and returns `{ success: false, error: "..." }` so the UI can display it.

---

## 5. Data Flow (User Input → Displayed Test Result)

1. **User:** Pastes a single JavaScript/TypeScript function into the input area and clicks “Generate tests”.
2. **Frontend:** Validates minimally (e.g. non-empty), shows loading state, sends `POST /api/generate-tests` with body `{ code: "<user's pasted code>" }`.
3. **Backend:** Receives the request; optionally validates syntax and “single function” constraint. If invalid, returns `{ success: false, error: "<message>" }` and stops.
4. **Backend:** Builds the Gemini prompt (function + Vitest and testing instructions).
5. **Backend:** Calls Gemini API with the prompt; waits for the generated text.
6. **Backend:** Extracts/sanitizes the test code from the response; returns `{ success: true, testCode: "<generated Vitest code>" }` or, on failure, `{ success: false, error: "<message>" }`.
7. **Frontend:** Receives the JSON response; hides loading state.
8. **Frontend:** On success: displays `testCode` in the output area and enables the copy button. On failure: displays `error` in the output or error area.
9. **User:** Reads the generated test suite and/or clicks “Copy” to copy it to the clipboard.

---

## 6. Proposed File Structure

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
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── components/
│   │   │   ├── CodeInput.jsx
│   │   │   ├── GenerateButton.jsx
│   │   │   ├── TestOutput.jsx
│   │   │   └── CopyButton.jsx
│   │   └── api/
│   │       └── generateTests.js    # HTTP client for POST /api/generate-tests
│   └── public/
└── server/                     # Node.js backend
    ├── package.json
    ├── .env.example             # GEMINI_API_KEY=your_key
    ├── index.js                 # Express app, route definitions
    ├── routes/
    │   └── generateTests.js     # POST handler, validation, call to Gemini service
    ├── services/
    │   └── geminiService.js     # Gemini API client, prompt building, response parsing
    └── utils/
        └── validation.js       # Optional: syntax / single-function checks
```

---

## 7. Third-Party Libraries

### Frontend (client)

| Package   | Purpose |
|----------|---------|
| `react`  | UI components and state. |
| `react-dom` | Mounting the React app. |
| `vite`   | Build tool and dev server. |
| `axios`  | HTTP client for `POST /api/generate-tests` (optional: can use native `fetch` instead). |

### Backend (server)

| Package              | Purpose |
|----------------------|---------|
| `express`            | HTTP server and routing. |
| `cors`               | Allow requests from the Vite dev server origin (e.g. `http://localhost:5173`). |
| `@google/generative-ai` | Official SDK to call the Gemini API from Node.js. |
| `dotenv`             | Load `GEMINI_API_KEY` from a `.env` file in development. |

### Generated output (no runtime dependency)

- The generated code is **Vitest** test syntax; the application does not install or run Vitest. The user copies the code into their own project where Vitest is already set up.

---

*Document version: 1.0 — Phase 2: Architecture*
