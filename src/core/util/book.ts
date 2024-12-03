import type { BookTypes } from '../book/types.js'
import { jsDOMParser } from './dom.js'
import { splitLines } from './text.js'

export function getBookExtension() {
  return '.epub'
}

export function getBookNameByText(content: string) {
  const lines = splitLines(content)
  return lines.map((line) => line.trim()).find((line) => !!line)
}

export async function getBookNameByHtml(html: string) {
  const articleDom = jsDOMParser(html)
  const articleDoc = articleDom.doc
  return articleDoc.title
}

export function bookJsonToEntity(
  entityJson: BookTypes.EntityJson,
): BookTypes.Entity {
  const entity: BookTypes.Entity = {
    name: entityJson.name,
    langCode: entityJson.langCode,
    isFavorited: entityJson.isFavorited,
    isArchived: Boolean(entityJson.isArchived),
    uuid: entityJson.uuid,
    createdAt: new Date(entityJson.createdAt),
    updatedAt: new Date(entityJson.updatedAt),
    isTmp: entityJson.isTmp,
  }
  return entity
}
