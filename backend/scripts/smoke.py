"""
Simple smoke checks against a running Task Manager API instance.

Usage:
  BASE_URL=http://localhost:4001 API_KEY=yourkey python scripts/smoke.py
"""
import os
import sys
import requests


def main():
    base_url = os.getenv("BASE_URL", "http://localhost:4001")
    api_key = os.getenv("API_KEY")
    headers = {"X-API-Key": api_key} if api_key else {}

    def check(endpoint, method="get", **kwargs):
        url = f"{base_url}{endpoint}"
        try:
          resp = requests.request(method, url, headers=headers, timeout=5, **kwargs)
        except requests.exceptions.RequestException as exc:
          print(f"[FAIL] {endpoint} -> {exc}")
          return False
        ok = resp.status_code == 200
        status = "OK" if ok else "FAIL"
        print(f"[{status}] {endpoint} ({resp.status_code})")
        return ok

    overall = True
    overall &= check("/api/health")
    # Root health as a quick reachability check
    overall &= check("/")

    if not overall:
        sys.exit(1)


if __name__ == "__main__":
    main()
