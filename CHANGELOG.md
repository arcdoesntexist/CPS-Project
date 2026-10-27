# Changelog

This file records the project changes between committed versions. Project purpose, gameplay and setup information belong in [README.md](README.md).

## Version 2.1.0 — 2026-10-27

### Added

- Global Keyboard / FSR / Load Cell selector on Home and USB recovery controls in Pause.
- One combined ESP32 sketch with FSR on GPIO34/35 and HX711 pairs DT32/SCK18 and DT33/SCK4, at 115200 baud.
- Windows Editor USB serial and a native browser permission button for Web Serial on HTTPS/localhost.
- Strict versioned JSON telemetry, independent sample freshness, asynchronous tare, and reset/reconnect guards.
- Automatic pause on stale input, USB loss or board restart; explicit Resume after recovery.
- Spacebar/Escape Pause/Resume with modal/text-entry guards, retaining A/D/B and arrow controls.
- Source-aware statistics: FSR relative 0–100%; Load Cell estimated Max/Average N; no simulated Newton values.
- Controller settings asset, firmware/host tests, Unity controller tests and USB setup documentation.

### Changed

- Kept the user's replacement left-FSR values: released 4095 and reference press 156.5, replacing 551/135 in the combined sketch.
- Updated combined-firmware test ADC samples and README pin/calibration tables to match the current sensors.
- Used a numeric fallback font in live controller readouts to display the trial font's missing percent glyph.
- Set `VERSION` and Unity `bundleVersion` to `2.1.0`. Telemetry schema remains version 1; HX711 force coefficients are unchanged.

### Verification and limits

- User confirmed successful gameplay with the updated sensor sketch.
- USB implementation evidence: EditMode 189/189; PlayMode 106/107 with one existing audio-volume assertion; JS bridge 7/7; combined firmware host cases 10/10; successful ESP32 compile and WebGL build.
- Automated verification did not upload firmware or open physical serial ports. Load Cell calibration and fault/latency checks remain hardware-dependent.
- MQTT, Node-RED and the planned Versus mode remain outside this version.

## Version 2.0.0 — 2026-10-26

Version 2.0.0 changes CPS Kitchen Catch from a design-and-evidence repository into a directly openable and tested Unity project.

### Difference from Version 1.0.0

| Area | Version 1.0.0 | Version 2.0.0 |
| --- | --- | --- |
| Repository | Design files, production artwork, implementation notes and verification evidence | Complete Unity project with `Assets`, `Packages` and `ProjectSettings` |
| Playable flow | Unity checkout was maintained separately | Boot, profile selection, difficulty selection, gameplay, pause and results are included in the repository |
| Profiles | Proposed workflow | Create, select, rename and delete local profiles |
| Difficulty | Design specification | Easy, Normal and Hard configurations with different speeds, intervals, hazard rates and environments |
| Gameplay | Approved concept and rules | 60-second rounds with food, rubbish, HP, score and D-to-SSS combo ranks |
| Results | Planned statistics | Outcome, score, difficulty badge, item counts, combo rank and detailed round statistics |
| Environments | Initial kitchen artwork | Kitchen, daytime cafe and nighttime cafe with separate ambient decorations |
| Presentation | Character and UI references | Mascot animation, readable two-facing IoTE helmet, eat/hurt/triumph/death effects and redesigned UI |
| Audio and settings | Demo sources and audio direction | Global volume, background-music toggle and optional local demo-audio loading |
| Cloud data | Integration plan | Google Sheets result payload and upload client for completed rounds |
| Automated verification | Reports from development stages | EditMode and PlayMode suites included with the Unity source |

### Added

- Complete Unity 6.3 LTS source snapshot and required `.meta` files.
- Home screen based on the approved Kitchen Catch UI, including profile management and difficulty badges.
- Gameplay HUD, game-rules overlay, pause menu and global audio settings.
- Results screen with summary and expandable detailed round information.
- Three environment presentations linked to difficulty.
- Food and rubbish item tracking in the final result.
- Google Sheets upload payload containing profile, round, score, item, combo and available input statistics.
- Editor authoring utilities and automated EditMode/PlayMode tests.
- `VERSION` file and Unity `bundleVersion` set to `2.0.0`.

### Changed

- Increased the mascot catch area to make food collection more forgiving.
- Corrected the engineer helmet position and provided separate left- and right-facing artwork while keeping `IoTE` readable.
- Updated the menu, gameplay and results layouts to the approved warm kitchen visual system.
- Moved audio controls into global settings rather than storing them per profile.
- Aligned scene difficulty references with the shared GameplayRig prefab.
- Updated the approved lobby, gameplay and running audio levels and added the Chomping catch sound hook.

### Verification

- Unity `6000.3.25f1` EditMode: 151 passed, 0 failed.
- Unity `6000.3.25f1` PlayMode: 100 passed, 0 failed.
- Required Unity assets were checked for matching `.meta` files.
- A fresh WebGL build was not produced during Version 2.0.0 release preparation.

### Known limitations

- ESP32, physical FSR input, serial/MQTT and Node-RED communication are not integrated in this release.
- Keyboard input is simulated `0%`/`100%` input and does not produce calibrated force measurements.
- Local two-player Versus mode remains a design draft and is not part of Version 2.0.0.
- Demo MP3s and `FFSpokenTrial-Regular.ttf` require replacement or license verification before public distribution.

## Version 1.0.0 — 2026-10-20

Initial repository baseline for CPS Kitchen Catch.

### Included

- Approved game concept and Unity implementation specification.
- Character, item, kitchen background and UI production artwork.
- Gameplay, combo-rank, death and result-screen design references.
- Asset provenance, setup notes and staged verification records.
- Classroom demo audio source files and attribution notes.

The playable Unity checkout was maintained outside this repository at this version.
