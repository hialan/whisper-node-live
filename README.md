# whisper-node-live

This repository just a practice to make a node.js native module for whisper.

## Build the native addon

Install the JavaScript dependencies and build from the repository root:

```sh
npm install
npm run build
```

The build uses whisper.cpp's `examples/addon.node` CMake target and writes the
Node.js binary to `build/Release/addon.node`. Building requires CMake and a
working C/C++ toolchain.

## Reference

- https://github.com/ChetanXpro/nodejs-whisper/tree/main
- `cpp/whisper.cpp/examples/addon.node`
