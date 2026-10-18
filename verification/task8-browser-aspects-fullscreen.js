import fs from 'node:fs';

const pages = await (await fetch('http://127.0.0.1:9223/json')).json();
const page = pages.find(item => item.type === 'page' && item.url.includes('127.0.0.1:8123'));
if (!page) throw new Error('WebGL page not found');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
let nextId = 1;
const pending = new Map();
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (!message.id) return;
  const handler = pending.get(message.id);
  if (!handler) return;
  pending.delete(message.id);
  if (message.error) handler.reject(new Error(message.error.message));
  else handler.resolve(message.result);
});
function command(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function screenshot(name) {
  const result = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync('C:/Users/Arc/Downloads/CPS/Unity_Project/verification/' + name, Buffer.from(result.data, 'base64'));
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true });
  return result.result.value;
}

await command('Emulation.setDeviceMetricsOverride', { width: 1024, height: 768, deviceScaleFactor: 1, mobile: false });
await wait(1000);
await screenshot('task8-browser-aspect-1024x768.png');
await command('Emulation.setDeviceMetricsOverride', { width: 2560, height: 1080, deviceScaleFactor: 1, mobile: false });
await wait(1000);
await screenshot('task8-browser-aspect-2560x1080.png');
await command('Emulation.clearDeviceMetricsOverride');
await wait(1000);
await command('Input.dispatchMouseEvent', { type: 'mousePressed', x: 1411, y: 793, button: 'left', clickCount: 1 });
await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 1411, y: 793, button: 'left', clickCount: 1 });
await wait(1500);
const fullscreen = await evaluate(`(() => { const canvas=document.querySelector('#unity-canvas'); const rect=canvas.getBoundingClientRect(); return { active: !!document.fullscreenElement, width: rect.width, height: rect.height, bufferWidth: canvas.width, bufferHeight: canvas.height }; })()`);
await screenshot('task8-browser-fullscreen.png');
fs.writeFileSync('C:/Users/Arc/Downloads/CPS/Unity_Project/verification/task8-browser-fullscreen.json', JSON.stringify(fullscreen, null, 2));
socket.close();
console.log(JSON.stringify(fullscreen));
