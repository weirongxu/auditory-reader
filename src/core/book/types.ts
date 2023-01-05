import type { LangCode } from '../lang.js'

export namespace BookTypes {
  export type EntityType = 'epub' | 'text'

  export type Json = {
    list: EntityJson[]
  }

  export type EntityJson = {
    uuid: string
    name: string
    type: EntityType
    langCode: LangCode
    createdAt: string
    updatedAt: string
  }

  export type Entity = {
    uuid: string
    name: string
    type: EntityType
    langCode: LangCode
    createdAt: Date
    updatedAt: Date
  }

  export type EntityUpdate = {
    name?: string
    langCode?: LangCode
  }

  export type PropertyJson = {
    position?: PropertyPosition
  }

  export type PropertyPosition = {
    section: number
    paragraph: number
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
