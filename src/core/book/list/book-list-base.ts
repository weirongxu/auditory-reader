import { TMP_UUID } from '../../consts.js'
import { bookManager } from '../book-manager.js'
import type { BookEntityBase } from '../entity/book-entity-base.js'
import type { BookTypes } from '../types.js'

export abstract class BookListBase {
  protected json?: BookTypes.Json

  protected version = 1

  constructor(protected readonly account: string) {}

  get tmpUuid() {
    return this.json?.tmp?.uuid
  }

  isTmpUuid(uuid: string) {
    return this.json?.tmp?.uuid === uuid
  }

  protected getDefaultJson(): BookTypes.Json {
    return {
      version: this.version,
      list: [],
    }
  }

  protected async getJson(): Promise<BookTypes.Json> {
    this.json ??= await this.readJson()
    return this.json
  }

  protected abstract readJson(): Promise<BookTypes.Json>

  protected async list(): Promise<BookTypes.EntityJson[]> {
    const data = await this.getJson()
    return data.list
  }

  protected async getTmp(): Promise<BookTypes.EntityJson | undefined> {
    const data = await this.getJson()
    return data.tmp
  }

  protected async setTmp(entity: BookTypes.EntityJson) {
    const data = await this.getJson()
    data.tmp = entity
  }

  protected async write() {
    await this.writeJson(await this.getJson())
  }

  protected abstract writeJson(json: BookTypes.Json): Promise<void>

  async count(): Promise<number> {
    const l = await this.list()
    return l.length
  }

  async moveOffset(uuid: string, offset: number): Promise<void> {
    const list = await this.list()
    const entityIndex = list.findIndex((it) => it.uuid === uuid)
    if (entityIndex === -1) return
    const targetIndex = entityIndex + offset
    if (targetIndex < 0 || targetIndex >= list.length) return
    const [entityJson] = list.splice(entityIndex, 1)
    list.splice(targetIndex, 0, entityJson)
    await this.write()
  }

  async moveTop(uuid: string): Promise<void> {
    const list = await this.list()
    const entityIndex = list.findIndex((it) => it.uuid === uuid)
    if (entityIndex === -1) return
    const [entityJson] = list.splice(entityIndex, 1)
    list.unshift(entityJson)
    await this.write()
  }

  page(params: BookTypes.PageParams = {}): Promise<BookTypes.PageResult> {
    return this.getPage({
      page: params.page ?? 1,
      perPage: params.perPage ?? 15,
    })
  }

  async getPage({ page, perPage }: BookTypes.PageParamsRequired) {
    const list = await this.list()
    const skipCount = perPage * (page - 1)
    const items = list
      .slice(skipCount, skipCount + perPage)
      .map((it) => this.toEntity(it))
    const count = list.length
    return {
      page,
      perPage,
      items,
      count,
      pageCount: Math.ceil(count / perPage),
    }
  }

  protected async entityJson(uuid: string) {
    const list = await this.list()
    return list.find((it) => it.uuid === uuid)
  }

  protected toEntity(entityJson: BookTypes.EntityJson): BookTypes.Entity {
    const entity: BookTypes.Entity = {
      name: entityJson.name,
      type: entityJson.type,
      langCode: entityJson.langCode,
      isFavorited: entityJson.isFavorited,
      uuid: entityJson.uuid,
      createdAt: new Date(entityJson.createdAt),
      updatedAt: new Date(entityJson.updatedAt),
      isTmp: entityJson.isTmp,
    }
    return entity
  }

  async update(uuid: string, update: BookTypes.EntityUpdate): Promise<void> {
    const list = await this.list()
    const entityJson = list.find((it) => it.uuid === uuid)
    if (!entityJson) return
    if (update.langCode) entityJson.langCode = update.langCode
    if (update.name) entityJson.name = update.name
    if (update.isFavorited !== undefined)
      entityJson.isFavorited = update.isFavorited
    await this.write()
  }

  async add(
    entity: BookTypes.Entity,
    file: ArrayBuffer,
  ): Promise<BookTypes.EntityJson> {
    const entityJson: BookTypes.EntityJson = {
      name: entity.name,
      uuid: entity.uuid,
      type: entity.type,
      langCode: entity.langCode,
      isFavorited: entity.isFavorited,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      isTmp: entity.isTmp,
    }

    if (entity.isTmp) {
      // delete cache
      await bookManager.delete(this.account, TMP_UUID)

      const bookEntity = this.entity2bookEntity(entityJson)
      await bookEntity.reset()
      await this.setTmp(entityJson)
    } else {
      const list = await this.list()
      list.push(entityJson)
    }

    await this.write()
    await this.bookAdd(entity, file)
    return entityJson
  }

  async delete(uuid: string): Promise<void> {
    const list = await this.list()
    const bookIndex = list.findIndex((b) => b.uuid === uuid)
    if (bookIndex === -1) {
      return
    }
    const entityJson = list[bookIndex]
    await this.bookDelete(entityJson)
    list.splice(bookIndex, 1)

    await this.write()
  }

  async book(uuid: string): Promise<BookEntityBase | undefined> {
    const entityJson = this.isTmpUuid(uuid)
      ? await this.getTmp()
      : await this.entityJson(uuid)
    if (!entityJson) return
    return this.entity2bookEntity(entityJson)
  }

  protected abstract entity2bookEntity(
    entity: BookTypes.EntityJson,
  ): BookEntityBase

  abstract bookAdd(entity: BookTypes.Entity, file: ArrayBuffer): Promise<void>

  abstract bookDelete(entityJson: BookTypes.EntityJson): Promise<void>
}
