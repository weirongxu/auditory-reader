import { ROOT_ANNOTATION_HIGHLIGHT_CLASS } from '../../../../../core/consts.js'
import { BaseHighlight } from './highlight.js'

export class AnnotationHighlight extends BaseHighlight {
  rootClass = ROOT_ANNOTATION_HIGHLIGHT_CLASS
  ignoreClass = null
}
