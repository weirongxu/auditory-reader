export function splitLines(text: string) {
  return text.split(/\r?\n/)
}

export function splitParagraph(text: string) {
  return text.split(/\r?\n\r?\n/)
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
