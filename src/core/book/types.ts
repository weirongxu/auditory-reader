import type { LiteralUnion } from 'type-fest'
import type { LangCode } from '../lang.js'

export namespace BookTypes {
  export type EntityType = 'epub' | 'text'

  /**
   * Using tmp content when uuid is '$tmp'
   */
  export type EntityUUID = LiteralUnion<'$tmp', string>

  export type Json = {
    list: EntityJson[]
    tmp?: EntityJson
  }

  export type EntityJson = {
    uuid: EntityUUID
    name: string
    type: EntityType
    langCode: LangCode
    createdAt: string
    updatedAt: string
    isTmp: boolean
  }

  export type Entity = {
    uuid: EntityUUID
    name: string
    type: EntityType
    langCode: LangCode
    createdAt: Date
    updatedAt: Date
    isTmp: boolean
  }

  export type EntityUpdate = {
    name?: string
    langCode?: LangCode
  }

  export type PropertyJson = {
    position?: PropertyPosition
    bookmarks?: PropertyBookmark[]
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
