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

*Document version: 1.0 — Phase 1: Requirements Engineering*
