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
async function click(x, y) {
  await command('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}
async function key(type, key, code, modifiers = 0) {
  await command('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode: key.charCodeAt(0), nativeVirtualKeyCode: key.charCodeAt(0), modifiers });
}
async function screenshot(name) {
  const result = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync('C:/Users/Arc/Downloads/CPS/Unity_Project/verification/' + name, Buffer.from(result.data, 'base64'));
}

await command('Page.bringToFront');
await click(781, 643);
await wait(4500);
await screenshot('task8-browser-easy-playing.png');
await key('keyDown', 'd', 'KeyD');
await wait(700);
await key('keyUp', 'd', 'KeyD');
await wait(11000);
await screenshot('task8-browser-easy-death-results.png');
socket.close();
