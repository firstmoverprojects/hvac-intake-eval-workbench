# HVAC Intake Eval Workbench

A static, shared workbench where a person and a WebMCP-capable agent label fictional HVAC/plumbing intake tickets and run the same five deterministic checks. It has no backend, network integrations, analytics, credentials, or build step.

## Run locally

From this directory:

```sh
python3 -m http.server 8765
```

Open `http://127.0.0.1:8765`. Serving over HTTP is required because the demo data is loaded with `fetch`. If WebMCP is unavailable, a banner appears and every manual feature remains usable.

## Test WebMCP

Use ChatGPT’s in-app browser, or Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled and Chrome restarted. Open the served page and confirm the green status chip reports nine tools. Try: “List unscored emergency cases,” then “Open the first case,” “Submit labels,” and “Show the scoreboard.”

The registered tools are `list_cases`, `get_case`, `open_case`, `submit_labels`, `score_labels`, `get_scoreboard`, `reveal_gold`, `reset_session`, and `export_session`. Customer messages are untrusted content. Gold stays hidden until that case has been scored.

Run scorer tests with:

```sh
node --test test/scorer.test.mjs
```

## Local licensed data

The “Load local cases” control accepts newline-delimited JSON and parses it entirely in the browser. Nothing is uploaded. Loaded lines must follow the included case shape and contain `case_id` and `expected`.

## Provenance and scope

First Mover Projects’ pre-existing HVAC/Plumbing Intake Eval Pack supplied the label and deterministic scorer contracts. This workbench, its WebMCP tool surface, browser scorer port, and the 12 fictional `demo-*` cases are new submission-period work. No case line, customer message, shop, or street from the paid JSONL is included here.

Copyright © 2026 First Mover Projects. Released under the MIT License. This is not professional HVAC/plumbing advice or a hosted evaluation service.
