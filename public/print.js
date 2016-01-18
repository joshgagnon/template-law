/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(429);
	
	var _pagify = __webpack_require__(428);
	
	var _pagify2 = _interopRequireDefault(_pagify);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	document.addEventListener("DOMContentLoaded", function (event) {
	    (0, _pagify2.default)(document.getElementsByClassName('document')[0]);
	});

/***/ },

/***/ 428:
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = pagify;
	function pagify(node) {
	    var current = node.querySelector('.page');
	    while (current.scrollHeight > current.clientHeight) {
	        var newPage = document.createElement('div');
	        newPage.className = "page extra";
	        node.appendChild(newPage);
	        while (current.scrollHeight > current.clientHeight) {
	
	            if (!current.lastChild.clientHeight || current.lastChild.clientHeight < current.clientHeight) {
	                newPage.insertBefore(current.lastChild, newPage.firstChild);
	            } else {
	                // recurse, i guess
	                break;
	            }
	        };
	        current = newPage;
	    }
	    var pages = node.querySelectorAll('.extra');
	    Array.prototype.map.call(pages, function (page, i) {
	        var el = document.createElement('div');
	        el.className = "page-number";
	        el.textContent = i + 2;
	        page.appendChild(el);
	    });
	}

/***/ },

/***/ 429:
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }

/******/ });
//# sourceMappingURL=print.js.map