import { TMP_UUID } from '../../consts.js'
import { bookJsonToEntity } from '../../util/book.js'
import { orderBy } from '../../util/collection.js'
import { bookManager } from '../book-manager.js'
import type { BookEntityBase } from '../entity/book-entity-base.js'
import type { BookTypes } from '../types.js'

export abstract class BookListBase {
  protected json?: BookTypes.Json

  public readonly version = 1

  public readonly defaultPerPage = 15

  constructor(protected readonly account: string) {}

  get tmpUuid() {
    return this.json?.tmp?.uuid
  }

  protected isTmpUuid(uuid: string) {
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

  protected async rawList(): Promise<BookTypes.EntityJson[]> {
    const data = await this.getJson()
    return data.list
  }

  protected async rawListFilter({
    archive = 'active',
    favorite = 'all',
    search,
    order,
  }: Partial<BookTypes.FilterParams>): Promise<BookTypes.EntityJson[]> {
    let list = await this.rawList()
    if (archive !== 'all')
      list = list.filter((it) =>
        archive === 'archived' ? it.isArchived : !it.isArchived,
      )
    if (favorite !== 'all')
      list = list.filter((it) =>
        favorite === 'favorited' ? it.isFavorited : !it.isFavorited,
      )
    if (search)
      list = list.filter((it) =>
        it.name.toLowerCase().includes(search.toLowerCase()),
      )
    if (order && order !== 'default')
      switch (order) {
        case 'reverse':
          list = [...list].reverse()
          break
        case 'name':
          list = orderBy(list, 'asc', (it) => it.name)
          break
        case 'name-reverse':
          list = orderBy(list, 'desc', (it) => it.name)
          break
      }
    return list
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

  public async moveOffset(uuid: string, offset: number): Promise<void> {
    if (offset === 0) return
    const list = await this.rawList()
    const entityIndex = list.findIndex((it) => it.uuid === uuid)
    if (entityIndex === -1) return
    const targetIndex = entityIndex + offset
    if (targetIndex < 0 || targetIndex >= list.length) return
    const [entityJson] = list.splice(entityIndex, 1)
    if (entityJson) list.splice(targetIndex, 0, entityJson)
    await this.write()
  }

  public async moveAfter(uuid: string, afterUuid: string): Promise<void> {
    if (uuid === afterUuid) return
    const list = await this.rawList()
    const entityIndex = list.findIndex((it) => it.uuid === uuid)
    if (entityIndex === -1) return
    const afterIndex = list.findIndex((it) => it.uuid === afterUuid)
    if (afterIndex === -1) return
    const targetIndex = afterIndex > entityIndex ? afterIndex : afterIndex + 1
    if (
      targetIndex === entityIndex ||
      targetIndex < 0 ||
      targetIndex >= list.length
    )
      return
    const [entityJson] = list.splice(entityIndex, 1)
    if (entityJson) list.splice(targetIndex, 0, entityJson)
    await this.write()
  }

  public async moveTop(uuid: string): Promise<void> {
    const list = await this.rawList()
    const entityIndex = list.findIndex((it) => it.uuid === uuid)
    if (entityIndex === -1) return
    const [entityJson] = list.splice(entityIndex, 1)
    if (entityJson) list.unshift(entityJson)
    await this.write()
  }

  public async list(filter: Partial<BookTypes.FilterParams>) {
    const list = await this.rawListFilter(filter)
    const items = list.map((it) => this.toEntity(it))
    return items
  }

  public async page(
    filter: Partial<BookTypes.FilterParams>,
    {
      page = 1,
      perPage = this.defaultPerPage,
    }: Partial<BookTypes.PageParams> = {},
  ): Promise<BookTypes.PageResult> {
    const list = await this.rawListFilter(filter)
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
    const list = await this.rawList()
    return list.find((it) => it.uuid === uuid)
  }

  protected toEntity(entityJson: BookTypes.EntityJson): BookTypes.Entity {
    return bookJsonToEntity(entityJson)
  }

  public async update(
    uuid: string,
    update: BookTypes.EntityUpdate,
  ): Promise<void> {
    const list = await this.rawList()
    const entityJson = list.find((it) => it.uuid === uuid)
    if (!entityJson) return
    if (update.langCode) entityJson.langCode = update.langCode
    if (update.name) entityJson.name = update.name
    if (update.isFavorited !== undefined)
      entityJson.isFavorited = update.isFavorited
    if (update.isArchived !== undefined)
      entityJson.isArchived = update.isArchived
    await this.write()
  }

  public async add(
    entity: BookTypes.Entity,
    file: ArrayBuffer,
  ): Promise<BookTypes.EntityJson> {
    const entityJson: BookTypes.EntityJson = {
      name: entity.name,
      uuid: entity.uuid,
      langCode: entity.langCode,
      isFavorited: entity.isFavorited,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      isTmp: entity.isTmp,
    }

    if (entity.isTmp) {
      // delete cache
      await bookManager.delete(this.account, TMP_UUID)
      await this.setTmp(entityJson)
    } else {
      const list = await this.rawList()
      list.push(entityJson)
    }

    await this.write()
    await this.bookAdd(entity, file)
    if (entity.isTmp) {
      const bookEntity = this.entity2bookEntity(entityJson)
      await bookEntity.reset()
    }
    return entityJson
  }

  public async delete(uuid: string): Promise<void> {
    const list = await this.rawList()
    const bookIndex = list.findIndex((b) => b.uuid === uuid)
    if (bookIndex === -1) {
      return
    }
    const entityJson = list[bookIndex]
    if (entityJson) await this.bookDelete(entityJson)
    list.splice(bookIndex, 1)

    await this.write()
  }

  public async book(uuid: string): Promise<BookEntityBase | undefined> {
    const entityJson = this.isTmpUuid(uuid)
      ? await this.getTmp()
      : await this.entityJson(uuid)
    if (!entityJson) return
    return this.entity2bookEntity(entityJson)
  }

  protected abstract entity2bookEntity(
    entity: BookTypes.EntityJson,
  ): BookEntityBase

  protected abstract bookAdd(
    entity: BookTypes.Entity,
    file: ArrayBuffer,
  ): Promise<void>

  protected abstract bookDelete(entityJson: BookTypes.EntityJson): Promise<void>
}
