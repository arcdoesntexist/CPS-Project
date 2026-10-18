from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class WebGLHandler(SimpleHTTPRequestHandler):
    def guess_type(self, path):
        if path.endswith(".wasm.br"):
            return "application/wasm"
        if path.endswith(".js.br"):
            return "application/javascript"
        if path.endswith(".data.br"):
            return "application/octet-stream"
        return super().guess_type(path)

    def end_headers(self):
        if self.path.endswith(".br"):
            self.send_header("Content-Encoding", "br")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


handler = partial(WebGLHandler, directory=r"C:\Users\Arc\Unity\CPS-Project\Builds\WebGL")
ThreadingHTTPServer(("127.0.0.1", 8123), handler).serve_forever()
