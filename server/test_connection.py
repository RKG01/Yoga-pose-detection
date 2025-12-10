#!/usr/bin/env python3.11
"""
Simple HTTP server to test connectivity
Run this to verify your phone can connect to your laptop
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        response = {'status': 'ok', 'message': 'Connection successful!'}
        self.wfile.write(json.dumps(response).encode())
        print(f"✓ Connection from {self.client_address[0]}")

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 8000), SimpleHandler)
    print("=" * 60)
    print("Test server running on http://0.0.0.0:8000")
    print("Try accessing from your phone:")
    print("  http://10.42.0.1:8000")
    print("  http://172.16.142.231:8000")
    print("=" * 60)
    server.serve_forever()
