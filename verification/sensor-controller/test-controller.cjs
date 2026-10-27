const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const fixture = JSON.parse(readFileSync(path.join(__dirname, '../../sensor-protocol/fixtures/released-v1.json'), 'utf8'));
let failed = 0;
for (const name of ['released', 'midpoint', 'clamp', 'load', 'missing', 'recovery', 'stale', 'average', 'tare-dropout', 'rollover']) {
    try {
        const output = execFileSync(path.join(__dirname, 'test_controller.exe'), [name], { encoding: 'utf8', timeout: 5000 });
        const lines = output.trim().split(/\r?\n/).filter(line => line.startsWith('{'));
        assert.ok(lines.length >= 10, 'Missing continuous telemetry');
        const frames = lines.map(line => { assert.ok(line.length <= 1024); return JSON.parse(line); });
        for (const frame of frames) {
            assert.deepEqual(Object.keys(frame).sort(), Object.keys(fixture).sort());
            assert.equal(frame.version, 1);
            assert.equal(frame.bootId, 17);
            assert.equal(frame.calibrationVersion, fixture.calibrationVersion);
            assert.ok(frame.fsrLeftPercent >= 0 && frame.fsrLeftPercent <= 100);
            assert.ok(frame.fsrRightPercent >= 0 && frame.fsrRightPercent <= 100);
            for (const side of ['Left','Right']) {
                assert.equal(typeof frame[`load${side}Valid`], 'boolean');
                assert.equal(typeof frame[`load${side}Tared`], 'boolean');
                if (!frame[`load${side}Valid`]) {
                    assert.equal(frame[`load${side}N`], null);
                    assert.equal(frame[`load${side}AgeMs`], null);
                } else {
                    assert.equal(frame[`load${side}Tared`], true);
                    assert.ok(Number.isFinite(frame[`load${side}N`]));
                    assert.ok(frame[`load${side}AgeMs`] < 750);
                }
            }
        }
        const last = frames.at(-1);
        if (name === 'released' || name === 'rollover') {
            assert.equal(last.fsrLeftPercent, 0); assert.equal(last.fsrRightPercent, 0);
            assert.equal(last.loadLeftValid, false); assert.equal(last.tareId, 0);
        }
        if (name === 'midpoint') {
            assert.ok(Math.abs(last.fsrLeftPercent - 50) < .02);
            assert.ok(Math.abs(last.fsrRightPercent - 50) < .02);
        }
        if (name === 'clamp') { assert.equal(last.fsrLeftPercent, 100); assert.equal(last.fsrRightPercent, 100); }
        if (name === 'load') {
            assert.equal(last.tareId, 1);
            assert.ok(Math.abs(last.loadLeftN - .980665) < .0001);
            assert.ok(Math.abs(last.loadRightN - .980665) < .0001);
        }
        if (name === 'missing' || name === 'tare-dropout') {
            assert.equal(last.loadLeftTared, false); assert.equal(last.loadLeftValid, false);
            assert.equal(last.loadRightValid, true);
        }
        if (name === 'recovery') { assert.equal(last.tareId, 2); assert.equal(last.loadLeftValid, true); assert.equal(last.loadLeftN, 0); }
        if (name === 'stale') { assert.equal(last.loadLeftValid, false); assert.equal(last.loadRightValid, true); }
        if (name === 'average') assert.ok(Math.abs(last.loadLeftN - .326888) < .0001);
        console.log(`PASS ${name}`);
    } catch (error) { console.error(`FAIL ${name}: ${error.message}`); failed++; }
}
if (failed) process.exit(1);
console.log('10/10 combined firmware host cases passed.');
