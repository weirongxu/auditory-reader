```bash
pnpm test:types
pnpm test:lint
pnpm test:unit
```

- Uses `test:types filepath` and `test:lint filepath` to check after edit
- **Jotai atoms** for client-side state in `src/web/store/`
- Uses `@file-services/path` instead of `path`
