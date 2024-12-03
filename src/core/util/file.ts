import path from '@file-services/path'

export function isTextFile(file: File) {
  return file.name.endsWith('.txt') || file.name.endsWith('.text')
}

export function isHtmlFile(file: File) {
  return file.name.endsWith('.html')
}

export function isEpubFile(file: File) {
  return file.name.endsWith('.epub')
}

export function getBookNameByFile(file: File) {
  const ext = path.extname(file.name)
  return path.basename(file.name, ext)
}
