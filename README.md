# CPS Kitchen Catch

Version 2.0.0 is a complete Unity 6.3 LTS project. Clone this repository and open its root folder with Unity `6000.3.25f1`. The playable flow remains Single Player: create or select a profile, choose Easy/Normal/Hard, play a 60-second round, then review results. See [the setup guide](docs/unity-setup-guide.md) for testing and WebGL build instructions.

The Unity source committed for this release is limited to `Assets`, `Packages`, and `ProjectSettings`. Unity caches, generated IDE files, user settings, local builds and raw release-test output are intentionally excluded.

See [CHANGELOG.md](CHANGELOG.md) for the difference between Version 1.0.0 and Version 2.0.0.

## Temporary classroom demo audio

Six user-provided MP3s are retained in `sound` as classroom-demo source material. Runtime copies under `Assets/CPS/Resources/LocalDemoAudio` are excluded from the Unity snapshot. The game loads them by name when present and stays silent when the folder is absent.

| Local clip | Source URL |
| --- | --- |
| Triumph | https://www.youtube.com/watch?v=PsIzcEZZKgw |
| Death | https://www.youtube.com/watch?v=z5_xeFV1pvw |
| Gameplay | https://www.youtube.com/watch?v=7PvYu-1iEbY |
| Lobby | https://www.youtube.com/watch?v=MeCWuFZMQzA |
| Running | https://www.youtube.com/watch?v=KCzqiv0HrHc |
| Chomping | User-provided local file; source URL not recorded |

These URLs record provenance, not a license or permission to redistribute. The Death clip traces to Rockstar Games' *Red Dead Redemption 2*. No production or public distribution rights have been verified for these MP3s. Before making a distributable build, delete or move `Assets/CPS/Resources/LocalDemoAudio` out of the Unity project, then rebuild. This also disables the local demo music and sound without changing code.

Hurt, rank-up, UI confirm, countdown, and go sound effects remain missing. A licensed production font and production audio also remain pending.

The Main Menu and Pause screen now share global audio settings stored outside player profiles. Master Volume reaches `+12 dB` at 100, and Background Music disables only Lobby/Gameplay music while keeping gameplay sound effects enabled.

`FFSpokenTrial-Regular.ttf` is embedded temporarily for the classroom UI. It is a trial font with no redistribution license recorded in this repository, and its Thai glyph coverage has not been verified. Replace it with a licensed font before distributing the game.
