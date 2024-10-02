import {
  PARA_IGNORE_CLASS,
  ROOT_UTTERER_HIGHLIGHT_CLASS,
} from '../../../../../core/consts.js'
import { BaseHighlight } from './highlight.js'

export class UttererHighlight extends BaseHighlight {
  rootClass = ROOT_UTTERER_HIGHLIGHT_CLASS
  ignoreClass = PARA_IGNORE_CLASS
}
