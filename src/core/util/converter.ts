export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return window.btoa(binary)
}

export function base64ToArrayBuffer(base64Str: string): Uint8Array {
  return Uint8Array.from(window.atob(base64Str), (c) => c.charCodeAt(0))
}

export function arrayBufferToBuffer(ab: ArrayBuffer): Buffer {
  const buf = Buffer.alloc(ab.byteLength)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i]!
  }
  return buf
}
