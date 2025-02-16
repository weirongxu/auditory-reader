import type { BookTypes } from '../book/types.js'
import { sum } from './collection.js'
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

export function bookJsonToEntityRaw(
  entityJson: BookTypes.EntityJson,
): BookTypes.EntityRaw {
  const entity: BookTypes.EntityRaw = {
    name: entityJson.name,
    langCode: entityJson.langCode,
    isFavorited: entityJson.isFavorited,
    isArchived: Boolean(entityJson.isArchived),
    uuid: entityJson.uuid,
    createdAt: new Date(entityJson.createdAt),
    updatedAt: new Date(entityJson.updatedAt),
    isTmp: entityJson.isTmp,
    position: entityJson.position ?? null,
    pageParagraphs: entityJson.pageParagraphs ?? null,
  }
  return entity
}

export function bookEntityRawToEntityRender(
  entity: BookTypes.EntityRaw,
): BookTypes.Entity {
  let progress = null
  if (entity.position && entity.pageParagraphs) {
    const section = entity.position.section
    const readParagraph =
      sum(
        entity.pageParagraphs.slice(0, section).map((p) => p.paragraphCount),
      ) + entity.position.paragraph
    const totalParagraph = sum(
      entity.pageParagraphs.map((p) => p.paragraphCount),
    )
    progress = Math.round((readParagraph / totalParagraph) * 100) / 100
  }
  const entityRender: BookTypes.Entity = {
    name: entity.name,
    langCode: entity.langCode,
    isFavorited: entity.isFavorited,
    isArchived: Boolean(entity.isArchived),
    uuid: entity.uuid,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    isTmp: entity.isTmp,
    position: entity.position ?? null,
    progress,
  }
  return entityRender
}
