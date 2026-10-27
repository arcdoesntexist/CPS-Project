#pragma once
#include "Arduino.h"
class HX711 {
    uint32_t previousSample = 0;
public:
    bool ready = true;
    float raw = 0;
    void begin(uint8_t, uint8_t, bool = false, bool doReset = true) {
        if (doReset) throw std::runtime_error("Blocking begin/reset path is not allowed");
    }
    void power_down() {}
    void power_up() {}
    bool is_ready() { return ready && static_cast<uint32_t>(testTime - previousSample) >= 100; }
    float read() {
        if (!is_ready()) throw std::runtime_error("Read before ready would block");
        previousSample = testTime;
        return raw;
    }
};
