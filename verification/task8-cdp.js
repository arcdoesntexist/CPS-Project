import fs from 'node:fs';

const endpoint = 'http://127.0.0.1:9223';
const pages = await (await fetch(endpoint + '/json')).json();
const page = pages.find(item => item.type === 'page' && item.url.includes('127.0.0.1:8123'));
if (!page) throw new Error('WebGL page not found');

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
    if (handler) {
      pending.delete(message.id);
      if (message.error) handler.reject(new Error(message.error.message));
      else handler.resolve(message.result);
    }
  } else if (message.method) {
    if (message.method === 'Runtime.consoleAPICalled' ||
        message.method === 'Runtime.exceptionThrown' ||
        message.method === 'Network.loadingFailed' ||
        message.method === 'Log.entryAdded') events.push(message);
  }
});

function command(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

for (const domain of ['Runtime.enable', 'Page.enable', 'Network.enable', 'Log.enable', 'Performance.enable'])
  await command(domain);

async function evaluate(expression, awaitPromise = false) {
  const result = await command('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

let state;
for (let i = 0; i < 120; i++) {
  state = await evaluate(`(() => {
    const canvas = document.querySelector('#unity-canvas');
    const loading = document.querySelector('#unity-loading-bar');
    const rect = canvas && canvas.getBoundingClientRect();
    return { ready: document.readyState, loading: loading && getComputedStyle(loading).display,
      canvas: rect && { x: rect.x, y: rect.y, width: rect.width, height: rect.height,
        bufferWidth: canvas.width, bufferHeight: canvas.height } };
  })()`);
  if (state.ready === 'complete' && state.loading === 'none') break;
  await new Promise(resolve => setTimeout(resolve, 1000));
}
if (!state || state.loading !== 'none') throw new Error('Unity loading did not finish');

const raf = await evaluate(`new Promise(resolve => {
  const samples = [];
  function frame(t) {
    samples.push(t);
    if (samples.length > 1 && t - samples[0] >= 5000) {
      const elapsed = t - samples[0];
      const intervals = samples.slice(1).map((value, index) => value - samples[index]);
      resolve({ frames: intervals.length, elapsedMs: elapsed,
        fps: intervals.length * 1000 / elapsed,
        meanFrameMs: intervals.reduce((a, b) => a + b, 0) / intervals.length,
        maxFrameMs: Math.max(...intervals) });
    } else requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})`, true);
const metrics = await command('Performance.getMetrics');
const screenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
fs.writeFileSync('C:/Users/Arc/Downloads/CPS/Unity_Project/verification/task8-browser-loaded.png', Buffer.from(screenshot.data, 'base64'));
fs.writeFileSync('C:/Users/Arc/Downloads/CPS/Unity_Project/verification/task8-browser-loaded.json', JSON.stringify({ state, raf, metrics: metrics.metrics, events }, null, 2));
socket.close();
console.log(JSON.stringify({ state, raf, eventCount: events.length }));
