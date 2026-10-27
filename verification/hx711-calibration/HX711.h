#pragma once
#include <cstdint>
#include <deque>
#include <iomanip>
#include <sstream>
#include <stdexcept>
#include <string>

struct TestSerial {
    std::ostringstream output;
    std::deque<char> input;
    void begin(int) {}
    int available() { return static_cast<int>(input.size()); }
    int read() { char value = input.front(); input.pop_front(); return value; }
    template<class T> void print(T value) { output << value; }
    void print(float value, int digits) { output << std::fixed << std::setprecision(digits) << value; }
    template<class T> void println(T value) { print(value); output << '\n'; }
    void println(float value, int digits) { print(value, digits); output << '\n'; }
    void println() { output << '\n'; }
} inline Serial;

inline void delay(unsigned long) {}

class HX711 {
    float factor = 1;
    int32_t offset = 0;
public:
    bool ready = true;
    float raw = 0;
    int readsUntilDisconnect = -1;
    void begin(uint8_t, uint8_t, bool = false, bool doReset = true) {
        if (doReset) read();
    }
    void power_down() {}
    void power_up() {}
    bool is_ready() { return ready; }
    bool wait_ready_timeout(uint32_t timeout = 1000, uint32_t = 0) {
        if (timeout == 0 || timeout > 2000) throw std::runtime_error("Invalid readiness timeout");
        return ready;
    }
    float read() {
        if (!ready) throw std::runtime_error("Attempted blocking read on unavailable channel");
        if (readsUntilDisconnect > 0 && --readsUntilDisconnect == 0) ready = false;
        return raw;
    }
    float read_average(uint8_t count = 10) {
        float sum = 0;
        for (uint8_t i = 0; i < count; ++i) sum += read();
        return sum / count;
    }
    void tare(uint8_t count = 10) { offset = static_cast<int32_t>(read_average(count)); }
    void set_offset(int32_t value) { offset = value; }
    bool set_scale(float value = 1) { factor = value; return value != 0; }
    float get_value(uint8_t count = 1) { return read_average(count) - offset; }
    float get_units(uint8_t count = 1) { return get_value(count) / factor; }
};
