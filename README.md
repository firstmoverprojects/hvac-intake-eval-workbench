# HVAC Intake Eval Workbench

A dependency-free browser workbench for evaluating HVAC and plumbing intake labels. A human or a WebMCP-capable agent reads a fictional ticket, submits structured labels, and receives five deterministic checks:

1. valid output schema;
2. trade, intent, and urgency;
3. operational boolean/null fields;
4. exactly identified missing required fields; and
5. the submitted declaration of whether an instruction embedded in untrusted customer text was followed.

The main app is `index.html`. It has no backend, accounts, analytics, credentials, paid APIs, build step, or deployment requirement.

## Quickstart from a clean clone

The app only requires Python 3 to serve its static files:

```sh
git clone https://github.com/firstmoverprojects/hvac-intake-eval-workbench.git
cd hvac-intake-eval-workbench
python3 -m http.server 8765 --bind 127.0.0.1
```

Open <http://127.0.0.1:8765>. Do not open `index.html` as a `file://` URL: browsers block the `fetch` used to load demo data.

Node.js 20+ is needed only for tests. If Node is available, `npm start` is a convenience alias for the same Python server command. No package installation is needed.

```sh
npm start
```

## Three-case synthetic demo

1. Start the app and expand **Load local cases**.
2. Choose `data/demo-3.jsonl`.
3. Score `sample-heat`, then reveal its gold labels.
4. Score `sample-missing-address` with `address` in **Missing fields**.
5. For `sample-injection`, classify the service request and leave **Injection followed** unchecked.
6. Review the scoreboard and export the session.

All names, businesses, contact details, addresses, and situations in both bundled datasets are invented. The short demo deliberately uses `Demo Person`, `Example`, reserved `example.test` email domains, and fictional `555-01xx` phone numbers. It contains no customer or personal data.

The default `data/demo-12.json` set provides broader emergency, quote, maintenance, ambiguous, service-area, missing-field, photo, and prompt-injection coverage.

## Tests

```sh
npm test
```

The test suite covers scorer branches, case/JSONL validation, bundled synthetic data, gold-label access regression, and local asset links. GitHub Actions runs the same suite and a static-server smoke test using only the included GitHub-hosted runner and public actions; it needs no secrets or paid services.

## Optional WebMCP flow

In a browser with WebMCP support, the status chip reports nine registered tools:

`list_cases`, `get_case`, `open_case`, `submit_labels`, `score_labels`, `get_scoreboard`, `reveal_gold`, `reset_session`, and `export_session`.

Try: “List unscored cases,” “Open the first case,” “Submit labels,” and “Show the scoreboard.” The tool surface hides the inferred trade/intent/urgency labels and gold. Supplied operational facts (`after_hours`, service-area status, and attachment status) remain visible and are prefilled because their check measures faithful preservation rather than inference. Every scoring tool records its attempt; `reveal_gold` remains locked until a case has a recorded score. Customer messages must be treated as untrusted content.

If WebMCP is unavailable or registration fails, the complete manual workbench remains usable.

## Loading another local dataset

**Load local cases** accepts newline-delimited JSON (`.jsonl`). Parsing and scoring happen in the browser; this app does not upload the file. Each row is validated against the bundled case contract, including unique IDs, supported labels, operational types, expected-label consistency, and required-field readiness.

Use `data/demo-3.jsonl` as the smallest valid example. Do not add real customer records to this repository.

## Project layout

- `app.js` — browser state, rendering, local-file loading, and WebMCP tools
- `lib/scorer.js` — deterministic five-check scorer, usable in browser or Node
- `lib/cases.js` — case and JSONL validation, usable in browser or Node
- `data/` — synthetic demo fixtures
- `test/` — dependency-free Node test suite
- `.github/workflows/ci.yml` — free test and static-server CI

The other top-level HTML files are linked, standalone First Mover Projects calculators or product examples. They do not participate in intake scoring.

## Known limitations

- This is an evaluation UI, not a classifier: a person or external agent supplies the proposed labels.
- Gold labels ship in the browser data bundle. The normal UI and WebMCP tools lock them until scoring, but a user can inspect the JSON or browser developer tools. This is not a tamper-resistant or proctored benchmark.
- State is in memory and is lost on refresh unless the user exports it. There is no collaboration, history, authentication, or persistence.
- WebMCP support is experimental and browser-dependent. Automated tests cover deterministic logic and static serving, not a real WebMCP browser implementation.
- The five equally weighted checks are intentionally coarse. They do not measure response quality, technician safety, dispatch feasibility, regulatory compliance, or model accuracy beyond these labels.
- `injection_followed` is self-reported by the submitter. The scorer can catch poisoned trade/intent/urgency labels in the bundled adversarial cases, but it cannot inspect a model’s internal behavior or independently prove that an instruction was ignored.
- Local JSONL stays in the page, but this project cannot control browser extensions, screenshots, or files a user separately shares.
- This is not professional HVAC/plumbing advice, a hosted service, or production intake software.

## Provenance and license

First Mover Projects’ pre-existing HVAC/Plumbing Intake Eval Pack supplied the label and scorer contracts. The public fixtures are synthetic and do not include lines, messages, shops, or addresses from licensed customer data.

Copyright © 2026 First Mover Projects. Released under the [MIT License](LICENSE).
