import { message } from 'antd'
import { t } from 'i18next'
import invert from 'invert-color'
import { booksDeleteAnnotationsRouter } from '../../../../core/api/books/delete-annotations.js'
import { booksUpsertAnnotationsRouter } from '../../../../core/api/books/upsert-annotations.js'
import type { BookTypes } from '../../../../core/book/types.js'
import { uiConfirm } from '../../../common/confirm.js'
import type { Player } from './player.js'

export class PlayerAnnotations {
  /** book uuid */
  uuid: string
  reload?: () => void

  constructor(public readonly player: Player) {
    this.uuid = player.book.item.uuid
  }

  async upsert(
    {
      uuid,
      pos,
      range,
    }: {
      uuid: string | null
      pos: BookTypes.PropertyPosition
      range?: BookTypes.PropertyAnnotationRange | null
    },
    {
      note,
      color,
      group,
    }: {
      note?: string
      color?: string
      group?: string
    },
  ): Promise<undefined | BookTypes.PropertyAnnotation> {
    const node = this.player.iframeCtrler.readableParts.at(pos.paragraph)
    if (!node) return
    if (node.type !== 'text') {
      void message.error(t('desc.noSupportedAnnotation'))
      return
    }
    const brief = node.text.slice(0, 30)
    const res = await booksUpsertAnnotationsRouter.action({
      annotations: [
        {
          uuid,
          pos,
          range: range ?? undefined,
          brief,
          type: 'text',
          content: node.text,
          note: note || undefined,
          color,
          group,
        },
      ],
      uuid: this.uuid,
    })
    this.reload?.()
    void message.info(`${t('desc.updatedAnnotation')} ${brief}`)
    return res.annotations.at(0)
  }

  async remove(annotation: BookTypes.PropertyAnnotation) {
    if (annotation.note || annotation.range) {
      const fgColor = annotation.color
        ? invert(annotation.color, {
            black: '#3a3a3a',
            white: '#fafafa',
          })
        : 'var(--main-fg-blue)'
      await uiConfirm({
        title: t('prompt.annotationRemoveConfirm'),
        description: (
          <>
            <p>{annotation.brief}</p>
            {annotation.note && <p>Note: {annotation.note}</p>}
            {annotation.range && (
              <p>
                Selected:{' '}
                <span
                  style={{
                    backgroundColor: annotation.color ?? 'var(--main-bg-blue)',
                    color: fgColor,
                  }}
                >
                  {annotation.range.selectedText}
                </span>
              </p>
            )}
          </>
        ),
      })
    }

    await booksDeleteAnnotationsRouter.action({
      uuid: this.uuid,
      annotationUuids: [annotation.uuid],
    })
    this.reload?.()
    void message.info(`${t('desc.deletedAnnotation')} ${annotation.brief}`)
  }

  indexByPos(
    pos: BookTypes.PropertyPosition,
    range: BookTypes.PropertyAnnotationRange | null,
  ): number | null {
    const annotations = this.player.states.annotations
    if (!annotations) return null
    const index = annotations.findIndex(
      (n) =>
        n.pos.section === pos.section &&
        n.pos.paragraph === pos.paragraph &&
        n.range?.start === range?.start &&
        n.range?.end === range?.end,
    )
    if (index === -1) return null
    return index
  }

  closestIndexByPos(pos: BookTypes.PropertyPosition) {
    const annotations = this.player.states.annotations
    if (!annotations) return null
    const index = annotations.findLastIndex(
      (n) => n.pos.section === pos.section && n.pos.paragraph <= pos.paragraph,
    )
    if (index === -1) return null
    return index
  }

  protected byPos(
    pos: BookTypes.PropertyPosition,
    range: BookTypes.PropertyAnnotationRange | null,
  ) {
    const index = this.indexByPos(pos, range)
    if (index === null) return null
    return this.player.states.annotations?.at(index) ?? null
  }

  async toggle(
    pos: BookTypes.PropertyPosition,
    range: BookTypes.PropertyAnnotationRange | null,
  ) {
    const annotation = this.byPos(pos, range)
    if (annotation) {
      await this.remove(annotation)
    } else {
      await this.upsert({ pos, range, uuid: null }, {})
    }
  }
}
