#pragma once
#include <cstdint>
#include <iomanip>
#include <sstream>

inline unsigned long testTime = 0;
inline int testAdc[256] = {};
inline unsigned long millis() { return testTime; }
inline void delay(unsigned long ms) { testTime += ms; }
inline void analogReadResolution(uint8_t) {}
inline uint16_t analogRead(uint8_t pin) { return testAdc[pin]; }
inline float constrain(float value, float low, float high) {
    return value < low ? low : value > high ? high : value;
}

struct TestSerial {
    std::ostringstream output;
    void begin(int) {}
    template<class T> void print(T value) { output << value; }
    void print(float value, int digits) { output << std::fixed << std::setprecision(digits) << value; }
    template<class T> void println(T value) { print(value); output << '\n'; }
    void println(float value, int digits) { print(value, digits); output << '\n'; }
    void println() { output << '\n'; }
} inline Serial;
