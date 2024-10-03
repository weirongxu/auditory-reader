(() => { // webpackBootstrap
"use strict";
var __webpack_modules__ = ({
"./src/core/api/books/property.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  booksPropertyRouter: function() { return booksPropertyRouter; }
});
/* harmony import */var _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/book/book-manager.ts");
/* harmony import */var _route_router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/route/router.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


const booksPropertyRouter = new _route_router_js__WEBPACK_IMPORTED_MODULE_1__.URouter('books/property').routeLogined(async (param)=>{
    let { req, userInfo } = param;
    const body = await req.body;
    const bookEntity = await _book_book_manager_js__WEBPACK_IMPORTED_MODULE_0__.bookManager.entity(userInfo.account, body.uuid);
    return bookEntity.readProp();
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
"./src/core/api/index.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  ROUTERS: function() { return ROUTERS; }
});
/* harmony import */var _books_annotations_delete_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/api/books/annotations-delete.ts");
/* harmony import */var _books_annotations_upsert_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/api/books/annotations-upsert.ts");
/* harmony import */var _books_annotations_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/api/books/annotations.ts");
/* harmony import */var _books_cover_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./src/core/api/books/cover.ts");
/* harmony import */var _books_create_by_url_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./src/core/api/books/create-by-url.ts");
/* harmony import */var _books_create_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./src/core/api/books/create.ts");
/* harmony import */var _books_download_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./src/core/api/books/download.ts");
/* harmony import */var _books_fetch_url_info_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__("./src/core/api/books/fetch-url-info.ts");
/* harmony import */var _books_move_after_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__("./src/core/api/books/move-after.ts");
/* harmony import */var _books_move_top_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__("./src/core/api/books/move-top.ts");
/* harmony import */var _books_page_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__("./src/core/api/books/page.ts");
/* harmony import */var _books_position_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__("./src/core/api/books/position.ts");
/* harmony import */var _books_property_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__("./src/core/api/books/property.ts");
/* harmony import */var _books_remove_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__("./src/core/api/books/remove.ts");
/* harmony import */var _books_render_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__("./src/core/api/books/render.ts");
/* harmony import */var _books_search_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__("./src/core/api/books/search.ts");
/* harmony import */var _books_show_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__("./src/core/api/books/show.ts");
/* harmony import */var _books_position_sync_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__("./src/core/api/books/position-sync.ts");
/* harmony import */var _books_tmp_store_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__("./src/core/api/books/tmp-store.ts");
/* harmony import */var _books_update_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__("./src/core/api/books/update.ts");
/* harmony import */var _books_view_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__("./src/core/api/books/view.ts");
/* harmony import */var _login_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__("./src/core/api/login.ts");
/* harmony import */var _logout_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__("./src/core/api/logout.ts");
/* harmony import */var _user_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__("./src/core/api/user.ts");
/* harmony import */var _books_keywords_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__("./src/core/api/books/keywords.ts");
/* harmony import */var _books_keywords_upsert_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__("./src/core/api/books/keywords-upsert.ts");
/* harmony import */var _books_keywords_delete_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__("./src/core/api/books/keywords-delete.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");



























const ROUTERS = [
    _login_js__WEBPACK_IMPORTED_MODULE_21__.loginRouter,
    _logout_js__WEBPACK_IMPORTED_MODULE_22__.logoutRouter,
    _user_js__WEBPACK_IMPORTED_MODULE_23__.userRouter,
    _books_create_js__WEBPACK_IMPORTED_MODULE_5__.booksCreateRouter,
    _books_fetch_url_info_js__WEBPACK_IMPORTED_MODULE_7__.booksFetchUrlInfoRouter,
    _books_tmp_store_js__WEBPACK_IMPORTED_MODULE_18__.booksTmpStoreRouter,
    _books_create_by_url_js__WEBPACK_IMPORTED_MODULE_4__.booksCreateByUrlRouter,
    _books_move_after_js__WEBPACK_IMPORTED_MODULE_8__.booksMoveAfterRouter,
    _books_move_top_js__WEBPACK_IMPORTED_MODULE_9__.booksMoveTopRouter,
    _books_page_js__WEBPACK_IMPORTED_MODULE_10__.booksPageRouter,
    _books_remove_js__WEBPACK_IMPORTED_MODULE_13__.booksRemoveRouter,
    _books_show_js__WEBPACK_IMPORTED_MODULE_16__.booksShowRouter,
    _books_download_js__WEBPACK_IMPORTED_MODULE_6__.booksDownloadRouter,
    _books_position_js__WEBPACK_IMPORTED_MODULE_11__.booksPositionRouter,
    _books_position_sync_js__WEBPACK_IMPORTED_MODULE_17__.booksPositionSyncRouter,
    _books_property_js__WEBPACK_IMPORTED_MODULE_12__.booksPropertyRouter,
    _books_annotations_js__WEBPACK_IMPORTED_MODULE_2__.booksAnnotationsRouter,
    _books_annotations_upsert_js__WEBPACK_IMPORTED_MODULE_1__.booksAnnotationsUpsertRouter,
    _books_annotations_delete_js__WEBPACK_IMPORTED_MODULE_0__.booksAnnotationsDeleteRouter,
    _books_keywords_js__WEBPACK_IMPORTED_MODULE_24__.booksKeywordsRouter,
    _books_keywords_upsert_js__WEBPACK_IMPORTED_MODULE_25__.booksKeywordsUpsertRouter,
    _books_keywords_delete_js__WEBPACK_IMPORTED_MODULE_26__.booksKeywordsDeleteRouter,
    _books_update_js__WEBPACK_IMPORTED_MODULE_19__.booksUpdateRouter,
    _books_view_js__WEBPACK_IMPORTED_MODULE_20__.booksViewRouter,
    _books_cover_js__WEBPACK_IMPORTED_MODULE_3__.booksCoverRouter,
    _books_render_js__WEBPACK_IMPORTED_MODULE_14__.booksRenderRouter,
    _books_search_js__WEBPACK_IMPORTED_MODULE_15__.booksSearchRouter
];

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
"./src/core/route/request.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  URequest: function() { return URequest; }
});
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* harmony import */var _session_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/core/route/session.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");


