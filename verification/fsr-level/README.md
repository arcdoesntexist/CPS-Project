# FSR level verification

Run from project root:

```powershell
& .\verification\fsr-level\Test-Sketch.ps1
& .\verification\hx711-calibration\Test-Sketch.ps1
```

FSR: 8/8 passed (released, pressed, midpoint, independent channels, lower/upper clamp, filter transition, timer rollover). All eight failed on the old sketch with missing percentage output before implementation. Actual sketch is included by the host test; only ADC/Serial/time are substituted. HX711 regression checks remain 9/9 passing.

Compile only:

```powershell
arduino-cli compile --config-file verification/hx711-calibration/arduino-cli.yaml --fqbn esp32:esp32:esp32 --build-path verification/fsr-level/build FSR_Reading
```

ESP32 core 3.3.12: successful build, program 278640 bytes, global RAM 22220 bytes. Full output in compile.log. Generic ESP32 validates source compatibility, not the user's exact board selection or hardware calibration. No upload or physical input test performed. No extra library installed.

Measured endpoints are from Yahoo.txt and the user's confirmation; right idle 4095 is saturated and does not establish light-press resolution or disconnected-sensor detection. No dead-zone, automatic calibration or gameplay thresholds were added. See FSR_Reading/README.md for bench instructions.
