# CPS Kitchen Catch

CPS Kitchen Catch is a university Cyber-Physical Systems and Sensor project that turns two-hand physical input into a short arcade game. The player moves a mascot left and right to catch food, avoid rubbish, build a combo rank and survive a 60-second round. After each round, the system records gameplay and hand-input statistics for later review.

The project is designed as an educational rehabilitation-style activity rather than a clinically validated treatment or medical device. Its purpose is to demonstrate how a physical controller, an interactive application and cloud data collection can operate as one cyber-physical system.

## Why this project exists

The course brief asks for a deployable web game controlled by two physical inputs, multiple difficulty levels, a combo system and cloud-based result storage. The resulting system is intended to make repeated left- and right-hand activity more engaging while producing structured data that can be used to observe performance over multiple sessions.

The complete concept has three connected parts:

1. **Unity Web Application** — presents the game, profiles, difficulty levels, scoring, combo feedback and round results.
2. **ESP32 and analog sensors** — provide separate left- and right-hand controller values. The proposed sensor is an FSR402 analog force sensor.
3. **Cloud result storage** — stores player, score, time, difficulty and input statistics for later analysis. This project uses a Google Sheets web endpoint rather than Firebase.

## Current Version 2.0.0 scope

This repository currently contains the complete Unity gameplay client and its automated tests. Hardware communication remains a later integration step.

| System area | Version 2.0.0 status |
| --- | --- |
| Unity game and menu flow | Implemented |
| Local player profiles | Implemented |
| Easy, Normal and Hard modes | Implemented |
| Score, HP and D-to-SSS combo ranks | Implemented |
| Kitchen, daytime cafe and nighttime cafe environments | Implemented |
| Round results and item statistics | Implemented |
| Google Sheets result upload | Implemented |
| Keyboard simulation for two hand inputs | Implemented |
| ESP32 and physical sensor input | Not yet integrated |
| Serial/MQTT and Node-RED communication | Not included in this release |
| Calibrated force values in newtons | Not available without the physical sensor pipeline |
| Local two-player Versus mode | Design draft only; not included in Version 2.0.0 |

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
- `D` or Right Arrow: simulate the right-hand input.
- Keyboard strength is binary and displayed as `0%` or `100%`.
- Keyboard input must not be interpreted as measured force in newtons.

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

See [CHANGELOG.md](CHANGELOG.md) for the differences between Version 1.0.0 and Version 2.0.0.

## Temporary classroom assets

The repository retains classroom-demo audio sources in `sound` and temporarily embeds `FFSpokenTrial-Regular.ttf`. Their presence records the material used during development and does not establish redistribution rights. Replace them with properly licensed production assets before publishing the game outside the coursework demonstration.

The recorded audio source links and detailed asset provenance are available in [the font and audio brief](docs/unity-font-audio-brief.md) and [the asset provenance report](docs/unity-asset-provenance.md).