class URequest {
    static fromNode(req, dynamicPaths) {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(req.query)){
            if (typeof value === 'string') searchParams.append(key, value);
            else if (Array.isArray(value)) {
                for (const item of value)if (typeof item === 'string') searchParams.append(key, item);
            }
        }
        return new this({
            searchParams: ()=>searchParams,
            body: ()=>req.body,
            url: ()=>req.url,
            session: ()=>_session_js__WEBPACK_IMPORTED_MODULE_0__.USession.fromNode(req.session),
            paths: ()=>dynamicPaths
        });
    }
    static fromBrowser(req, dynamicPaths) {
        return new this({
            searchParams: ()=>new URLSearchParams(req.url.split('?')[1]),
            body: async ()=>await req.json(),
            url: ()=>req.url,
            session: ()=>_session_js__WEBPACK_IMPORTED_MODULE_0__.USession.fromBrowser(),
            paths: ()=>dynamicPaths
        });
    }
    get searchParams() {
        return this.getter.searchParams();
    }
    get body() {
        return this.getter.body();
    }
    get url() {
        return this.getter.url();
    }
    get paths() {
        return this.getter.paths();
    }
    get session() {
        return this.getter.session();
    }
    constructor(getter){
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_1__._)(this, "getter", void 0);
        this.getter = getter;
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
"./src/core/route/response.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  UResponse: function() { return UResponse; },
  UResponseHold: function() { return UResponseHold; }
});
/* harmony import */var _swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/.pnpm/@swc+helpers@0.5.13/node_modules/@swc/helpers/esm/_define_property.js");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");

class UResponseHold {
    constructor(){
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_0__._)(this, "headers", {});
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_0__._)(this, "status", void 0);
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class UResponse {
    static fromNode(res) {
        return new this({
            header: (name, value)=>res.setHeader(name, value),
            status: (s)=>res.status(s)
        });
    }
    static fromBrowser(res) {
        return new this({
            header: (name, value)=>res.headers[name] = value.toString(),
            status: (code)=>res.status = code
        });
    }
    header(name, value) {
        this.setter.header(name, value);
        return this;
    }
    status(code) {
        this.setter.status(code);
        return this;
    }
    constructor(setter){
        (0,_swc_helpers_define_property__WEBPACK_IMPORTED_MODULE_0__._)(this, "setter", void 0);
        this.setter = setter;
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
"./src/web/service-worker/api.ts": (function (module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return __WEBPACK_DEFAULT_EXPORT__; }
});
/* harmony import */var is_plain_obj__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/.pnpm/is-plain-obj@4.1.0/node_modules/is-plain-obj/index.js");
/* harmony import */var _core_api_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/core/api/index.ts");
/* harmony import */var _core_route_action_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./src/core/route/action.ts");
/* harmony import */var _core_route_request_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./src/core/route/request.ts");
/* harmony import */var _core_route_response_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./src/core/route/response.ts");
/* harmony import */var _core_route_session_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./src/core/route/session.ts");
/* provided dependency */ var $ReactRefreshRuntime$ = __webpack_require__("./node_modules/.pnpm/@rspack+plugin-react-refresh@1.0.0_react-refresh@0.14.2/node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js");
/// <reference lib="webworker"/>






/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (null);
self.addEventListener('install', (event)=>{
    // eslint-disable-next-line no-console
    console.log('service-worker: installed');
    event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', (event)=>{
    // eslint-disable-next-line no-console
    console.log('service-worker: activate event in progress.');
    event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (event)=>{
    const req = event.request;
    const url = new URL(req.url);
    if (url.hostname !== location.hostname || !url.pathname.startsWith((0,_core_route_action_js__WEBPACK_IMPORTED_MODULE_2__.getActionPath)(''))) return;
    const router = _core_api_index_js__WEBPACK_IMPORTED_MODULE_1__.ROUTERS.find((r)=>r.isMatch({
            method: req.method,
            pathname: url.pathname
        }));
    if (router === null || router === void 0 ? void 0 : router.handler) {
        const resH = new _core_route_response_js__WEBPACK_IMPORTED_MODULE_4__.UResponseHold();
        event.respondWith(Promise.resolve(router.handler({
            req: _core_route_request_js__WEBPACK_IMPORTED_MODULE_3__.URequest.fromBrowser(req, router.getDynamicPaths(url.pathname)),
            res: _core_route_response_js__WEBPACK_IMPORTED_MODULE_4__.UResponse.fromBrowser(resH)
        })).then((body)=>{
            const data = (0,is_plain_obj__WEBPACK_IMPORTED_MODULE_0__["default"])(body) ? JSON.stringify(body) : body;
            return new Response(data, {
                status: resH.status ?? 200,
                headers: resH.headers
            });
        }).catch((error)=>{
            if (error instanceof _core_route_session_js__WEBPACK_IMPORTED_MODULE_5__.ErrorRequestResponse) {
                return new Response(JSON.stringify({
                    message: error.message
                }), {
                    status: 400,
                    headers: resH.headers
                });
            } else {
                const msg = error instanceof Error ? error.message : error === null || error === void 0 ? void 0 : error.toString();
                console.error(error);
                return new Response(JSON.stringify({
                    message: msg
                }), {
                    status: 500,
                    headers: resH.headers
                });
            }
        }));
    }
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
"./node_modules/.pnpm/is-plain-obj@4.1.0/node_modules/is-plain-obj/index.js": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return isPlainObject; }
});
function isPlainObject(value) {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);
	return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}


}),

});
/************************************************************************/
// The module cache
var __webpack_module_cache__ = {};

