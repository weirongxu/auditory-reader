export function isInputElement(element: any) {
  if (element instanceof Element) {
    const elemName = element.tagName.toLowerCase()
    if (['textarea', 'input'].includes(elemName)) return true
  }
  return false
}
