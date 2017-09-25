(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["botamp"] = factory();
	else
		root["botamp"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var api, api_key, page_id, promise, api_base = 'https://app.botamp.com/api/v1/';

window.addEventListener('click', function(e) {
  href = e.target.getAttribute('href')

  if (!(e.target.tagName.toLowerCase() == 'a' && href.includes('m.me/')))
    return;

  var saved_id = saved_contact_id();
  if (saved_id == null)
    return;

  e.preventDefault();
  document.location.href = href + '?ref=' + encodeURIComponent('botamp?btp_cid=' + saved_id);
}, false)

var Botamp = function Botamp() {}

function api_url(resource, id, sub_resource) {
  url = api_base + resource;
  if (id != undefined)
    url += ('/' + id);
  if (sub_resource != undefined)
    url += ('/' + sub_resource)
  return url;
}

function set_request_headers() {
  api.setRequestHeader('Content-Type', 'application/vnd.api+json');
  api.setRequestHeader('Authorization', "Basic " + btoa(api_key + ':'));
  api.withCredentials = true;
}

function request_body(resource, attributes) {
  body = {
    'data': {
      'type': resource,
      'attributes': attributes,
    }
  }

  return JSON.stringify(body);
}

function contact_id_key() {
  return 'botamp_' + page_id + '_contact_id';
}

function saved_contact_id() {
  return localStorage.getItem(contact_id_key());
}

function create_contact(attributes) {
  promise.then(function() {
    api.open('POST', api_url('contacts'));
    set_request_headers();
    api.onload = function() {
      if(api.status === 201) {
        localStorage.setItem(contact_id_key(), JSON.parse(api.responseText)['data']['id'])
      }
    }
    api.send(request_body('contacts', attributes))
  })
}

function update_contact(id, attributes) {
  promise.then(function(){
    api.open('PUT', api_url('contacts', id));
    set_request_headers();
    api.send(request_body('contacts', attributes))
  })
}

Botamp.prototype.load = function(public_api_key) {
  api_key = public_api_key;

  api = new XMLHttpRequest();

  promise = new Promise(function(resolve, reject){
    api.open('GET', api_url('me'), true);
    api.onload = function() {
      if(api.status == 200) {
        page_id = JSON.parse(api.responseText)['data']['id'];

        match_contact_id = window.location.href.match(/btp_cid=(\d+)/);
        if (match_contact_id != null) {
          api.open('GET', api_url('contacts',match_contact_id[1]), true);
          api.onload = function() {
            if(api.status == 200)
              localStorage.setItem(contact_id_key(), match_contact_id[1]);
          }
          set_request_headers();
          api.send();
        }

        resolve();
      }
      else {
        reject();
      }
    }

    api.onerror = function() {
      reject();
    }
    set_request_headers();
    api.send();
  })

  promise.catch(function(error) {
    throw error;
  })
}

Botamp.prototype.identify = function() {
  if (arguments.length == 1) {
    var saved_id = saved_contact_id();
    if (saved_id == null)
      create_contact(arguments[0])
    else
      update_contact(saved_id, arguments[0])
  } else if (arguments.length == 2) {
    update_contact(arguments[0], arguments[1])
  }
}

Botamp.prototype.track = function(name, properties) {
  promise.then(function() {
    api.open('POST', api_url('contacts', saved_contact_id(), 'events'));
    set_request_headers();
    api.send(request_body('events', {name: name, properties: properties}))
  })
}

module.export = new Botamp()

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)(module)))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ })
/******/ ]);
});