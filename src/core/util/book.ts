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
    pageParagraphCounts: entityJson.pageParagraphCounts ?? null,
  }
  return entity
}

export function bookProgress(
  pageParagraphCounts: number[],
  position: BookTypes.PropertyPosition,
) {
  const section = position.section
  const readParagraph =
    sum(pageParagraphCounts.slice(0, section)) + position.paragraph
  const totalParagraph = sum(pageParagraphCounts)
  return readParagraph / totalParagraph
}

export function bookEntityRawToEntityRender(
  entity: BookTypes.EntityRaw,
): BookTypes.Entity {
  let progress: number | null = null
  if (entity.position && entity.pageParagraphCounts) {
    progress = bookProgress(entity.pageParagraphCounts, entity.position)
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
    position: entity.position,
    progress,
  }
  return entityRender
}
