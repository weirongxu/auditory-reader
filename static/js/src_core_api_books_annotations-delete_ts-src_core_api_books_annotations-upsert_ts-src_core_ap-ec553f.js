"use strict";
(self['webpackChunkauditory_reader'] = self['webpackChunkauditory_reader'] || []).push([["src_core_api_books_annotations-delete_ts-src_core_api_books_annotations-upsert_ts-src_core_ap-ec553f"], {
"./src/core/api/books/annotations-delete.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksAnnotationsDeleteRouter: function() { return booksAnnotationsDeleteRouter; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const booksAnnotationsDeleteRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/annotations-delete').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const bookEntity = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.entity(userInfo.account, body.uuid);
    await bookEntity.annotationsDelete(body.annotationUuids);
    return {
        ok: true
    };
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/annotations-upsert.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksAnnotationsUpsertRouter: function() { return booksAnnotationsUpsertRouter; }
});
/* harmony import */var uuid__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/.pnpm/uuid@10.0.0/node_modules/uuid/dist/esm-browser/v1.js");
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");



const booksAnnotationsUpsertRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/annotations-upsert').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const bookEntity = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.entity(userInfo.account, body.uuid);
    const annotations = body.annotations.map((n)=>{
        n.uuid = n.uuid || (0,uuid__WEBPACK_IMPORTED_MODULE_2__["default"])();
        return n;
    });
    return {
        ok: true,
        annotations: await bookEntity.annotationsUpsert(annotations)
    };
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/annotations.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksAnnotationsRouter: function() { return booksAnnotationsRouter; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const booksAnnotationsRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/annotations').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const bookEntity = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.entity(userInfo.account, body.uuid);
    return bookEntity.annotationsGet();
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/cover.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksCoverRouter: function() { return booksCoverRouter; },
  getBooksCoverPath: function() { return getBooksCoverPath; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* harmony import */var _route_session_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/route/session.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");



const booksCoverRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/cover', {
    method: 'get'
}).routeLogined(async (param)=>{
    let { req, res, userInfo } = param;
    const uuid = req.searchParams.get('uuid');
    if (!uuid) {
        throw new _route_session_js__WEBPACK_IMPORTED_MODULE_2__.ErrorRequestResponse('uuid parameter required');
    }
    const book = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.book(userInfo.account, uuid);
    const file = await book.cover();
    if (!file) throw new _route_session_js__WEBPACK_IMPORTED_MODULE_2__.ErrorRequestResponse('cover in book not found');
    if (file.mediaType) res.header('Content-Type', file.mediaType.toString());
    return file.buffer;
});
const getBooksCoverPath = (uuid)=>`${booksCoverRouter.fullRoutePath}?uuid=${uuid}`;

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/create-by-url.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksCreateByUrlRouter: function() { return booksCreateByUrlRouter; }
});
/* harmony import */var _mozilla_readability__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/.pnpm/@mozilla+readability@0.5.0/node_modules/@mozilla/readability/index.js");
/* harmony import */var _mozilla_readability__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_mozilla_readability__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */var uuid__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__("./node_modules/.pnpm/uuid@10.0.0/node_modules/uuid/dist/esm-browser/v1.js");
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _env_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/env.ts");
/* harmony import */var _generate_epub_gen_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./src/core/generate/epub-gen.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./src/core/route/router.ts");
/* harmony import */var _util_dom_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./src/core/util/dom.ts");
/* harmony import */var _util_http_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./src/core/util/http.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");








const booksCreateByUrlRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_4__.URouter('books/create-by-url').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const uuid = (0,uuid__WEBPACK_IMPORTED_MODULE_7__["default"])();
    const date = new Date();
    const entity = {
        uuid,
        name: body.name,
        type: 'epub',
        langCode: body.langCode,
        isFavorited: false,
        isArchived: false,
        createdAt: date,
        updatedAt: date,
        isTmp: body.isTmp ?? false
    };
    const dom = await (0,_util_http_js__WEBPACK_IMPORTED_MODULE_6__.fetchDom)(body.url);
    const doc = dom.doc;
    const article = new _mozilla_readability__WEBPACK_IMPORTED_MODULE_0__.Readability(doc).parse();
    if (!article) throw new Error('parse article error');
    const articleDom = await (0,_util_dom_js__WEBPACK_IMPORTED_MODULE_5__.jsDOMParser)(article.content);
    const articleDoc = articleDom.doc;
    if (_env_js__WEBPACK_IMPORTED_MODULE_2__.env.appMode === 'server') await (0,_util_dom_js__WEBPACK_IMPORTED_MODULE_5__.HTMLImgs2DataURL)(body.url, articleDoc.body);
    const htmlContent = new articleDom.view.XMLSerializer().serializeToString(articleDoc.body);
    const epubBuf = await new _generate_epub_gen_js__WEBPACK_IMPORTED_MODULE_3__.EpubGen({
        title: body.name,
        date,
        htmlContent,
        lang: body.langCode,
        publisher: body.url,
        sourceURL: body.url,
        uuid
    }).gen();
    const entityJson = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_1__.bookManager.list(userInfo.account).add(entity, epubBuf);
    return entityJson;
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/create.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksCreateRouter: function() { return booksCreateRouter; }
});
/* harmony import */var uuid__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/.pnpm/uuid@10.0.0/node_modules/uuid/dist/esm-browser/v1.js");
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* harmony import */var _util_converter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/util/converter.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");




const booksCreateRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/create').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const buf = (0,_util_converter_js__WEBPACK_IMPORTED_MODULE_2__.base64ToArrayBuffer)(body.bufferBase64);
    const uuid = (0,uuid__WEBPACK_IMPORTED_MODULE_3__["default"])();
    const entity = {
        uuid,
        name: body.name,
        type: body.type,
        langCode: body.langCode,
        isFavorited: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isTmp: body.isTmp ?? false
    };
    const entityJson = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.list(userInfo.account).add(entity, buf);
    return entityJson;
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/download.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksDownloadRouter: function() { return booksDownloadRouter; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* harmony import */var _route_session_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/route/session.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");



const booksDownloadRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/download', {
    method: 'get'
}).routeLogined(async (param)=>{
    let { req, res, userInfo } = param;
    const searchParams = req.searchParams;
    const uuid = searchParams.get('uuid');
    if (!uuid) throw new _route_session_js__WEBPACK_IMPORTED_MODULE_2__.ErrorRequestResponse('uuid parameter required');
    const bookEntity = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.entity(userInfo.account, uuid);
    const { contentType, buffer, filename } = await bookEntity.download();
    res.header('Content-Type', contentType);
    res.header('Content-Disposition', `attachment; filename="${encodeURI(filename)}"`);
    return buffer;
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/fetch-url-info.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksFetchUrlInfoRouter: function() { return booksFetchUrlInfoRouter; }
});
/* harmony import */var _mozilla_readability__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/.pnpm/@mozilla+readability@0.5.0/node_modules/@mozilla/readability/index.js");
/* harmony import */var _mozilla_readability__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_mozilla_readability__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */var _lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/lang.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/route/router.ts");
/* harmony import */var _util_http_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./src/core/util/http.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");




const booksFetchUrlInfoRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_2__.URouter('books/fetch-url-info').routeLogined(async (param)=>{
    let { req } = param;
    var _doc_activeElement;
    const body = await req.body;
    const dom = await (0,_util_http_js__WEBPACK_IMPORTED_MODULE_3__.fetchDom)(body.url);
    const doc = dom.doc;
    const article = new _mozilla_readability__WEBPACK_IMPORTED_MODULE_0__.Readability(doc).parse();
    let title, lang;
    if (article) {
        title = article.title;
        // @ts-ignore
        lang = article.lang;
    } else {
        var _titleDom_textContent;
        const titleDom = doc.querySelector('article h1') ?? doc.querySelector('h1') ?? doc.querySelector('meta[name=og\\:title]') ?? doc.querySelector('head>title');
        title = (titleDom === null || titleDom === void 0 ? void 0 : (_titleDom_textContent = titleDom.textContent) === null || _titleDom_textContent === void 0 ? void 0 : _titleDom_textContent.trim()) ?? '';
    }
    lang ?? (lang = ((_doc_activeElement = doc.activeElement) === null || _doc_activeElement === void 0 ? void 0 : _doc_activeElement.getAttribute('lang')) ?? undefined);
    const langCode = (0,_lang_js__WEBPACK_IMPORTED_MODULE_1__.parseLangCode)(lang);
    const info = {
        title,
        lang: langCode
    };
    return info;
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/keywords-delete.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksKeywordsDeleteRouter: function() { return booksKeywordsDeleteRouter; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const booksKeywordsDeleteRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/keywords-delete').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const bookEntity = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.entity(userInfo.account, body.uuid);
    await bookEntity.keywordsDelete(body.keywordUuids);
    return {
        ok: true
    };
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/keywords-upsert.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksKeywordsUpsertRouter: function() { return booksKeywordsUpsertRouter; }
});
/* harmony import */var uuid__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/.pnpm/uuid@10.0.0/node_modules/uuid/dist/esm-browser/v1.js");
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");



const booksKeywordsUpsertRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/keywords-upsert').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const bookEntity = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.entity(userInfo.account, body.uuid);
    const keywords = body.keywords.map((n)=>{
        n.uuid = n.uuid || (0,uuid__WEBPACK_IMPORTED_MODULE_2__["default"])();
        return n;
    });
    return {
        ok: true,
        keywords: await bookEntity.keywordsUpsert(keywords)
    };
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/keywords.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksKeywordsRouter: function() { return booksKeywordsRouter; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const booksKeywordsRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/keywords').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const bookEntity = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.entity(userInfo.account, body.uuid);
    return bookEntity.keywordsGet();
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/move-after.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksMoveAfterRouter: function() { return booksMoveAfterRouter; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const booksMoveAfterRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/move-after').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const book = _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.list(userInfo.account);
    await book.moveAfter(body.uuid, body.afterUuid);
    return {
        ok: true
    };
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/move-top.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksMoveTopRouter: function() { return booksMoveTopRouter; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const booksMoveTopRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/move-top').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const book = _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.list(userInfo.account);
    await book.moveTop(body.uuid);
    return {
        ok: true
    };
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/page.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksPageRouter: function() { return booksPageRouter; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const booksPageRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/page').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const { page, filter } = body;
    const data = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.list(userInfo.account).page(filter, page);
    return {
        items: data.items,
        current: data.page,
        pageCount: data.pageCount,
        count: data.count
    };
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/position-sync.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksPositionSyncRouter: function() { return booksPositionSyncRouter; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const booksPositionSyncRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/position-sync').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const bookEntity = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.entity(userInfo.account, body.uuid);
    await bookEntity.posSet(body.pos);
    return {
        ok: true
    };
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/position.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksPositionRouter: function() { return booksPositionRouter; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const booksPositionRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/position').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const bookEntity = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.entity(userInfo.account, body.uuid);
    return await bookEntity.posGet();
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/remove.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksRemoveRouter: function() { return booksRemoveRouter; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const booksRemoveRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/remove').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager["delete"](userInfo.account, body.uuid);
    return {
        ok: true
    };
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/render.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksRenderRouter: function() { return booksRenderRouter; },
  getBooksRenderPath: function() { return getBooksRenderPath; }
});
/* harmony import */var mime_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/.pnpm/mime-types@2.1.35/node_modules/mime-types/index.js");
/* harmony import */var _file_services_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/.pnpm/@file-services+path@9.4.1/node_modules/@file-services/path/browser-path.js");
/* harmony import */var _file_services_path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_file_services_path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./src/core/route/router.ts");
/* harmony import */var _route_session_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./src/core/route/session.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");





const booksRenderRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_3__.URouter('books/render', {
    method: 'get',
    isDynamic: true
}).routeLogined(async (param)=>{
    let { req, res, userInfo } = param;
    const [uuid, ...paths] = req.paths;
    if (!uuid) throw new _route_session_js__WEBPACK_IMPORTED_MODULE_4__.ErrorRequestResponse('uuid not found');
    const book = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_2__.bookManager.book(userInfo.account, uuid);
    const filepath = decodeURI(_file_services_path__WEBPACK_IMPORTED_MODULE_1___default().join(...paths));
    const file = await book.file(filepath);
    if (!file) throw new _route_session_js__WEBPACK_IMPORTED_MODULE_4__.ErrorRequestResponse('Path in book not found');
    const contType = file.mediaType ?? mime_types__WEBPACK_IMPORTED_MODULE_0__.contentType(_file_services_path__WEBPACK_IMPORTED_MODULE_1___default().basename(filepath));
    if (contType) res.header('Content-Type', contType);
    return file.buffer;
});
const getBooksRenderPath = (uuid, paths)=>_file_services_path__WEBPACK_IMPORTED_MODULE_1___default().join(booksRenderRouter.fullRoutePath, uuid, paths);

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/search.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksSearchRouter: function() { return booksSearchRouter; }
});
/* harmony import */var mime_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/.pnpm/mime-types@2.1.35/node_modules/mime-types/index.js");
/* harmony import */var _file_services_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/.pnpm/@file-services+path@9.4.1/node_modules/@file-services/path/browser-path.js");
/* harmony import */var _file_services_path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_file_services_path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./src/core/route/router.ts");
/* harmony import */var _util_dom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./src/core/util/dom.ts");
/* harmony import */var _util_readable_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./src/core/util/readable.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");






function searchAllIndex(content, search) {
    const indexes = [];
    let startIndex = 0;
    while(startIndex !== -1){
        startIndex = content.indexOf(search, startIndex);
        if (startIndex !== -1) {
            indexes.push(startIndex);
            startIndex += search.length;
        }
    }
    return indexes;
}
const booksSearchRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_3__.URouter('books/search').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const book = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_2__.bookManager.book(userInfo.account, body.uuid);
    const navs = await book.navs();
    const matches = [];
    for (const [section, spine] of book.spines.entries()){
        const filepath = spine.href;
        const file = await book.file(filepath);
        if (!file) continue;
        const content = file.buffer.toString('utf-8');
        const contType = file.mediaType ?? mime_types__WEBPACK_IMPORTED_MODULE_0__.contentType(_file_services_path__WEBPACK_IMPORTED_MODULE_1___default().basename(filepath));
        if (contType && [
            '/xml',
            '/html',
            '/xhtml'
        ].some((t)=>contType.includes(t))) {
            const { doc } = await (0,_util_dom_js__WEBPACK_IMPORTED_MODULE_4__.jsDOMParser)(content);
            const readableExtractor = new _util_readable_js__WEBPACK_IMPORTED_MODULE_5__.ReadableExtractor(doc, navs);
            const parts = readableExtractor.toReadableParts();
            const nav = navs.find((it)=>it.spineIndex === section);
            for (const [paragraph, part] of parts.entries()){
                if (part.type !== 'text') continue;
                const startIndexes = searchAllIndex(part.text, body.search);
                if (!startIndexes.length) continue;
                for (const startIndex of startIndexes)matches.push({
                    text: part.text,
                    section,
                    paragraph,
                    start: startIndex,
                    nav: nav === null || nav === void 0 ? void 0 : nav.label
                });
            }
        }
    }
    return {
        search: body.search,
        matches
    };
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/show.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksShowRouter: function() { return booksShowRouter; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const booksShowRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/show').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const bookEntity = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.entity(userInfo.account, body.uuid);
    return bookEntity.entity;
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/tmp-store.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksTmpStoreRouter: function() { return booksTmpStoreRouter; }
});
/* harmony import */var uuid__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/.pnpm/uuid@10.0.0/node_modules/uuid/dist/esm-browser/v1.js");
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _consts_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/consts.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");




const booksTmpStoreRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_2__.URouter('books/tmp-store').routeLogined(async (param)=>{
    let { userInfo } = param;
    const bookEntityTmp = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.entity(userInfo.account, _consts_js__WEBPACK_IMPORTED_MODULE_1__.TMP_UUID);
    const uuid = (0,uuid__WEBPACK_IMPORTED_MODULE_3__["default"])();
    const entity = {
        uuid,
        name: bookEntityTmp.entity.name,
        type: bookEntityTmp.entity.type,
        langCode: bookEntityTmp.entity.langCode,
        isFavorited: bookEntityTmp.entity.isFavorited,
        isArchived: bookEntityTmp.entity.isArchived,
        createdAt: new Date(),
        updatedAt: new Date(),
        isTmp: false
    };
    const buf = await bookEntityTmp.readFileBuffer();
    const pos = await bookEntityTmp.posGet();
    const annotations = await bookEntityTmp.annotationsGet();
    const entityJson = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.list(userInfo.account).add(entity, buf);
    const bookEntity = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.entity(userInfo.account, entityJson.uuid);
    await bookEntity.posSet(pos);
    await bookEntity.annotationsUpsert(annotations);
    return entityJson;
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/update.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksUpdateRouter: function() { return booksUpdateRouter; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const booksUpdateRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/update').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.update(userInfo.account, body.uuid, body.update);
    return {
        ok: true
    };
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/books/view.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksViewRouter: function() { return booksViewRouter; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const booksViewRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/view').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const bookEntity = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.entity(userInfo.account, body.uuid);
    const book = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.book(userInfo.account, body.uuid);
    return {
        item: bookEntity.entity,
        navs: await book.navs(),
        spines: book.spines
    };
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/login.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  loginRouter: function() { return loginRouter; }
});
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");

const loginRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_0__.URouter('login').route(async (param)=>{
    let { req } = param;
    const session = req.session;
    const body = await req.body;
    const logined = await session.userLogin(body.account, body.password);
    return {
        ok: logined
    };
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/logout.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  logoutRouter: function() { return logoutRouter; }
});
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");

const logoutRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_0__.URouter('logout').route(async (param)=>{
    let { req } = param;
    const session = req.session;
    await session.userLogout();
    return {
        ok: true
    };
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/api/user.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  userRouter: function() { return userRouter; }
});
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");

const userRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_0__.URouter('user').route((param)=>{
    let { req } = param;
    const info = req.session.userInfo();
    return {
        info
    };
});

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/book/book-base.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  BookBase: function() { return BookBase; }
});
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");
class BookBase {
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/book/book-epub.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  BookEpub: function() { return BookEpub; },
  NAV_TOC_SELECTOR: function() { return NAV_TOC_SELECTOR; }
});
/* harmony import */var _swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_class_private_field_get.js");
/* harmony import */var _swc_helpers_class_private_field_init__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_class_private_field_init.js");
/* harmony import */var _swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_class_private_field_set.js");
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* harmony import */var jszip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/dist/jszip.min.js");
/* harmony import */var jszip__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jszip__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */var _file_services_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/.pnpm/@file-services+path@9.4.1/node_modules/@file-services/path/browser-path.js");
/* harmony import */var _file_services_path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_file_services_path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */var _util_collection_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/util/collection.ts");
/* harmony import */var _util_converter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./src/core/util/converter.ts");
/* harmony import */var _util_xml_dom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./src/core/util/xml-dom.ts");
/* harmony import */var _book_base_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./src/core/book/book-base.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");










// JSDOM unsupported :scope selector
/**
 * Implementation `:scope` selector
 * ```
 * querySelectorAll(':scope>navPoint .class') <=> scopeQuerySelectorAll(dom, ['navPoint'], '.class')
 * querySelectorAll(':scope>navLabel>text .class') <=> scopeQuerySelectorAll(dom, ['navLabel', 'text'], '.class')
 * ```
 */ function* scopeQuerySelectorAll(scope, childTags, selector) {
    const [tag, ...remainTags] = childTags;
    if (!tag) {
        if (selector) {
            for (const el of scope.querySelectorAll(selector)){
                yield el;
            }
        } else {
            yield scope;
        }
        return;
    }
    for (const el of scope.children){
        if (tag === '*' || el.tagName.toLowerCase() === tag.toLowerCase()) {
            yield* scopeQuerySelectorAll(el, remainTags, selector);
        }
    }
}
const NAV_TOC_SELECTOR = 'nav[epub\\:type="toc"]';
/**
 * Implementation `:scope` selector
 * ```
 * querySelector(':scope>navPoint') <=> scopeQuerySelector(dom, ['navPoint'])
 * querySelector(':scope>navLabel>text') <=> scopeQuerySelector(dom, ['navLabel', 'text'])
 * ```
 */ function scopeQuerySelector(scope, childTags, selector) {
    const first = scopeQuerySelectorAll(scope, childTags, selector).next();
    return first.value ?? null;
}
var _version = /*#__PURE__*/ new WeakMap(), _title = /*#__PURE__*/ new WeakMap(), _language = /*#__PURE__*/ new WeakMap(), _manifestItems = /*#__PURE__*/ new WeakMap(), _spine = /*#__PURE__*/ new WeakMap(), _spineItems = /*#__PURE__*/ new WeakMap(), _spines = /*#__PURE__*/ new WeakMap(), _navs = /*#__PURE__*/ new WeakMap();
class BookEpub extends _book_base_js__WEBPACK_IMPORTED_MODULE_5__.BookBase {
    static async getRootPath(xml) {
        var _containerRoot_querySelector;
        const containerRoot = await xml.htmlDom('META-INF/container.xml');
        if (!containerRoot) {
            console.error('Parse META-INF/container.xml error');
            return;
        }
        const rootfilePath = (_containerRoot_querySelector = containerRoot.querySelector('rootfile')) === null || _containerRoot_querySelector === void 0 ? void 0 : _containerRoot_querySelector.getAttribute('full-path');
        if (!rootfilePath) {
            console.error('rootfile full-path not found');
            return;
        }
        return _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().join('/', rootfilePath);
    }
    static async read(buffer) {
        const zip = await jszip__WEBPACK_IMPORTED_MODULE_0___default().loadAsync(buffer);
        const xml = new _util_xml_dom_js__WEBPACK_IMPORTED_MODULE_4__.XMLDOMLoader(zip);
        const rootPath = await this.getRootPath(xml);
        if (!rootPath) {
            console.error(`epub root-path(${rootPath}) not found`);
            return;
        }
        const rootDoc = await xml.xmlDom(rootPath);
        if (!rootDoc) {
            console.error(`epub root document not found`);
            return;
        }
        return new BookEpub(zip, xml, rootDoc, _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().dirname(rootPath));
    }
    get version() {
        if (!(0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _version)) {
            const versionStr = this.rootPkg.getAttribute('version') ?? '2.0';
            (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_7__._)(this, _version, parseFloat(versionStr) >= 3 ? 3 : 2);
        }
        return (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _version);
    }
    get title() {
        if (!(0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _title)) {
            var _this_rootPkg_findDescendant, _titleElem_text;
            const titleElem = (_this_rootPkg_findDescendant = this.rootPkg.findDescendant('metadata')) === null || _this_rootPkg_findDescendant === void 0 ? void 0 : _this_rootPkg_findDescendant.findDescendant('dc:title');
            (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_7__._)(this, _title, (titleElem === null || titleElem === void 0 ? void 0 : (_titleElem_text = titleElem.text()) === null || _titleElem_text === void 0 ? void 0 : _titleElem_text.trim()) ?? null);
        }
        return (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _title);
    }
    get language() {
        if (!(0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _language)) {
            var _this_rootPkg_findDescendant, _langElem_text;
            const langElem = (_this_rootPkg_findDescendant = this.rootPkg.findDescendant('metadata')) === null || _this_rootPkg_findDescendant === void 0 ? void 0 : _this_rootPkg_findDescendant.findDescendant('dc:language');
            (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_7__._)(this, _language, (langElem === null || langElem === void 0 ? void 0 : (_langElem_text = langElem.text()) === null || _langElem_text === void 0 ? void 0 : _langElem_text.trim()) ?? null);
        }
        return (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _language);
    }
    get manifestItems() {
        if (!(0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _manifestItems)) {
            var _this_rootPkg_findDescendant;
            const items = ((_this_rootPkg_findDescendant = this.rootPkg.findDescendant('manifest')) === null || _this_rootPkg_findDescendant === void 0 ? void 0 : _this_rootPkg_findDescendant.childrenFilter('item')) ?? [];
            (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_7__._)(this, _manifestItems, items.map((item)=>{
                return {
                    id: item.getAttribute('id'),
                    href: _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().join(this.rootDir, item.getAttribute('href')),
                    mediaType: item.getAttribute('media-type'),
                    properties: item.getAttribute('properties') ?? undefined
                };
            }));
        }
        return (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _manifestItems);
    }
    get spine() {
        if (!(0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _spine)) {
            // spine
            (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_7__._)(this, _spine, this.rootPkg.findDescendant('spine') ?? undefined);
            if (!(0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _spine)) throw new Error('spine not found');
        }
        return (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _spine);
    }
    get spineItems() {
        if (!(0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _spineItems)) {
            (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_7__._)(this, _spineItems, (0,_util_collection_js__WEBPACK_IMPORTED_MODULE_2__.compact)([
                ...this.spine.childrenFilter('itemref')
            ].map((item)=>{
                const idref = item.getAttribute('idref');
                const manifest = this.manifestItems.find((m)=>m.id === idref);
                if (!manifest) return;
                return {
                    manifest,
                    idref,
                    linear: item.getAttribute('linear')
                };
            })));
        }
        return (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _spineItems);
    }
    get spines() {
        if (!(0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _spines)) {
            (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_7__._)(this, _spines, this.spineItems.map((s)=>({
                    href: s.manifest.href,
                    id: s.idref
                })));
        }
        return (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _spines);
    }
    async file(href) {
        const file = await this.xmlLoader.file(href);
        if (!file) return;
        const arrBuf = await file.arrayBuffer();
        const buffer = (0,_util_converter_js__WEBPACK_IMPORTED_MODULE_3__.arrayBufferToBuffer)(arrBuf);
        const absHref = href.startsWith('/') ? href : `/${href}`;
        const manifest = this.manifestItems.find((item)=>item.href == absHref);
        return {
            buffer,
            mediaType: manifest === null || manifest === void 0 ? void 0 : manifest.mediaType
        };
    }
    async cover() {
        var _this_rootPkg_findDescendant;
        const coverElem = (_this_rootPkg_findDescendant = this.rootPkg.findDescendant('metadata')) === null || _this_rootPkg_findDescendant === void 0 ? void 0 : _this_rootPkg_findDescendant.findDescendants('meta').find((node)=>node.getAttribute('name') === 'cover');
        if (!coverElem) return;
        const coverId = coverElem.getAttribute('content');
        if (!coverId) return;
        const manifest = this.manifestItems.find((item)=>item.id === coverId);
        if (!(manifest === null || manifest === void 0 ? void 0 : manifest.href)) return;
        const file = await this.xmlLoader.file(manifest.href);
        if (!file) return;
        const buffer = (0,_util_converter_js__WEBPACK_IMPORTED_MODULE_3__.arrayBufferToBuffer)(await file.arrayBuffer());
        return {
            buffer,
            mediaType: manifest.mediaType
        };
    }
    async content(href) {
        return this.xmlLoader.content(href);
    }
    async xmlDom(href) {
        return this.xmlLoader.xmlDom(href);
    }
    async htmlDom(href) {
        return this.xmlLoader.htmlDom(href);
    }
    dirBySpineIndex(spineIndex) {
        const spine = this.spineItems[spineIndex];
        if (spine) return _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().dirname(spine.manifest.href);
    }
    getSpineIndexByHref(href) {
        const spineIndex = this.spineItems.findIndex((s)=>s.manifest.href === href);
        if (spineIndex === -1) return;
        return spineIndex;
    }
    async loadNav3() {
        const navManifest = this.manifestItems.find((it)=>it.properties === 'nav');
        if (!navManifest) return this.loadNav2();
        const navDom = await this.htmlDom(navManifest.href);
        const navDir = _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().dirname(navManifest.href);
        if (!navDom) return [];
        const navRoot = navDom.querySelector(`${NAV_TOC_SELECTOR}>ol`);
        if (!navRoot) return [];
        return this.parseNav3(navRoot, navDir);
    }
    parseNav3(dom, dir) {
        let level = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
        const nav = (0,_util_collection_js__WEBPACK_IMPORTED_MODULE_2__.compact)(Array.from(scopeQuerySelectorAll(dom, [
            'li'
        ])).map((el)=>{
            const elem = Array.from(el.children).find((l)=>l.tagName.toLowerCase() !== 'ol');
            if (!elem) return;
            const label = elem.textContent ?? '';
            let href;
            let hrefBase;
            let hrefAnchor;
            let spineIndex;
            if (elem.tagName.toLowerCase() === 'a') {
                const src = elem.getAttribute('href');
                if (src) {
                    href = _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().join(dir, src);
                    [hrefBase, hrefAnchor] = href.split('#', 2);
                    if (hrefBase) spineIndex = this.getSpineIndexByHref(hrefBase);
                }
            }
            const childOl = scopeQuerySelector(el, [
                'ol'
            ]);
            return {
                level,
                label,
                href,
                hrefBase,
                hrefAnchor,
                spineIndex,
                children: childOl ? this.parseNav3(childOl, dir, level + 1) : []
            };
        }));
        return nav;
    }
    async loadNav2() {
        const tocId = this.spine.getAttribute('toc') ?? 'ncx';
        const ncxManifest = this.manifestItems.find((it)=>it.id === tocId);
        if (!ncxManifest) return [];
        const navDom = await this.xmlDom(ncxManifest.href);
        const navDir = _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().dirname(ncxManifest.href);
        if (!navDom) return [];
        const navRoot = navDom.findDescendant('navMap');
        if (!navRoot) return [];
        return this.parseNav2(navRoot, navDir);
    }
    parseNav2(dom, dir) {
        let level = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
        const nav = (0,_util_collection_js__WEBPACK_IMPORTED_MODULE_2__.compact)(dom.childrenFilter('navPoint').map((el)=>{
            var _el_findChild_findChild, _el_findChild, _el_findChild1;
            const label = (_el_findChild = el.findChild('navLabel')) === null || _el_findChild === void 0 ? void 0 : (_el_findChild_findChild = _el_findChild.findChild('text')) === null || _el_findChild_findChild === void 0 ? void 0 : _el_findChild_findChild.text();
            if (!label) return;
            let href;
            let hrefBase;
            let hrefAnchor;
            let spineIndex;
            const src = (_el_findChild1 = el.findChild('content')) === null || _el_findChild1 === void 0 ? void 0 : _el_findChild1.getAttribute('src');
            if (src) {
                href = _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().join(dir, src);
                [hrefBase, hrefAnchor] = href.split('#', 2);
                if (hrefBase) spineIndex = this.getSpineIndexByHref(hrefBase);
            }
            return {
                level,
                label,
                href,
                hrefBase,
                hrefAnchor,
                spineIndex,
                children: this.parseNav2(el, dir, level + 1)
            };
        }));
        return nav;
    }
    async navs() {
        if (!(0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _navs)) {
            if (this.version >= 3) {
                (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_7__._)(this, _navs, await this.loadNav3());
            } else {
                (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_7__._)(this, _navs, await this.loadNav2());
            }
        }
        return (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_6__._)(this, _navs);
    }
    constructor(zip, xmlLoader, rootPkg, rootDir){
        super(), (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_8__._)(this, "zip", void 0), (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_8__._)(this, "xmlLoader", void 0), (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_8__._)(this, "rootPkg", void 0), (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_8__._)(this, "rootDir", void 0), (0,_swc_helpers_class_private_field_init__WEBPACK_IMPORTED_MODULE_9__._)(this, _version, {
            writable: true,
            value: void 0
        }), (0,_swc_helpers_class_private_field_init__WEBPACK_IMPORTED_MODULE_9__._)(this, _title, {
            writable: true,
            value: void 0
        }), (0,_swc_helpers_class_private_field_init__WEBPACK_IMPORTED_MODULE_9__._)(this, _language, {
            writable: true,
            value: void 0
        }), (0,_swc_helpers_class_private_field_init__WEBPACK_IMPORTED_MODULE_9__._)(this, _manifestItems, {
            writable: true,
            value: void 0
        }), (0,_swc_helpers_class_private_field_init__WEBPACK_IMPORTED_MODULE_9__._)(this, _spine, {
            writable: true,
            value: void 0
        }), (0,_swc_helpers_class_private_field_init__WEBPACK_IMPORTED_MODULE_9__._)(this, _spineItems, {
            writable: true,
            value: void 0
        }), (0,_swc_helpers_class_private_field_init__WEBPACK_IMPORTED_MODULE_9__._)(this, _spines, {
            writable: true,
            value: void 0
        }), (0,_swc_helpers_class_private_field_init__WEBPACK_IMPORTED_MODULE_9__._)(this, _navs, {
            writable: true,
            value: void 0
        }), this.zip = zip, this.xmlLoader = xmlLoader, this.rootPkg = rootPkg, this.rootDir = rootDir;
    }
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/book/book-manager.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  bookManager: function() { return bookManager; }
});
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* harmony import */var _swc_helpers_apply_decs_2203_r__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_apply_decs_2203_r.js");
/* harmony import */var _consts_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/consts.ts");
/* harmony import */var _env_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/env.ts");
/* harmony import */var _route_session_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/route/session.ts");
/* harmony import */var _book_epub_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./src/core/book/book-epub.ts");
/* harmony import */var _book_text_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./src/core/book/book-text.ts");
/* harmony import */var _list_book_list_fs_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./src/core/book/list/book-list-fs.ts");
/* harmony import */var _list_book_list_indexed_db_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./src/core/book/list/book-list-indexed-db.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


var _initProto;







const extractUuid = (method, context)=>{
    const methodName = context.name;
    context.addInitializer(function() {
        this[methodName] = function(account, uuid) {
            for(var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++){
                args[_key - 2] = arguments[_key];
            }
            const extractedUuid = uuid === _consts_js__WEBPACK_IMPORTED_MODULE_0__.TMP_UUID ? bookManager.reqTmpUuid(account) : uuid;
            return method.call(this, account, extractedUuid, ...args);
        };
    });
};
class BookManager {
    reqTmpUuid(account) {
        const uuid = this.list(account).tmpUuid;
        return uuid ?? _consts_js__WEBPACK_IMPORTED_MODULE_0__.TMP_UUID;
    }
    list(account) {
        let bookList = this.cacheList.get(account);
        if (!bookList) {
            bookList = _env_js__WEBPACK_IMPORTED_MODULE_1__.env.appMode === 'server' ? new _list_book_list_fs_js__WEBPACK_IMPORTED_MODULE_5__.BookListFS(account) : new _list_book_list_indexed_db_js__WEBPACK_IMPORTED_MODULE_6__.BookListIndexedDB(account);
            this.cacheList.set(account, bookList);
        }
        return bookList;
    }
    async delete(account, uuid) {
        this.cacheEntity.delete(uuid);
        this.cacheBook.delete(uuid);
        await this.list(account).delete(uuid);
    }
    async entity(account, uuid) {
        let entity = this.cacheEntity.get(uuid);
        if (!entity) {
            entity = await this.list(account).book(uuid);
            if (!entity) throw new _route_session_js__WEBPACK_IMPORTED_MODULE_2__.ErrorRequestResponse(`book entity(${uuid}) not found`);
            this.cacheEntity.set(uuid, entity);
        }
        return entity;
    }
    async update(account, uuid, update) {
        await this.list(account).update(uuid, update);
        this.cacheEntity.delete(uuid);
    }
    async book(account, uuid) {
        let book = this.cacheBook.get(uuid);
        if (!book) {
            const bookEntity = await this.entity(account, uuid);
            book = await this.parseBook(bookEntity);
            this.cacheBook.set(uuid, book);
        }
        return book;
    }
    async parseBook(bookEntity) {
        switch(bookEntity.entity.type){
            case 'epub':
                {
                    const epub = await _book_epub_js__WEBPACK_IMPORTED_MODULE_3__.BookEpub.read(await bookEntity.readFileBuffer());
                    if (!epub) throw new _route_session_js__WEBPACK_IMPORTED_MODULE_2__.ErrorRequestResponse('Parse epub error');
                    return epub;
                }
            case 'text':
                {
                    const text = await _book_text_js__WEBPACK_IMPORTED_MODULE_4__.BookText.read(await bookEntity.readFileText(), bookEntity.entity.name);
                    return text;
                }
            default:
                throw new _route_session_js__WEBPACK_IMPORTED_MODULE_2__.ErrorRequestResponse(`Unsupported type ${bookEntity.entity.type}`);
        }
    }
    constructor(){
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_7__._)(this, "cacheList", new Map());
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_7__._)(this, "cacheEntity", new Map());
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_7__._)(this, "cacheBook", new Map());
        _initProto(this);
    }
}
({ e: [_initProto] } = (0,_swc_helpers_apply_decs_2203_r__WEBPACK_IMPORTED_MODULE_8__._)(BookManager, [
    [
        extractUuid,
        2,
        "delete"
    ],
    [
        extractUuid,
        2,
        "entity"
    ],
    [
        extractUuid,
        2,
        "update"
    ],
    [
        extractUuid,
        2,
        "book"
    ]
], []));
const bookManager = new BookManager();

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/book/book-text.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  BookText: function() { return BookText; }
});
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* harmony import */var _util_text_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/util/text.ts");
/* harmony import */var _book_base_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/book/book-base.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");



