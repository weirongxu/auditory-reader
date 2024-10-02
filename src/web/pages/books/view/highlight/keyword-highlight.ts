import { ROOT_KEYWORD_HIGHLIGHT_CLASS } from '../../../../../core/consts.js'
import { BaseHighlight } from './highlight.js'

export class KeywordHighlight extends BaseHighlight {
  rootClass = ROOT_KEYWORD_HIGHLIGHT_CLASS
  ignoreClass = null
}
