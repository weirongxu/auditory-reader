import type { BookEntityBase } from '../entity/book-entity-base.js'
import type { BookTypes } from '../types.js'

export abstract class BookListBase {
  protected json?: BookTypes.Json

  protected async getJson(): Promise<BookTypes.Json> {
    this.json ??= await this.readJson()
    return this.json
  }

  protected abstract readJson(): Promise<BookTypes.Json>

  protected async list(): Promise<BookTypes.EntityJson[]> {
    const data = await this.getJson()
    return data.list
  }

  protected async write() {
    await this.writeJson(await this.getJson())
  }

  protected abstract writeJson(json: BookTypes.Json): Promise<void>

  async count(): Promise<number> {
    const l = await this.list()
    return l.length
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
      uuid: entityJson.uuid,
      createdAt: new Date(entityJson.createdAt),
      updatedAt: new Date(entityJson.updatedAt),
    }
    return entity
  }

  async update(uuid: string, update: BookTypes.EntityUpdate): Promise<void> {
    const list = await this.list()
    const entityJson = list.find((it) => it.uuid === uuid)
    if (!entityJson) return
    if (update.langCode) entityJson.langCode = update.langCode
    if (update.name) entityJson.name = update.name
    await this.write()
  }

  async add(entity: BookTypes.Entity, file: ArrayBuffer): Promise<void> {
    const list = await this.list()
    list.push({
      name: entity.name,
      uuid: entity.uuid,
      type: entity.type,
      langCode: entity.langCode,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    })

    await this.write()
    await this.bookAdd(entity, file)
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

  abstract book(uuid: string): Promise<BookEntityBase | undefined>

  abstract bookAdd(entity: BookTypes.Entity, file: ArrayBuffer): Promise<void>

  abstract bookDelete(entityJson: BookTypes.EntityJson): Promise<void>
}
