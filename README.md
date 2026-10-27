# CPS Kitchen Catch

CPS Kitchen Catch is a university Cyber-Physical Systems and Sensor project that turns two-hand physical input into a short arcade game. The player moves a mascot left and right to catch food, avoid rubbish, build a combo rank and survive a 60-second round. After each round, the system records gameplay and hand-input statistics for later review.

The project is designed as an educational rehabilitation-style activity rather than a clinically validated treatment or medical device. Its purpose is to demonstrate how a physical controller, an interactive application and cloud data collection can operate as one cyber-physical system.

## Why this project exists

The course brief asks for a deployable web game controlled by two physical inputs, multiple difficulty levels, a combo system and cloud-based result storage. The resulting system is intended to make repeated left- and right-hand activity more engaging while producing structured data that can be used to observe performance over multiple sessions.

The complete concept has three connected parts:

1. **Unity Web Application** — presents the game, profiles, difficulty levels, scoring, combo feedback and round results.
2. **ESP32 and sensors** — provide separate left- and right-hand values over USB, using either FSR relative press levels or HX711 Load Cell force estimates.
3. **Cloud result storage** — stores player, score, time, difficulty and input statistics for later analysis. This project uses a Google Sheets web endpoint rather than Firebase.

## Current Version 2.1.0 scope

This repository contains the Unity gameplay client, combined ESP32 firmware, documentation and automated tests. Version 2.1.0 adds selectable USB controllers. The user has confirmed successful gameplay and replaced the left FSR; the committed firmware retains their updated endpoint values.

| System area | Version 2.1.0 status |
| --- | --- |
| Unity game and menu flow | Implemented |
| Local player profiles | Implemented |
| Easy, Normal and Hard modes | Implemented |
| Score, HP and D-to-SSS combo ranks | Implemented |
| Kitchen, daytime cafe and nighttime cafe environments | Implemented |
| Round results and item statistics | Implemented |
| Google Sheets result upload | Implemented |
| Keyboard simulation for two hand inputs | Implemented |
| ESP32 and physical sensor input | Selectable FSR or Load Cell input from one board |
| USB serial | Windows Unity Editor; Web Serial in a supported desktop browser |
| Force values in newtons | Estimated N for tared, fresh Load Cell input; FSR and keyboard do not report N |
| MQTT and Node-RED communication | Not included in this release |
| Local two-player Versus mode | Design draft only; not included in Version 2.1.0 |

## Gameplay

1. Create a nickname profile or select an existing profile.
2. Choose Easy, Normal or Hard.
3. Move the mascot with the left and right inputs.
4. Catch apples, bread and cake to score and extend the combo.
5. Avoid cans and banana peels. Eating rubbish reduces HP.
6. Survive the 60-second round for a Triumph result, or continue to Results when HP reaches zero.
7. Review the final score, highest rank, item counts and available input statistics.

Difficulty changes the falling speed, spawn interval, rubbish probability and visual environment. Easy contains no rubbish, while Normal and Hard introduce hazards and progressively faster spawning.

### Development controls

- `A` or Left Arrow: simulate the left-hand input.
- `D`, `B` or Right Arrow: simulate the right-hand input.
- Spacebar or Escape: Pause/Resume, with typing, modal and sensor-readiness guards.
- Keyboard strength is binary and displayed as `0%` or `100%`.
- Keyboard input must not be interpreted as measured force in newtons.

### USB controller setup

1. Upload [Sensor_Controller.ino](Sensor_Controller/Sensor_Controller.ino) to the ESP32, then close Serial Monitor.
2. On Home, open **Controller** and select Keyboard, FSR or Load Cell. This selection is global, independent of the selected profile.
3. In Windows Editor, select the board's COM port and Connect USB. In a Web Serial browser, open the game on HTTPS or localhost and click Connect USB to choose the port. Both use 115200 baud.
4. FSR shows relative press levels from 0–100%. For Load Cell, unload both sensors and press **Tare**, then wait for fresh readings before starting.

