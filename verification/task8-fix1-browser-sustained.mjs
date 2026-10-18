import fs from 'node:fs';

const outputRoot = 'C:/Users/Arc/Downloads/CPS/Unity_Project/verification/';
const pages = await (await fetch('http://127.0.0.1:9228/json')).json();
const page = pages.find(item => item.type === 'page' && item.url.includes('127.0.0.1:8124'));
if (!page) throw new Error('Development WebGL page not found');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let nextId = 1;
const pending = new Map();
const events = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const handler = pending.get(message.id);
    if (!handler) return;
    pending.delete(message.id);
    if (message.error) handler.reject(new Error(message.error.message));
    else handler.resolve(message.result);
    return;
  }
  if (message.method === 'Runtime.consoleAPICalled' || message.method === 'Runtime.exceptionThrown' || message.method === 'Log.entryAdded')
    events.push(message);
});

function command(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function click(x, y) {
  await command('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  await wait(300);
}

async function type(text) {
  for (const character of text) {
    await command('Input.dispatchKeyEvent', { type: 'char', text: character });
    await wait(20);
  }
}

async function key(key, code, virtualKeyCode) {
  await command('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: virtualKeyCode, nativeVirtualKeyCode: virtualKeyCode });
  await wait(100);
  await command('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: virtualKeyCode, nativeVirtualKeyCode: virtualKeyCode });
}

async function screenshot(name) {
  const result = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(outputRoot + name, Buffer.from(result.data, 'base64'));
}

function consoleText() {
  return events.flatMap(event => {
    if (event.method === 'Runtime.consoleAPICalled')
      return [event.params.args.map(argument => argument.value ?? argument.description ?? '').join(' ')];
    if (event.method === 'Log.entryAdded') return [event.params.entry.text];
    return [event.params.exceptionDetails?.text ?? 'Runtime exception'];
  });
}

async function waitForMetric(previousCount, timeoutMilliseconds) {
  const deadline = Date.now() + timeoutMilliseconds;
  while (Date.now() < deadline) {
    const metrics = consoleText().filter(text => text.includes('CPS_DEV_METRICS'));
    if (metrics.length > previousCount) return metrics.at(-1);
    await wait(250);
  }
  throw new Error('Timed out waiting for CPS_DEV_METRICS');
}

async function selectDifficultyAndStart(x) {
  await click(x, 596);
  await click(781, 643);
  await wait(4500);
}

async function sustainedRound(label, difficultyX) {
  const previousCount = consoleText().filter(text => text.includes('CPS_DEV_METRICS')).length;
  const startedAtUtc = new Date().toISOString();
  await selectDifficultyAndStart(difficultyX);
  const metric = await waitForMetric(previousCount, 75000);
  const completedAtUtc = new Date().toISOString();
  await screenshot(`task8-fix1-browser-${label}-sustained.png`);
  await click(1075, 683);
  await wait(1500);
  return { difficulty: label, startedAtUtc, completedAtUtc, metric };
}

async function forcedTerminal(label, difficultyX, keyName, code, virtualKeyCode) {
  const previousCount = consoleText().filter(text => text.includes('CPS_DEV_METRICS')).length;
  await selectDifficultyAndStart(difficultyX);
  await key(keyName, code, virtualKeyCode);
  const metric = await waitForMetric(previousCount, 10000);
  await screenshot(`task8-fix1-browser-${label}.png`);
  await click(1075, 683);
  await wait(1500);
  return metric;
}

await command('Runtime.enable');
await command('Log.enable');
await command('Page.enable');
await command('Performance.enable');
await command('Page.bringToFront');

await click(781, 426);
await type('Sustained QA');
await click(781, 470);
await wait(1000);
await key('F7', 'F7', 118);
await key('F10', 'F10', 121);

const sustainedRounds = [];
sustainedRounds.push(await sustainedRound('easy', 666));
sustainedRounds.push(await sustainedRound('normal', 781));
sustainedRounds.push(await sustainedRound('hard', 897));
await key('F10', 'F10', 121);
const terminalShortcut = await forcedTerminal('terminal-shortcut', 666, 'F8', 'F8', 119);
const forcedDeath = await forcedTerminal('forced-death', 781, 'F9', 'F9', 120);

const performance = await command('Performance.getMetrics');
const text = consoleText();
const report = {
  url: page.url,
  capturedAtUtc: new Date().toISOString(),
  sustainedRounds,
  terminalShortcut,
  forcedDeath,
  metrics: text.filter(value => value.includes('CPS_DEV_METRICS')),
  consoleErrors: text.filter(value => /error|exception|failed/i.test(value) && !value.includes('CPS_DEV_METRICS')),
  shaderEvents: events.filter(event => JSON.stringify(event).includes('ERROR: Shader')),
  performance: performance.metrics
};
fs.writeFileSync(outputRoot + 'task8-fix1-browser-sustained.json', JSON.stringify(report, null, 2));
socket.close();
