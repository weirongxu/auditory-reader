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
  }

  export type Entity = {
    uuid: EntityUUID
    name: string
    type: EntityType
    langCode: LangCode
    isFavorited: boolean
    createdAt: Date
    updatedAt: Date
    isTmp: boolean
  }

  export type EntityUpdate = {
    name?: string
    langCode?: LangCode
    isFavorited?: boolean
  }

  export type PropertyJson = {
    position?: PropertyPosition
    bookmarks?: PropertyBookmark[]
    notes?: PropertyNote[]
  }

  export type PropertyPosition = {
    section: number
    paragraph: number
  }

  export type PropertyBookmarkRangePosition = {
    start: number
    end: number
  }

  export interface PropertyBookmarkRange extends PropertyBookmarkRangePosition {
    selectedText: string
    note?: string
  }

  export interface PropertyNote extends PropertyPosition {
    uuid: string
    type: 'text'
    brief: string
    content: string
    note?: string
    range: PropertyBookmarkRange
  }

  export interface PropertyBookmark extends PropertyPosition {
    uuid: string
    type: 'text'
    brief: string
    note?: string
    ranges?: PropertyBookmarkRange[]
  }

  export interface PageParamsRequired {
    page: number
    perPage: number
  }

  export type PageParams = Partial<PageParamsRequired>

  export interface PageResult {
    page: number
    perPage: number
    items: Entity[]
    count: number
    pageCount: number
  }
}