class BookText extends _book_base_js__WEBPACK_IMPORTED_MODULE_1__.BookBase {
    static async read(text, title) {
        let html = (0,_util_text_js__WEBPACK_IMPORTED_MODULE_0__.splitParagraph)(text).map((p)=>`<p>${p}</p>`).join('\r\n');
        html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
    </head>
    <body>
      ${html}
    </body>
    </html>
    `;
        return new BookText(text, html);
    }
    async navs() {
        return [];
    }
    async file() {
        return {
            buffer: Buffer.from(this.html, 'utf8')
        };
    }
    async cover() {
        return undefined;
    }
    constructor(text, html){
        super(), (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_2__._)(this, "text", void 0), (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_2__._)(this, "html", void 0), (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_2__._)(this, "spines", void 0), this.text = text, this.html = html, this.spines = [
            {
                href: '/main.html',
                id: 'main'
            }
        ];
    }
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/book/entity/book-entity-base.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  BookEntityBase: function() { return BookEntityBase; }
});
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* harmony import */var mime_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/.pnpm/mime-types@2.1.35/node_modules/mime-types/index.js");
/* harmony import */var _route_session_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/session.ts");
/* harmony import */var _util_collection_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/util/collection.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");




class BookEntityBase {
    async download() {
        const buffer = await this.readFileBuffer();
        let extname;
        let contentType = false;
        switch(this.entity.type){
            case 'epub':
                extname = '.epub';
                break;
            case 'text':
                extname = '.txt';
                break;
        }
        const unknownHint = 'Book type unknown';
        if (!extname) throw new _route_session_js__WEBPACK_IMPORTED_MODULE_1__.ErrorRequestResponse(unknownHint);
        contentType = mime_types__WEBPACK_IMPORTED_MODULE_0__.contentType(extname);
        if (!contentType) throw new _route_session_js__WEBPACK_IMPORTED_MODULE_1__.ErrorRequestResponse(unknownHint);
        const filename = this.entity.name + extname;
        return {
            contentType,
            buffer,
            filename
        };
    }
    async reset() {
        await this.posSet({
            section: 0,
            paragraph: 0
        });
        await this.annotationsDeleteAll();
    }
    async posGet() {
        const prop = await this.readProp();
        return prop.position ?? {
            section: 0,
            paragraph: 0
        };
    }
    async posSet(pos) {
        const prop = await this.readProp();
        prop.position = pos;
        await this.writeProp(prop);
    }
    sortAnnotations(annotations) {
        return (0,_util_collection_js__WEBPACK_IMPORTED_MODULE_2__.orderBy)(annotations, 'asc', (n)=>{
            var _n_range;
            return [
                n.pos.section,
                n.pos.paragraph,
                ((_n_range = n.range) === null || _n_range === void 0 ? void 0 : _n_range.start) ?? 0
            ];
        });
    }
    async annotationsGet() {
        const prop = await this.readProp();
        return prop.annotations ?? [];
    }
    async annotationsUpsert(annotations) {
        var _prop;
        const prop = await this.readProp();
        (_prop = prop).annotations ?? (_prop.annotations = []);
        for (const annotation of annotations){
            const index = prop.annotations.findIndex((b)=>b.uuid === annotation.uuid);
            if (index !== -1) prop.annotations[index] = annotation;
            else prop.annotations.push(annotation);
        }
        prop.annotations = this.sortAnnotations(prop.annotations);
        await this.writeProp(prop);
        return prop.annotations;
    }
    async annotationsDelete(annotationUuids) {
        const prop = await this.readProp();
        if (prop.annotations) prop.annotations = prop.annotations.filter((b)=>!annotationUuids.includes(b.uuid));
        await this.writeProp(prop);
    }
    async annotationsDeleteAll() {
        const prop = await this.readProp();
        if (prop.annotations) prop.annotations = [];
        await this.writeProp(prop);
    }
    sortKeywords(keywords) {
        return (0,_util_collection_js__WEBPACK_IMPORTED_MODULE_2__.orderBy)(keywords, 'asc', (n)=>[
                n.pos.section,
                n.pos.paragraph,
                n.keyword
            ]);
    }
    async keywordsGet() {
        const prop = await this.readProp();
        return prop.keywords ?? [];
    }
    async keywordsUpsert(keywords) {
        var _prop;
        const prop = await this.readProp();
        (_prop = prop).keywords ?? (_prop.keywords = []);
        for (const keyword of keywords){
            const index = prop.keywords.findIndex((b)=>b.uuid === keyword.uuid);
            if (index !== -1) prop.keywords[index] = keyword;
            else prop.keywords.push(keyword);
        }
        prop.keywords = this.sortKeywords(prop.keywords);
        await this.writeProp(prop);
        return prop.keywords;
    }
    async keywordsDelete(keywordUuids) {
        const prop = await this.readProp();
        if (prop.keywords) prop.keywords = prop.keywords.filter((b)=>!keywordUuids.includes(b.uuid));
        await this.writeProp(prop);
    }
    constructor(entity){
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__._)(this, "entity", void 0);
        this.entity = entity;
    }
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/book/entity/book-entity-fs.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  BookEntityFS: function() { return BookEntityFS; }
});
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* harmony import */var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("?e773");
/* harmony import */var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */var _file_services_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/.pnpm/@file-services+path@9.4.1/node_modules/@file-services/path/browser-path.js");
/* harmony import */var _file_services_path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_file_services_path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */var _book_entity_base_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/book/entity/book-entity-base.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");




class BookEntityFS extends _book_entity_base_js__WEBPACK_IMPORTED_MODULE_2__.BookEntityBase {
    static async create(allBooksDir, entity, file) {
        const bookEntity = new BookEntityFS(allBooksDir, entity);
        await bookEntity.mkdir();
        await bookEntity.writeFile(file);
        const prop = await bookEntity.readProp();
        await bookEntity.writeProp(prop);
    }
    async mkdir() {
        await fs__WEBPACK_IMPORTED_MODULE_0___default().promises.mkdir(this.bookDir, {
            recursive: true
        });
    }
    async writeFile(file) {
        await fs__WEBPACK_IMPORTED_MODULE_0___default().promises.writeFile(this.bufferPath, Buffer.from(file));
    }
    async readFileBuffer() {
        return fs__WEBPACK_IMPORTED_MODULE_0___default().promises.readFile(this.bufferPath);
    }
    async readFileText() {
        return fs__WEBPACK_IMPORTED_MODULE_0___default().promises.readFile(this.bufferPath, 'utf8');
    }
    async delete() {
        if (fs__WEBPACK_IMPORTED_MODULE_0___default().existsSync(this.bufferPath)) await fs__WEBPACK_IMPORTED_MODULE_0___default().promises.rm(this.bufferPath);
        if (fs__WEBPACK_IMPORTED_MODULE_0___default().existsSync(this.propJsonPath)) await fs__WEBPACK_IMPORTED_MODULE_0___default().promises.rm(this.propJsonPath);
        if (fs__WEBPACK_IMPORTED_MODULE_0___default().existsSync(this.bookDir)) {
            const dirFiles = await fs__WEBPACK_IMPORTED_MODULE_0___default().promises.readdir(this.bookDir);
            if (dirFiles.length === 0) await fs__WEBPACK_IMPORTED_MODULE_0___default().promises.rmdir(this.bookDir);
        }
    }
    async readProp() {
        if (!this.propJson) {
            if (!fs__WEBPACK_IMPORTED_MODULE_0___default().existsSync(this.propJsonPath)) {
                this.propJson = {};
            } else {
                const str = await fs__WEBPACK_IMPORTED_MODULE_0___default().promises.readFile(this.propJsonPath, 'utf8');
                try {
                    this.propJson = JSON.parse(str);
                } catch  {
                    this.propJson = {};
                }
            }
        }
        return this.propJson;
    }
    async writeProp(prop) {
        await fs__WEBPACK_IMPORTED_MODULE_0___default().promises.writeFile(this.propJsonPath, JSON.stringify(prop), 'utf8');
    }
    constructor(allBooksDir, entity){
        super(entity), (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__._)(this, "allBooksDir", void 0), /**
   * Book dir
   * `books/02`
   */ (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__._)(this, "bookDir", void 0), /**
   * Book basename
   * `books/02/b9b990-4d72-11ed-86a9-498b78ad0441`
   */ (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__._)(this, "bookBaseNamePath", void 0), /**
   * Book data path
   * `books/02/b9b990-4d72-11ed-86a9-498b78ad0441.data`
   */ (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__._)(this, "bufferPath", void 0), /**
   * Book prop json path
   * `books/02/b9b990-4d72-11ed-86a9-498b78ad0441.prop.json`
   */ (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__._)(this, "propJsonPath", void 0), (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__._)(this, "propJson", void 0), this.allBooksDir = allBooksDir;
        const prefix = entity.uuid.slice(0, 2);
        const remain = entity.uuid.slice(2);
        if (this.entity.isTmp) {
            this.bookDir = _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().join(this.allBooksDir, '$');
            this.bookBaseNamePath = _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().join(this.bookDir, 'tmp');
        } else {
            this.bookDir = _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().join(this.allBooksDir, prefix);
            this.bookBaseNamePath = _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().join(this.bookDir, remain);
        }
        this.bufferPath = `${this.bookBaseNamePath}.data`;
        this.propJsonPath = `${this.bookBaseNamePath}.prop.json`;
    }
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/book/entity/book-entity-indexed-db.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  BookEntityIndexedDB: function() { return BookEntityIndexedDB; }
});
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* harmony import */var _indexedDB_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/indexedDB.ts");
/* harmony import */var _book_entity_base_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/book/entity/book-entity-base.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");



class BookEntityIndexedDB extends _book_entity_base_js__WEBPACK_IMPORTED_MODULE_1__.BookEntityBase {
    static async create(entity, file) {
        const bookEntity = new BookEntityIndexedDB(entity);
        await bookEntity.writeFile(file);
        const prop = await bookEntity.readProp();
        await bookEntity.writeProp(prop);
    }
    async readFileBuffer() {
        const db = await (0,_indexedDB_js__WEBPACK_IMPORTED_MODULE_0__.getDB)();
        const data = await db.get('book-data', this.uid);
        if (!data) throw new Error(`book(${this.uid}) data not found`);
        return data.data;
    }
    async readFileText() {
        const buf = await this.readFileBuffer();
        return new TextDecoder('utf-8').decode(buf);
    }
    async writeFile(file) {
        const db = await (0,_indexedDB_js__WEBPACK_IMPORTED_MODULE_0__.getDB)();
        await db.put('book-data', {
            data: file
        }, this.uid);
    }
    async delete() {
        const db = await (0,_indexedDB_js__WEBPACK_IMPORTED_MODULE_0__.getDB)();
        await db.delete('book-data', this.uid);
    }
    async readProp() {
        if (!this.propJson) {
            const db = await (0,_indexedDB_js__WEBPACK_IMPORTED_MODULE_0__.getDB)();
            this.propJson = await db.get('book-properties', this.uid) ?? {};
        }
        return this.propJson;
    }
    async writeProp(prop) {
        const db = await (0,_indexedDB_js__WEBPACK_IMPORTED_MODULE_0__.getDB)();
        await db.put('book-properties', prop, this.uid);
    }
    constructor(entity){
        super(entity), (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_2__._)(this, "propJson", void 0), (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_2__._)(this, "uid", void 0);
        if (this.entity.isTmp) {
            this.uid = '$tmp';
        } else {
            this.uid = entity.uuid;
        }
    }
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/book/indexedDB.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  getDB: function() { return getDB; }
});
/* harmony import */var idb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/.pnpm/idb@8.0.0/node_modules/idb/build/index.js");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");

async function getDB() {
    return await (0,idb__WEBPACK_IMPORTED_MODULE_0__.openDB)('auditory-reader', 1, {
        upgrade (db) {
            db.createObjectStore('book-json', {
                autoIncrement: false
            });
            db.createObjectStore('book-data', {
                autoIncrement: false
            });
            db.createObjectStore('book-properties', {
                autoIncrement: false
            });
        }
    });
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/book/list/book-list-base.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  BookListBase: function() { return BookListBase; }
});
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* harmony import */var _consts_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/consts.ts");
/* harmony import */var _util_collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/util/collection.ts");
/* harmony import */var _book_manager_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/book/book-manager.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");




class BookListBase {
    get tmpUuid() {
        var _this_json_tmp, _this_json;
        return (_this_json = this.json) === null || _this_json === void 0 ? void 0 : (_this_json_tmp = _this_json.tmp) === null || _this_json_tmp === void 0 ? void 0 : _this_json_tmp.uuid;
    }
    isTmpUuid(uuid) {
        var _this_json_tmp, _this_json;
        return ((_this_json = this.json) === null || _this_json === void 0 ? void 0 : (_this_json_tmp = _this_json.tmp) === null || _this_json_tmp === void 0 ? void 0 : _this_json_tmp.uuid) === uuid;
    }
    getDefaultJson() {
        return {
            version: this.version,
            list: []
        };
    }
    async getJson() {
        this.json ?? (this.json = await this.readJson());
        return this.json;
    }
    async list() {
        const data = await this.getJson();
        return data.list;
    }
    async listFilter(param) {
        let { archive = 'active', favorite = 'all', search, order } = param;
        let list = await this.list();
        if (archive !== 'all') list = list.filter((it)=>archive === 'archived' ? it.isArchived : !it.isArchived);
        if (favorite !== 'all') list = list.filter((it)=>favorite === 'favorited' ? it.isFavorited : !it.isFavorited);
        if (search) list = list.filter((it)=>it.name.toLowerCase().includes(search.toLowerCase()));
        if (order && order !== 'default') switch(order){
            case 'reverse':
                list = [
                    ...list
                ].reverse();
                break;
            case 'name':
                list = (0,_util_collection_js__WEBPACK_IMPORTED_MODULE_1__.orderBy)(list, 'asc', (it)=>it.name);
                break;
            case 'name-reverse':
                list = (0,_util_collection_js__WEBPACK_IMPORTED_MODULE_1__.orderBy)(list, 'desc', (it)=>it.name);
                break;
        }
        return list;
    }
    async getTmp() {
        const data = await this.getJson();
        return data.tmp;
    }
    async setTmp(entity) {
        const data = await this.getJson();
        data.tmp = entity;
    }
    async write() {
        await this.writeJson(await this.getJson());
    }
    async moveOffset(uuid, offset) {
        if (offset === 0) return;
        const list = await this.list();
        const entityIndex = list.findIndex((it)=>it.uuid === uuid);
        if (entityIndex === -1) return;
        const targetIndex = entityIndex + offset;
        if (targetIndex < 0 || targetIndex >= list.length) return;
        const [entityJson] = list.splice(entityIndex, 1);
        if (entityJson) list.splice(targetIndex, 0, entityJson);
        await this.write();
    }
    async moveAfter(uuid, afterUuid) {
        if (uuid === afterUuid) return;
        const list = await this.list();
        const entityIndex = list.findIndex((it)=>it.uuid === uuid);
        if (entityIndex === -1) return;
        const afterIndex = list.findIndex((it)=>it.uuid === afterUuid);
        if (afterIndex === -1) return;
        const targetIndex = afterIndex > entityIndex ? afterIndex : afterIndex + 1;
        if (targetIndex === entityIndex || targetIndex < 0 || targetIndex >= list.length) return;
        const [entityJson] = list.splice(entityIndex, 1);
        if (entityJson) list.splice(targetIndex, 0, entityJson);
        await this.write();
    }
    async moveTop(uuid) {
        const list = await this.list();
        const entityIndex = list.findIndex((it)=>it.uuid === uuid);
        if (entityIndex === -1) return;
        const [entityJson] = list.splice(entityIndex, 1);
        if (entityJson) list.unshift(entityJson);
        await this.write();
    }
    async page(filter) {
        let { page = 1, perPage = this.defaultPerPage } = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        const list = await this.listFilter(filter);
        const skipCount = perPage * (page - 1);
        const items = list.slice(skipCount, skipCount + perPage).map((it)=>this.toEntity(it));
        const count = list.length;
        return {
            page,
            perPage,
            items,
            count,
            pageCount: Math.ceil(count / perPage)
        };
    }
    async entityJson(uuid) {
        const list = await this.list();
        return list.find((it)=>it.uuid === uuid);
    }
    toEntity(entityJson) {
        const entity = {
            name: entityJson.name,
            type: entityJson.type,
            langCode: entityJson.langCode,
            isFavorited: entityJson.isFavorited,
            isArchived: Boolean(entityJson.isArchived),
            uuid: entityJson.uuid,
            createdAt: new Date(entityJson.createdAt),
            updatedAt: new Date(entityJson.updatedAt),
            isTmp: entityJson.isTmp
        };
        return entity;
    }
    async update(uuid, update) {
        const list = await this.list();
        const entityJson = list.find((it)=>it.uuid === uuid);
        if (!entityJson) return;
        if (update.langCode) entityJson.langCode = update.langCode;
        if (update.name) entityJson.name = update.name;
        if (update.isFavorited !== undefined) entityJson.isFavorited = update.isFavorited;
        if (update.isArchived !== undefined) entityJson.isArchived = update.isArchived;
        await this.write();
    }
    async add(entity, file) {
        const entityJson = {
            name: entity.name,
            uuid: entity.uuid,
            type: entity.type,
            langCode: entity.langCode,
            isFavorited: entity.isFavorited,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString(),
            isTmp: entity.isTmp
        };
        if (entity.isTmp) {
            // delete cache
            await _book_manager_js__WEBPACK_IMPORTED_MODULE_2__.bookManager["delete"](this.account, _consts_js__WEBPACK_IMPORTED_MODULE_0__.TMP_UUID);
            const bookEntity = this.entity2bookEntity(entityJson);
            await bookEntity.reset();
            await this.setTmp(entityJson);
        } else {
            const list = await this.list();
            list.push(entityJson);
        }
        await this.write();
        await this.bookAdd(entity, file);
        return entityJson;
    }
    async delete(uuid) {
        const list = await this.list();
        const bookIndex = list.findIndex((b)=>b.uuid === uuid);
        if (bookIndex === -1) {
            return;
        }
        const entityJson = list[bookIndex];
        if (entityJson) await this.bookDelete(entityJson);
        list.splice(bookIndex, 1);
        await this.write();
    }
    async book(uuid) {
        const entityJson = this.isTmpUuid(uuid) ? await this.getTmp() : await this.entityJson(uuid);
        if (!entityJson) return;
        return this.entity2bookEntity(entityJson);
    }
    constructor(account){
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__._)(this, "account", void 0);
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__._)(this, "json", void 0);
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__._)(this, "version", void 0);
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__._)(this, "defaultPerPage", void 0);
        this.account = account;
        this.version = 1;
        this.defaultPerPage = 15;
    }
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/book/list/book-list-fs.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  BookListFS: function() { return BookListFS; }
});
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* harmony import */var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("?377a");
/* harmony import */var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */var _file_services_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/.pnpm/@file-services+path@9.4.1/node_modules/@file-services/path/browser-path.js");
/* harmony import */var _file_services_path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_file_services_path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */var _env_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/env.ts");
/* harmony import */var _entity_book_entity_fs_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./src/core/book/entity/book-entity-fs.ts");
/* harmony import */var _book_list_base_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./src/core/book/list/book-list-base.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");






class BookListFS extends _book_list_base_js__WEBPACK_IMPORTED_MODULE_4__.BookListBase {
    async readJson() {
        const jsonPath = this.jsonPath;
        if (!fs__WEBPACK_IMPORTED_MODULE_0___default().existsSync(jsonPath)) {
            return this.getDefaultJson();
        } else {
            const str = await fs__WEBPACK_IMPORTED_MODULE_0___default().promises.readFile(jsonPath, 'utf8');
            return JSON.parse(str);
        }
    }
    async writeJson(json) {
        if (!fs__WEBPACK_IMPORTED_MODULE_0___default().existsSync(this.accountDir)) await fs__WEBPACK_IMPORTED_MODULE_0___default().promises.mkdir(this.accountDir, {
            recursive: true
        });
        await fs__WEBPACK_IMPORTED_MODULE_0___default().promises.writeFile(this.jsonPath, JSON.stringify(json), 'utf8');
    }
    entity2bookEntity(entityJson) {
        return new _entity_book_entity_fs_js__WEBPACK_IMPORTED_MODULE_3__.BookEntityFS(this.allBooksDir, this.toEntity(entityJson));
    }
    async bookAdd(entity, file) {
        await _entity_book_entity_fs_js__WEBPACK_IMPORTED_MODULE_3__.BookEntityFS.create(this.allBooksDir, entity, file);
    }
    async bookDelete(entityJson) {
        const book = new _entity_book_entity_fs_js__WEBPACK_IMPORTED_MODULE_3__.BookEntityFS(this.allBooksDir, this.toEntity(entityJson));
        await book.delete();
    }
    constructor(account){
        super(account), /**
   * `path/to/:account`
   */ (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_5__._)(this, "accountDir", void 0), /**
   * `path/to/:account/books.json`
   */ (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_5__._)(this, "jsonPath", void 0), /**
   * `path/to/:account/books`
   */ (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_5__._)(this, "allBooksDir", void 0);
        this.accountDir = _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().join(_env_js__WEBPACK_IMPORTED_MODULE_2__.env.dataPath, 'users', account);
        this.allBooksDir = _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().join(this.accountDir, 'books');
        this.jsonPath = _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().join(this.accountDir, 'books.json');
    }
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/book/list/book-list-indexed-db.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  BookListIndexedDB: function() { return BookListIndexedDB; }
});
/* harmony import */var _entity_book_entity_indexed_db_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/entity/book-entity-indexed-db.ts");
/* harmony import */var _indexedDB_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/book/indexedDB.ts");
/* harmony import */var _book_list_base_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/book/list/book-list-base.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");



class BookListIndexedDB extends _book_list_base_js__WEBPACK_IMPORTED_MODULE_2__.BookListBase {
    async readJson() {
        const db = await (0,_indexedDB_js__WEBPACK_IMPORTED_MODULE_1__.getDB)();
        const storedJson = await db.get('book-json', 'default');
        if (!storedJson) {
            const defaultJson = this.getDefaultJson();
            await db.add('book-json', defaultJson, 'default');
            return defaultJson;
        }
        return storedJson;
    }
    async writeJson(json) {
        const db = await (0,_indexedDB_js__WEBPACK_IMPORTED_MODULE_1__.getDB)();
        await db.put('book-json', json, 'default');
    }
    entity2bookEntity(entityJson) {
        return new _entity_book_entity_indexed_db_js__WEBPACK_IMPORTED_MODULE_0__.BookEntityIndexedDB(this.toEntity(entityJson));
    }
    async bookAdd(entity, file) {
        await _entity_book_entity_indexed_db_js__WEBPACK_IMPORTED_MODULE_0__.BookEntityIndexedDB.create(entity, file);
    }
    async bookDelete(entityJson) {
        const book = new _entity_book_entity_indexed_db_js__WEBPACK_IMPORTED_MODULE_0__.BookEntityIndexedDB(this.toEntity(entityJson));
        await book.delete();
    }
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/consts.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  COLOR_SCHEME_DARK_CLASS: function() { return COLOR_SCHEME_DARK_CLASS; },
  COLUMN_BREAK_CLASS: function() { return COLUMN_BREAK_CLASS; },
  IMG_MAX_HEIGHT_CLASS: function() { return IMG_MAX_HEIGHT_CLASS; },
  IMG_MAX_WIDTH_CLASS: function() { return IMG_MAX_WIDTH_CLASS; },
  PARA_ACTIVE_CLASS: function() { return PARA_ACTIVE_CLASS; },
  PARA_ANNOTATION_CLASS: function() { return PARA_ANNOTATION_CLASS; },
  PARA_BOX_CLASS: function() { return PARA_BOX_CLASS; },
  PARA_IGNORE_CLASS: function() { return PARA_IGNORE_CLASS; },
  ROOT_ANNOTATION_HIGHLIGHT_CLASS: function() { return ROOT_ANNOTATION_HIGHLIGHT_CLASS; },
  ROOT_KEYWORD_HIGHLIGHT_CLASS: function() { return ROOT_KEYWORD_HIGHLIGHT_CLASS; },
  ROOT_UTTERER_HIGHLIGHT_CLASS: function() { return ROOT_UTTERER_HIGHLIGHT_CLASS; },
  TMP_UUID: function() { return TMP_UUID; },
  ZH_PERSON_RULES: function() { return ZH_PERSON_RULES; }
});
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");
const PARA_BOX_CLASS = '__para_box__';
const PARA_IGNORE_CLASS = '__para_ignore__';
const PARA_ACTIVE_CLASS = '__para_active__';
const PARA_ANNOTATION_CLASS = '__para_annotation__';
const ROOT_ANNOTATION_HIGHLIGHT_CLASS = '__root_annotation_highlight__';
const ROOT_KEYWORD_HIGHLIGHT_CLASS = '__root_keyword_highlight__';
const ROOT_UTTERER_HIGHLIGHT_CLASS = '__root_utterer_highlight__';
const IMG_MAX_WIDTH_CLASS = '__img_max_width__';
const IMG_MAX_HEIGHT_CLASS = '__img_max_height__';
const COLOR_SCHEME_DARK_CLASS = '__color_scheme_dark__';
const COLUMN_BREAK_CLASS = '__column_break__';
const ZH_PERSON_RULES = {
    妳: {
        word: '乃',
        pinyin: 'naǐ'
    },
    她: {
        word: '伊',
        pinyin: 'yī'
    },
    它: {
        word: '牠',
        pinyin: 'tuó'
    }
};
const TMP_UUID = '$tmp';

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/env.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  env: function() { return env; }
});
/* harmony import */var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("?7cc7");
/* harmony import */var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */var _file_services_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/.pnpm/@file-services+path@9.4.1/node_modules/@file-services/path/browser-path.js");
/* harmony import */var _file_services_path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_file_services_path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */var _util_browser_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/util/browser.ts");
/* harmony import */var _util_random_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./src/core/util/random.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");




const dataPath = 'server-data';
const config = _util_browser_js__WEBPACK_IMPORTED_MODULE_2__.isBrowser ? {} : JSON.parse(fs__WEBPACK_IMPORTED_MODULE_0___default().readFileSync('auditory-reader.config.json', 'utf8'));
const appPublicRoot = config.appPublicPath || "/auditory-reader/" || 0;
const env = {
    isProduction: "development" === 'production',
    appMode: "service-worker" || 0,
    appPort: config.appPort ?? 4001,
    appBodyLimit: config.appBodyLimit ?? '20mb',
    appPublicRoot,
    appApiRoot: _file_services_path__WEBPACK_IMPORTED_MODULE_1___default().join(appPublicRoot, 'api'),
    dataPath,
    sessionKey: config.sessionKey || (0,_util_random_js__WEBPACK_IMPORTED_MODULE_3__.randomString)(40),
    accounts: config.accounts ?? []
};

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/generate/epub-gen.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  EpubGen: function() { return EpubGen; }
});
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* harmony import */var dedent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/.pnpm/dedent@1.5.3/node_modules/dedent/dist/dedent.mjs");
/* harmony import */var jszip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/dist/jszip.min.js");
/* harmony import */var jszip__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jszip__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */var _consts_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/consts.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");




class EpubGen {
    genContainer() {
        this.zip.file('META-INF/container.xml', (0,dedent__WEBPACK_IMPORTED_MODULE_0__["default"])`
        <?xml version="1.0"?>
        <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
          <rootfiles>
            <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
          </rootfiles>
        </container>
      `);
    }
    genContentOpf() {
        this.zip.file('content.opf', (0,dedent__WEBPACK_IMPORTED_MODULE_0__["default"])`
        <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="${this.options.uuid}" version="3.0" >
          <metadata
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:dcterms="http://purl.org/dc/terms/"
            xmlns:opf="http://www.idpf.org/2007/opf"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <dc:title>${this.options.title}</dc:title>
            <dc:creator>unknown</dc:creator>
            <dc:language>${this.options.lang}</dc:language>
            <dc:date>${this.options.date.toISOString()}</dc:date>
            <dc:publisher>${this.options.publisher}</dc:publisher>
          </metadata>
          <manifest>
            <item href="page-styles.css" id="page-styles" media-type="text/css"/>
            <item href="stylesheet.css" id="stylesheet" media-type="text/css"/>
            <item href="text/content.html" id="html-content" media-type="application/xhtml+xml"/>
          </manifest>
          <spine>
            <itemref idref="html-content"/>
          </spine>
        </package>
      `);
    }
    genStyle() {
        this.zip.file('page-styles.css', (0,dedent__WEBPACK_IMPORTED_MODULE_0__["default"])`
        @page {
          margin-bottom: 5pt;
          margin-top: 5pt
        }
      `);
        this.zip.file('stylesheet.css', (0,dedent__WEBPACK_IMPORTED_MODULE_0__["default"])`
        rt {
          user-select: none;
        }
        img {
          max-width: 100%;
        }
      `);
    }
    genContentHTML() {
        this.zip.file('text/content.html', (0,dedent__WEBPACK_IMPORTED_MODULE_0__["default"])`
        <?xml version='1.0' encoding='utf-8'?>
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${this.options.lang}">
          <head>
            <title>${this.options.title}</title>
            <link href="../stylesheet.css" rel="stylesheet" type="text/css"/>
            <link href="../page-styles.css" rel="stylesheet" type="text/css"/>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
          </head>
          <body>
            ${this.options.sourceURL ? `<p class="${_consts_js__WEBPACK_IMPORTED_MODULE_2__.PARA_IGNORE_CLASS}"><a target="_blank" href="${this.options.sourceURL}">
                  ${this.options.sourceURL}
                </a></p>` : ''}
            <h1>${this.options.title}</h1>
            ${this.options.htmlContent}
          </body>
        </html>
      `);
    }
    async gen() {
        this.zip.file('mimetype', 'application/epub+zip');
        this.genContainer();
        this.genContentOpf();
        this.genStyle();
        this.genContentHTML();
        return await this.zip.generateAsync({
            type: 'arraybuffer'
        });
    }
    constructor(options){
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__._)(this, "options", void 0);
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__._)(this, "zip", void 0);
        this.options = options;
        this.zip = new (jszip__WEBPACK_IMPORTED_MODULE_1___default())();
    }
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/lang.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  langCodes: function() { return langCodes; },
  langList: function() { return langList; },
  parseLangCode: function() { return parseLangCode; },
  useOrderedLangOptions: function() { return useOrderedLangOptions; },
  useOrderedLangs: function() { return useOrderedLangs; },
  useUserLanguages: function() { return useUserLanguages; }
});
/* harmony import */var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/.pnpm/react@18.3.1/node_modules/react/index.js");
/* harmony import */var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */var _util_collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/util/collection.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const langSet = [
    {
        code: 'ab',
        name: 'Abkhazian'
    },
    {
        code: 'aa',
        name: 'Afar'
    },
    {
        code: 'af',
        name: 'Afrikaans'
    },
    {
        code: 'ak',
        name: 'Akan'
    },
    {
        code: 'sq',
        name: 'Albanian'
    },
    {
        code: 'am',
        name: 'Amharic'
    },
    {
        code: 'ar',
        name: 'Arabic'
    },
    {
        code: 'an',
        name: 'Aragonese'
    },
    {
        code: 'hy',
        name: 'Armenian'
    },
    {
        code: 'as',
        name: 'Assamese'
    },
    {
        code: 'av',
        name: 'Avaric'
    },
    {
        code: 'ae',
        name: 'Avestan'
    },
    {
        code: 'ay',
        name: 'Aymara'
    },
    {
        code: 'az',
        name: 'Azerbaijani'
    },
    {
        code: 'bm',
        name: 'Bambara'
    },
    {
        code: 'ba',
        name: 'Bashkir'
    },
    {
        code: 'eu',
        name: 'Basque'
    },
    {
        code: 'be',
        name: 'Belarusian'
    },
    {
        code: 'bn',
        name: 'Bengali (Bangla)'
    },
    {
        code: 'bh',
        name: 'Bihari'
    },
    {
        code: 'bi',
        name: 'Bislama'
    },
    {
        code: 'bs',
        name: 'Bosnian'
    },
    {
        code: 'br',
        name: 'Breton'
    },
    {
        code: 'bg',
        name: 'Bulgarian'
    },
    {
        code: 'my',
        name: 'Burmese'
    },
    {
        code: 'ca',
        name: 'Catalan'
    },
    {
        code: 'ch',
        name: 'Chamorro'
    },
    {
        code: 'ce',
        name: 'Chechen'
    },
    {
        code: 'ny',
        name: 'Chichewa, Chewa, Nyanja'
    },
    {
        code: 'zh',
        name: 'Chinese'
    },
    // { code: 'zh-Hans', name: 'Chinese (Simplified)' },
    // { code: 'zh-Hant', name: 'Chinese (Traditional)' },
    {
        code: 'cv',
        name: 'Chuvash'
    },
    {
        code: 'kw',
        name: 'Cornish'
    },
    {
        code: 'co',
        name: 'Corsican'
    },
    {
        code: 'cr',
        name: 'Cree'
    },
    {
        code: 'hr',
        name: 'Croatian'
    },
    {
        code: 'cs',
        name: 'Czech'
    },
    {
        code: 'da',
        name: 'Danish'
    },
    {
        code: 'dv',
        name: 'Divehi, Dhivehi, Maldivian'
    },
    {
        code: 'nl',
        name: 'Dutch'
    },
    {
        code: 'dz',
        name: 'Dzongkha'
    },
    {
        code: 'en',
        name: 'English'
    },
    {
        code: 'eo',
        name: 'Esperanto'
    },
    {
        code: 'et',
        name: 'Estonian'
    },
    {
        code: 'ee',
        name: 'Ewe'
    },
    {
        code: 'fo',
        name: 'Faroese'
    },
    {
        code: 'fj',
        name: 'Fijian'
    },
    {
        code: 'fi',
        name: 'Finnish'
    },
    {
        code: 'fr',
        name: 'French'
    },
    {
        code: 'ff',
        name: 'Fula, Fulah, Pulaar, Pular'
    },
    {
        code: 'gl',
        name: 'Galician'
    },
    {
        code: 'gd',
        name: 'Gaelic (Scottish)'
    },
    {
        code: 'gv',
        name: 'Gaelic (Manx)'
    },
    {
        code: 'ka',
        name: 'Georgian'
    },
    {
        code: 'de',
        name: 'German'
    },
    {
        code: 'el',
        name: 'Greek'
    },
    {
        code: 'kl',
        name: 'Greenlandic'
    },
    {
        code: 'gn',
        name: 'Guarani'
    },
    {
        code: 'gu',
        name: 'Gujarati'
    },
    {
        code: 'ht',
        name: 'Haitian Creole'
    },
    {
        code: 'ha',
        name: 'Hausa'
    },
    {
        code: 'he',
        name: 'Hebrew'
    },
    {
        code: 'hz',
        name: 'Herero'
    },
    {
        code: 'hi',
        name: 'Hindi'
    },
    {
        code: 'ho',
        name: 'Hiri Motu'
    },
    {
        code: 'hu',
        name: 'Hungarian'
    },
    {
        code: 'is',
        name: 'Icelandic'
    },
    {
        code: 'io',
        name: 'Ido'
    },
    {
        code: 'ig',
        name: 'Igbo'
    },
    {
        code: 'id, in',
        name: 'Indonesian'
    },
    {
        code: 'ia',
        name: 'Interlingua'
    },
    {
        code: 'ie',
        name: 'Interlingue'
    },
    {
        code: 'iu',
        name: 'Inuktitut'
    },
    {
        code: 'ik',
        name: 'Inupiak'
    },
    {
        code: 'ga',
        name: 'Irish'
    },
    {
        code: 'it',
        name: 'Italian'
    },
    {
        code: 'ja',
        name: 'Japanese'
    },
    {
        code: 'jv',
        name: 'Javanese'
    },
    {
        code: 'kl',
        name: 'Kalaallisut, Greenlandic'
    },
    {
        code: 'kn',
        name: 'Kannada'
    },
    {
        code: 'kr',
        name: 'Kanuri'
    },
    {
        code: 'ks',
        name: 'Kashmiri'
    },
    {
        code: 'kk',
        name: 'Kazakh'
    },
    {
        code: 'km',
        name: 'Khmer'
    },
    {
        code: 'ki',
        name: 'Kikuyu'
    },
    {
        code: 'rw',
        name: 'Kinyarwanda (Rwanda)'
    },
    {
        code: 'rn',
        name: 'Kirundi'
    },
    {
        code: 'ky',
        name: 'Kyrgyz'
    },
    {
        code: 'kv',
        name: 'Komi'
    },
    {
        code: 'kg',
        name: 'Kongo'
    },
    {
        code: 'ko',
        name: 'Korean'
    },
    {
        code: 'ku',
        name: 'Kurdish'
    },
    {
        code: 'kj',
        name: 'Kwanyama'
    },
    {
        code: 'lo',
        name: 'Lao'
    },
    {
        code: 'la',
        name: 'Latin'
    },
    {
        code: 'lv',
        name: 'Latvian (Lettish)'
    },
    {
        code: 'li',
        name: 'Limburgish ( Limburger)'
    },
    {
        code: 'ln',
        name: 'Lingala'
    },
    {
        code: 'lt',
        name: 'Lithuanian'
    },
    {
        code: 'lu',
        name: 'Luga-Katanga'
    },
    {
        code: 'lg',
        name: 'Luganda, Ganda'
    },
    {
        code: 'lb',
        name: 'Luxembourgish'
    },
    {
        code: 'gv',
        name: 'Manx'
    },
    {
        code: 'mk',
        name: 'Macedonian'
    },
    {
        code: 'mg',
        name: 'Malagasy'
    },
    {
        code: 'ms',
        name: 'Malay'
    },
    {
        code: 'ml',
        name: 'Malayalam'
    },
    {
        code: 'mt',
        name: 'Maltese'
    },
    {
        code: 'mi',
        name: 'Maori'
    },
    {
        code: 'mr',
        name: 'Marathi'
    },
    {
        code: 'mh',
        name: 'Marshallese'
    },
    {
        code: 'mo',
        name: 'Moldavian'
    },
    {
        code: 'mn',
        name: 'Mongolian'
    },
    {
        code: 'na',
        name: 'Nauru'
    },
    {
        code: 'nv',
        name: 'Navajo'
    },
    {
        code: 'ng',
        name: 'Ndonga'
    },
    {
        code: 'nd',
        name: 'Northern Ndebele'
    },
    {
        code: 'ne',
        name: 'Nepali'
    },
    {
        code: 'no',
        name: 'Norwegian'
    },
    {
        code: 'nb',
        name: 'Norwegian bokmål'
    },
    {
        code: 'nn',
        name: 'Norwegian nynorsk'
    },
    {
        code: 'ii',
        name: 'Nuosu'
    },
    {
        code: 'oc',
        name: 'Occitan'
    },
    {
        code: 'oj',
        name: 'Ojibwe'
    },
    {
        code: 'cu',
        name: 'Old Church Slavonic, Old Bulgarian'
    },
    {
        code: 'or',
        name: 'Oriya'
    },
    {
        code: 'om',
        name: 'Oromo (Afaan Oromo)'
    },
    {
        code: 'os',
        name: 'Ossetian'
    },
    {
        code: 'pi',
        name: 'Pāli'
    },
    {
        code: 'ps',
        name: 'Pashto, Pushto'
    },
    {
        code: 'fa',
        name: 'Persian (Farsi)'
    },
    {
        code: 'pl',
        name: 'Polish'
    },
    {
        code: 'pt',
        name: 'Portuguese'
    },
    {
        code: 'pa',
        name: 'Punjabi (Eastern)'
    },
    {
        code: 'qu',
        name: 'Quechua'
    },
    {
        code: 'rm',
        name: 'Romansh'
    },
    {
        code: 'ro',
        name: 'Romanian'
    },
    {
        code: 'ru',
        name: 'Russian'
    },
    {
        code: 'se',
        name: 'Sami'
    },
    {
        code: 'sm',
        name: 'Samoan'
    },
    {
        code: 'sg',
        name: 'Sango'
    },
    {
        code: 'sa',
        name: 'Sanskrit'
    },
    {
        code: 'sr',
        name: 'Serbian'
    },
    {
        code: 'sh',
        name: 'Serbo-Croatian'
    },
    {
        code: 'st',
        name: 'Sesotho'
    },
    {
        code: 'tn',
        name: 'Setswana'
    },
    {
        code: 'sn',
        name: 'Shona'
    },
    {
        code: 'ii',
        name: 'Sichuan Yi'
    },
    {
        code: 'sd',
        name: 'Sindhi'
    },
    {
        code: 'si',
        name: 'Sinhalese'
    },
    {
        code: 'ss',
        name: 'Siswati'
    },
    {
        code: 'sk',
        name: 'Slovak'
    },
    {
        code: 'sl',
        name: 'Slovenian'
    },
    {
        code: 'so',
        name: 'Somali'
    },
    {
        code: 'nr',
        name: 'Southern Ndebele'
    },
    {
        code: 'es',
        name: 'Spanish'
    },
    {
        code: 'su',
        name: 'Sundanese'
    },
    {
        code: 'sw',
        name: 'Swahili (Kiswahili)'
    },
    {
        code: 'ss',
        name: 'Swati'
    },
    {
        code: 'sv',
        name: 'Swedish'
    },
    {
        code: 'tl',
        name: 'Tagalog'
    },
    {
        code: 'ty',
        name: 'Tahitian'
    },
    {
        code: 'tg',
        name: 'Tajik'
    },
    {
        code: 'ta',
        name: 'Tamil'
    },
    {
        code: 'tt',
        name: 'Tatar'
    },
    {
        code: 'te',
        name: 'Telugu'
    },
    {
        code: 'th',
        name: 'Thai'
    },
    {
        code: 'bo',
        name: 'Tibetan'
    },
    {
        code: 'ti',
        name: 'Tigrinya'
    },
    {
        code: 'to',
        name: 'Tonga'
    },
    {
        code: 'ts',
        name: 'Tsonga'
    },
    {
        code: 'tr',
        name: 'Turkish'
    },
    {
        code: 'tk',
        name: 'Turkmen'
    },
    {
        code: 'tw',
        name: 'Twi'
    },
    {
        code: 'ug',
        name: 'Uyghur'
    },
    {
        code: 'uk',
        name: 'Ukrainian'
    },
    {
        code: 'ur',
        name: 'Urdu'
    },
    {
        code: 'uz',
        name: 'Uzbek'
    },
    {
        code: 've',
        name: 'Venda'
    },
    {
        code: 'vi',
        name: 'Vietnamese'
    },
    {
        code: 'vo',
        name: 'Volapük'
    },
    {
        code: 'wa',
        name: 'Wallon'
    },
    {
        code: 'cy',
        name: 'Welsh'
    },
    {
        code: 'wo',
        name: 'Wolof'
    },
    {
        code: 'fy',
        name: 'Western Frisian'
    },
    {
        code: 'xh',
        name: 'Xhosa'
    },
    {
        code: 'yi',
        name: 'Yiddish'
    },
    {
        code: 'ji',
        name: 'Yiddish'
    },
    {
        code: 'yo',
        name: 'Yoruba'
    },
    {
        code: 'za',
        name: 'Zhuang, Chuang'
    },
    {
        code: 'zu',
        name: 'Zulu'
    }
];
const langList = langSet;
const langCodes = langSet.map((l)=>l.code);
const parseLangCode = (lang)=>{
    if (!lang) return;
    if (lang.includes('-')) lang = lang.split('-')[0];
    if (!lang) return;
    if (lang.includes('_')) lang = lang.split('_')[0];
    if (!lang) return;
    lang = lang.toLowerCase();
    if (!langCodes.includes(lang)) {
        return;
    }
    return lang;
};
const useUserLanguages = ()=>{
    const userLanguages = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(()=>__webpack_require__.g.navigator.languages, []);
    return userLanguages;
};
const useOrderedLangs = ()=>{
    const userLanguages = useUserLanguages();
    const langs = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(()=>{
        return (0,_util_collection_js__WEBPACK_IMPORTED_MODULE_1__.orderBy)(langList, 'asc', (l)=>userLanguages.indexOf(l.code) === -1 ? 0 : 1);
    }, [
        userLanguages
    ]);
    return langs;
};
const useOrderedLangOptions = ()=>{
    const langs = useOrderedLangs();
    const options = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(()=>{
        return langs.map((l, i)=>({
                key: i,
                value: l.code,
                label: `${l.name} (${l.code})`
            }));
    }, [
        langs
    ]);
    return options;
};

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/route/action.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  ActionError: function() { return ActionError; },
  ActionRequestError: function() { return ActionRequestError; },
  ActionUnauthorized: function() { return ActionUnauthorized; },
  actionCatchError: function() { return actionCatchError; },
  getActionPath: function() { return getActionPath; },
  useAction: function() { return useAction; }
});
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* harmony import */var _file_services_path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/.pnpm/@file-services+path@9.4.1/node_modules/@file-services/path/browser-path.js");
/* harmony import */var _file_services_path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_file_services_path__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/.pnpm/react@18.3.1/node_modules/react/index.js");
/* harmony import */var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */var react_router_dom__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/.pnpm/react-router@6.26.2_react@18.3.1/node_modules/react-router/dist/index.js");
/* harmony import */var _env_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/env.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");





class ActionUnauthorized extends Error {
    constructor(){
        super();
    }
}
class ActionRequestError extends Error {
    constructor(message){
        super(), (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__._)(this, "message", void 0), this.message = message;
    }
}
class ActionError extends Error {
    constructor(data){
        super(), (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_3__._)(this, "data", void 0), this.data = data;
    }
}
function getActionPath(urlPath) {
    return _file_services_path__WEBPACK_IMPORTED_MODULE_0___default().join(_env_js__WEBPACK_IMPORTED_MODULE_2__.env.appApiRoot, urlPath);
}
function actionCatchError(navigate) {
    return (error)=>{
        if (error instanceof ActionUnauthorized) {
            navigate('/login');
            return false;
        } else throw error;
    };
}
function useAction(router, arg, options) {
    const navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_4__.useNavigate)();
    const refArg = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(arg);
    refArg.current = arg;
    const argJson = JSON.stringify(arg);
    const refOptions = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(options);
    refOptions.current = options;
    const [data, setData] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)();
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)();
    const load = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((signal)=>{
        router.action(refArg.current).then((res)=>{
            if (signal.aborted) return;
            setData(res);
        }).catch((error)=>{
            if (signal.aborted) return;
            if (error instanceof ActionUnauthorized) {
                navigate('/login');
                return null;
            } else {
                setError(error);
            }
        });
    }, [
        navigate,
        router
    ]);
    const reload = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((options)=>{
        var _refOptions_current;
        if (((_refOptions_current = refOptions.current) === null || _refOptions_current === void 0 ? void 0 : _refOptions_current.clearWhenReload) !== false) {
            setData(undefined);
            setError(undefined);
        }
        load((options === null || options === void 0 ? void 0 : options.signal) ?? new AbortController().signal);
    }, [
        load
    ]);
    // load
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        if (!argJson) return;
        if ((options === null || options === void 0 ? void 0 : options.request) === false) return;
        const abort = new AbortController();
        reload({
            signal: abort.signal
        });
        return ()=>{
            abort.abort();
        };
    }, [
        argJson,
        options === null || options === void 0 ? void 0 : options.request,
        reload
    ]);
    return {
        data,
        reload,
        error
    };
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/route/router.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  URouter: function() { return URouter; }
});
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* harmony import */var _web_common_notification_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/web/common/notification.tsx");
/* harmony import */var _action_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/action.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");



class URouter {
    isMatch(ctx) {
        if (this.method !== ctx.method.toLowerCase()) return false;
        if (this.isDynamic) return ctx.pathname.startsWith(this.fullRoutePath);
        return this.fullRoutePath === ctx.pathname;
    }
    getDynamicPaths(pathname) {
        if (!this.isDynamic) return [];
        if (!pathname.startsWith(this.fullRoutePath)) throw new Error('getDynamicPaths pathname not match');
        return pathname.slice(this.fullRoutePath.length).replace(/^\/*/, '').split('/');
    }
    async action(body, signal) {
        const res = await fetch(this.fullRoutePath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            signal,
            body: body ? JSON.stringify(body) : null
        });
        if (res.status === 401) throw new _action_js__WEBPACK_IMPORTED_MODULE_1__.ActionUnauthorized();
        if (res.status.toString().startsWith('4')) {
            const json = await res.json();
            (0,_web_common_notification_js__WEBPACK_IMPORTED_MODULE_0__.notificationApi)().error({
                message: 'Error',
                description: json.message
            });
            throw new _action_js__WEBPACK_IMPORTED_MODULE_1__.ActionRequestError(json.message);
        }
        if (!res.status.toString().startsWith('2')) throw new _action_js__WEBPACK_IMPORTED_MODULE_1__.ActionError(await res.json());
        return await res.json();
    }
    route(handler) {
        this.handler = handler;
        return this;
    }
    routeLogined(handler) {
        this.route((context)=>{
            const session = context.req.session;
            const userInfo = session.userInfo();
            if (!userInfo) {
                context.res.status(401);
                return {};
            }
            return handler({
                ...context,
                userInfo
            });
        });
        return this;
    }
    constructor(routePath, { method = 'post', responseType = 'json', isDynamic = false } = {}){
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_2__._)(this, "routePath", void 0);
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_2__._)(this, "fullRoutePath", void 0);
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_2__._)(this, "method", void 0);
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_2__._)(this, "responseType", void 0);
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_2__._)(this, "isDynamic", void 0);
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_2__._)(this, "handler", void 0);
        this.routePath = routePath;
        this.fullRoutePath = (0,_action_js__WEBPACK_IMPORTED_MODULE_1__.getActionPath)(routePath);
        this.method = method;
        this.responseType = responseType;
        this.isDynamic = isDynamic;
    }
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/route/session.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  ErrorRequestResponse: function() { return ErrorRequestResponse; },
  USession: function() { return USession; },
  createUserStore: function() { return createUserStore; }
});
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* harmony import */var _env_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/env.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


class ErrorRequestResponse extends Error {
}
class USession {
    static fromNode(session) {
        return new this(session, null);
    }
    static fromBrowser() {
        return new this(null, {
            account: 'anonymous'
        });
    }
    userInfo() {
        if (this.browserUser) {
            return this.browserUser;
        } else if (this.nodeSession) {
            return this.nodeSession.user ? {
                account: this.nodeSession.user
            } : undefined;
        }
    }
    async userLogin(account, password) {
        if (!this.nodeSession) return false;
        if (_env_js__WEBPACK_IMPORTED_MODULE_0__.env.accounts.find((a)=>a.account === account && a.password === password)) {
            this.nodeSession.user = account;
            this.nodeSession.save();
            return true;
        } else {
            return false;
        }
    }
    async userLogout() {
        if (!this.nodeSession) return;
        this.nodeSession.user = undefined;
        this.nodeSession.save();
    }
    userLogined() {
        return !!this.userInfo();
    }
    async save() {
        if (this.nodeSession) this.nodeSession.save();
    }
    constructor(nodeSession, browserUser){
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_1__._)(this, "nodeSession", void 0);
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_1__._)(this, "browserUser", void 0);
        this.nodeSession = nodeSession;
        this.browserUser = browserUser;
    }
}
function createUserStore(session) {
    return {
        login: async (account, password)=>{
            if (_env_js__WEBPACK_IMPORTED_MODULE_0__.env.accounts.find((a)=>a.account === account && a.password === password)) {
                session.user = account;
                session.save();
                return true;
            } else {
                return false;
            }
        },
        logout: async ()=>{
            session.user = undefined;
            session.save();
        },
        logined () {
            return !!this.info();
        },
        info: ()=>{
            return session.user ? {
                account: session.user
            } : null;
        }
    };
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/util/browser.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  isBrowser: function() { return isBrowser; },
  isFirefox: function() { return isFirefox; },
  isMobile: function() { return isMobile; },
  isSafari: function() { return isSafari; },
  supportedTouch: function() { return supportedTouch; }
});
/* harmony import */var ismobilejs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/.pnpm/ismobilejs@1.1.1/node_modules/ismobilejs/esm/index.js");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");

const isBrowser = Boolean(__webpack_require__.g.window) || Boolean(__webpack_require__.g.navigator);
const supportedTouch = 'ontouchstart' in (isBrowser ? __webpack_require__.g.window ?? {} : {});
const isMobile = isBrowser && (0,ismobilejs__WEBPACK_IMPORTED_MODULE_0__["default"])(navigator.userAgent).any;
const isSafari = isBrowser && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isFirefox = isBrowser && navigator.userAgent.toLowerCase().includes('firefox');

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/util/collection.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  compact: function() { return compact; },
  find: function() { return find; },
  findIndex: function() { return findIndex; },
  findLast: function() { return findLast; },
  findLastIndex: function() { return findLastIndex; },
  findLastPair: function() { return findLastPair; },
  findPair: function() { return findPair; },
  groupToMap: function() { return groupToMap; },
  maxBy: function() { return maxBy; },
  maxIndexBy: function() { return maxIndexBy; },
  minBy: function() { return minBy; },
  minIndexBy: function() { return minIndexBy; },
  orderBy: function() { return orderBy; },
  range: function() { return range; },
  sum: function() { return sum; },
  uniq: function() { return uniq; },
  uniqBy: function() { return uniqBy; }
});
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");
function range(start, end) {
    let step = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : start < end ? 1 : -1;
    const result = [];
    if (step > 0) for(let i = start; i < end; i += step){
        result.push(i);
    }
    else if (step < 0) for(let i = start; i > end; i += step){
        result.push(i);
    }
    return result;
}
function compact(list) {
    return list.filter((it)=>!!it);
}
function findPair(list, predicate) {
    let startIndex = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
    let index = startIndex;
    while(index < list.length){
        const value = list[index];
        if (!value) continue;
        const testResult = predicate(value, index, list);
        if (testResult) {
            return [
                value,
                index
            ];
        }
        index += 1;
    }
    return [
        undefined,
        undefined
    ];
}
function findIndex(list, predicate, startIndex) {
    return findPair(list, predicate, startIndex)[1];
}
function find(list, predicate, startIndex) {
    return findPair(list, predicate, startIndex)[0];
}
function findLastPair(list, predicate) {
    let startIndex = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : list.length - 1;
    let index = startIndex;
    while(index >= 0){
        const value = list[index];
        if (!value) continue;
        const testResult = predicate(value, index, list);
        if (testResult) {
            return [
                value,
                index
            ];
        }
        index -= 1;
    }
    return [
        undefined,
        undefined
    ];
}
function findLastIndex(list, predicate, startIndex) {
    return findLastPair(list, predicate, startIndex)[1];
}
function findLast(list, predicate, startIndex) {
    return findLastPair(list, predicate, startIndex)[0];
}
function maxIndexBy(list, getValue) {
    let maxValue = null;
    let maxIndex = null;
    for (const [index, it] of list.entries()){
        const curValue = getValue(it, index, list);
        if (maxValue === null || curValue > maxValue) {
            maxValue = curValue;
            maxIndex = index;
        }
    }
    if (maxIndex === null) throw new Error('maxBy list is empty');
    return maxIndex;
}
function maxBy(list, getValue) {
    const index = maxIndexBy(list, getValue);
    return list[index];
}
function minIndexBy(list, getValue) {
    let minValue = null;
    let minIndex = null;
    for (const [index, it] of list.entries()){
        const curValue = getValue(it, index, list);
        if (minValue === null || curValue < minValue) {
            minValue = curValue;
            minIndex = index;
        }
    }
    if (minIndex === null) throw new Error('minBy list is empty');
    return minIndex;
}
function minBy(list, getValue) {
    const index = minIndexBy(list, getValue);
    return list[index];
}
function uniqBy(list, getValue) {
    const map = new Map();
    for (const [index, it] of list.entries()){
        const v = getValue(it, index, list);
        if (!map.has(v)) map.set(v, it);
    }
    return [
        ...map.values()
    ];
}
function uniq(list) {
    return uniqBy(list, (it)=>it);
}
function orderBy(list, order, getValue) {
    const listEntries = [
        ...list.entries()
    ];
    const getDiff = (va, vb)=>{
        if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb);
        else if (typeof va === 'number' && typeof vb === 'number') return va - vb;
        else if (typeof va === 'boolean' && typeof vb === 'boolean') return Number(va) - Number(vb);
        else if (Array.isArray(va) && Array.isArray(vb)) {
            for (const [idx, vaIt] of va.entries()){
                const vbIt = vb.at(idx);
                if (vbIt === undefined) return 0;
                const diff = getDiff(vaIt, vbIt);
                if (diff !== 0) return diff;
            }
            return 0;
        } else throw new Error(`no support order by type(${typeof va} vs ${typeof vb})`);
    };
    listEntries.sort((param, param1)=>{
        let [ai, a] = param, [bi, b] = param1;
        const va = getValue(a, ai, list);
        const vb = getValue(b, bi, list);
        return getDiff(va, vb);
    });
    if (order === 'desc') {
        listEntries.reverse();
    }
    return listEntries.map((it)=>it[1]);
}
function groupToMap(list, getKey) {
    const map = new Map();
    for (const [index, item] of list.entries()){
        const key = getKey(item, index, list);
        let group = map.get(key);
        if (!group) {
            group = [];
            map.set(key, group);
        }
        group.push(item);
    }
    return map;
}
function sum(list) {
    return list.reduce((ret, cur)=>ret + cur, 0);
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/util/converter.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  arrayBufferToBase64: function() { return arrayBufferToBase64; },
  arrayBufferToBuffer: function() { return arrayBufferToBuffer; },
  base64ToArrayBuffer: function() { return base64ToArrayBuffer; }
});
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (const byte of bytes){
        binary += String.fromCharCode(byte);
    }
    return window.btoa(binary);
}
function base64ToArrayBuffer(base64Str) {
    return Uint8Array.from(window.atob(base64Str), (c)=>c.charCodeAt(0));
}
function arrayBufferToBuffer(ab) {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for(let i = 0; i < buf.length; ++i){
        buf[i] = view[i];
    }
    return buf;
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/util/dom.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  HTMLImgs2DataURL: function() { return HTMLImgs2DataURL; },
  SVGImgs2DataURL: function() { return SVGImgs2DataURL; },
  eventBan: function() { return eventBan; },
  getDomView: function() { return getDomView; },
  isAnchorElement: function() { return isAnchorElement; },
  isElement: function() { return isElement; },
  isImageElement: function() { return isImageElement; },
  isInputElement: function() { return isInputElement; },
  isTextNode: function() { return isTextNode; },
  jsDOMParser: function() { return jsDOMParser; },
  requiredDomView: function() { return requiredDomView; },
  svgToDataUri: function() { return svgToDataUri; }
});
/* harmony import */var _url_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/util/url.ts");
/* harmony import */var _browser_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/util/browser.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const viewSym = Symbol('DOMView');
function isInputElement(element) {
    if (element instanceof Element) {
        const elemName = element.tagName.toLowerCase();
        if ([
            'textarea',
            'input'
        ].includes(elemName)) return true;
    }
    return false;
}
async function jsDOMParser(xml) {
    if (_browser_js__WEBPACK_IMPORTED_MODULE_1__.isBrowser) {
        const parser = new window.DOMParser();
        const doc = parser.parseFromString(xml, 'text/html');
        // @ts-ignore
        doc[viewSym] = window;
        return {
            view: window,
            doc
        };
    } else {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { JSDOM } = await Promise.resolve().then(function webpackMissingModule() { var e = new Error("Cannot find module 'jsdom'"); e.code = 'MODULE_NOT_FOUND'; throw e; });
        const jsdom = new JSDOM('', {
            pretendToBeVisual: true
        });
        const DOMParser = jsdom.window.DOMParser;
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/html');
        // @ts-ignore
        doc[viewSym] = jsdom.window;
        return {
            view: jsdom.window,
            doc
        };
    }
}
function getDomView(node) {
    var _node_ownerDocument, _node_ownerDocument1;
    return (node === null || node === void 0 ? void 0 : node.defaultView) || (node === null || node === void 0 ? void 0 : (_node_ownerDocument = node.ownerDocument) === null || _node_ownerDocument === void 0 ? void 0 : _node_ownerDocument.defaultView) || (node === null || node === void 0 ? void 0 : (_node_ownerDocument1 = node.ownerDocument) === null || _node_ownerDocument1 === void 0 ? void 0 : _node_ownerDocument1[viewSym]);
}
function requiredDomView(node) {
    const view = getDomView(node);
    if (!view) throw new Error('no dom view');
    return view;
}
function isTextNode(node) {
    const view = getDomView(node);
    return !!view && node instanceof view.Text;
}
function isElement(node) {
    const view = getDomView(node);
    return !!view && node instanceof view.HTMLElement;
}
function isImageElement(node) {
    const view = getDomView(node);
    return !!view && node instanceof view.HTMLImageElement;
}
function isAnchorElement(node) {
    const view = getDomView(node);
    return !!view && node instanceof view.HTMLAnchorElement;
}
async function HTMLImgs2DataURL(urlStr, element) {
    let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    const url = new URL(urlStr);
    const imgs = [
        ...element.querySelectorAll('img')
    ];
    const headers = new Headers({
        ...options.referrer ? {
            Referer: options.referrer ?? undefined
        } : {}
    });
    for (const img of imgs){
        let src = img.src || img.getAttribute('data-src');
        if (!src) continue;
        try {
            if (src.startsWith('//')) {
                src = `${url.protocol}:${src}`;
            }
            if (!(0,_url_js__WEBPACK_IMPORTED_MODULE_0__.isUrl)(src)) return;
            const res = await fetch(src, {
                headers
            });
            const contentType = res.headers.get('Content-Type');
            const buf = await res.arrayBuffer();
            img.src = `data:${contentType};base64,${Buffer.from(buf).toString('base64')}`;
        } catch (err) {
            console.error(err);
        }
    }
}
async function SVGImgs2DataURL(svgElement) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    const imgs = [
        ...svgElement.querySelectorAll('image')
    ];
    const headers = new Headers({
        ...options.referrer ? {
            Referer: options.referrer ?? undefined
        } : {}
    });
    for (const img of imgs){
        const relativeSrc = img.href.baseVal;
        if (!relativeSrc) continue;
        const src = options.baseURL ? new URL(relativeSrc, options.baseURL) : relativeSrc;
        try {
            const res = await fetch(src, {
                headers
            });
            const contentType = res.headers.get('Content-Type');
            const buf = await res.arrayBuffer();
            img.setAttribute('href', `data:${contentType};base64,${Buffer.from(buf).toString('base64')}`);
        } catch (err) {
            console.error(err);
        }
    }
}
async function svgToDataUri(svgElement, baseURL) {
    const clonedSvg = svgElement.cloneNode(true);
    await SVGImgs2DataURL(clonedSvg, {
        baseURL
    });
    clonedSvg.setAttribute('width', `${svgElement.clientWidth}px`);
    const xml = new XMLSerializer().serializeToString(clonedSvg);
    svgElement.cloneNode();
    const svg64 = window.btoa(xml);
    return `data:image/svg+xml;base64,${svg64}`;
}
function eventBan(event) {
    event.preventDefault();
    event.stopPropagation();
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/util/http.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  fetchDom: function() { return fetchDom; },
  fetchHtml: function() { return fetchHtml; }
});
/* harmony import */var _route_session_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/route/session.ts");
/* harmony import */var _dom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/util/dom.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


async function fetchHtml(url) {
    try {
        const res = await fetch(url);
        return await res.text();
    } catch (err) {
        const msg = err instanceof Error ? err.message : err === null || err === void 0 ? void 0 : err.toString();
        throw new _route_session_js__WEBPACK_IMPORTED_MODULE_0__.ErrorRequestResponse(msg);
    }
}
async function fetchDom(url) {
    const html = await fetchHtml(url);
    return (0,_dom_js__WEBPACK_IMPORTED_MODULE_1__.jsDOMParser)(html);
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/util/random.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  randomChar: function() { return randomChar; },
  randomRange: function() { return randomRange; },
  randomRangeInt: function() { return randomRangeInt; },
  randomString: function() { return randomString; }
});
/* harmony import */var _collection_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/util/collection.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");

function randomRange(start, end) {
    return Math.random() * (end - start) + start;
}
function randomRangeInt(start, end) {
    return Math.floor(Math.random() * (end - start + 1)) + start;
}
const CHAR_CODES = [
    ...(0,_collection_js__WEBPACK_IMPORTED_MODULE_0__.range)(0, 26).map((i)=>i + 65),
    ...(0,_collection_js__WEBPACK_IMPORTED_MODULE_0__.range)(0, 26).map((i)=>i + 97),
    ...(0,_collection_js__WEBPACK_IMPORTED_MODULE_0__.range)(0, 10).map((i)=>i + 48),
    33,
    44,
    46,
    58,
    59,
    63,
    64,
    95
];
function randomChar() {
    const charCodeIndex = randomRangeInt(0, CHAR_CODES.length - 1);
    return String.fromCharCode(CHAR_CODES[charCodeIndex]);
}
function randomString(len) {
    return (0,_collection_js__WEBPACK_IMPORTED_MODULE_0__.range)(0, len).map(()=>randomChar()).join();
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/util/readable.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  ReadableExtractor: function() { return ReadableExtractor; },
  walkerNode: function() { return walkerNode; }
});
/* harmony import */var _swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_class_private_field_get.js");
/* harmony import */var _swc_helpers_class_private_field_init__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_class_private_field_init.js");
/* harmony import */var _swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_class_private_field_set.js");
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* harmony import */var _consts_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/consts.ts");
/* harmony import */var _collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/util/collection.ts");
/* harmony import */var _dom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/util/dom.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");







function* walkerNode(doc, root) {
    const view = (0,_dom_js__WEBPACK_IMPORTED_MODULE_2__.requiredDomView)(root);
    const walker = doc.createTreeWalker(root, view.NodeFilter.SHOW_ALL);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while(true){
        const curNode = walker.nextNode();
        if (curNode) yield curNode;
        else break;
    }
}
/**
 * JSDOM getComputedStyle is not fully compatible with the DOM API.
 * - Property default could be empty
 * - Property inheritance is not supported
 */ function getComputedStyle(elem) {
    return (0,_dom_js__WEBPACK_IMPORTED_MODULE_2__.requiredDomView)(elem).getComputedStyle(elem);
}
const inlineElementNames = [
    'a',
    'abbr',
    'acronym',
    'b',
    'bdo',
    'big',
    'br',
    'button',
    'cite',
    'code',
    'dfn',
    'em',
    'i',
    'img',
    'input',
    'kbd',
    'label',
    'map',
    'object',
    'output',
    'q',
    'samp',
    'script',
    'select',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'textarea',
    'time',
    'tt',
    'var'
];
function isBlockElem(elem) {
    const display = getComputedStyle(elem).getPropertyValue('display');
    if (!display) return !inlineElementNames.includes(elem.tagName.toLowerCase());
    return ![
        'inline',
        'inline-block'
    ].includes(display);
}
const isIgnoreVerticalAlign = (elem)=>{
    const verticalAlign = getComputedStyle(elem).getPropertyValue('vertical-align');
    return verticalAlign && [
        'top',
        'bottom'
    ].includes(verticalAlign);
};
const ignoreTagNames = [
    // ruby > rt
    'rt',
    'noscript'
];
function getParentBlockElem(elem) {
    if (!elem) return;
    if (isBlockElem(elem)) {
        return elem;
    } else if (elem.parentElement) {
        return getParentBlockElem(elem.parentElement);
    }
}
function fixPageBreak(elem) {
    const style = getComputedStyle(elem);
    const breakBeforeList = [
        style.getPropertyValue('page-break-before'),
        style.getPropertyValue('break-before')
    ];
    if (breakBeforeList.some((b)=>b === 'always')) {
        elem.style.breakBefore = 'column';
    }
    const breakAfters = [
        style.getPropertyValue('page-break-after'),
        style.getPropertyValue('break-after')
    ];
    if (breakAfters.some((b)=>b === 'always')) {
        elem.style.breakAfter = 'column';
    }
}
function isAllInlineChild(elem) {
    if (elem.dataset.isAllInlineChild !== undefined) {
        return elem.dataset.isAllInlineChild === '1';
    }
    for (const node of elem.childNodes){
        if ((0,_dom_js__WEBPACK_IMPORTED_MODULE_2__.isElement)(node) && !node.classList.contains(_consts_js__WEBPACK_IMPORTED_MODULE_0__.PARA_IGNORE_CLASS) && (isBlockElem(node) || !isAllInlineChild(node))) {
            elem.dataset.isAllInlineChild = '0';
            return false;
        }
    }
    elem.dataset.isAllInlineChild = '1';
    return true;
}
var _parts = /*#__PURE__*/ new WeakMap(), _accAnchors = /*#__PURE__*/ new WeakMap(), _accNavAnchors = /*#__PURE__*/ new WeakMap(), _alias = /*#__PURE__*/ new WeakMap(), _navAnchorSet = /*#__PURE__*/ new WeakMap();
class ReadableExtractor {
    walk() {
        // walk
        for (const node of walkerNode(this.doc, this.doc.body)){
            var _node_textContent;
            if ((0,_dom_js__WEBPACK_IMPORTED_MODULE_2__.isElement)(node)) {
                // anchors
                if (node.id) {
                    this.addAnchor(node.id, (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_3__._)(this, _navAnchorSet).has(node.id));
                }
                // ruby
                if (node.tagName.toLowerCase() === 'ruby') {
                    this.addRuby(node);
                }
                fixPageBreak(node);
                // image
                if ((0,_dom_js__WEBPACK_IMPORTED_MODULE_2__.isImageElement)(node)) {
                    this.addImage(node);
                    continue;
                }
                // skip tag like: ruby > rt
                const tagName = node.tagName.toLowerCase();
                if (ignoreTagNames.includes(tagName)) {
                    node.classList.add(_consts_js__WEBPACK_IMPORTED_MODULE_0__.PARA_IGNORE_CLASS);
                    continue;
                }
                // skip ignored vertical-align
                if (isIgnoreVerticalAlign(node)) {
                    node.classList.add(_consts_js__WEBPACK_IMPORTED_MODULE_0__.PARA_IGNORE_CLASS);
                    continue;
                }
                // skip invisible
                const isVisible = // JSDom not support checkVisibility
                // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-unnecessary-condition
                node.checkVisibility ? node.checkVisibility({
                    contentVisibilityAuto: true,
                    checkOpacity: true,
                    visibilityProperty: true
                }) : true;
                if (!isVisible) {
                    node.classList.add(_consts_js__WEBPACK_IMPORTED_MODULE_0__.PARA_IGNORE_CLASS);
                    continue;
                }
            }
            // not text
            if (!(0,_dom_js__WEBPACK_IMPORTED_MODULE_2__.isTextNode)(node)) continue;
            // no content
            const content = (_node_textContent = node.textContent) === null || _node_textContent === void 0 ? void 0 : _node_textContent.trim();
            if (!content) continue;
            this.addText(node);
        }
    }
    popAccAnchors() {
        const anchors = (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_3__._)(this, _accAnchors);
        const navAnchors = (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_3__._)(this, _accNavAnchors);
        (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_4__._)(this, _accAnchors, undefined);
        (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_4__._)(this, _accNavAnchors, undefined);
        return {
            anchors,
            navAnchors
        };
    }
    addAnchor(id, isNavAnchor) {
        (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_4__._)(this, _accAnchors, (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_3__._)(this, _accAnchors) ?? []);
        (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_3__._)(this, _accAnchors).push(id);
        if (isNavAnchor) {
            (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_4__._)(this, _accNavAnchors, (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_3__._)(this, _accNavAnchors) ?? []);
            (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_3__._)(this, _accNavAnchors).push(id);
        }
    }
    addRuby(elem) {
        let source = '';
        let target = '';
        for (const node of walkerNode(this.doc, elem)){
            var _node_parentElement;
            if ((0,_dom_js__WEBPACK_IMPORTED_MODULE_2__.isElement)(node) && node.tagName.toLowerCase() === 'rt') {
                target += node.textContent;
            } else if ((0,_dom_js__WEBPACK_IMPORTED_MODULE_2__.isTextNode)(node) && !((_node_parentElement = node.parentElement) === null || _node_parentElement === void 0 ? void 0 : _node_parentElement.closest('rt'))) {
                source += node.textContent;
            }
        }
        if (source && target) {
            elem.dataset.isAlias = '1';
            (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_3__._)(this, _alias).push({
                source,
                target
            });
        }
    }
    addImage(elem) {
        const { anchors, navAnchors } = this.popAccAnchors();
        (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_3__._)(this, _parts).push({
            type: 'image',
            elem,
            anchors,
            navAnchors
        });
    }
    addText(text) {
        const { anchors, navAnchors } = this.popAccAnchors();
        (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_3__._)(this, _parts).push({
            type: 'text',
            elem: text,
            anchors,
            navAnchors
        });
    }
    getContentText(elem) {
        let contentText = '';
        for (const node of walkerNode(elem.ownerDocument, elem)){
            if (!(0,_dom_js__WEBPACK_IMPORTED_MODULE_2__.isTextNode)(node)) continue;
            if (!node.parentElement) continue;
            if (node.parentElement.closest(`.${_consts_js__WEBPACK_IMPORTED_MODULE_0__.PARA_IGNORE_CLASS}`)) continue;
            contentText += node.textContent;
        }
        return contentText;
    }
    toReadableParts() {
        const blockMap = new Map();
        const addTextPart = (blockElem, anchors, navAnchors)=>{
            blockElem.classList.add(_consts_js__WEBPACK_IMPORTED_MODULE_0__.PARA_BOX_CLASS);
            const textContent = this.getContentText(blockElem);
            const notEmpty = !!textContent.trim();
            if (notEmpty) {
                const part = {
                    elem: blockElem,
                    type: 'text',
                    text: textContent,
                    anchorIds: anchors,
                    navAnchorIds: navAnchors
                };
                blockMap.set(blockElem, part);
                readableParts.push(part);
            } else {
                blockMap.set(blockElem, null);
            }
        };
        const readableParts = [];
        for (const { type, elem, anchors, navAnchors } of (0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_3__._)(this, _parts)){
            switch(type){
                case 'image':
                    {
                        elem.classList.add(_consts_js__WEBPACK_IMPORTED_MODULE_0__.PARA_BOX_CLASS);
                        readableParts.push({
                            elem,
                            type: 'image',
                            anchorIds: anchors,
                            navAnchorIds: navAnchors
                        });
                        break;
                    }
                case 'text':
                    {
                        // no parent
                        const blockElem = getParentBlockElem(elem.parentElement);
                        if (!blockElem) continue;
                        // ignore class
                        if (blockElem.classList.contains(_consts_js__WEBPACK_IMPORTED_MODULE_0__.PARA_IGNORE_CLASS)) continue;
                        // avoid duplicated
                        const part = blockMap.get(blockElem);
                        if (part) {
                            if (anchors) {
                                var _part;
                                (_part = part).anchorIds ?? (_part.anchorIds = []);
                                part.anchorIds.push(...anchors);
                            }
                            if (navAnchors) {
                                var _part1;
                                (_part1 = part).navAnchorIds ?? (_part1.navAnchorIds = []);
                                part.navAnchorIds.push(...navAnchors);
                            }
                            continue;
                        }
                        if (isAllInlineChild(blockElem) && blockElem !== this.doc.body) {
                            addTextPart(blockElem, anchors, navAnchors);
                        } else {
                            // split block
                            if (!elem.parentElement) continue;
                            const wrapElem = this.doc.createElement('span');
                            elem.after(wrapElem);
                            wrapElem.appendChild(elem);
                            addTextPart(wrapElem, anchors, navAnchors);
                        }
                        break;
                    }
            }
        }
        return readableParts;
    }
    alias() {
        return (0,_collection_js__WEBPACK_IMPORTED_MODULE_1__.orderBy)((0,_swc_helpers_class_private_field_get__WEBPACK_IMPORTED_MODULE_3__._)(this, _alias), 'desc', (a)=>a.source.length);
    }
    constructor(doc, flattenedNavs){
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_5__._)(this, "doc", void 0);
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_5__._)(this, "flattenedNavs", void 0);
        (0,_swc_helpers_class_private_field_init__WEBPACK_IMPORTED_MODULE_6__._)(this, _parts, {
            writable: true,
            value: void 0
        });
        (0,_swc_helpers_class_private_field_init__WEBPACK_IMPORTED_MODULE_6__._)(this, _accAnchors, {
            writable: true,
            value: void 0
        });
        (0,_swc_helpers_class_private_field_init__WEBPACK_IMPORTED_MODULE_6__._)(this, _accNavAnchors, {
            writable: true,
            value: void 0
        });
        (0,_swc_helpers_class_private_field_init__WEBPACK_IMPORTED_MODULE_6__._)(this, _alias, {
            writable: true,
            value: void 0
        });
        (0,_swc_helpers_class_private_field_init__WEBPACK_IMPORTED_MODULE_6__._)(this, _navAnchorSet, {
            writable: true,
            value: void 0
        });
        this.doc = doc;
        this.flattenedNavs = flattenedNavs;
        (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_4__._)(this, _parts, []);
        (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_4__._)(this, _alias, []);
        (0,_swc_helpers_class_private_field_set__WEBPACK_IMPORTED_MODULE_4__._)(this, _navAnchorSet, new Set((0,_collection_js__WEBPACK_IMPORTED_MODULE_1__.compact)(this.flattenedNavs.map((n)=>n.hrefAnchor))));
        this.walk();
    }
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/util/text.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  capitalize: function() { return capitalize; },
  keywordMatches: function() { return keywordMatches; },
  splitLines: function() { return splitLines; },
  splitParagraph: function() { return splitParagraph; },
  textEllipsis: function() { return textEllipsis; }
});
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");
function splitLines(text) {
    return text.split(/\r?\n/);
}
function splitParagraph(text) {
    return text.split(/\r?\n\r?\n/);
}
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
function textEllipsis(text, maxLength) {
    if (!text) return '';
    if (text.length > maxLength + 3) {
        return `${text.slice(0, maxLength)}...`;
    }
    return text;
}
function keywordMatches(text, keyword) {
    function matchAllIndex(text, search) {
        const matchIndexes = [];
        let index = 0;
        const len = text.length;
        while(index < len){
            const m = text.indexOf(search, index);
            if (m === -1) break;
            matchIndexes.push(m);
            index = m + search.length;
        }
        return matchIndexes;
    }
    const keywordMatches = matchAllIndex(text, keyword.keyword).map((index)=>[
            index,
            keyword.keyword.length
        ]);
    const aliasMatches = [];
    if (keyword.alias) for (const alias of keyword.alias){
        const len = alias.length;
        const matches = matchAllIndex(text, alias).filter((m)=>!keywordMatches.some((k)=>k[0] <= m && k[0] + k[1] >= m + len));
        aliasMatches.push(...matches.map((m)=>[
                m,
                len
            ]));
    }
    return [
        ...keywordMatches,
        ...aliasMatches
    ];
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/util/url.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  isUrl: function() { return isUrl; },
  urlSplitAnchor: function() { return urlSplitAnchor; }
});
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");
function urlSplitAnchor(url) {
    const [mainUrl, anchorId] = url.split('#', 2);
    return [
        decodeURIComponent(mainUrl ?? ''),
        decodeURIComponent(anchorId ?? '')
    ];
}
function isUrl(url) {
    try {
        new URL(url);
        return true;
    } catch  {
        return false;
    }
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/core/util/xml-dom.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  XMLDOMLoader: function() { return XMLDOMLoader; },
  XMLElem: function() { return XMLElem; },
  parseXML: function() { return parseXML; }
});
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* harmony import */var buffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("?7b12");
/* harmony import */var buffer__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(buffer__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */var htmlparser2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/.pnpm/htmlparser2@9.1.0/node_modules/htmlparser2/lib/esm/index.js");
/* harmony import */var jszip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/.pnpm/jszip@3.10.1/node_modules/jszip/dist/jszip.min.js");
/* harmony import */var jszip__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jszip__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */var _browser_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./src/core/util/browser.ts");
/* harmony import */var _collection_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./src/core/util/collection.ts");
/* harmony import */var _dom_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./src/core/util/dom.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");







globalThis.Blob = _browser_js__WEBPACK_IMPORTED_MODULE_3__.isBrowser ? Blob : (buffer__WEBPACK_IMPORTED_MODULE_0___default().Blob);
(jszip__WEBPACK_IMPORTED_MODULE_2___default().support.blob) = true;
class XMLDOMLoader {
    async htmlToDOM(xml) {
        const dom = await (0,_dom_js__WEBPACK_IMPORTED_MODULE_5__.jsDOMParser)(xml);
        return dom.doc;
    }
    async xmlToDOM(xml) {
        const doc = await parseXML(xml);
        return new XMLElem(doc);
    }
    getFinalPath(filepath) {
        return filepath.startsWith('/') ? filepath.slice(1) : filepath;
    }
    async file(filepath) {
        const file = this.zip.file(this.getFinalPath(filepath));
        if (!file) return;
        return await file.async('blob');
    }
    async content(filepath) {
        const file = this.zip.file(this.getFinalPath(filepath));
        if (!file) return;
        return await file.async('string');
    }
    async htmlDom(filepath) {
        const xml = await this.content(filepath);
        if (!xml) return;
        const dom = await this.htmlToDOM(xml);
        return dom;
    }
    async xmlDom(filepath) {
        const xml = await this.content(filepath);
        if (!xml) return;
        const dom = await this.xmlToDOM(xml);
        return dom;
    }
    constructor(zip){
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_6__._)(this, "zip", void 0);
        this.zip = zip;
    }
}
function parseXML(xmlText) {
    return new Promise((resolve, reject)=>{
        // the full parsed object.
        let parsed;
        // the current node being parsed.
        let current;
        // stack of nodes leading to the current one.
        const stack = [];
        const parser = new htmlparser2__WEBPACK_IMPORTED_MODULE_1__.Parser({
            ontext (text) {
                var _current;
                if (!current) return;
                (_current = current).children ?? (_current.children = []);
                current.children.push(text);
            },
            onopentag (name, attributes) {
                const child = {
                    name,
                    attributes,
                    children: undefined
                };
                if (current) {
                    var _current;
                    (_current = current).children ?? (_current.children = []);
                    current.children.push(child);
                } else {
                    parsed = child;
                }
                stack.push(child);
                current = child;
            },
            onclosetag () {
                stack.pop();
                current = stack[stack.length - 1];
            },
            onend () {
                resolve(parsed);
            },
            onerror (error) {
                reject(error);
            }
        }, {
            xmlMode: true
        });
        parser.write(xmlText);
        parser.end();
    });
}
class XMLElem {
    static getDescendantsText(node) {
        if (typeof node === 'string') return node;
        if (!node.children) return;
        let text = '';
        for (const c of node.children){
            text += this.getDescendantsText(c);
        }
        return text;
    }
    get tagName() {
        return this.node.name;
    }
    getAttribute(attributeName) {
        return this.node.attributes[attributeName];
    }
    text() {
        return XMLElem.getDescendantsText(this.node);
    }
    children() {
        var _this_node_children;
        return (0,_collection_js__WEBPACK_IMPORTED_MODULE_4__.compact)(((_this_node_children = this.node.children) === null || _this_node_children === void 0 ? void 0 : _this_node_children.map((n)=>typeof n === 'object' ? new XMLElem(n) : undefined)) ?? []);
    }
    childrenFilter(tagName) {
        return this.children().filter((c)=>c.tagName === tagName);
    }
    /**
   * Find a child with the given name.
   * @param tagName - The name to find.
   */ findChild(tagName) {
        return this.children().find((it)=>it.tagName === tagName);
    }
    /**
   * Find all descendants with the given name.
   * @param tagName - The name to find.
   */ findDescendants(tagName) {
        const foundNodes = [];
        for (const elem of this.children()){
            if (elem.tagName === tagName) foundNodes.push(elem);
            foundNodes.push(...elem.findDescendants(tagName));
        }
        return foundNodes;
    }
    /**
   * Find a descendant with the given name.
   * @param tagName - The name to find.
   */ findDescendant(tagName) {
        for (const elem of this.children()){
            if (elem.tagName === tagName) return elem;
            const found = elem.findDescendant(tagName);
            if (found) return found;
        }
    }
    constructor(node){
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_6__._)(this, "node", void 0);
        this.node = node;
    }
}

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/web/common/notification.tsx": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  MessageProvider: function() { return MessageProvider; },
  NotificationProvider: function() { return NotificationProvider; },
  messageApi: function() { return messageApi; },
  notificationApi: function() { return notificationApi; }
});
/* harmony import */var jotai__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/.pnpm/jotai@2.10.0_@types+react@18.3.9_react@18.3.1/node_modules/jotai/esm/vanilla.mjs");
/* harmony import */var jotai__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/.pnpm/jotai@2.10.0_@types+react@18.3.9_react@18.3.1/node_modules/jotai/esm/react.mjs");
/* harmony import */var antd__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/.pnpm/antd@5.21.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/notification/index.js");
/* harmony import */var antd__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/.pnpm/antd@5.21.1_react-dom@18.3.1_react@18.3.1/node_modules/antd/es/message/index.js");
/* harmony import */var _store_global_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/web/store/global.ts");
/* harmony import */var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/.pnpm/react@18.3.1/node_modules/react/index.js");
/* harmony import */var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");
var _s = $RefreshSig$(), _s1 = $RefreshSig$();




const notificationApiAtom = (0,jotai__WEBPACK_IMPORTED_MODULE_2__.atom)(null);
const notificationApi = ()=>{
    const api = _store_global_js__WEBPACK_IMPORTED_MODULE_0__.globalStore.get(notificationApiAtom);
    if (api) return api;
    return antd__WEBPACK_IMPORTED_MODULE_3__["default"];
};
function NotificationProvider() {
    _s();
    const [api, contextHolder] = antd__WEBPACK_IMPORTED_MODULE_3__["default"].useNotification({
        placement: 'top',
        duration: 3
    });
    const [, setNotificationApi] = (0,jotai__WEBPACK_IMPORTED_MODULE_4__.useAtom)(notificationApiAtom);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        setNotificationApi(api);
    }, [
        api,
        setNotificationApi
    ]);
    return contextHolder;
}
_s(NotificationProvider, "zXt9NRbZq3687VRwsyczSKW2Hvk=", false, function() {
    return [
        antd__WEBPACK_IMPORTED_MODULE_3__["default"].useNotification,
        jotai__WEBPACK_IMPORTED_MODULE_4__.useAtom
    ];
});
_c = NotificationProvider;
const messageApiAtom = (0,jotai__WEBPACK_IMPORTED_MODULE_2__.atom)(null);
const messageApi = ()=>{
    const api = _store_global_js__WEBPACK_IMPORTED_MODULE_0__.globalStore.get(messageApiAtom);
    if (api) return api;
    return antd__WEBPACK_IMPORTED_MODULE_5__["default"];
};
function MessageProvider() {
    _s1();
    const [messageApi, contextHolder] = antd__WEBPACK_IMPORTED_MODULE_5__["default"].useMessage({
        duration: 3
    });
    const [, setMessageApi] = (0,jotai__WEBPACK_IMPORTED_MODULE_4__.useAtom)(messageApiAtom);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        setMessageApi(messageApi);
    }, [
        messageApi,
        setMessageApi
    ]);
    return contextHolder;
}
_s1(MessageProvider, "a8bYfX06o8DDRBYNF4kuFBOUchU=", false, function() {
    return [
        antd__WEBPACK_IMPORTED_MODULE_5__["default"].useMessage,
        jotai__WEBPACK_IMPORTED_MODULE_4__.useAtom
    ];
});
_c1 = MessageProvider;
var _c, _c1;
$RefreshReg$(_c, "NotificationProvider");
$RefreshReg$(_c1, "MessageProvider");

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"./src/web/store/global.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  globalStore: function() { return globalStore; }
});
/* harmony import */var jotai__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/.pnpm/jotai@2.10.0_@types+react@18.3.9_react@18.3.1/node_modules/jotai/esm/vanilla.mjs");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");

const globalStore = (0,jotai__WEBPACK_IMPORTED_MODULE_0__.createStore)();

function $RefreshSig$() {
  return $ReactRefreshRuntime$.createSignatureFunctionForTransform();
}
function $RefreshReg$(type, id) {
  $ReactRefreshRuntime$.register(type, module.id + "_" + id);
}
Promise.resolve().then(function() {
  $ReactRefreshRuntime$.refresh(module.id, module.hot);
});


}),
"?e773": (function () {
/* (ignored) */

}),
"?377a": (function () {
/* (ignored) */

}),
"?7cc7": (function () {
/* (ignored) */

}),
"?7b12": (function () {
/* (ignored) */

}),

}]);
//# sourceMappingURL=src_core_api_books_annotations-delete_ts-src_core_api_books_annotations-upsert_ts-src_core_ap-ec553f.js.map