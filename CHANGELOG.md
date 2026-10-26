# Changelog

## 2.0.0 — 2026-10-26

Version 2.0.0 turns this repository into a directly openable Unity 6.3 LTS project. Version 1.0.0 primarily contained design, artwork, verification records and integration documentation while the Unity checkout lived separately.

### Added since 1.0.0

- Complete Unity source snapshot: `Assets`, `Packages` and `ProjectSettings`, with required `.meta` files and Git LFS rules for binary assets.
- Illustrated Home UI, profile selection and profile management with create, rename, select and delete flows.
- Redesigned Gameplay HUD, pause/settings flow, rules overlay and enlarged mascot catch zone.
- Redesigned Results view with difficulty badge, item counts and optional detailed round statistics.
- Easy kitchen, Normal daytime cafe and Hard nighttime cafe environments, including subtle animated decoration.
- Engineer-hat facing and placement fixes, Triumph/death presentation, food burst and dissolve effects.
- Global volume/background-music settings, FF Spoken Trial UI integration and optional local demo-audio loading, including Chomping for caught food.
- Google Sheets result upload support for completed single-player profiles.
- Editor authoring utilities and automated EditMode/PlayMode coverage for the shipped scenes and UI.

### Changed

- Unity application `bundleVersion` is now `2.0.0`.
- Gameplay presentation and UI were brought in line with the approved warm kitchen visual system.
- Scene difficulty references inherit from the shared GameplayRig prefab so Easy, Normal and Hard remain valid without scene overrides.
- Audio tests now match the user-approved lobby, gameplay and running volumes.

### Verification

- Unity `6000.3.25f1` EditMode: 151 passed, 0 failed.
- Unity `6000.3.25f1` PlayMode: 100 passed, 0 failed.
- A fresh WebGL build was not produced during release preparation.

### Current boundaries

- Version 2.0.0 is the completed Single Player game. The proposed local two-player Versus mode is still a draft and is not included.
- STM32/ESP32 serial input, MQTT and Node-RED are not implemented in this Unity release.
- Runtime demo MP3s remain local-only. The committed `sound` files have incomplete redistribution evidence and should be replaced before public distribution.
- `FFSpokenTrial-Regular.ttf` remains a temporary trial font and should be replaced with a licensed font before public distribution.

## 1.0.0

- Initial repository baseline with game design, production artwork, integration documentation, demo audio sources and verification records.
