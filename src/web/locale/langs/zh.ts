import type { LangEn } from './en.js'

export const langZh: LangEn = {
  setting: {
    title: '设置',
    autoNextSection: '自动下一章节',
    timer: '计时器 (分钟)',
    personReplace: '中文人称替换',
    speed: '$t(speed)',
    userColorScheme: '颜色主题',
    paragraphRepeat: '段落重复',
    disabledVertical: '禁用垂直方向',
    pageList: '分页',
    pageListType: {
      none: '无',
      auto: '自动',
      single: '单页',
      double: '双页',
    },
    fontSize: '字体大小',
  },
  hotkey: {
    title: '快捷键',
    escape: '退出 / 取消',
    ok: '确定',
    speedUp: '提高速度',
    speedDown: '降低速度',
    fontSizeUp: '提高字体大小',
    fontSizeDown: '降低字体大小',
    reload: '刷新页面',
    helper: '显示快捷键',
    speakBookName: '朗读选择的书名',
    playToggle: '播放 / 暂停',
    navToggle: '开关显示导航',
    prevNav: '选择上一个导航',
    nextNav: '选择下一个导航',
    gotoNav: '跳转到选择的导航',
    speakNav: '朗读选择的导航',
    bookmarksPanelToggle: '开关显示书签',
    bookmarkToggle: '添加或删除当前段落的书签',
    bookmarkNote: '添加当前段落的书签的备注',
    bookmarkRemoveSelected: '删除选择的书签',
    prevBookmark: '选择上一个书签',
    nextBookmark: '选择下一个书签',
    gotoBookmark: '跳转到选择的书签',
    speakBookmark: '朗读选择的书签',
    annotationsPanelToggle: '开关显示注解',
    annotationToggle: '添加或删除当前段落的注解',
    annotationNote: '添加当前段落的注解的备注',
    annotationRemoveSelected: '删除选择的注解',
    prevAnnotation: '选择上一个注解',
    nextAnnotation: '选择下一个注解',
    gotoAnnotation: '跳转到选择的注解',
    speakAnnotation: '朗读选择的注解',
    goBack: '回到书本目录',
    prevSection: '跳到本书上一部份',
    nextSection: '跳到本书下一部份',
    firstPage: '滚动到本书第一页',
    lastPage: '滚动到本书最后一页',
    jumpPrevPage: '跳到本书上一页面',
    jumpNextPage: '跳到本书下一页面',
    prevPage: '滚动到本书上一页面',
    nextPage: '滚动到本书下一页面',
    firstParagraph: '跳到本书第一段落',
    lastParagraph: '跳到本书最后一段落',
    prevParagraph: '跳到本书上一段落',
    nextParagraph: '跳到本书下一段落',
    goPrev: '去到上一个',
    goNext: '去到下一个',
    goTop: '去到顶部',
    goBottom: '去到底部',
    goPagePrev: '去到上一页面',
    goPageNext: '去到下一页面',
    goPageFirst: '去到第一页',
    goPageLast: '去到最后一页',
    goMovePrev: '挪到上一个',
    goMoveNext: '挪到下一个',
    goMoveTop: '挪到顶部',
    listArchive: '开关显示存档列表',
    listFavorite: '开关显示喜欢列表',
    archive: '开关存档',
    favorite: '开关喜欢',
    search: '聚焦到搜索输入框',
    sortOrder: '选择排序',
    edit: '编辑当前选择',
    select: '开关选择',
    selectShift: '把最后一次选择至当位置的标记为选择',
    selectAll: '开关选择全部',
    open: '打开当前选择',
    remove: '删除当前选择',
  },
  confirm: {
    ok: '确定',
    cancel: '取消',
  },
  desc: {
    addedBookSuccessful: '成功添加了一本新书',
    addedBookmark: '添加了一个$t(bookmark)',
    updatedBookmark: '更新了一个$t(bookmark)',
    deletedBookmark: '删除了一个$t(bookmark)',
    noSupportedBookmark: '不支持的$t(bookmark)类型',
    bookmarksEmpty: '$t(bookmark)为空',
    updatedAnnotation: '更新了一个$t(annotation)',
    deletedAnnotation: '删除了一个$t(annotation)',
    noSupportedAnnotation: '不支持的$t(annotation)类型',
    annotationsEmpty: '$t(annotation)为空',
    navEmpty: '$t(nav)为空',
  },
  prompt: {
    inputBookName: '请输入$t(bookName)',
    selectLanguage: '请选择$t(language)',
    inputAccount: '请输入$t(account)',
    inputPassword: '请输入$t(password)',
    dropHere: '拖动 .epub 文件、.txt 文件、文本或 URL 到这里。',
    dropHereToRemove: '拖放到这里删除。',
    bookmarkRemoveConfirm: '删除此书签和备注吗?',
    annotationRemoveConfirm: '删除此$t(annotation)和$t(note)吗?',
    uploadBook: '支持 .epub 和 .txt',
    noBooks: '这里没有书籍，添加你的第一本书吧。',
  },
  sortOrder: {
    label: '排序',
    item: {
      default: '默认',
      reverse: '反序',
      name: '名称',
      nameReverse: '名称反序',
    },
  },
  error: {
    login: '$t(account)或$t(password)错误',
  },
  note: '备注',
  speed: '速度',
  fontSize: '字体大小',
  view: '浏览',
  account: '帐号',
  password: '密码',
  login: '登录',
  logout: '登出',
  submit: '提交',
  select: '选择',
  add: '添加',
  tmpStore: '存储临时文件',
  top: '置顶',
  edit: '编辑',
  editBook: '编辑本书',
  remove: '删除',
  update: '更新',
  export: '导出',
  bookName: '书名',
  favorite: '喜欢',
  archive: '存档',
  unarchive: '取消存档',
  search: '搜索',
  cover: '封面',
  nav: '导航',
  bookmark: '书签',
  annotation: '注解',
  url: 'URL',
  extractUrlInfo: '提取URL信息',
  bookContent: '文本内容',
  language: '语言',
  file: '文件',
  text: '文本',
  system: '系统',
  dark: '暗色',
  light: '亮色',
  cancel: '取消',
  all: '全部',
}
