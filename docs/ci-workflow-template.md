# Suggested CI Workflow

The Xana-Hermes GitHub token currently does not have the `workflow` scope, so this workflow is documented here instead of being committed under `.github/workflows/ci.yml`.

If/when workflow permissions are granted, copy this file body into `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main
      - claude/barber-booking-pwa-pzxm0i

jobs:
  build-and-smoke:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Smoke test
        run: |
          npm run start -- -p 3100 &
          for i in {1..30}; do
            if curl -fsS http://localhost:3100 >/dev/null; then
              npm run smoke
              exit 0
            fi
            sleep 1
          done
          echo "Server did not become ready" >&2
          exit 1

      - name: Audit high/critical dependencies
        run: npm audit --audit-level=high
```