// The require function
function __webpack_require__(moduleId) {

// Check if module is in cache
var cachedModule = __webpack_module_cache__[moduleId];
if (cachedModule !== undefined) {
if (cachedModule.error !== undefined) throw cachedModule.error;
return cachedModule.exports;
}
// Create a new module (and put it into the cache)
var module = (__webpack_module_cache__[moduleId] = {
id: moduleId,
loaded: false,
exports: {}
});
// Execute the module function
try {

var execOptions = { id: moduleId, module: module, factory: __webpack_modules__[moduleId], require: __webpack_require__ };
__webpack_require__.i.forEach(function(handler) { handler(execOptions); });
module = execOptions.module;
if (!execOptions.factory) {
  console.error("undefined factory", moduleId)
}
execOptions.factory.call(module.exports, module, module.exports, execOptions.require);

} catch (e) {
module.error = e;
throw e;
}
// Flag the module as loaded
module.loaded = true;
// Return the exports of the module
return module.exports;

}

// expose the modules object (__webpack_modules__)
__webpack_require__.m = __webpack_modules__;

// expose the module cache
__webpack_require__.c = __webpack_module_cache__;

// expose the module execution interceptor
__webpack_require__.i = [];

// the startup function
__webpack_require__.x = () => {
// Load entry module and return exports
var __webpack_exports__ = __webpack_require__.O(undefined, ["lib-react", "lib-router", "vendors-node_modules_pnpm_mozilla_readability_0_5_0_node_modules_mozilla_readability_index_js-9ac323", "src_core_api_books_annotations-delete_ts-src_core_api_books_annotations-upsert_ts-src_core_ap-ec553f"], function() { return __webpack_require__("./src/web/service-worker/api.ts") });
__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
return __webpack_exports__
};

