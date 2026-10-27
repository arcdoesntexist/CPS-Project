#include <cmath>
#include <iostream>
#include <limits>
#include <regex>
#include <stdexcept>
#include <string>
#include "Arduino.h"
#include "../../FSR_Reading/FSR_Reading.ino"

void require(bool condition, const char* message) {
    if (!condition) throw std::runtime_error(message);
}

void step(unsigned long duration = 100) {
    Serial.output.str("");
    Serial.output.clear();
    for (unsigned long elapsed = 0; elapsed < duration; elapsed += 20) {
        testTime += 20;
        loop();
    }
}

float level(const std::string& side) {
    std::string text = Serial.output.str();
    std::regex pattern("FSR " + side + "[^\\n]*level=([0-9]+\\.[0-9]+)%");
    std::sregex_iterator it(text.begin(), text.end(), pattern), end;
    require(it != end, "Missing FSR relative percentage output");
    float result = -1;
    for (; it != end; ++it) result = std::stof((*it)[1]);
    require(result >= 0 && result <= 100, "Out-of-range percentage");
    return result;
}

void expect(float left, float right) {
    require(std::fabs(level("Left") - left) <= .11f, "Incorrect Left percentage");
    require(std::fabs(level("Right") - right) <= .11f, "Incorrect Right percentage");
    require(Serial.output.str().find("raw=") != std::string::npos, "Missing raw diagnostic");
}

int main(int argc, char** argv) {
    try {
        require(argc == 2, "Expected case argument");
        std::string name = argv[1];
        testAdc[34] = 551;
        testAdc[35] = 4095;
        if (name == "pressed" || name == "independent") testAdc[34] = 135;
        if (name == "pressed") testAdc[35] = 156;
        if (name == "midpoint") { testAdc[34] = 343; testAdc[35] = 2126; }
        if (name == "clamp-low") { testAdc[34] = 4095; testAdc[35] = 4095; }
        if (name == "clamp-high") { testAdc[34] = 0; testAdc[35] = 0; }
        if (name == "rollover") testTime = std::numeric_limits<unsigned long>::max() - 59;
        setup();
        step();
        if (name == "released" || name == "clamp-low" || name == "rollover") expect(0, 0);
        else if (name == "pressed" || name == "clamp-high") expect(100, 100);
        else if (name == "midpoint") expect(50, 50);
        else if (name == "independent") expect(100, 0);
        else if (name == "transition") {
            testAdc[34] = 135;
            testAdc[35] = 156;
            step();
            float rising = level("Left");
            require(rising > 0 && rising < 100, "Press must be smoothed, not instantaneous or stuck");
            step(1000);
            expect(100, 100);
            testAdc[34] = 551;
            testAdc[35] = 4095;
            step();
            require(level("Left") > 0 && level("Left") < rising, "Release must decay toward zero");
            step(1000);
            expect(0, 0);
        } else throw std::runtime_error("Unknown case");
        std::cout << "PASS " << name << '\n';
        return 0;
    } catch (const std::exception& error) {
        std::cerr << "FAIL " << error.what() << '\n';
        return 1;
    }
}
