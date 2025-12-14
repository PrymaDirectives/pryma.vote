import ssl
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer, SimpleHTTPRequestHandler


class RedirectHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _redirect(self):
        host = (self.headers.get("Host") or "localhost").strip()
        location = f"https://{host}{self.path}"
        self.send_response(301)
        self.send_header("Location", location)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        self._redirect()

    def do_HEAD(self):
        self._redirect()

    def do_POST(self):
        self._redirect()

    def do_PUT(self):
        self._redirect()

    def do_DELETE(self):
        self._redirect()

    def do_PATCH(self):
        self._redirect()

    def do_OPTIONS(self):
        self._redirect()


def create_https_server():
    https_server = HTTPServer(("0.0.0.0", 443), SimpleHTTPRequestHandler)
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain("cert.pem", "key.pem")
    https_server.socket = context.wrap_socket(https_server.socket, server_side=True)
    return https_server


def create_http_redirect_server():
    return HTTPServer(("0.0.0.0", 80), RedirectHandler)


if __name__ == "__main__":
    https_server = create_https_server()
    redirect_server = create_http_redirect_server()

    print("Starting HTTPS server on port 443")
    print("Starting HTTP redirect server on port 80")

    threads = [
        threading.Thread(target=https_server.serve_forever, name="https-server"),
        threading.Thread(target=redirect_server.serve_forever, name="http-redirect"),
    ]

    for thread in threads:
        thread.start()

    try:
        for thread in threads:
            thread.join()
    except KeyboardInterrupt:
        https_server.shutdown()
        redirect_server.shutdown()
    finally:
        https_server.server_close()
        redirect_server.server_close()