| Input | ESP32 pins | Current firmware values |
| --- | --- | --- |
| Left FSR, replacement in 2.1.0 | GPIO34 | Released 4095; reference press 156.5 |
| Right FSR | GPIO35 | Released 4095; reference press 156.5 |
| Left Load Cell, 1 kg | DT32 / SCK18 | −2449.84 counts/g |
| Right Load Cell, 5 kg | DT33 / SCK4 | −429.11 counts/g |

The single firmware supports switching controller type without reflashing. The round locks its controller mode and thresholds. Stale input, USB loss or a board restart pauses the game before further gameplay updates; recover through Controller in Pause, then resume explicitly.

Thresholds are editable in `Assets/CPS/Resources/ControllerSettings.asset`: FSR press/release 20%/15%, Load Cell 0.50/0.30 N, separately for each hand. Load Cell calibration remains provisional; validate known weights after assembly. Both FSR release readings are at the ADC ceiling, so some wiring faults cannot be distinguished from release.

See the [USB controller guide](docs/unity-usb-controller-guide.md) and [firmware README](Sensor_Controller/README.md) for details. The bench sketches in `FSR_Reading` and `HX711_Reading` retain their earlier standalone calibration workflows.

## Data recorded after a round

The result payload can include:

- Session and profile identifiers
- Display name and difficulty
- End reason, play duration, score and remaining HP
- Food caught, food missed and rubbish eaten
- Maximum combo and highest rank
- Input source and left/right activity duration
- Normalized strength statistics
- Force and balance statistics when a calibrated sensor source supplies them

Profiles are local nicknames, not authenticated accounts. The project does not provide clinical interpretation of the recorded data.

## Technology

- Unity `6000.3.25f1` / Unity 6.3 LTS
- Universal Render Pipeline 2D and Unity uGUI
- Unity Input System
- ESP32, HX711 and versioned USB JSON telemetry
- Google Apps Script and Google Sheets result endpoint
- Target platform: WebGL in a desktop browser, landscape orientation

## Open and test the project

1. Clone this repository.
2. Open the repository root in Unity `6000.3.25f1`.
3. Open `Assets/CPS/Scenes/Boot.unity`.
4. Enter Play Mode.

See the [Unity setup and WebGL guide](docs/unity-setup-guide.md) for build instructions and the [playtest checklist](docs/unity-playtest-checklist.md) for the expected flow.

The committed Unity project consists of `Assets`, `Packages` and `ProjectSettings`. Generated folders such as `Library`, `Temp`, `Logs`, local builds and IDE project files are intentionally excluded.

## Version history

See [CHANGELOG.md](CHANGELOG.md) for Version 2.1.0 and earlier changes. `VERSION` and Unity `bundleVersion` are both `2.1.0`; the wire-protocol version remains `1`.

## Verification

The USB implementation passed 189/189 EditMode tests, 106/107 PlayMode tests, seven JS bridge tests and ten combined-firmware host cases. The remaining PlayMode failure is an existing audio-volume expectation (0.3 expected versus the configured 0.99). WebGL was built successfully and checked in a browser. The user subsequently confirmed gameplay with their replacement left FSR; its host-test ADC inputs now match the revised firmware.

Detailed evidence and remaining calibration/device checks are recorded in [the USB verification report](verification/unity-usb/RESULTS.md). Keyboard/FSR results have no measured force; Load Cell results show Max/Average N without inventing percentage measurements. The numeric controller readouts use a fallback font because the trial font's percent glyph is blank.

## Temporary classroom assets

The repository retains classroom-demo audio sources in `sound` and temporarily embeds `FFSpokenTrial-Regular.ttf`. Their presence records the material used during development and does not establish redistribution rights. Replace them with properly licensed production assets before publishing the game outside the coursework demonstration.

Runtime audio in `Assets/CPS/Resources/LocalDemoAudio` remains local and ignored by Git. For the classroom setup, copy the supplied MP3s from `sound` into that folder with their existing filenames; otherwise the optional local audio remains silent.

The recorded audio source links and detailed asset provenance are available in [the font and audio brief](docs/unity-font-audio-brief.md) and [the asset provenance report](docs/unity-asset-provenance.md).
