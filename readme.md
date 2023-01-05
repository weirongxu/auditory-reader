# Immersive Reader

A Speech Reader, Support Epub, Text.

## Build & Start

- Install pnpm. https://pnpm.io/
- Install nodejs dependencies. `pnpm i`

### Service Worker version

- Build project
  - `pnpm build:sw`
- Run
  - `cd sw-public && npx serve`

### HTTP Server version

- Build project
  - `pnpm build:server`
- Create a configuration file.
  - `cp auditory-reader.config.example.json auditory-reader.config.json`
  - Use text editor to open and edit the `auditory-reader.config.json`
- Run
  - `pnpm start`

## Development & Contributing

- Install pnpm.
- Install nodejs dependencies `pnpm i`.
- Install ESLint and Prettier plugins of your editor.

### Service Worker version

- `pnpm dev:sw`

### HTTP Server version

- `pnpm dev:server`
