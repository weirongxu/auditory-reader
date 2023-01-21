import { COLOR_SCHEME_DARK_CLASS } from './consts.js'

export const globalStyle = `
  :root {
    --main-bg: white;
    --main-bg-active: rgba(100, 100, 100, 0.2);
    --main-bg-hover: rgba(100, 100, 100, 0.35);
    --main-fg: #111;
    --main-fg-active: #111;
    --main-fg-hover: #111;
    --main-border: rgba(100, 100, 100, 0.35);
    --main-bg-highlight: rgba(10, 120, 220, 0.3);
    --main-fg-highlight: var(--main-fg);
  }
  :root.${COLOR_SCHEME_DARK_CLASS}  {
    --main-bg: #1a1b1e;
    --main-bg-active: rgba(200, 200, 200, 0.15);
    --main-bg-hover: rgba(200, 200, 200, 0.25);
    --main-fg: #ccc;
    --main-fg-active: #ccc;
    --main-fg-hover: #ccc;
    --main-border: #777;
    --main-bg-highlight: rgba(255, 255, 255, 0.9);
    --main-fg-highlight: rgba(100, 100, 100, 0.8);
  }
`
