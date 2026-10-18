import fs from 'node:fs';

const pages = await (await fetch('http://127.0.0.1:9228/json')).json();
const page = pages.find(item => item.type === 'page');
if (!page) throw new Error('Development browser page not found');
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
  } else if (message.method === 'Runtime.consoleAPICalled' || message.method === 'Runtime.exceptionThrown' || message.method === 'Log.entryAdded') {
    events.push(message);
  }
});
function command(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
await command('Runtime.enable');
await command('Log.enable');
await command('Page.enable');
await command('Page.navigate', { url: 'http://127.0.0.1:8124/' });
await new Promise(resolve => setTimeout(resolve, 20000));

const shaderEvents = events.filter(event => event.method === 'Runtime.consoleAPICalled' &&
  event.params.args.some(argument => argument.value === 'ERROR: Shader'));
const details = [];
for (const event of shaderEvents) {
  const item = { event, objectProperties: [] };
  for (const argument of event.params.args) {
    if (argument.objectId) {
      const properties = await command('Runtime.getProperties', { objectId: argument.objectId, ownProperties: true });
      item.objectProperties.push(properties);
    }
  }
  details.push(item);
}
fs.writeFileSync('C:/Users/Arc/Downloads/CPS/Unity_Project/verification/task8-dev-shader-console.json', JSON.stringify({ shaderEventCount: shaderEvents.length, details }, null, 2));
const screenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
fs.writeFileSync('C:/Users/Arc/Downloads/CPS/Unity_Project/verification/task8-dev-shader-console.png', Buffer.from(screenshot.data, 'base64'));
socket.close();
