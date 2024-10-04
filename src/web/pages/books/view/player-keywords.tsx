import { t } from 'i18next'
import invert from 'invert-color'
import { booksKeywordsDeleteRouter } from '../../../../core/api/books/keywords-delete.js'
import { booksKeywordsUpsertRouter } from '../../../../core/api/books/keywords-upsert.js'
import type { BookTypes } from '../../../../core/book/types.js'
import { uiConfirm } from '../../../common/confirm.js'
import { messageApi } from '../../../common/notification.js'
import type { Player } from './player.js'

export class PlayerKeywords {
  /** book uuid */
  uuid: string
  reload?: () => void

  constructor(public readonly player: Player) {
    this.uuid = player.book.item.uuid
  }

  private getBriefText(pos: BookTypes.PropertyPosition) {
    const node = this.player.iframeCtrler.readableParts.at(pos.paragraph)
    if (!node) return
    if (node.type !== 'text') {
      void messageApi().error(t('desc.keywordNoSupported'))
      return null
    }
    const brief = node.text.slice(0, 30)
    return {
      text: node.text,
      brief,
    }
  }

  async add({
    keyword,
    pos,
  }: {
    keyword: string
    pos: BookTypes.PropertyPosition
  }) {
    const text = this.getBriefText(pos)
    if (!text) return
    const res = await booksKeywordsUpsertRouter.json({
      keywords: [
        {
          keyword,
          uuid: null,
          pos,
          brief: text.brief,
          content: text.text,
        },
      ],
      uuid: this.uuid,
    })
    this.reload?.()
    void messageApi().info(`${t('desc.keywordUpdated')} ${keyword}`)
    return res.keywords.at(0)
  }

  async upsert(
    {
      uuid,
      keyword,
      pos,
    }: {
      uuid: string | null
      keyword: string
      pos: BookTypes.PropertyPosition
    },
    {
      alias,
      note,
      color,
    }: {
      alias?: string[]
      note?: string
      color?: string
    },
  ): Promise<undefined | BookTypes.PropertyKeyword> {
    const text = this.getBriefText(pos)
    if (!text) return
    const res = await booksKeywordsUpsertRouter.json({
      keywords: [
        {
          uuid,
          keyword,
          pos,
          brief: text.brief,
          content: text.text,
          alias,
          note,
          color,
        },
      ],
      uuid: this.uuid,
    })
    this.reload?.()
    void messageApi().info(`${t('desc.keywordUpdated')} ${keyword}`)
    return res.keywords.at(0)
  }

  async remove(keyword: BookTypes.PropertyKeyword) {
    const fgColor = keyword.color
      ? invert(keyword.color, {
          black: '#3a3a3a',
          white: '#fafafa',
        })
      : 'var(--main-fg-blue)'
    if (
      !(await uiConfirm({
        title: t('prompt.keywordRemoveConfirm'),
        description: (
          <span
            style={{
              backgroundColor: keyword.color ?? 'var(--main-bg-blue)',
              color: fgColor,
            }}
          >
            {keyword.keyword}
          </span>
        ),
      }))
    )
      return

    await booksKeywordsDeleteRouter.json({
      uuid: this.uuid,
      keywordUuids: [keyword.uuid],
    })
    this.reload?.()
    void messageApi().info(`${t('desc.keywordDeleted')} ${keyword.keyword}`)
  }
}
