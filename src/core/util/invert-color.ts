const RE_HEX = /^(?:[0-9a-f]{3}){1,2}$/i

export interface BlackWhite {
  black: string
  white: string
  threshold?: number
}

export function invert(color: string, bw?: BlackWhite): string {
  const rgb = hexToRgbArray(color)
  if (bw)
    return getLuminance(rgb) > (bw.threshold ?? defaultThreshold)
      ? bw.black
      : bw.white
  return `#${rgb.map((c) => (255 - c).toString(16).padStart(2, '0')).join('')}`
}

/** http://stackoverflow.com/a/3943023/112731 */
function linearize(c: number): number {
  const x = c / 255
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
}

function getLuminance([r, g, b]: [number, number, number]): number {
  const [lr, lg, lb] = [linearize(r), linearize(g), linearize(b)]
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

function hexToRgbArray(hex: string): [number, number, number] {
  let value = hex.slice(0, 1) === '#' ? hex.slice(1) : hex
  if (!RE_HEX.test(value)) throw new Error(`Invalid HEX color: "${hex}"`)
  if (value.length === 3) value = value.replace(/./g, (c) => c + c)
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ]
}

export const defaultThreshold: number = Math.sqrt(1.05 * 0.05) - 0.05
