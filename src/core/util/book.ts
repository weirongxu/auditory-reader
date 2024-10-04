import type { BookTypes } from '../book/types.js'

export function getBookExtension(entity: { type: BookTypes.EntityType }) {
  switch (entity.type) {
    case 'epub':
      return '.epub'
    case 'text':
      return '.txt'
    default:
      return undefined
  }
}

export function bookJsonToEntity(
  entityJson: BookTypes.EntityJson,
): BookTypes.Entity {
  const entity: BookTypes.Entity = {
    name: entityJson.name,
    type: entityJson.type,
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
