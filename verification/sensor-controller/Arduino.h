#pragma once
#include <cstdint>
#include <deque>
#include <iomanip>
#include <sstream>
#include <stdexcept>
inline uint32_t testTime = 0;
inline int testAdc[256] = {};
inline unsigned long millis() { return testTime; }
inline uint16_t analogRead(uint8_t pin) { return testAdc[pin]; }
inline void analogReadResolution(uint8_t) {}
inline void delay(unsigned long ms) { testTime += ms; }
inline float constrain(float x, float low, float high) { return x < low ? low : x > high ? high : x; }
struct TestSerial {
    std::ostringstream output;
    std::deque<char> input;
    void begin(int) {}
    int available() { return static_cast<int>(input.size()); }
    int read() { char c = input.front(); input.pop_front(); return c; }
    template<class T> void print(T value) { output << value; }
    void print(float value, int digits) { output << std::fixed << std::setprecision(digits) << value; }
    template<class T> void println(T value) { print(value); output << '\n'; }
    void println() { output << '\n'; }
} inline Serial;
