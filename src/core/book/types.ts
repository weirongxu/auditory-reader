import type { LiteralUnion } from 'type-fest'
import type { LangCode } from '../lang.js'
import type { SortOrder } from './enums.js'

export namespace BookTypes {
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
    annotations?: PropertyAnnotation[]
    keywords?: PropertyKeyword[]
  }

  export type PropertyPosition = {
    section: number
    paragraph: number
  }

  export type PropertyRangePosition = {
    start: number
    end: number
  }

  export interface PropertyRange extends PropertyRangePosition {
    selectedText: string
  }

  export interface PropertyAnnotation {
    uuid: string
    pos: PropertyPosition
    type: 'text'
    brief: string
    content: string
    note?: string
    range?: PropertyRange
    group?: string
    color?: string
  }

  export interface PropertyKeyword {
    uuid: string
    keyword: string
    pos: PropertyPosition
    brief: string
    content: string
    alias?: string[]
    note?: string
    color?: string
  }

  export type Nav = {
    /** root (minimum) level is 1 */
    level: number
    label: string
    href?: string
    hrefBase?: string
    hrefAnchor?: string
    spineIndex?: number
    children: Nav[]
  }

  export type Spine = {
    id: string
    href: string
  }

  export type ManifestItem = {
    id: string
    href: string
    mediaType: string
    properties?: string
  }

  export type SpineItem = {
    manifest: ManifestItem
    idref: string
    linear: string
  }

  export type File = {
    buffer: ArrayBuffer
    mediaType?: string
  }

  export interface FilterParams {
    archive: 'all' | 'active' | 'archived'
    favorite: 'all' | 'favorited' | 'unfavorited'
    order: SortOrder
    search: string
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
