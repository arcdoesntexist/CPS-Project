const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const file = path.join(__dirname, '../../Assets/Plugins/WebGL/CpsSerial.jslib');
function harness({ secure = true, supported = true, request, openError, open, readError, writeError, chunks = [] } = {}) {
    const sent = [], elements = [];
    let requests = 0, closed = 0, writes = [];
    const port = {
        open: async options => { assert.equal(options.baudRate, 115200); if (openError) throw Error('port in use'); if (open) await open(); },
        close: async () => { closed++; },
        readable: { getReader() { return { read: () => readError ? Promise.reject(Error('read failed')) : chunks.length ? Promise.resolve({ value: new TextEncoder().encode(chunks.shift()), done: false }) : new Promise(() => {}), cancel: async () => {}, releaseLock() {} }; } },
        writable: { getWriter() { return { write: async bytes => { if (writeError) throw Error('write failed'); writes.push(new TextDecoder().decode(bytes)); }, close: async () => {}, releaseLock() {} }; } }
    };
    const library = {};
    const context = {
        navigator: supported ? { serial: { requestPort: () => { requests++; return request ? request(port) : Promise.resolve(port); } } } : {},
        window: { isSecureContext: secure },
        document: { body: { appendChild: node => elements.push(node) }, createElement: () => ({ style: {}, setAttribute() {}, remove() { this.removed = true; }, addEventListener(name, handler) { this[name] = handler; } }) },
        Module: { canvas: { getBoundingClientRect: () => ({ left: 10, top: 20, width: 1280, height: 720 }) } },
        SendMessage: (...args) => sent.push(args),
        UTF8ToString: value => value,
        TextDecoder, TextEncoder, Promise, console,
        LibraryManager: { library }, mergeInto: (target, value) => Object.assign(target, value)
    };
    vm.createContext(context); vm.runInContext(fs.readFileSync(file, 'utf8'), context);
    context.CpsSerial = library.$CpsSerial;
    return { library, context, sent, elements, requests: () => requests, closed: () => closed, writes };
}
const settle = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
let failed = 0;
async function test(name, body) { try { await body(); console.log('PASS ' + name); } catch (error) { failed++; console.error('FAIL ' + name + ': ' + error.message); } }
(async () => {
    await test('feature detection and secure context', async () => {
        for (const options of [{ secure: false }, { supported: false }]) {
            const h = harness(options); h.library.CpsSerial_Show('USB', 1, 0, 0, .1, .1);
            assert.ok(h.sent.some(event => event[1] === 'OnWebSerialStatus' && /unsupported/.test(event[2])));
            assert.equal(h.requests(), 0);
        }
    });
    await test('permission request only occurs in native button handler; bounded split lines', async () => {
        const h = harness({ chunks: ['ab', 'c\n' + 'x'.repeat(1025), 'discard\nnext\n'] });
        h.library.CpsSerial_Show('USB', 2, .1, .1, .2, .1);
        assert.equal(h.requests(), 0); assert.equal(h.elements.length, 1);
        assert.equal(h.elements[0].style.left, '138px');
        h.elements[0].click(); await settle();
        assert.equal(h.requests(), 1);
        assert.ok(h.sent.some(e => e[1] === 'OnWebSerialStatus' && e[2] === '2:connected'));
        const lines = h.sent.filter(e => e[1] === 'OnWebSerialChunk').map(e => e[2]);
        assert.deepEqual(lines, ['2:abc\n', '2:next\n']);
        h.library.CpsSerial_Write('t\n'); await settle(); assert.deepEqual(h.writes, ['t\n']);
        h.library.CpsSerial_Close(); await settle(); assert.equal(h.closed(), 1);
    });
    await test('permission cancellation and port-open errors are reported', async () => {
        for (const options of [{ request: () => Promise.reject(Error('cancelled')) }, { openError: true }]) {
            const h = harness(options); h.library.CpsSerial_Show('USB', 3, 0, 0, .1, .1);
            h.elements[0].click(); await settle();
            assert.ok(h.sent.some(e => e[1] === 'OnWebSerialStatus' && /3:error:/.test(e[2])));
        }
    });
    await test('closing panel while picker pending cannot attach a hidden connection', async () => {
        let grant;
        const h = harness({ request: port => new Promise(resolve => { grant = () => resolve(port); }) });
        h.library.CpsSerial_Show('USB', 4, 0, 0, .1, .1);
        h.elements[0].click(); await settle(); h.library.CpsSerial_Hide(); grant(); await settle();
        assert.equal(h.sent.some(e => e[2] === '4:connected'), false);
        assert.ok(h.elements[0].removed);
    });
    await test('read and write failures release the port and report error', async () => {
        for (const options of [{ readError: true }, { writeError: true }]) {
            const h = harness(options); h.library.CpsSerial_Show('USB', 5, 0, 0, .1, .1);
            h.elements[0].click(); await settle();
            if (options.writeError) { h.library.CpsSerial_Write('t\n'); await settle(); }
            assert.ok(h.sent.some(e => /5:error:/.test(e[2])));
            assert.equal(h.closed(), 1);
            assert.equal(h.context.CpsSerial.port, null);
        }
    });
    await test('close during pending open cleans late port without connected callback', async () => {
        let finish;
        const h = harness({ open: () => new Promise(resolve => { finish = resolve; }) });
        h.library.CpsSerial_Show('USB', 6, 0, 0, .1, .1); h.elements[0].click(); await settle();
        h.library.CpsSerial_Close(); finish(); await settle();
        assert.equal(h.sent.some(e => e[2] === '6:connected'), false);
        assert.equal(h.closed(), 1);
    });
    await test('repeated click while picker is pending requests permission once', async () => {
        const h = harness({ request: () => new Promise(() => {}) });
        h.library.CpsSerial_Show('USB', 7, 0, 0, .1, .1);
        h.elements[0].click(); h.elements[0].click(); await settle();
        assert.equal(h.requests(), 1);
    });
    if (failed) process.exitCode = 1;
})();
