import { COLOR_SCHEME_DARK_CLASS } from '../core/consts.js'

export const globalStyle = `
  :root {
    --main-bg: white;
    --main-bg-active: #ddd;
    --main-bg-hover: #e3e3e3;
    --main-fg: #111;
    --main-fg-active: #111;
    --main-fg-hover: #111;
    --main-border: #666;
    --main-bg-blue: #03c;
    --main-fg-blue: #DDD;
    --main-bg-highlight: rgba(10, 120, 220, 0.3);
    --main-bg-symbol: rgba(10, 120, 220, 0.6);
    --main-fg-highlight: var(--main-fg);
  }
  :root.${COLOR_SCHEME_DARK_CLASS}  {
    --main-bg: #1a1b1e;
    --main-bg-active: #555;
    --main-bg-hover: #444;
    --main-fg: #ccc;
    --main-fg-active: #ccc;
    --main-fg-hover: #ccc;
    --main-border: #777;
  }
`
