# SDD ledger — plan: docs/superpowers/plans/2026-10-26-hx711-calibration.md

Pre-flight: no shared interfaces (one standalone task).

Workspace: existing user-selected checkout; new branch codex/hx711-calibration. No unrelated changes staged or committed. Verification artifacts stay in the existing verification folder to preserve the user's documentation layout.

Ruling: use Rob Tillaart HX711 0.6.5 already installed, with per-sample bounded readiness checks and explicit raw-average offset — its default begin/reset and multi-sample tare/read calls can otherwise block on a missing device. No library installation. Physical disconnect between readiness and the immediate read remains an upstream blocking-read limitation.

Task 1: RED observed against the original sketch: missing calibrated output in conversion/commands; blocking read on unavailable startup channel in missing. GREEN: all nine host cases pass with g++ 15.2.0 and -Wall -Wextra -Werror. Tests exercise the actual sketch with host substitutes for HX711 and Serial hardware only; they do not establish physical sensor accuracy.

Ruling: bounded per-sample raw tare average and set_offset replace library tare(5), because checking readiness once does not bound the next four internal reads. get_units(1) remains the existing library's conversion API. Risk: readiness-to-read disconnect is still an upstream race, documented to the user.

Ruling: board variant was not specified, so compile against installed generic esp32:esp32:esp32 as a compatibility check only; the user must select their actual board before uploading. No board discovery, serial connection or upload is requested.

Final review: self-review in a separate pass, preserving the user's native/no-subagent execution preference. Checked API compatibility against installed HX711.cpp, startup reset side effects, signed conversions, partial tare/read failures, recovery and both-channel command semantics. No additional code defect found. Physical accuracy and the readiness-to-read race cannot be proven by the host stub; documented in HX711_Reading/README.md. This is not an independent reviewer verdict.

Task 1: complete. Fresh `Test-Sketch.ps1` run passed 9/9 cases. Arduino CLI compile exited 0 against esp32:esp32:esp32 core 3.3.12 and HX711 0.6.5: 275236 bytes program storage, 22172 bytes global RAM. See compile.log. No upload, hardware/Serial connection, Unity changes, dependency installation, staging or commit performed. Generated build/executable outputs are excluded by this verification folder's .gitignore; evidence remains in place.
