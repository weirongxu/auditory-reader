import type { LiteralUnion } from 'type-fest'
import type { LangCode } from '../lang.js'

export namespace BookTypes {
  export type EntityType = 'epub' | 'text'

  /**
   * Using tmp content when uuid is '$tmp'
   */
  export type EntityUUID = LiteralUnion<'$tmp', string>

  export type Json = {
    version: number
    list: EntityJson[]
    tmp?: EntityJson
  }

  export type EntityJson = {
    uuid: EntityUUID
    name: string
    type: EntityType
    langCode: LangCode
    isFavorited: boolean
    createdAt: string
    updatedAt: string
    isTmp: boolean
    isArchived?: boolean
  }

  export type Entity = {
    uuid: EntityUUID
    name: string
    type: EntityType
    langCode: LangCode
    isFavorited: boolean
    isArchived: boolean
    createdAt: Date
    updatedAt: Date
    isTmp: boolean
  }

  export type EntityUpdate = {
    name?: string
    langCode?: LangCode
    isFavorited?: boolean
    isArchived?: boolean
  }

  export type PropertyJson = {
    position?: PropertyPosition
    bookmarks?: PropertyBookmark[]
    annotations?: PropertyAnnotation[]
  }

  export type PropertyPosition = {
    section: number
    paragraph: number
  }

  export interface PropertyBookmark extends PropertyPosition {
    uuid: string
    type: 'text'
    brief: string
    note?: string
  }

  export type PropertyAnnotationRangePosition = {
    start: number
    end: number
  }

  export interface PropertyAnnotationRange
    extends PropertyAnnotationRangePosition {
    selectedText: string
  }

  export interface PropertyAnnotation {
    uuid: string
    pos: PropertyPosition
    type: 'text'
    brief: string
    content: string
    note?: string
    range?: PropertyAnnotationRange
    group?: string
    color?: string
  }

  export interface FilterParams {
    archive: 'all' | 'active' | 'archived'
    favorite: 'all' | 'favorited' | 'unfavorited'
    search: string
  }

  export interface LocationInPageState {
    isArchived: boolean
    page: number
    index: number
  }

  export interface PageParams {
    page: number
    perPage: number
  }

  export interface PageResult {
    page: number
    perPage: number
    items: Entity[]
    count: number
    pageCount: number
  }
}
