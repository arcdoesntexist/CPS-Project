# Unity setup and WebGL run guide

## Required environment

- Windows demonstration machine used for verification: Unity `6000.3.25f1`, Universal 2D project.
- Install `Web Build Support` for that exact Editor version in Unity Hub. The verified module root is `C:\Program Files\Unity\Hub\Editor\6000.3.25f1\Editor\Data\PlaybackEngines\WebGLSupport` and includes `UnityEditor.WebGL.Extensions.dll` plus Emscripten.
- Project root: the cloned repository root containing `Assets`, `Packages`, and `ProjectSettings`.
- Open `Assets/CPS/Scenes/Boot.unity` before using Play Mode. Boot routes to Main Menu, then the selected profile and difficulty route to Gameplay.

## Play the current build

1. Create a local nickname or select an existing profile.
2. Select Easy, Normal, or Hard and choose Start Cooking.
3. Use `A`/left arrow and `D`/right arrow. Keyboard input is a simulated binary input: released is `0%`, pressed is `100%`.
4. Catch food, avoid trash, and keep HP above zero for the 60-second round. Missing food or catching trash costs one HP.
5. Pause and resume explicitly after browser focus loss. Results offers Restart and Main Menu.

The current game does not report keyboard input as Newtons. Physical-force maximum and average remain unavailable until a real sensor adapter is connected. The external MQTT, Node-RED, and Google Sheets path is outside this Unity-only delivery.

## Build WebGL

Close any open Unity Editor for this checkout, then run:

```powershell
& 'C:\Program Files\Unity\Hub\Editor\6000.3.25f1\Editor\Unity.exe' `
  -batchmode -quit `
  -projectPath 'C:\Users\Arc\Unity\CPS-Project' `
  -buildTarget WebGL `
  -executeMethod CPS.KitchenCatch.Editor.WebGLBuild.Build `
  -logFile 'C:\Users\Arc\Downloads\CPS\Unity_Project\verification\task8-webgl-build.log'
```

The build entry point refuses missing/disabled Boot, MainMenu, or Gameplay scenes. It opens the effective `GameSessionController` instance from `Gameplay.unity`, then rejects missing references, controller/spawner player mismatches, and invalid difficulty/object definitions before building. A successful release is written to `Builds/WebGL`. Build output is generated delivery material and is intentionally not committed.

## Serve locally

Do not open `index.html` through a `file://` URL. Serve the folder over HTTP with the correct Brotli and MIME headers, or use Unity's Build and Run. In particular:

- `*.wasm.br`: `Content-Type: application/wasm`, `Content-Encoding: br`
- `*.js.br`: `Content-Type: application/javascript`, `Content-Encoding: br`
- `*.data.br`: `Content-Type: application/octet-stream`, `Content-Encoding: br`

The Task 8 verification helper is `verification/task8-webgl-server.py`; it binds only to `127.0.0.1:8123` and serves the release folder with those headers.

## Current delivery limits

- The licensed production font and audio are still awaiting user-supplied files. Thai glyph/combining-mark acceptance and audio timing, mix, mute/focus, and WebGL autoplay acceptance remain open.
- The browser build uses keyboard simulation only. Physical sensor, calibrated Newton values, HiveMQ, Node-RED, Google Sheets, and cloud behavior were not claimed or tested.
- Browser background tabs are not expected to sustain foreground frame timing. Resume explicitly after focus returns.
- Difficulty feel and spawn fairness still need a hands-on user playtest. No difficulty values were changed without measured evidence.
