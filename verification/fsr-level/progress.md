# SDD ledger — plan: docs/superpowers/plans/2026-10-26-fsr-level.md

Pre-flight: no shared interfaces; standalone FSR task on the existing user-selected checkout/branch. Measured ranges and implementation were approved in conversation. Native execution, no commit or upload.

Task 1 RED: all eight host cases failed against the original sketch with missing relative percentage output. Tests run the actual .ino; only ADC/time/Serial hardware is substituted.

Ruling: no new tare/calibration command, persistence, dead-zone mapping, safety/disconnect detection or force conversion. Measured endpoints stay visible constants. Risk: idle noise can show a small nonzero level and a saturated/open ADC cannot be reliably distinguished from release; both documented.

Ruling: seed the filter from actual startup ADC values, not an assumed released state, to avoid a false startup press. Timing uses unsigned subtraction for millis rollover. Bench sampling/reporting are 20/100 ms, not a claim of hardware latency or gameplay performance.

Task 1 complete: FSR Test-Sketch.ps1 passed 8/8 after implementation; existing HX711 Test-Sketch.ps1 passed 9/9 unchanged. Generic ESP32 compile succeeded with core 3.3.12, program 278640 bytes, global RAM 22220 bytes; see compile.log. No dependency installation, hardware connection, upload or Unity changes.

Final review: separate author self-review, preserving the user's native/no-subagent preference. Checked unequal channel ranges, descending mapping, clamp behavior, seeded smoothing, unsigned timer rollover and diagnostic output against approved scope. No additional issue found. Physical wiring, light-press resolution on the saturated right input, real sensor noise and physical timing remain unverified. No commit or merge requested.
