#include <iostream>
#include <limits>
#include <string>
#include "Arduino.h"
#include "../../Sensor_Controller/Sensor_Controller.ino"

void advance(unsigned long duration) {
    for (unsigned long elapsed = 0; elapsed < duration; elapsed += 10) {
        testTime += 10;
        loop();
    }
}

int main(int argc, char** argv) {
    try {
        if (argc != 2) throw std::runtime_error("Expected case argument");
        std::string name = argv[1];
        testAdc[34] = name == "midpoint" ? 2126 : name == "clamp" ? 0 : 4095;
        testAdc[35] = name == "midpoint" ? 2126 : name == "clamp" ? 0 : 4095;
        loadLeft.scale.raw = 1000;
        loadRight.scale.raw = -2000;
        if (name == "missing" || name == "recovery") loadLeft.scale.ready = false;
        if (name == "rollover") testTime = std::numeric_limits<uint32_t>::max() - 250;
        setup();
        if (name == "load" || name == "missing" || name == "recovery" || name == "stale" || name == "average" || name == "tare-dropout") {
            Serial.input = {'t','T','\r','\n'};
            if (name == "tare-dropout") {
                advance(200); loadLeft.scale.ready = false; advance(1200);
            } else advance(1200);
            if (name == "recovery") {
                loadLeft.scale.ready = true; loadLeft.scale.raw = 5000;
                Serial.input = {'t'}; advance(900);
            }
            if (name == "load") {
                loadLeft.scale.raw = -243984; loadRight.scale.raw = -44911; advance(400);
            }
            if (name == "average") { loadLeft.scale.raw = -243984; advance(100); }
            if (name == "stale") { loadLeft.scale.ready = false; advance(900); }
        } else advance(1000);
        std::cout << Serial.output.str();
    } catch (const std::exception& error) {
        std::cerr << error.what() << '\n';
        return 1;
    }
}
