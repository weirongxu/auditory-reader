import { COLOR_SCHEME_DARK_CLASS } from './consts.js'

export const globalStyle = `
  :root {
    --main-bg: white;
    --main-bg-active: rgba(100, 100, 100, 0.2);
    --main-bg-hover: rgba(100, 100, 100, 0.35);
    --main-fg: #1a1b1e;
    --main-fg-active: #1a1b1e;
    --main-fg-hover: #1a1b1e;
  }
  :root.${COLOR_SCHEME_DARK_CLASS}  {
    --main-bg: #1a1b1e;
    --main-bg-active: rgba(200, 200, 200, 0.15);
    --main-bg-hover: rgba(200, 200, 200, 0.25);
    --main-fg: #c1c2c5;
    --main-fg-active: #c1c2c5;
    --main-fg-hover: #c1c2c5;
  }
`