/************************************************************************/
// webpack/runtime/compat_get_default_export
(() => {
// getDefaultExport function for compatibility with non-harmony modules
__webpack_require__.n = function (module) {
	var getter = module && module.__esModule ?
		function () { return module['default']; } :
		function () { return module; };
	__webpack_require__.d(getter, { a: getter });
	return getter;
};




})();
// webpack/runtime/create_fake_namespace_object
(() => {
var getProto = Object.getPrototypeOf ? function(obj) { return Object.getPrototypeOf(obj); } : function(obj) { return obj.__proto__ };
var leafPrototypes;
// create a fake namespace object
// mode & 1: value is a module id, require it
// mode & 2: merge all properties of value into the ns
// mode & 4: return value when already ns object
// mode & 16: return value when it's Promise-like
// mode & 8|1: behave like require
__webpack_require__.t = function(value, mode) {
	if(mode & 1) value = this(value);
	if(mode & 8) return value;
	if(typeof value === 'object' && value) {
		if((mode & 4) && value.__esModule) return value;
		if((mode & 16) && typeof value.then === 'function') return value;
	}
	var ns = Object.create(null);
	__webpack_require__.r(ns);
	var def = {};
	leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
	for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
		Object.getOwnPropertyNames(current).forEach(function(key) { def[key] = function() { return  value[key]; } });
	}
	def['default'] = function() { return value };
	__webpack_require__.d(ns, def);
	return ns;
};
})();
// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = function(exports, definition) {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// webpack/runtime/ensure_chunk
(() => {
__webpack_require__.f = {};
// This file contains only the entry chunk.
// The chunk loading function for additional chunks
__webpack_require__.e = function (chunkId) {
	return Promise.all(
		Object.keys(__webpack_require__.f).reduce(function (promises, key) {
			__webpack_require__.f[key](chunkId, promises);
			return promises;
		}, [])
	);
};

})();
// webpack/runtime/get javascript chunk filename
(() => {
// This function allow to reference chunks
        __webpack_require__.u = function (chunkId) {
          // return url for filenames not based on template
          
          // return url for filenames based on template
          return "static/js/" + chunkId + ".js";
        };
      
})();
// webpack/runtime/get mini-css chunk filename
(() => {
// This function allow to reference chunks
        __webpack_require__.miniCssF = function (chunkId) {
          // return url for filenames not based on template
          
          // return url for filenames based on template
          return "" + chunkId + ".css";
        };
      
})();
// webpack/runtime/get_chunk_update_filename
(() => {
__webpack_require__.hu = function (chunkId) {
            return '' + chunkId + '.' + __webpack_require__.h() + '.hot-update.js';
         };
        
})();
// webpack/runtime/get_full_hash
(() => {
__webpack_require__.h = function () {
	return "104b90b2efb00369";
};

})();
// webpack/runtime/get_main_filename/update manifest
(() => {
__webpack_require__.hmrF = function () {
            return "459ec68cf2d7a63c." + __webpack_require__.h() + ".hot-update.json";
         };
        
})();
// webpack/runtime/global
(() => {
__webpack_require__.g = (function () {
	if (typeof globalThis === 'object') return globalThis;
	try {
		return this || new Function('return this')();
	} catch (e) {
		if (typeof window === 'object') return window;
	}
})();

})();
// webpack/runtime/harmony_module_decorator
(() => {
__webpack_require__.hmd = function (module) {
    module = Object.create(module);
    if (!module.children) module.children = [];
    Object.defineProperty(module, 'exports', {
        enumerable: true,
        set: function () {
            throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
        }
    });
    return module;
};
})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = function (obj, prop) {
	return Object.prototype.hasOwnProperty.call(obj, prop);
};

})();
// webpack/runtime/hot_module_replacement
(() => {
var currentModuleData = {};
var installedModules = __webpack_require__.c;

// module and require creation
var currentChildModule;
var currentParents = [];

// status
var registeredStatusHandlers = [];
var currentStatus = "idle";

// while downloading
var blockingPromises = 0;
var blockingPromisesWaiting = [];

// The update info
var currentUpdateApplyHandlers;
var queuedInvalidatedModules;

__webpack_require__.hmrD = currentModuleData;
__webpack_require__.i.push(function (options) {
	var module = options.module;
	var require = createRequire(options.require, options.id);
	module.hot = createModuleHotObject(options.id, module);
	module.parents = currentParents;
	module.children = [];
	currentParents = [];
	options.require = require;
});

__webpack_require__.hmrC = {};
__webpack_require__.hmrI = {};

function createRequire(require, moduleId) {
	var me = installedModules[moduleId];
	if (!me) return require;
	var fn = function (request) {
		if (me.hot.active) {
			if (installedModules[request]) {
				var parents = installedModules[request].parents;
				if (parents.indexOf(moduleId) === -1) {
					parents.push(moduleId);
				}
			} else {
				currentParents = [moduleId];
				currentChildModule = request;
			}
			if (me.children.indexOf(request) === -1) {
				me.children.push(request);
			}
		} else {
			console.warn(
				"[HMR] unexpected require(" +
				request +
				") from disposed module " +
				moduleId
			);
			currentParents = [];
		}
		return require(request);
	};
	var createPropertyDescriptor = function (name) {
		return {
			configurable: true,
			enumerable: true,
			get: function () {
				return require[name];
			},
			set: function (value) {
				require[name] = value;
			}
		};
	};
	for (var name in require) {
		if (Object.prototype.hasOwnProperty.call(require, name) && name !== "e") {
			Object.defineProperty(fn, name, createPropertyDescriptor(name));
		}
	}

	fn.e = function (chunkId, fetchPriority) {
		return trackBlockingPromise(require.e(chunkId, fetchPriority));
	};

	return fn;
}

function createModuleHotObject(moduleId, me) {
	var _main = currentChildModule !== moduleId;
	var hot = {
		_acceptedDependencies: {},
		_acceptedErrorHandlers: {},
		_declinedDependencies: {},
		_selfAccepted: false,
		_selfDeclined: false,
		_selfInvalidated: false,
		_disposeHandlers: [],
		_main: _main,
		_requireSelf: function () {
			currentParents = me.parents.slice();
			currentChildModule = _main ? undefined : moduleId;
			__webpack_require__(moduleId);
		},
		active: true,
		accept: function (dep, callback, errorHandler) {
			if (dep === undefined) hot._selfAccepted = true;
			else if (typeof dep === "function") hot._selfAccepted = dep;
			else if (typeof dep === "object" && dep !== null) {
				for (var i = 0; i < dep.length; i++) {
					hot._acceptedDependencies[dep[i]] = callback || function () { };
					hot._acceptedErrorHandlers[dep[i]] = errorHandler;
				}
			} else {
				hot._acceptedDependencies[dep] = callback || function () { };
				hot._acceptedErrorHandlers[dep] = errorHandler;
			}
		},
		decline: function (dep) {
			if (dep === undefined) hot._selfDeclined = true;
			else if (typeof dep === "object" && dep !== null)
				for (var i = 0; i < dep.length; i++)
					hot._declinedDependencies[dep[i]] = true;
			else hot._declinedDependencies[dep] = true;
		},
		dispose: function (callback) {
			hot._disposeHandlers.push(callback);
		},
		addDisposeHandler: function (callback) {
			hot._disposeHandlers.push(callback);
		},
		removeDisposeHandler: function (callback) {
			var idx = hot._disposeHandlers.indexOf(callback);
			if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
		},
		invalidate: function () {
			this._selfInvalidated = true;
			switch (currentStatus) {
				case "idle":
					currentUpdateApplyHandlers = [];
					Object.keys(__webpack_require__.hmrI).forEach(function (key) {
						__webpack_require__.hmrI[key](moduleId, currentUpdateApplyHandlers);
					});
					setStatus("ready");
					break;
				case "ready":
					Object.keys(__webpack_require__.hmrI).forEach(function (key) {
						__webpack_require__.hmrI[key](moduleId, currentUpdateApplyHandlers);
					});
					break;
				case "prepare":
				case "check":
				case "dispose":
				case "apply":
					(queuedInvalidatedModules = queuedInvalidatedModules || []).push(
						moduleId
					);
					break;
				default:
					break;
			}
		},
		check: hotCheck,
		apply: hotApply,
		status: function (l) {
			if (!l) return currentStatus;
			registeredStatusHandlers.push(l);
		},
		addStatusHandler: function (l) {
			registeredStatusHandlers.push(l);
		},
		removeStatusHandler: function (l) {
			var idx = registeredStatusHandlers.indexOf(l);
			if (idx >= 0) registeredStatusHandlers.splice(idx, 1);
		},
		data: currentModuleData[moduleId]
	};
	currentChildModule = undefined;
	return hot;
}

function setStatus(newStatus) {
	currentStatus = newStatus; 
	var results = [];
	for (var i = 0; i < registeredStatusHandlers.length; i++)
		results[i] = registeredStatusHandlers[i].call(null, newStatus);

	return Promise.all(results).then(function () { });
}

function unblock() {
	if (--blockingPromises === 0) {
		setStatus("ready").then(function () {
			if (blockingPromises === 0) {
				var list = blockingPromisesWaiting;
				blockingPromisesWaiting = [];
				for (var i = 0; i < list.length; i++) {
					list[i]();
				}
			}
		});
	}
}

function trackBlockingPromise(promise) {
	switch (currentStatus) {
		case "ready":
			setStatus("prepare");
		case "prepare":
			blockingPromises++;
			promise.then(unblock, unblock);
			return promise;
		default:
			return promise;
	}
}

function waitForBlockingPromises(fn) {
	if (blockingPromises === 0) return fn();
	return new Promise(function (resolve) {
		blockingPromisesWaiting.push(function () {
			resolve(fn());
		});
	});
}

function hotCheck(applyOnUpdate) {
	if (currentStatus !== "idle") {
		throw new Error("check() is only allowed in idle status");
	} 
	return setStatus("check")
		.then(__webpack_require__.hmrM)
		.then(function (update) {
			if (!update) {
				return setStatus(applyInvalidatedModules() ? "ready" : "idle").then(
					function () {
						return null;
					}
				);
			}

			return setStatus("prepare").then(function () {
				var updatedModules = [];
				currentUpdateApplyHandlers = [];

				return Promise.all(
					Object.keys(__webpack_require__.hmrC).reduce(function (
						promises,
						key
					) {
						__webpack_require__.hmrC[key](
							update.c,
							update.r,
							update.m,
							promises,
							currentUpdateApplyHandlers,
							updatedModules
						);
						return promises;
					},
						[])
				).then(function () {
					return waitForBlockingPromises(function () {
						if (applyOnUpdate) {
							return internalApply(applyOnUpdate);
						}
						return setStatus("ready").then(function () {
							return updatedModules;
						});
					});
				});
			});
		});
}

function hotApply(options) {
	if (currentStatus !== "ready") {
		return Promise.resolve().then(function () {
			throw new Error(
				"apply() is only allowed in ready status (state: " + currentStatus + ")"
			);
		});
	}
	return internalApply(options);
}

function internalApply(options) {
	options = options || {};
	applyInvalidatedModules();
	var results = currentUpdateApplyHandlers.map(function (handler) {
		return handler(options);
	});
	currentUpdateApplyHandlers = undefined;
	var errors = results
		.map(function (r) {
			return r.error;
		})
		.filter(Boolean);

	if (errors.length > 0) {
		return setStatus("abort").then(function () {
			throw errors[0];
		});
	}

	var disposePromise = setStatus("dispose");

	results.forEach(function (result) {
		if (result.dispose) result.dispose();
	});

	var applyPromise = setStatus("apply");

	var error;
	var reportError = function (err) {
		if (!error) error = err;
	};

	var outdatedModules = [];
	results.forEach(function (result) {
		if (result.apply) {
			var modules = result.apply(reportError);
			if (modules) {
				for (var i = 0; i < modules.length; i++) {
					outdatedModules.push(modules[i]);
				}
			}
		}
	});

	return Promise.all([disposePromise, applyPromise]).then(function () {
		if (error) {
			return setStatus("fail").then(function () {
				throw error;
			});
		}

		if (queuedInvalidatedModules) {
			return internalApply(options).then(function (list) {
				outdatedModules.forEach(function (moduleId) {
					if (list.indexOf(moduleId) < 0) list.push(moduleId);
				});
				return list;
			});
		}

		return setStatus("idle").then(function () {
			return outdatedModules;
		});
	});
}

function applyInvalidatedModules() {
	if (queuedInvalidatedModules) {
		if (!currentUpdateApplyHandlers) currentUpdateApplyHandlers = [];
		Object.keys(__webpack_require__.hmrI).forEach(function (key) {
			queuedInvalidatedModules.forEach(function (moduleId) {
				__webpack_require__.hmrI[key](moduleId, currentUpdateApplyHandlers);
			});
		});
		queuedInvalidatedModules = undefined;
		return true;
	}
}

})();
// webpack/runtime/make_namespace_object
(() => {
// define __esModule on exports
__webpack_require__.r = function(exports) {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};

})();
// webpack/runtime/node_module_decorator
(() => {
__webpack_require__.nmd = function (module) {
    module.paths = [];
    if (!module.children) module.children = [];
    return module;
};
})();
// webpack/runtime/on_chunk_loaded
(() => {
var deferred = [];
__webpack_require__.O = function (result, chunkIds, fn, priority) {
	if (chunkIds) {
		priority = priority || 0;
		for (var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--)
			deferred[i] = deferred[i - 1];
		deferred[i] = [chunkIds, fn, priority];
		return;
	}
	var notFulfilled = Infinity;
	for (var i = 0; i < deferred.length; i++) {
		var chunkIds = deferred[i][0],
			fn = deferred[i][1],
			priority = deferred[i][2];
		var fulfilled = true;
		for (var j = 0; j < chunkIds.length; j++) {
			if (
				(priority & (1 === 0) || notFulfilled >= priority) &&
				Object.keys(__webpack_require__.O).every(function (key) {
					return __webpack_require__.O[key](chunkIds[j]);
				})
			) {
				chunkIds.splice(j--, 1);
			} else {
				fulfilled = false;
				if (priority < notFulfilled) notFulfilled = priority;
			}
		}
		if (fulfilled) {
			deferred.splice(i--, 1);
			var r = fn();
			if (r !== undefined) result = r;
		}
	}
	return result;
};

})();
// webpack/runtime/public_path
(() => {
__webpack_require__.p = "/";

})();
// webpack/runtime/rspack_version
(() => {
__webpack_require__.rv = function () {
	return "1.0.8";
};

})();
// webpack/runtime/startup_chunk_dependencies
(() => {
var next = __webpack_require__.x;
        __webpack_require__.x = function() {
          return Promise.all(["lib-react","lib-router","vendors-node_modules_pnpm_mozilla_readability_0_5_0_node_modules_mozilla_readability_index_js-9ac323","src_core_api_books_annotations-delete_ts-src_core_api_books_annotations-upsert_ts-src_core_ap-ec553f"].map(__webpack_require__.e, __webpack_require__)).then(next);
        };
})();
// webpack/runtime/css loading
(() => {
if (typeof document === "undefined") return;
var createStylesheet = function (
	chunkId, fullhref, oldTag, resolve, reject
) {
	var linkTag = document.createElement("link");
	
	linkTag.rel = "stylesheet";
	linkTag.type="text/css";
	if (__webpack_require__.nc) {
		linkTag.nonce = __webpack_require__.nc;
	}
	var onLinkComplete = function (event) {
		// avoid mem leaks.
		linkTag.onerror = linkTag.onload = null;
		if (event.type === 'load') {
			resolve();
		} else {
			var errorType = event && (event.type === 'load' ? 'missing' : event.type);
			var realHref = event && event.target && event.target.href || fullhref;
			var err = new Error("Loading CSS chunk " + chunkId + " failed.\\n(" + realHref + ")");
			err.code = "CSS_CHUNK_LOAD_FAILED";
			err.type = errorType;
			err.request = realHref;
			if (linkTag.parentNode) linkTag.parentNode.removeChild(linkTag)
			reject(err);
		}
	}

	linkTag.onerror = linkTag.onload = onLinkComplete;
	linkTag.href = fullhref;
	
	if (oldTag) {
  oldTag.parentNode.insertBefore(linkTag, oldTag.nextSibling);
} else {
  document.head.appendChild(linkTag);
}
	return linkTag;
}
var findStylesheet = function (href, fullhref) {
	var existingLinkTags = document.getElementsByTagName("link");
	for (var i = 0; i < existingLinkTags.length; i++) {
		var tag = existingLinkTags[i];
		var dataHref = tag.getAttribute("data-href") || tag.getAttribute("href");
		if (tag.rel === "stylesheet" && (dataHref === href || dataHref === fullhref)) return tag;
	}

	var existingStyleTags = document.getElementsByTagName("style");
	for (var i = 0; i < existingStyleTags.length; i++) {
		var tag = existingStyleTags[i];
		var dataHref = tag.getAttribute("data-href");
		if (dataHref === href || dataHref === fullhref) return tag;
	}
}

var loadStylesheet = function (chunkId) {
	return new Promise(function (resolve, reject) {
		var href = __webpack_require__.miniCssF(chunkId);
		var fullhref = __webpack_require__.p + href;
		if (findStylesheet(href, fullhref)) return resolve();
		createStylesheet(chunkId, fullhref, null, resolve, reject);
	})
}

// no chunk loading
var oldTags = [];
var newTags = [];
var applyHandler = function (options) {
	return {
		dispose: function () {
			for (var i = 0; i < oldTags.length; i++) {
				var oldTag = oldTags[i];
				if (oldTag.parentNode) oldTag.parentNode.removeChild(oldTag);
			}
			oldTags.length = 0;
		},
		apply: function () {
			for (var i = 0; i < newTags.length; i++) newTags[i].rel = "stylesheet";
			newTags.length = 0;
		}
	}
}
__webpack_require__.hmrC.miniCss = function (chunkIds, removedChunks, removedModules, promises, applyHandlers, updatedModulesList) {
	applyHandlers.push(applyHandler);
	chunkIds.forEach(function (chunkId) {
		var href = __webpack_require__.miniCssF(chunkId);
		var fullhref = __webpack_require__.p + href;
		var oldTag = findStylesheet(href, fullhref);
		if (!oldTag) return;
		promises.push(new Promise(function (resolve, reject) {
			var tag = createStylesheet(
				chunkId,
				fullhref,
				oldTag,
				function () {
					tag.as = "style";
					tag.rel = "preload";
					resolve();
				},
				reject
			);
			oldTags.push(oldTag);
			newTags.push(tag);
		}))
	});
}


})();
// webpack/runtime/import_scripts_chunk_loading
(() => {
var installedChunks = __webpack_require__.hmrS_importScripts = __webpack_require__.hmrS_importScripts || {"src_web_service-worker_api_ts": 1,};
// importScripts chunk loading
var installChunk = function (data) {
    var chunkIds = data[0];
    var moreModules = data[1];
    var runtime = data[2];
    for (var moduleId in moreModules) {
        if (__webpack_require__.o(moreModules, moduleId)) {
            __webpack_require__.m[moduleId] = moreModules[moduleId];
        }
    }
    if (runtime) runtime(__webpack_require__);
    while (chunkIds.length) installedChunks[chunkIds.pop()] = 1;
    parentChunkLoadingFunction(data);
};
__webpack_require__.f.i = function (chunkId, promises) {
    
          // "1" is the signal for "already loaded
          if (!installedChunks[chunkId]) {
            if (true) {
              importScripts(__webpack_require__.p + __webpack_require__.u(chunkId));
            }
          }
          
};
var chunkLoadingGlobal = self["webpackChunkauditory_reader"] = self["webpackChunkauditory_reader"] || [];
var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
chunkLoadingGlobal.push = installChunk;
function loadUpdateChunk(chunkId, updatedModulesList) {
    var success = false;
    self["webpackHotUpdateauditory_reader"] = function (_, moreModules, runtime) {
        for (var moduleId in moreModules) {
            if (__webpack_require__.o(moreModules, moduleId)) {
                currentUpdate[moduleId] = moreModules[moduleId];
                if (updatedModulesList) updatedModulesList.push(moduleId);
            }
        }
        if (runtime) currentUpdateRuntime.push(runtime);
        success = true;
    };
    // start update chunk loading
    importScripts(__webpack_require__.p + __webpack_require__.hu(chunkId));
    if (!success) throw new Error("Loading update chunk failed for unknown reason");
}
var currentUpdateChunks;
var currentUpdate;
var currentUpdateRemovedChunks;
var currentUpdateRuntime;
function applyHandler(options) {
	if (__webpack_require__.f) delete __webpack_require__.f.importScriptsHmr;
	currentUpdateChunks = undefined;
	function getAffectedModuleEffects(updateModuleId) {
		var outdatedModules = [updateModuleId];
		var outdatedDependencies = {};
		var queue = outdatedModules.map(function (id) {
			return {
				chain: [id],
				id: id
			};
		});
		while (queue.length > 0) {
			var queueItem = queue.pop();
			var moduleId = queueItem.id;
			var chain = queueItem.chain;
			var module = __webpack_require__.c[moduleId];
			if (
				!module ||
				(module.hot._selfAccepted && !module.hot._selfInvalidated)
			) {
				continue;
			}

			if (module.hot._selfDeclined) {
				return {
					type: "self-declined",
					chain: chain,
					moduleId: moduleId
				};
			}

			if (module.hot._main) {
				return {
					type: "unaccepted",
					chain: chain,
					moduleId: moduleId
				};
			}

			for (var i = 0; i < module.parents.length; i++) {
				var parentId = module.parents[i];
				var parent = __webpack_require__.c[parentId];
				if (!parent) {
					continue;
				}
				if (parent.hot._declinedDependencies[moduleId]) {
					return {
						type: "declined",
						chain: chain.concat([parentId]),
						moduleId: moduleId,
						parentId: parentId
					};
				}
				if (outdatedModules.indexOf(parentId) !== -1) {
					continue;
				}
				if (parent.hot._acceptedDependencies[moduleId]) {
					if (!outdatedDependencies[parentId]) {
						outdatedDependencies[parentId] = [];
					}
					addAllToSet(outdatedDependencies[parentId], [moduleId]);
					continue;
				}
				delete outdatedDependencies[parentId];
				outdatedModules.push(parentId);
				queue.push({
					chain: chain.concat([parentId]),
					id: parentId
				});
			}
		}

		return {
			type: "accepted",
			moduleId: updateModuleId,
			outdatedModules: outdatedModules,
			outdatedDependencies: outdatedDependencies
		};
	}

	function addAllToSet(a, b) {
		for (var i = 0; i < b.length; i++) {
			var item = b[i];
			if (a.indexOf(item) === -1) a.push(item);
		}
	}

	var outdatedDependencies = {};
	var outdatedModules = [];
	var appliedUpdate = {};

	var warnUnexpectedRequire = function warnUnexpectedRequire(module) {
		console.warn(
			"[HMR] unexpected require(" + module.id + ") to disposed module"
		);
	};

	for (var moduleId in currentUpdate) {
		if (__webpack_require__.o(currentUpdate, moduleId)) {
			var newModuleFactory = currentUpdate[moduleId];
			var result = newModuleFactory ? getAffectedModuleEffects(moduleId) : {
				type: "disposed",
				moduleId: moduleId
			};
			var abortError = false;
			var doApply = false;
			var doDispose = false;
			var chainInfo = "";
			if (result.chain) {
				chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
			}
			switch (result.type) {
				case "self-declined":
					if (options.onDeclined) options.onDeclined(result);
					if (!options.ignoreDeclined)
						abortError = new Error(
							"Aborted because of self decline: " + result.moduleId + chainInfo
						);
					break;
				case "declined":
					if (options.onDeclined) options.onDeclined(result);
					if (!options.ignoreDeclined)
						abortError = new Error(
							"Aborted because of declined dependency: " +
							result.moduleId +
							" in " +
							result.parentId +
							chainInfo
						);
					break;
				case "unaccepted":
					if (options.onUnaccepted) options.onUnaccepted(result);
					if (!options.ignoreUnaccepted)
						abortError = new Error(
							"Aborted because " + moduleId + " is not accepted" + chainInfo
						);
					break;
				case "accepted":
					if (options.onAccepted) options.onAccepted(result);
					doApply = true;
					break;
				case "disposed":
					if (options.onDisposed) options.onDisposed(result);
					doDispose = true;
					break;
				default:
					throw new Error("Unexception type " + result.type);
			}
			if (abortError) {
				return {
					error: abortError
				};
			}
			if (doApply) {
				appliedUpdate[moduleId] = newModuleFactory;
				addAllToSet(outdatedModules, result.outdatedModules);
				for (moduleId in result.outdatedDependencies) {
					if (__webpack_require__.o(result.outdatedDependencies, moduleId)) {
						if (!outdatedDependencies[moduleId])
							outdatedDependencies[moduleId] = [];
						addAllToSet(
							outdatedDependencies[moduleId],
							result.outdatedDependencies[moduleId]
						);
					}
				}
			}
			if (doDispose) {
				addAllToSet(outdatedModules, [result.moduleId]);
				appliedUpdate[moduleId] = warnUnexpectedRequire;
			}
		}
	}
	currentUpdate = undefined;

	var outdatedSelfAcceptedModules = [];
	for (var j = 0; j < outdatedModules.length; j++) {
		var outdatedModuleId = outdatedModules[j];
		var module = __webpack_require__.c[outdatedModuleId];
		if (
			module &&
			(module.hot._selfAccepted || module.hot._main) &&
			// removed self-accepted modules should not be required
			appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire &&
			// when called invalidate self-accepting is not possible
			!module.hot._selfInvalidated
		) {
			outdatedSelfAcceptedModules.push({
				module: outdatedModuleId,
				require: module.hot._requireSelf,
				errorHandler: module.hot._selfAccepted
			});
		}
	} 

	var moduleOutdatedDependencies;
	return {
		dispose: function () {
			currentUpdateRemovedChunks.forEach(function (chunkId) {
				delete installedChunks[chunkId];
			});
			currentUpdateRemovedChunks = undefined;

			var idx;
			var queue = outdatedModules.slice();
			while (queue.length > 0) {
				var moduleId = queue.pop();
				var module = __webpack_require__.c[moduleId];
				if (!module) continue;

				var data = {};

				// Call dispose handlers
				var disposeHandlers = module.hot._disposeHandlers; 
				for (j = 0; j < disposeHandlers.length; j++) {
					disposeHandlers[j].call(null, data);
				}
				__webpack_require__.hmrD[moduleId] = data;

				module.hot.active = false;

				delete __webpack_require__.c[moduleId];

				delete outdatedDependencies[moduleId];

				for (j = 0; j < module.children.length; j++) {
					var child = __webpack_require__.c[module.children[j]];
					if (!child) continue;
					idx = child.parents.indexOf(moduleId);
					if (idx >= 0) {
						child.parents.splice(idx, 1);
					}
				}
			}

			var dependency;
			for (var outdatedModuleId in outdatedDependencies) {
				if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
					module = __webpack_require__.c[outdatedModuleId];
					if (module) {
						moduleOutdatedDependencies = outdatedDependencies[outdatedModuleId];
						for (j = 0; j < moduleOutdatedDependencies.length; j++) {
							dependency = moduleOutdatedDependencies[j];
							idx = module.children.indexOf(dependency);
							if (idx >= 0) module.children.splice(idx, 1);
						}
					}
				}
			}
		},
		apply: function (reportError) {
			// insert new code
			for (var updateModuleId in appliedUpdate) {
				if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
					__webpack_require__.m[updateModuleId] = appliedUpdate[updateModuleId]; 
				}
			}

			// run new runtime modules
			for (var i = 0; i < currentUpdateRuntime.length; i++) {
				currentUpdateRuntime[i](__webpack_require__);
			}

			// call accept handlers
			for (var outdatedModuleId in outdatedDependencies) {
				if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
					var module = __webpack_require__.c[outdatedModuleId];
					if (module) {
						moduleOutdatedDependencies = outdatedDependencies[outdatedModuleId];
						var callbacks = [];
						var errorHandlers = [];
						var dependenciesForCallbacks = [];
						for (var j = 0; j < moduleOutdatedDependencies.length; j++) {
							var dependency = moduleOutdatedDependencies[j];
							var acceptCallback = module.hot._acceptedDependencies[dependency];
							var errorHandler = module.hot._acceptedErrorHandlers[dependency];
							if (acceptCallback) {
								if (callbacks.indexOf(acceptCallback) !== -1) continue;
								callbacks.push(acceptCallback);
								errorHandlers.push(errorHandler); 
								dependenciesForCallbacks.push(dependency);
							}
						}
						for (var k = 0; k < callbacks.length; k++) {
							try {
								callbacks[k].call(null, moduleOutdatedDependencies);
							} catch (err) {
								if (typeof errorHandlers[k] === "function") {
									try {
										errorHandlers[k](err, {
											moduleId: outdatedModuleId,
											dependencyId: dependenciesForCallbacks[k]
										});
									} catch (err2) {
										if (options.onErrored) {
											options.onErrored({
												type: "accept-error-handler-errored",
												moduleId: outdatedModuleId,
												dependencyId: dependenciesForCallbacks[k],
												error: err2,
												originalError: err
											});
										}
										if (!options.ignoreErrored) {
											reportError(err2);
											reportError(err);
										}
									}
								} else {
									if (options.onErrored) {
										options.onErrored({
											type: "accept-errored",
											moduleId: outdatedModuleId,
											dependencyId: dependenciesForCallbacks[k],
											error: err
										});
									}
									if (!options.ignoreErrored) {
										reportError(err);
									}
								}
							}
						}
					}
				}
			}

			// Load self accepted modules
			for (var o = 0; o < outdatedSelfAcceptedModules.length; o++) {
				var item = outdatedSelfAcceptedModules[o];
				var moduleId = item.module;
				try {
					item.require(moduleId);
				} catch (err) {
					if (typeof item.errorHandler === "function") {
						try {
							item.errorHandler(err, {
								moduleId: moduleId,
								module: __webpack_require__.c[moduleId]
							});
						} catch (err1) {
							if (options.onErrored) {
								options.onErrored({
									type: "self-accept-error-handler-errored",
									moduleId: moduleId,
									error: err1,
									originalError: err
								});
							}
							if (!options.ignoreErrored) {
								reportError(err1);
								reportError(err);
							}
						}
					} else {
						if (options.onErrored) {
							options.onErrored({
								type: "self-accept-errored",
								moduleId: moduleId,
								error: err
							});
						}
						if (!options.ignoreErrored) {
							reportError(err);
						}
					}
				}
			}

			return outdatedModules;
		}
	};
}

