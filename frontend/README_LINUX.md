# Linux / mac quick note

This project uses inline `NODE_OPTIONS` environment assignments in `package.json` scripts to ensure compatibility with newer OpenSSL versions on some Node.js releases.

- Run locally (Linux/mac): `NODE_OPTIONS=--openssl-legacy-provider npm start`
- Build (Linux/mac): `NODE_OPTIONS=--openssl-legacy-provider npm run build`
- Run tests (Linux/mac): `NODE_OPTIONS=--openssl-legacy-provider npm test`

These inline environment assignments work in Linux/mac shells. On Windows (cmd.exe) you may need to use `set` or add the `cross-env` package for cross-platform compatibility.
