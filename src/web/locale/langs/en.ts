export const langEn = {
  setting: {
    title: 'Settings',
    autoNextSection: 'Auto Next Section',
    timer: 'Timer (Minute)',
    personReplace: '中文人称替换',
    speed: '$t(speed)',
    userColorScheme: 'Color Scheme',
    paragraphRepeat: 'Paragraph Repeat',
    disabledVertical: 'Disable Vertical Direction',
    pageList: 'Split Page',
    pageListType: {
      none: 'None',
      auto: 'Auto',
      single: 'Single',
      double: 'Double',
    },
    fontSize: 'Font Size',
  },
  hotkey: {
    title: 'Hotkeys',
    escape: 'Quit / Cancel',
    ok: 'Ok',
    speedUp: 'Increase speed',
    speedDown: 'Decrease speed',
    fontSizeUp: 'Increase font size',
    fontSizeDown: 'Decrease font size',
    reload: 'Reload',
    helper: 'Show the hotkeys',
    speakBookName: 'Speak selected book name',
    playToggle: 'Play / Pause',
    navToggle: 'Toggle table contents panel',
    prevNav: 'Select previous nav',
    nextNav: 'Select next nav',
    gotoNav: 'Go to selected nav',
    speakNav: 'Speak selected nav',
    annotationsPanelToggle: 'Toggle annotations panel',
    annotationToggle: 'Add / Remove annotation for current paragraph',
    annotationNote: 'Note current annotation',
    annotationRemoveSelected: 'Remove selected annotation',
    prevAnnotation: 'Select previous annotation',
    nextAnnotation: 'Select next annotation',
    gotoAnnotation: 'Go to selected annotation',
    speakAnnotation: 'Speak selected annotation',
    goBack: 'Go back books index',
    prevSection: 'Go to previous book section',
    nextSection: 'Go to next book section',
    firstPage: 'Scroll to first book page',
    lastPage: 'Scroll to last book page',
    jumpPrevPage: 'Go to previous book page',
    jumpNextPage: 'Go to next book page',
    prevPage: 'Scroll to previous book page',
    nextPage: 'Scroll to next book page',
    firstParagraph: 'Go to first paragraph',
    lastParagraph: 'Go to last paragraph',
    prevParagraph: 'Go to previous paragraph',
    nextParagraph: 'Go to next paragraph',
    prevSearchResult: 'Go to previous search result',
    nextSearchResult: 'Go to next search result',
    gotoSearchResult: 'Go to selected search result',
    goPrev: 'Go to previous',
    goNext: 'Go to next',
    goTop: 'Go to the top',
    goBottom: 'Move selection to bottom',
    goPagePrev: 'Go to previous page',
    goPageNext: 'Go to next page',
    goPageFirst: 'Go to first page',
    goPageLast: 'Go to last page',
    goMovePrev: 'Move selection to previous',
    goMoveNext: 'Move selection to next',
    goMoveTop: 'Move selection to top',
    listArchive: 'Toggle display of list archived books',
    listFavorite: 'Toggle display of list favorited books',
    archive: 'Toggle archive',
    favorite: 'Toggle favorite',
    search: 'Focus to search input',
    sortOrder: 'Select sort order',
    edit: 'Edit current selection',
    select: 'Toggle select',
    selectShift: 'Mark from last select to current as selected',
    selectAll: 'Toggle select all',
    open: 'Open current selection',
    editBook: 'Edit book',
    remove: 'Remove current selection',
  },
  confirm: {
    ok: 'Ok',
    cancel: 'Cancel',
  },
  desc: {
    addedBookSuccessful: 'Successfully added a new book',
    updatedAnnotation: 'Updated a $t(annotation)',
    deletedAnnotation: 'Deleted a $t(annotation)',
    noSupportedAnnotation: 'No support $t(annotation) type',
    annotationsEmpty: '$t(annotation)s empty',
    navEmpty: '$t(nav) empty',
  },
  prompt: {
    inputBookName: 'Please input $t(bookName).',
    selectLanguage: 'Please select the $t(language).',
    inputAccount: 'Please input your $t(account).',
    inputPassword: 'Please input your $t(password).',
    dropHere: 'drop .epub file、.txt file、text or URL to here.',
    dropHereToRemove: 'Drop here to remove it.',
    annotationRemoveConfirm: 'Remove this $t(annotation) with $t(note)?',
    uploadBook: 'Support .epub and .txt.',
    noBooks: 'No books here, Add your first book.',
    noSearchMatches: 'No search matches',
  },
  sortOrder: {
    label: 'Sort order',
    item: {
      default: 'Default',
      reverse: 'Reverse',
      name: 'Name',
      nameReverse: 'Name reverse',
    },
  },
  error: {
    login: '$t(account) or $t(password) error',
  },
  title: 'Title',
  note: 'Note',
  speed: 'Speed',
  fontSize: 'Font Size',
  view: 'View',
  account: 'Account',
  password: 'Password',
  login: 'Login',
  logout: 'Logout',
  submit: 'Submit',
  select: 'Select',
  add: 'Add',
  tmpStore: 'Store temporary file',
  top: 'Top',
  edit: 'Edit',
  editBook: 'Edit book',
  remove: 'Remove',
  update: 'Update',
  export: 'Export',
  bookName: 'Book name',
  favorite: 'Favorite',
  archive: 'Archive',
  unarchive: 'Unarchive',
  search: 'Search',
  cover: 'Cover',
  nav: 'Table contents',
  annotation: 'Annotation',
  url: 'URL',
  extractUrlInfo: 'Extract URL info',
  bookContent: 'Book content',
  language: 'Language',
  empty: 'Empty',
  file: 'File',
  text: 'Text',
  system: 'System',
  dark: 'Dark',
  light: 'Light',
  cancel: 'Cancel',
  all: 'All',
}

export type LangEn = typeof langEn
