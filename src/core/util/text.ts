export function splitLines(text: string) {
  return text.split(/\r?\n/)
}

export function splitParagraph(text: string) {
  return text.split(/\r?\n\r?\n/)
}
