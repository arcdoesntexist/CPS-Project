#include <cmath>
#include <iostream>
#include <regex>
#include "HX711.h"
#include "../../HX711_Reading/HX711_Reading.ino"

void require(bool condition, const char* message) {
    if (!condition) throw std::runtime_error(message);
}

void clearOutput() { Serial.output.str(""); Serial.output.clear(); }

void expectReading(int channel, float grams, float newtons) {
    std::string text = Serial.output.str();
    std::regex pattern("CH" + std::to_string(channel) +
        "[^\\n]*?(-?[0-9]+\\.[0-9]+) g \\| Estimated Force: (-?[0-9]+\\.[0-9]+) N");
    std::smatch match;
    require(std::regex_search(text, match, pattern), "Missing calibrated grams/N output");
    require(std::fabs(std::stof(match[1]) - grams) < .02f, "Incorrect grams or sign");
    require(std::fabs(std::stof(match[2]) - newtons) < .0002f, "Incorrect Newton conversion or sign");
}

int main(int argc, char** argv) {
    try {
        require(argc == 2, "Expected test case argument");
        std::string test = argv[1];
        scale1.raw = 1000;
        scale2.raw = -2000;
        if (test == "missing" || test == "recovery") scale1.ready = false;
        if (test == "tare-dropout") scale1.readsUntilDisconnect = 2;
        setup();
        clearOutput();
        if (test == "conversion" || test == "negative") {
            float sign = test == "negative" ? -1.f : 1.f;
            scale1.raw = 1000 - 244984 * sign;
            scale2.raw = -2000 - 42911 * sign;
            loop();
            expectReading(1, 100 * sign, .980665f * sign);
            expectReading(2, 100 * sign, .980665f * sign);
        } else if (test == "missing" || test == "tare-dropout") {
            scale2.raw = -44911;
            loop();
            require(Serial.output.str().find("CH1: not calibrated") != std::string::npos,
                "Failed tare must not emit calibrated force");
            expectReading(2, 100, .980665f);
        } else if (test == "recovery") {
            scale1.ready = true;
            scale1.raw = 7000;
            Serial.input = {'t', '\r', '\n'};
            loop();
            clearOutput();
            scale1.raw = -237984;
            loop();
            expectReading(1, 100, .980665f);
        } else if (test == "commands") {
            scale1.raw = -243984;
            scale2.raw = -44911;
            Serial.input = {'\r', '\n', 'x'};
            loop();
            expectReading(1, 100, .980665f);
            clearOutput();
            Serial.input = {'T', '\r', '\n'};
            loop();
            clearOutput();
            loop();
            expectReading(1, 0, 0);
            expectReading(2, 0, 0);
        } else if (test == "disconnect" || test == "retare-failure") {
            scale1.ready = false;
            scale2.raw = -44911;
            if (test == "retare-failure") Serial.input = {'t'};
            loop();
            require(Serial.output.str().find(test == "retare-failure" ?
                "CH1: not calibrated" : "CH1: not ready") != std::string::npos,
                "Missing explicit unavailable status");
            if (test == "disconnect") expectReading(2, 100, .980665f);
            else expectReading(2, 0, 0);
        } else if (test == "read-dropout") {
            scale1.readsUntilDisconnect = 1;
            scale2.raw = -44911;
            loop();
            require(Serial.output.str().find("CH1: not ready") != std::string::npos,
                "Partial average must not be emitted");
            expectReading(2, 100, .980665f);
        } else throw std::runtime_error("Unknown test case");
        std::cout << "PASS " << test << '\n';
        return 0;
    } catch (const std::exception& error) {
        std::cerr << "FAIL " << error.what() << '\n';
        return 1;
    }
}