__webpack_require__.hmrI.importScripts = function (moduleId, applyHandlers) {
	if (!currentUpdate) {
		currentUpdate = {};
		currentUpdateRuntime = [];
		currentUpdateRemovedChunks = [];
		applyHandlers.push(applyHandler);
	}
	if (!__webpack_require__.o(currentUpdate, moduleId)) {
		currentUpdate[moduleId] = __webpack_require__.m[moduleId];
	}
};

__webpack_require__.hmrC.importScripts = function (
	chunkIds,
	removedChunks,
	removedModules,
	promises,
	applyHandlers,
	updatedModulesList
) {
	applyHandlers.push(applyHandler);
	currentUpdateChunks = {};
	currentUpdateRemovedChunks = removedChunks;
	currentUpdate = removedModules.reduce(function (obj, key) {
		obj[key] = false;
		return obj;
	}, {});
	currentUpdateRuntime = [];
	chunkIds.forEach(function (chunkId) {
		if (
			__webpack_require__.o(installedChunks, chunkId) &&
			installedChunks[chunkId] !== undefined
		) {
			promises.push(loadUpdateChunk(chunkId, updatedModulesList));
			currentUpdateChunks[chunkId] = true;
		} else {
			currentUpdateChunks[chunkId] = false;
		}
	});
	if (__webpack_require__.f) {
		__webpack_require__.f.importScriptsHmr = function (chunkId, promises) {
			if (
				currentUpdateChunks &&
				__webpack_require__.o(currentUpdateChunks, chunkId) &&
				!currentUpdateChunks[chunkId]
			) {
				promises.push(loadUpdateChunk(chunkId));
				currentUpdateChunks[chunkId] = true;
			}
		};
	}
};
__webpack_require__.hmrM = function () {
    if (typeof fetch === "undefined") throw new Error("No browser support: need fetch API");
    return fetch(__webpack_require__.p + __webpack_require__.hmrF()).then(
		function (response) {
			if (response.status === 404) return; // no update available
			if (!response.ok)
				throw new Error(
					"Failed to fetch update manifest " + response.statusText
				);
			return response.json();
		}
	);
};
})();
// webpack/runtime/rspack_unique_id
(() => {
__webpack_require__.ruid = "bundler=rspack@1.0.8";

})();
/************************************************************************/
// module cache are used so entry inlining is disabled
// run startup
var __webpack_exports__ = __webpack_require__.x();
})()
;
//# sourceMappingURL=src_web_service-worker_api_ts.js.map