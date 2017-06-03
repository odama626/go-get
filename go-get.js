/******/ (function(modules) { // webpackBootstrap
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
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
/******/ 	return __webpack_require__(__webpack_require__.s = 385);
/******/ })
/************************************************************************/
/******/ ({

/***/ 385:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Filter get and post request results
 *
 * @param {Object} data object to be filtered
 * @param {Object} filter json object used to filter other objects
 *  Use -  key: val | $in: [] | $range: [min, max]
 *
 *  key: val only returns objects with matching values
 *  $in: [] filter out results not in array
 *  $range: [min, max] filter out numbers not in range
 */
function filter(filter) {
    var self = this;
    // this.map: [this.$*] 
    this.$first = function (data, filter) {
        return data.slice(0, filter);
    };
    this.$last = function (data, filter) {
        return data.slice(data.length - filter, data.length);
    };
    this.recurse = function (data, filter) {
        var keys = Object.keys(filter).sort();
        var i = 0,
            m = 0,
            func = false;
        for (; i < keys.length; i++) {
            var d = data[keys[i]],
                f = filter[keys[i]];
            for (; m < self.map.length; m++) {
                if (keys[i] === self.map[m]) {
                    data = self[self.map[m]](data, f);
                    func = true;
                    break;
                }
            }
            if (!func && typeof d === 'object' && typeof f === 'object') {
                data[keys[i]] = self.recurse(d, f);
            }
        }
        return data;
    };
    this.go = function (data) {
        return self.recurse(data, filter);
    };
    // create map of all $ functions
    this.map = Object.keys(this).filter(function (val) {
        return val.indexOf('$') === 0;
    });
    // Attach filter to promise
    var r = this.then(this.go);
    return r;
}
exports.filter = filter;
var Go = function () {
    function Go(baseUrl, options) {
        if (baseUrl === void 0) {
            baseUrl = '';
        }
        if (options === void 0) {
            options = {};
        }
        this.baseUrl = baseUrl;
        this.options = options;
    }
    Go.prototype.get = function (urlEndpoint) {
        if (urlEndpoint === void 0) {
            urlEndpoint = '';
        }
        return this.buildRequest(urlEndpoint, undefined, 'GET');
    };
    Go.prototype.post = function (urlEndpoint, json) {
        return this.buildRequest(urlEndpoint, json, 'POST');
    };
    Go.prototype.query = function (url, query, json, method) {
        if (method === void 0) {
            method = 'GET';
        }
        if (query == null || typeof query === 'undefined') return Promise.reject({ status: 0, msg: 'query required, did you mean to use get?' });
        var keys = Object.keys(query);
        var q = url + keys.reduce(function (acc, val, i) {
            return acc + (i == 0 ? '' : '&') + (encodeURIComponent(val) + "=" + encodeURIComponent(query[val]));
        }, '?');
        return this.buildRequest(q, json, method);
    };
    Go.prototype.buildRequest = function (url, json, method) {
        var data;
        var request = JSON.parse(JSON.stringify(this.options));
        //request.credentials = 'include';
        if (json !== null && typeof json !== 'undefined') {
            var keys = Object.keys(json);
            data = new FormData();
            for (var i = 0; i < keys.length; i++) {
                data.append(keys[i], json[keys[i]]);
            }
        }
        if (data !== null && typeof data !== 'undefined') {
            request.body = data;
            if (method !== 'POST') {
                console.warn('Go', '- GET requests cannot include data (json)! use query or post.', '-- using post instead');
                method = 'POST';
            }
        }
        if (typeof method !== 'undefined' && method !== null) {
            request.method = method;
        }
        var chain = fetch(this.baseUrl + url, request).then(this.checkStatus).then(this.checkEmpty);
        chain.__proto__.filter = filter;
        return chain;
    };
    Go.prototype.checkStatus = function (r) {
        if (!r.ok) throw { status: r.status, msg: r.statusText, response: r };
        return r.json();
    };
    Go.prototype.checkEmpty = function (r) {
        if (Object.keys(r).length === 0 && r.constructor === Object) {
            throw { status: 1000, msg: 'empty response', response: r };
        }
        return r;
    };
    return Go;
}();
exports.Go = Go;
window.Go = Go;

/***/ })

/******/ });
//# sourceMappingURL=Go.js.map
