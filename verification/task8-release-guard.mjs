import fs from 'node:fs';

const endpoint = 'http://127.0.0.1:9227';
const pages = await (await fetch(endpoint + '/json')).json();
const page = pages.find(item => item.type === 'page');
if (!page) throw new Error('Release WebGL page not found');
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
  if (message.method === 'Runtime.consoleAPICalled' || message.method === 'Runtime.exceptionThrown' ||
      message.method === 'Network.loadingFailed' || message.method === 'Network.responseReceived' ||
      message.method === 'Log.entryAdded') events.push(message);
});

function command(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

await command('Runtime.enable');
await command('Page.enable');
await command('Network.enable');
await command('Log.enable');
await command('Page.navigate', { url: 'http://127.0.0.1:8123/' });

let state;
for (let i = 0; i < 120; i++) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  state = await evaluate(`(() => {
    const canvas = document.querySelector('#unity-canvas');
    const loading = document.querySelector('#unity-loading-bar');
    const rect = canvas && canvas.getBoundingClientRect();
    return { ready: document.readyState, loading: loading && getComputedStyle(loading).display,
      canvas: rect && { x: rect.x, y: rect.y, width: rect.width, height: rect.height,
        bufferWidth: canvas.width, bufferHeight: canvas.height } };
  })()`);
  if (state.ready === 'complete' && state.loading === 'none') break;
}
if (!state || state.loading !== 'none') throw new Error('Release Unity loading did not finish');
await new Promise(resolve => setTimeout(resolve, 10000));

const screenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
fs.writeFileSync('C:/Users/Arc/Downloads/CPS/Unity_Project/verification/task8-release-guard.png', Buffer.from(screenshot.data, 'base64'));
const responses = events.filter(event => event.method === 'Network.responseReceived').map(event => ({
  url: event.params.response.url,
  status: event.params.response.status,
  mimeType: event.params.response.mimeType
}));
const errors = events.filter(event => event.method === 'Runtime.exceptionThrown' || event.method === 'Network.loadingFailed' ||
  event.method === 'Log.entryAdded' && event.params.entry.level === 'error');
fs.writeFileSync('C:/Users/Arc/Downloads/CPS/Unity_Project/verification/task8-release-guard.json', JSON.stringify({ state, responses, errors }, null, 2));
socket.close();
