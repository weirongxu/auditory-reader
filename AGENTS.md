```bash
pnpm test:types
pnpm test:lint
pnpm test:units
```

- Uses `test:types filepath` and `test:lint filepath` to check after edit
- **`src/core/util/`**: Shared utilities (DOM, speech, text processing, collections)
- **Jotai atoms** for client-side state in `src/web/store/`
- Uses `@file-services/path` instead of `path`
- Externals `jsdom` for server builds
- `verbatimModuleSyntax: true` for explicit module syntax
