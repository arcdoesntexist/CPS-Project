# HX711 verification

Run host checks from the project root:

```powershell
& .\verification\hx711-calibration\Test-Sketch.ps1
```

The test compiles the actual `.ino` with g++ 15.2.0, using hardware substitutes for Serial/HX711 only. All nine cases passed: conversion, negative sign, missing channel, partial tare dropout, recovery, commands/line endings, runtime disconnect, retare failure and incomplete reading discard. Original sketch failed conversion/commands output and missing-device startup checks before implementation.

Board compile command (compile only; no upload):

```powershell
arduino-cli compile --config-file verification/hx711-calibration/arduino-cli.yaml --fqbn esp32:esp32:esp32 --build-path verification/hx711-calibration/build HX711_Reading
```

Result: exit 0; HX711 0.6.5; ESP32 core 3.3.12; program 275236 bytes, globals 22172 bytes. Full compiler result is in compile.log. Generic ESP32 is a representative target, not confirmation of the user's exact board model. Existing installed library/core used; no installation performed.

No physical measurements, uploads, Unity builds or transport tests were performed. The provisional factors still require the user's unloaded/83/228/525 g checks with the actual assembly. Startup and per-sample readiness checks do not eliminate a disconnect occurring between a readiness check and the library's blocking read.
