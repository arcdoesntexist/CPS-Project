# USB controller verification — 2026-10-27

## Version 2.1.0 packaging follow-up

The user subsequently confirmed successful gameplay and replaced the left FSR. The combined sketch now uses released 4095/reference press 156.5 on GPIO34, matching the right-hand endpoints. Updated only the corresponding host-test ADC inputs; all 10 combined-firmware cases pass. Recompiled that exact sketch for ESP32 core 3.3.12/HX711 0.6.5: 282448 bytes program, 22372 bytes RAM. Web Serial tests now target the actual repository `Assets/Plugins/WebGL/CpsSerial.jslib` rather than the development staging mirror; all seven pass. The original verification below describes the USB implementation before this endpoint-only hardware adjustment. No fresh full Unity suite or WebGL binary was produced solely for the 2.1.0 version-number change.

The published repository `arcdoesntexist/CPS-Project` now includes the tested Unity source at its root, together with firmware/docs. `VERSION` and `ProjectSettings/ProjectSettings.asset` both identify 2.1.0. The separate development checkout remains available. Build/cache and local runtime audio directories are excluded.

Project: `C:\Users\Arc\Unity\CPS-Project`, Unity 6000.3.25f1. Documentation/firmware: `C:\Users\Arc\Downloads\CPS\Unity_Project`. No commit, push, board upload, real serial-port open, or package installation.

## Evidence

| Check | Evidence | Result |
|---|---|---|
| EditMode suite | `editmode-complete.xml` | 189/189 passed, including JSON integer force regression |
| PlayMode suite | `playmode-verified.xml` | 106/107 passed; one existing audio-volume expectation |
| New-boot regression | `recovery-red.xml`, then `playmode-verified.xml` | Fresh FSR reboot reproduced before fix; final flow passes and waits for explicit Resume |
| Real scene integration | `ControllerSceneTests` in PlayMode XML | Home readiness, practice source, Load Cell N, USB-loss pause/recovery passed |
| Browser JS bridge | `Test-WebSerial.ps1`, `web-serial.test.cjs` | 7/7 passed: feature detection, native gesture, framing, cancellation/open/read/write errors, pending-close cleanup, duplicate-click guard |
| Combined firmware | `verification/sensor-controller/Test-Controller.ps1` | 10/10 host cases passed |
| Unchanged bench sketches | FSR/HX711 `Test-Sketch.ps1` | 8/8 and 9/9 passed |
| ESP32 compile | `verification/sensor-controller/compile.log` | Exit 0; 282456 bytes program, 22372 RAM |
| Fixture identity | Canonical `sensor-protocol/fixtures` versus Unity fixtures | SHA256 matched |
| Staging identity | `sync-manifest.csv` | All 32 staged files matched Unity at verification time |
| Visual inspection | `captures/*.png` | Home Controller, Load Cell gameplay, sensor-loss Pause at 1280×720 and 1920×1080 |

First WebGL build succeeded (`usb-webgl-build.log`, exit 0). Browser smoke on `http://127.0.0.1:8125/` loaded the real game, switched Keyboard/FSR/Load Cell, showed unavailable readings/tare instructions, mounted the accessible native Connect USB DOM button over the Unity button, and removed it when the panel closed. No real picker/port was opened. Browser errors/permission cancellation are covered by the separate JS VM mocks, not claimed as physical browser/device tests.

The browser inspection caught missing `%` glyphs in FF Spoken Trial on the numeric readings. Reading its cmap/glyf tables showed `%` maps to glyph 6, whose outline has zero bytes. HasCharacter therefore cannot detect this trial-font limitation. The panel now uses the built-in font for the two live numeric readouts; other text/buttons retain the selected font. A planned intermediate build (`usb-webgl-final.log`) was deliberately stopped before player compilation; it is not a successful build. `usb-webgl-delivery.log` ended with an interrupted Bee backend and no successful BuildReport. Automatic approval review subsequently failed due to the account usage limit, so the attempted final patch/build did not execute then. On the user's next continuation, the unconditional numeric-font patch was synced.

**Final delivery:** `usb-webgl-confirmed.log` completed successfully, process exit 0; the build entry point throws unless BuildReport is Succeeded. Served the resulting `Builds/WebGL-Dev` on localhost and opened the actual game in the in-app browser. Both numeric readouts visibly show `0%` with the rest of the approved font/layout retained. Final screenshot: `captures/webgl-controller-final.png`. No physical serial connection was requested. Final source sync: all 32 staged files match Unity. Unity batch Editor has exited; the user can reopen the project.

The full PlayMode failure is `LocalDemoAudioTests.InteractionUnlocksSceneMusicWithLoopAndApprovedVolumes`: expected 0.3, actual 0.99. Audio settings/assets/assertions were not changed to force a passing test. Earlier baseline audio failures varied with the existing suite; the final full run has exactly the one failure above.

## Change scope

`sync-manifest.csv` lists the exact 32 new/modified Unity source/test/fixture files. Runtime changes cover strict packets/framing, Windows serial worker, Web Serial bridge, global selected input/threshold settings, honest percent/N statistics, automatic safety pause and Space/Escape guards, existing Home/Pause connection panel and Results unit labels. `ControllerUISetup.Apply` adds only controller UI and settings references to MainMenuCanvas/GameplayCanvas; it does not regenerate the scene or the approved home/gameplay/results design. `Assets/CPS/Resources/ControllerSettings.asset` is the editable threshold asset.

Firmware is the single `Sensor_Controller` sketch; original FSR_Reading/HX711_Reading sketches remain available. The guide is `docs/unity-usb-controller-guide.md`.

## Asset preservation limit

Existing legacy EditMode tests invoke broad home/gameplay/cafe authoring routines and save assets. The first full run occurred before this side effect was accounted for; it may have reserialized the scenes or reset decoration transforms to the existing authoring defaults. No original pre-run scene snapshot was available to prove every custom transform survived. Subsequent EditMode runs preserve and restore current non-code CPS assets; the final EditMode run restored two legacy-test writes. Scoped controller authoring itself is tested twice for idempotence and unchanged existing UI positions/scene bytes. No Git reset or restoration from unrelated older art was attempted.

## Physical checks still required

- Upload the combined sketch, close Serial Monitor and select the actual COM port.
- Verify FSR release/press behavior and Load Cell zero/known weights after tare; calibration remains provisional, especially the inconsistent 83 g point.
- Verify native driver reconnect/port contention, browser picker/device permission, end-to-end latency and USB unplug/reboot while playing. Automated tests use fixtures/mocks and do not prove physical hardware behavior.
- FSR right released ADC 4095 cannot distinguish some wiring faults from release; no force in N is inferred from FSR.
