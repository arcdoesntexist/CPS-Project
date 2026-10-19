# CPS Kitchen Catch

The Unity project is at `C:\Users\Arc\Unity\CPS-Project`. See [the setup guide](docs/unity-setup-guide.md) for opening, testing, and building the game.

## Temporary classroom demo audio

Five user-provided MP3s are available only in the local Unity checkout at `Assets/CPS/Resources/LocalDemoAudio`. They are for a temporary classroom demonstration and are not committed. The game loads them by name when present and stays silent when the folder is absent.

| Local clip | Source URL |
| --- | --- |
| Triumph | https://www.youtube.com/watch?v=PsIzcEZZKgw |
| Death | https://www.youtube.com/watch?v=z5_xeFV1pvw |
| Gameplay | https://www.youtube.com/watch?v=7PvYu-1iEbY |
| Lobby | https://www.youtube.com/watch?v=MeCWuFZMQzA |
| Running | https://www.youtube.com/watch?v=KCzqiv0HrHc |

These URLs record provenance, not a license or permission to redistribute. The Death clip traces to Rockstar Games' *Red Dead Redemption 2*. No production or public distribution rights have been verified for these MP3s. Before making a distributable build, delete or move `Assets/CPS/Resources/LocalDemoAudio` out of the Unity project, then rebuild. This also disables the local demo music and sound without changing code.

Eat, hurt, rank-up, UI confirm, countdown, and go sound effects remain missing. A licensed production font and production audio also remain pending.

The Main Menu and Pause screen now share global audio settings stored outside player profiles. Master Volume reaches `+12 dB` at 100, and Background Music disables only Lobby/Gameplay music while keeping gameplay sound effects enabled.

`FFSpokenTrial-Regular.ttf` is embedded temporarily for the classroom UI. It is a trial font with no redistribution license recorded in this repository, and its Thai glyph coverage has not been verified. Replace it with a licensed font before distributing the game.
