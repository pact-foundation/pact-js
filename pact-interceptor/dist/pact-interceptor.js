module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _mitm = __webpack_require__(1);

	var _mitm2 = _interopRequireDefault(_mitm);

	var _url = __webpack_require__(13);

	var _lodash = __webpack_require__(14);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _lodash3 = __webpack_require__(15);

	var _lodash4 = _interopRequireDefault(_lodash3);

	var _superagentBluebirdPromise = __webpack_require__(23);

	var _superagentBluebirdPromise2 = _interopRequireDefault(_superagentBluebirdPromise);

	var _logger = __webpack_require__(121);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Interceptor = function () {
	  function Interceptor(proxyHost) {
	    _classCallCheck(this, Interceptor);

	    if ((0, _lodash2.default)(proxyHost)) {
	      throw new Error('Please provide a proxy to route the request to.');
	    }

	    this.whitelist = [(0, _url.parse)(proxyHost)];
	    this.mitm = (0, _mitm2.default)();
	    this.mitm.disable();
	    this.disabled = true;
	    this.proxyHost = proxyHost;
	  }

	  _createClass(Interceptor, [{
	    key: 'interceptRequestsOn',
	    value: function interceptRequestsOn(url) {
	      var blacklist = [];

	      if ((0, _lodash2.default)(url)) {
	        _logger.logger.info('!!!! INTERCEPTING ALL REQUESTS !!!!');
	      } else {
	        _logger.logger.info('Intercepting URL "' + url + '"');
	        blacklist.push((0, _url.parse)(url));
	      }

	      _logger.logger.info('Enabling interceptor.');
	      this.mitm.enable();
	      this.disabled = false;

	      var whitelist = this.whitelist;
	      this.mitm.on('connect', function (socket, opts) {
	        var port = opts.port || null;

	        _logger.logger.info('Intercepting connection with hostname "' + opts.host + '", port "' + port + '"');

	        var foundBypass = !!(0, _lodash4.default)(whitelist, { hostname: opts.host, port: port });
	        var shouldIntercept = !!(0, _lodash4.default)(blacklist, { hostname: opts.host, port: port });
	        if (foundBypass || !shouldIntercept) {
	          _logger.logger.info('Bypassing request to "' + opts.host + '"');
	          socket.bypass();
	        }
	      });

	      var proxyHost = this.proxyHost;
	      this.mitm.on('request', function (req, res) {
	        _logger.logger.info('Request intercepted. Triggering call to Mock Server on "' + proxyHost + req.url + '"');
	        _superagentBluebirdPromise2.default[req.method.toLowerCase()]('' + proxyHost + req.url).set(req.headers || {}).then(function (resp) {
	          _logger.logger.info('HTTP ' + resp.status + ' on ' + req.url);
	          res.end(JSON.stringify(resp.body));
	        }).catch(function (err) {
	          _logger.logger.info('HTTP ' + err.status + ' on ' + req.url);
	          res.end(JSON.stringify(err.body));
	        });
	      });
	    }
	  }, {
	    key: 'stopIntercepting',
	    value: function stopIntercepting() {
	      _logger.logger.info('Disabling interceptor.');
	      this.mitm.disable();
	      this.disabled = true;
	    }
	  }]);

	  return Interceptor;
	}();

	exports.default = Interceptor;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2)
	var Net = __webpack_require__(3)
	var Tls = __webpack_require__(4)
	var Http = __webpack_require__(5)
	var Https = __webpack_require__(6)
	var ClientRequest = Http.ClientRequest
	var Socket = __webpack_require__(7)
	var TlsSocket = __webpack_require__(8)
	var EventEmitter = __webpack_require__(9).EventEmitter
	var InternalSocket = __webpack_require__(10)
	var Stubs = __webpack_require__(12)
	var slice = Function.call.bind(Array.prototype.slice)
	var normalizeConnectArgs = Net._normalizeConnectArgs
	var createRequestAndResponse = Http._connectionListener
	module.exports = Mitm

	function Mitm() {
	  if (!(this instanceof Mitm))
	    return Mitm.apply(Object.create(Mitm.prototype), arguments).enable()

	  this.stubs = new Stubs
	  this.on("request", addCrossReferences)

	  return this
	}

	Mitm.prototype.on = EventEmitter.prototype.on
	Mitm.prototype.once = EventEmitter.prototype.once
	Mitm.prototype.off = EventEmitter.prototype.removeListener
	Mitm.prototype.addListener = EventEmitter.prototype.addListener
	Mitm.prototype.removeListener = EventEmitter.prototype.removeListener
	Mitm.prototype.emit = EventEmitter.prototype.emit

	var NODE_0_10 = !!process.version.match(/^v0\.10\./)

	Mitm.prototype.enable = function() {
	  // Connect is called synchronously.
	  var netConnect = this.tcpConnect.bind(this, Net.connect)
	  var tlsConnect = this.tlsConnect.bind(this, Tls.connect)

	  this.stubs.stub(Net, "connect", netConnect)
	  this.stubs.stub(Net, "createConnection", netConnect)
	  this.stubs.stub(Http.Agent.prototype, "createConnection", netConnect)
	  this.stubs.stub(Tls, "connect", tlsConnect)

	  if (NODE_0_10) {
	    // Node v0.10 sets createConnection on the object in the constructor.
	    this.stubs.stub(Http.globalAgent, "createConnection", netConnect)

	    // This will create a lot of sockets in tests, but that's the current price
	    // to pay until I find a better way to force a new socket for each
	    // connection.
	    this.stubs.stub(Http.globalAgent, "maxSockets", Infinity)
	    this.stubs.stub(Https.globalAgent, "maxSockets", Infinity)
	  }

	  // ClientRequest.prototype.onSocket is called synchronously from
	  // ClientRequest's constructor and is a convenient place to hook into new
	  // ClientRequests.
	  this.stubs.stub(ClientRequest.prototype, "onSocket", _.compose(
	    ClientRequest.prototype.onSocket,
	    this.request.bind(this)
	  ))

	  return this
	}

	Mitm.prototype.disable = function() {
	  return this.stubs.restore(), this
	}

	Mitm.prototype.connect = function connect(orig, Socket, opts, done) {
	  var sockets = InternalSocket.pair()
	  var client = new Socket(_.defaults({handle: sockets[0]}, opts))

	  this.emit("connect", client, opts)
	  if (client.bypassed) return orig.call(this, opts, done)

	  var server = client.server = new Socket({handle: sockets[1]})
	  this.emit("connection", server, opts)

	  // Ensure connect is emitted in next ticks, otherwise it would be impossible
	  // to listen to it after calling Net.connect or listening to it after the
	  // ClientRequest emits "socket".
	  setTimeout(client.emit.bind(client, "connect"))
	  setTimeout(server.emit.bind(server, "connect"))

	  return client
	}

	Mitm.prototype.tcpConnect = function(orig, opts, done) {
	  var args = normalizeConnectArgs(slice(arguments, 1))
	  opts = args[0]; done = args[1]

	  // The callback is originally bound to the connect event in
	  // Socket.prototype.connect.
	  var client = this.connect(orig, Socket, opts, done)
	  if (client.server == null) return client
	  if (done) client.once("connect", done)

	  return client
	}

	Mitm.prototype.tlsConnect = function(orig, opts, done) {
	  var args = normalizeConnectArgs(slice(arguments, 1))
	  opts = args[0]; done = args[1]

	  var client = this.connect(orig, TlsSocket, opts, done)
	  if (client.server == null) return client
	  if (done) client.once("secureConnect", done)

	  setTimeout(client.emit.bind(client, "secureConnect"))

	  return client
	}

	Mitm.prototype.request = function request(socket) {
	  if (!socket.server) return socket

	  // Node >= v0.10.24 < v0.11 will crash with: «Assertion failed:
	  // (!current_buffer), function Execute, file ../src/node_http_parser.cc, line
	  // 387.» if ServerResponse.prototype.write is called from within the
	  // "request" event handler. Call it in the next tick to work around that.
	  var self = this
	  if (NODE_0_10) {
	    self = Object.create(this)
	    self.emit = _.compose(process.nextTick, Function.bind.bind(this.emit, this))
	  }

	  createRequestAndResponse.call(self, socket.server)
	  return socket
	}

	function addCrossReferences(req, res) { req.res = res; res.req = req }


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	//     Underscore.js 1.5.2
	//     http://underscorejs.org
	//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Establish the object that gets returned to break out of a loop iteration.
	  var breaker = {};

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    concat           = ArrayProto.concat,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeForEach      = ArrayProto.forEach,
	    nativeMap          = ArrayProto.map,
	    nativeReduce       = ArrayProto.reduce,
	    nativeReduceRight  = ArrayProto.reduceRight,
	    nativeFilter       = ArrayProto.filter,
	    nativeEvery        = ArrayProto.every,
	    nativeSome         = ArrayProto.some,
	    nativeIndexOf      = ArrayProto.indexOf,
	    nativeLastIndexOf  = ArrayProto.lastIndexOf,
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind;

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object via a string identifier,
	  // for Closure Compiler "advanced" mode.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.5.2';

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles objects with the built-in `forEach`, arrays, and raw objects.
	  // Delegates to **ECMAScript 5**'s native `forEach` if available.
	  var each = _.each = _.forEach = function(obj, iterator, context) {
	    if (obj == null) return;
	    if (nativeForEach && obj.forEach === nativeForEach) {
	      obj.forEach(iterator, context);
	    } else if (obj.length === +obj.length) {
	      for (var i = 0, length = obj.length; i < length; i++) {
	        if (iterator.call(context, obj[i], i, obj) === breaker) return;
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (var i = 0, length = keys.length; i < length; i++) {
	        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
	      }
	    }
	  };

	  // Return the results of applying the iterator to each element.
	  // Delegates to **ECMAScript 5**'s native `map` if available.
	  _.map = _.collect = function(obj, iterator, context) {
	    var results = [];
	    if (obj == null) return results;
	    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
	    each(obj, function(value, index, list) {
	      results.push(iterator.call(context, value, index, list));
	    });
	    return results;
	  };

	  var reduceError = 'Reduce of empty array with no initial value';

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
	  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
	    var initial = arguments.length > 2;
	    if (obj == null) obj = [];
	    if (nativeReduce && obj.reduce === nativeReduce) {
	      if (context) iterator = _.bind(iterator, context);
	      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
	    }
	    each(obj, function(value, index, list) {
	      if (!initial) {
	        memo = value;
	        initial = true;
	      } else {
	        memo = iterator.call(context, memo, value, index, list);
	      }
	    });
	    if (!initial) throw new TypeError(reduceError);
	    return memo;
	  };

	  // The right-associative version of reduce, also known as `foldr`.
	  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
	  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
	    var initial = arguments.length > 2;
	    if (obj == null) obj = [];
	    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
	      if (context) iterator = _.bind(iterator, context);
	      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
	    }
	    var length = obj.length;
	    if (length !== +length) {
	      var keys = _.keys(obj);
	      length = keys.length;
	    }
	    each(obj, function(value, index, list) {
	      index = keys ? keys[--length] : --length;
	      if (!initial) {
	        memo = obj[index];
	        initial = true;
	      } else {
	        memo = iterator.call(context, memo, obj[index], index, list);
	      }
	    });
	    if (!initial) throw new TypeError(reduceError);
	    return memo;
	  };

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, iterator, context) {
	    var result;
	    any(obj, function(value, index, list) {
	      if (iterator.call(context, value, index, list)) {
	        result = value;
	        return true;
	      }
	    });
	    return result;
	  };

	  // Return all the elements that pass a truth test.
	  // Delegates to **ECMAScript 5**'s native `filter` if available.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, iterator, context) {
	    var results = [];
	    if (obj == null) return results;
	    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
	    each(obj, function(value, index, list) {
	      if (iterator.call(context, value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, iterator, context) {
	    return _.filter(obj, function(value, index, list) {
	      return !iterator.call(context, value, index, list);
	    }, context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Delegates to **ECMAScript 5**'s native `every` if available.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, iterator, context) {
	    iterator || (iterator = _.identity);
	    var result = true;
	    if (obj == null) return result;
	    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
	    each(obj, function(value, index, list) {
	      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
	    });
	    return !!result;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Delegates to **ECMAScript 5**'s native `some` if available.
	  // Aliased as `any`.
	  var any = _.some = _.any = function(obj, iterator, context) {
	    iterator || (iterator = _.identity);
	    var result = false;
	    if (obj == null) return result;
	    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
	    each(obj, function(value, index, list) {
	      if (result || (result = iterator.call(context, value, index, list))) return breaker;
	    });
	    return !!result;
	  };

	  // Determine if the array or object contains a given value (using `===`).
	  // Aliased as `include`.
	  _.contains = _.include = function(obj, target) {
	    if (obj == null) return false;
	    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
	    return any(obj, function(value) {
	      return value === target;
	    });
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      return (isFunc ? method : value[method]).apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, function(value){ return value[key]; });
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs, first) {
	    if (_.isEmpty(attrs)) return first ? void 0 : [];
	    return _[first ? 'find' : 'filter'](obj, function(value) {
	      for (var key in attrs) {
	        if (attrs[key] !== value[key]) return false;
	      }
	      return true;
	    });
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.where(obj, attrs, true);
	  };

	  // Return the maximum element or (element-based computation).
	  // Can't optimize arrays of integers longer than 65,535 elements.
	  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
	  _.max = function(obj, iterator, context) {
	    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
	      return Math.max.apply(Math, obj);
	    }
	    if (!iterator && _.isEmpty(obj)) return -Infinity;
	    var result = {computed : -Infinity, value: -Infinity};
	    each(obj, function(value, index, list) {
	      var computed = iterator ? iterator.call(context, value, index, list) : value;
	      computed > result.computed && (result = {value : value, computed : computed});
	    });
	    return result.value;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iterator, context) {
	    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
	      return Math.min.apply(Math, obj);
	    }
	    if (!iterator && _.isEmpty(obj)) return Infinity;
	    var result = {computed : Infinity, value: Infinity};
	    each(obj, function(value, index, list) {
	      var computed = iterator ? iterator.call(context, value, index, list) : value;
	      computed < result.computed && (result = {value : value, computed : computed});
	    });
	    return result.value;
	  };

	  // Shuffle an array, using the modern version of the 
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var rand;
	    var index = 0;
	    var shuffled = [];
	    each(obj, function(value) {
	      rand = _.random(index++);
	      shuffled[index - 1] = shuffled[rand];
	      shuffled[rand] = value;
	    });
	    return shuffled;
	  };

	  // Sample **n** random values from an array.
	  // If **n** is not specified, returns a single random element from the array.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (arguments.length < 2 || guard) {
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // An internal function to generate lookup iterators.
	  var lookupIterator = function(value) {
	    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
	  };

	  // Sort the object's values by a criterion produced by an iterator.
	  _.sortBy = function(obj, value, context) {
	    var iterator = lookupIterator(value);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iterator.call(context, value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, value, context) {
	      var result = {};
	      var iterator = value == null ? _.identity : lookupIterator(value);
	      each(obj, function(value, index) {
	        var key = iterator.call(context, value, index, obj);
	        behavior(result, key, value);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, key, value) {
	    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, key, value) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, key) {
	    _.has(result, key) ? result[key]++ : result[key] = 1;
	  });

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iterator, context) {
	    iterator = iterator == null ? _.identity : lookupIterator(iterator);
	    var value = iterator.call(context, obj);
	    var low = 0, high = array.length;
	    while (low < high) {
	      var mid = (low + high) >>> 1;
	      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
	    }
	    return low;
	  };

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (obj.length === +obj.length) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    return (n == null) || guard ? array[0] : slice.call(array, 0, n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N. The **guard** check allows it to work with
	  // `_.map`.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array. The **guard** check allows it to work with `_.map`.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if ((n == null) || guard) {
	      return array[array.length - 1];
	    } else {
	      return slice.call(array, Math.max(array.length - n, 0));
	    }
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array. The **guard**
	  // check allows it to work with `_.map`.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, (n == null) || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, output) {
	    if (shallow && _.every(input, _.isArray)) {
	      return concat.apply(output, input);
	    }
	    each(input, function(value) {
	      if (_.isArray(value) || _.isArguments(value)) {
	        shallow ? push.apply(output, value) : flatten(value, shallow, output);
	      } else {
	        output.push(value);
	      }
	    });
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, []);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iterator, context) {
	    if (_.isFunction(isSorted)) {
	      context = iterator;
	      iterator = isSorted;
	      isSorted = false;
	    }
	    var initial = iterator ? _.map(array, iterator, context) : array;
	    var results = [];
	    var seen = [];
	    each(initial, function(value, index) {
	      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
	        seen.push(value);
	        results.push(array[index]);
	      }
	    });
	    return results;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(_.flatten(arguments, true));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var rest = slice.call(arguments, 1);
	    return _.filter(_.uniq(array), function(item) {
	      return _.every(rest, function(other) {
	        return _.indexOf(other, item) >= 0;
	      });
	    });
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
	    return _.filter(array, function(value){ return !_.contains(rest, value); });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    var length = _.max(_.pluck(arguments, "length").concat(0));
	    var results = new Array(length);
	    for (var i = 0; i < length; i++) {
	      results[i] = _.pluck(arguments, '' + i);
	    }
	    return results;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    if (list == null) return {};
	    var result = {};
	    for (var i = 0, length = list.length; i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
	  // we need this function. Return the position of the first occurrence of an
	  // item in an array, or -1 if the item is not included in the array.
	  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = function(array, item, isSorted) {
	    if (array == null) return -1;
	    var i = 0, length = array.length;
	    if (isSorted) {
	      if (typeof isSorted == 'number') {
	        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
	      } else {
	        i = _.sortedIndex(array, item);
	        return array[i] === item ? i : -1;
	      }
	    }
	    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
	    for (; i < length; i++) if (array[i] === item) return i;
	    return -1;
	  };

	  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
	  _.lastIndexOf = function(array, item, from) {
	    if (array == null) return -1;
	    var hasIndex = from != null;
	    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
	      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
	    }
	    var i = (hasIndex ? from : array.length);
	    while (i--) if (array[i] === item) return i;
	    return -1;
	  };

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (arguments.length <= 1) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = arguments[2] || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var idx = 0;
	    var range = new Array(length);

	    while(idx < length) {
	      range[idx++] = start;
	      start += step;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Reusable constructor function for prototype setting.
	  var ctor = function(){};

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    var args, bound;
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError;
	    args = slice.call(arguments, 2);
	    return bound = function() {
	      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
	      ctor.prototype = func.prototype;
	      var self = new ctor;
	      ctor.prototype = null;
	      var result = func.apply(self, args.concat(slice.call(arguments)));
	      if (Object(result) === result) return result;
	      return self;
	    };
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context.
	  _.partial = function(func) {
	    var args = slice.call(arguments, 1);
	    return function() {
	      return func.apply(this, args.concat(slice.call(arguments)));
	    };
	  };

	  // Bind all of an object's methods to that object. Useful for ensuring that
	  // all callbacks defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var funcs = slice.call(arguments, 1);
	    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
	    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memo = {};
	    hasher || (hasher = _.identity);
	    return function() {
	      var key = hasher.apply(this, arguments);
	      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
	    };
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){ return func.apply(null, args); }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = function(func) {
	    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
	  };

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    options || (options = {});
	    var later = function() {
	      previous = options.leading === false ? 0 : new Date;
	      timeout = null;
	      result = func.apply(context, args);
	    };
	    return function() {
	      var now = new Date;
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0) {
	        clearTimeout(timeout);
	        timeout = null;
	        previous = now;
	        result = func.apply(context, args);
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;
	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = new Date();
	      var later = function() {
	        var last = (new Date()) - timestamp;
	        if (last < wait) {
	          timeout = setTimeout(later, wait - last);
	        } else {
	          timeout = null;
	          if (!immediate) result = func.apply(context, args);
	        }
	      };
	      var callNow = immediate && !timeout;
	      if (!timeout) {
	        timeout = setTimeout(later, wait);
	      }
	      if (callNow) result = func.apply(context, args);
	      return result;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = function(func) {
	    var ran = false, memo;
	    return function() {
	      if (ran) return memo;
	      ran = true;
	      memo = func.apply(this, arguments);
	      func = null;
	      return memo;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return function() {
	      var args = [func];
	      push.apply(args, arguments);
	      return wrapper.apply(this, args);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var funcs = arguments;
	    return function() {
	      var args = arguments;
	      for (var i = funcs.length - 1; i >= 0; i--) {
	        args = [funcs[i].apply(this, args)];
	      }
	      return args[0];
	    };
	  };

	  // Returns a function that will only be executed after being called N times.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Object Functions
	  // ----------------

	  // Retrieve the names of an object's properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = nativeKeys || function(obj) {
	    if (obj !== Object(obj)) throw new TypeError('Invalid object');
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = new Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = new Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = function(obj) {
	    each(slice.call(arguments, 1), function(source) {
	      if (source) {
	        for (var prop in source) {
	          obj[prop] = source[prop];
	        }
	      }
	    });
	    return obj;
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(obj) {
	    var copy = {};
	    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
	    each(keys, function(key) {
	      if (key in obj) copy[key] = obj[key];
	    });
	    return copy;
	  };

	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj) {
	    var copy = {};
	    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
	    for (var key in obj) {
	      if (!_.contains(keys, key)) copy[key] = obj[key];
	    }
	    return copy;
	  };

	  // Fill in a given object with default properties.
	  _.defaults = function(obj) {
	    each(slice.call(arguments, 1), function(source) {
	      if (source) {
	        for (var prop in source) {
	          if (obj[prop] === void 0) obj[prop] = source[prop];
	        }
	      }
	    });
	    return obj;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a == 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className != toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, dates, and booleans are compared by value.
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return a == String(b);
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
	        // other numeric values.
	        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a == +b;
	      // RegExps are compared by their source patterns and flags.
	      case '[object RegExp]':
	        return a.source == b.source &&
	               a.global == b.global &&
	               a.multiline == b.multiline &&
	               a.ignoreCase == b.ignoreCase;
	    }
	    if (typeof a != 'object' || typeof b != 'object') return false;
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] == a) return bStack[length] == b;
	    }
	    // Objects with different constructors are not equivalent, but `Object`s
	    // from different frames are.
	    var aCtor = a.constructor, bCtor = b.constructor;
	    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
	                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
	      return false;
	    }
	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);
	    var size = 0, result = true;
	    // Recursively compare objects and arrays.
	    if (className == '[object Array]') {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      size = a.length;
	      result = size == b.length;
	      if (result) {
	        // Deep compare the contents, ignoring non-numeric properties.
	        while (size--) {
	          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
	        }
	      }
	    } else {
	      // Deep compare objects.
	      for (var key in a) {
	        if (_.has(a, key)) {
	          // Count the expected number of properties.
	          size++;
	          // Deep compare each member.
	          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
	        }
	      }
	      // Ensure that both objects contain the same number of properties.
	      if (result) {
	        for (key in b) {
	          if (_.has(b, key) && !(size--)) break;
	        }
	        result = !size;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return result;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b, [], []);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
	    for (var key in obj) if (_.has(obj, key)) return false;
	    return true;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) == '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    return obj === Object(obj);
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
	  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) == '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return !!(obj && _.has(obj, 'callee'));
	    };
	  }

	  // Optimize `isFunction` if appropriate.
	  if (true) {
	    _.isFunction = function(obj) {
	      return typeof obj === 'function';
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj != +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iterators.
	  _.identity = function(value) {
	    return value;
	  };

	  // Run a function **n** times.
	  _.times = function(n, iterator, context) {
	    var accum = Array(Math.max(0, n));
	    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // List of HTML entities for escaping.
	  var entityMap = {
	    escape: {
	      '&': '&amp;',
	      '<': '&lt;',
	      '>': '&gt;',
	      '"': '&quot;',
	      "'": '&#x27;'
	    }
	  };
	  entityMap.unescape = _.invert(entityMap.escape);

	  // Regexes containing the keys and values listed immediately above.
	  var entityRegexes = {
	    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
	    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
	  };

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  _.each(['escape', 'unescape'], function(method) {
	    _[method] = function(string) {
	      if (string == null) return '';
	      return ('' + string).replace(entityRegexes[method], function(match) {
	        return entityMap[method][match];
	      });
	    };
	  });

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property) {
	    if (object == null) return void 0;
	    var value = object[property];
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result.call(this, func.apply(_, args));
	      };
	    });
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\t':     't',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  _.template = function(text, data, settings) {
	    var render;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = new RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset)
	        .replace(escaper, function(match) { return '\\' + escapes[match]; });

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      }
	      if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      }
	      if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }
	      index = offset + match.length;
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + "return __p;\n";

	    try {
	      render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    if (data) return render(data, _);
	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled function source as a convenience for precompilation.
	    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function, which will delegate to the wrapper.
	  _.chain = function(obj) {
	    return _(obj).chain();
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function(obj) {
	    return this._chain ? _(obj).chain() : obj;
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
	      return result.call(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result.call(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  _.extend(_.prototype, {

	    // Start chaining a wrapped Underscore object.
	    chain: function() {
	      this._chain = true;
	      return this;
	    },

	    // Extracts the result from a wrapped and chained object.
	    value: function() {
	      return this._wrapped;
	    }

	  });

	}).call(this);


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("net");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("tls");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("http");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("https");

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var Net = __webpack_require__(3)
	module.exports = Socket

	function Socket() { Net.Socket.apply(this, arguments) }

	Socket.prototype = Object.create(Net.Socket.prototype, {
	  constructor: {value: Socket, configurable: true, writeable: true}
	})

	Socket.prototype.bypass = function() {
	  this.bypassed = true
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var Net = __webpack_require__(3)
	var Tls = __webpack_require__(4)
	var Socket = __webpack_require__(7)
	module.exports = TlsSocket

	function TlsSocket() { Socket.apply(this, arguments) }

	// Node v0.10 has no TLSSocket and uses a private ClearTextStream instance.
	TlsSocket.prototype = Object.create((Tls.TLSSocket || Net.Socket).prototype, {
	  constructor: {value: TlsSocket, configurable: true, writeable: true}
	})

	Object.keys(Socket.prototype).map(function(key) {
	  TlsSocket.prototype[key] = Socket.prototype[key]
	})

	TlsSocket.prototype.encrypted = true
	TlsSocket.prototype.authorized = true

	// Iojs v3 HTTPS/SSL implementation depends on a session.
	// Not sure whether returning null breaks anything.
	// https://github.com/nodejs/node/blob/291b310e219023c4d93b216b1081ef47386f8750/lib/_tls_wrap.js#L607
	TlsSocket.prototype.getSession = function() { return null }


/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("events");

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var DuplexStream = __webpack_require__(11).Duplex
	module.exports = InternalSocket

	var NODE_0_10 = !!process.version.match(/^v0\.10\./)
	if (!NODE_0_10) var Uv = process.binding("uv")

	/**
	 * Sockets write to InternalSocket via write*String functions. The
	 * WritableStream.prototype.write function is just used internally by
	 * InternalSocket to queue data before pushing it to the other end via
	 * ReadableStream.prototype.push. The receiver will then forward it to its
	 * owner Socket via the onread property.
	 *
	 * InternalSocket is created for both the client side and the server side.
	 */
	function InternalSocket(remote) {
	  DuplexStream.call(this)
	  if (remote) this.remote = remote

	  // End is for ReadableStream.prototype.push(null).
	  // Finish is for WritableStream.prototype.end.
	  this.on("data", readData.bind(this))
	  this.on("end", readEof.bind(this))
	  this.on("finish", this._write.bind(this, null, null, noop))

	  return this.pause(), this
	}

	InternalSocket.prototype = Object.create(DuplexStream.prototype, {
	  constructor: {value: InternalSocket, configurable: true, writeable: true}
	})

	InternalSocket.pair = function() {
	  var a = Object.create(InternalSocket.prototype)
	  var b = Object.create(InternalSocket.prototype)
	  return [InternalSocket.call(a, b), InternalSocket.call(b, a)]
	}

	function readData(data) {
	  if (NODE_0_10) this.onread(data, 0, data.length)
	  else this.onread(data.length, data)
	}

	function readEof() {
	  if (!this.onread) return
	  if (NODE_0_10) process._errno = "EOF", this.onread(null, 0, 0)
	  else this.onread(Uv.UV_EOF)
	}

	// ReadStart may be called multiple times.
	//
	// Node v0.11's ReadableStream.prototype.resume and ReadableStream.prototype.pause return
	// self. InternalSocket's API states that they should return error codes
	// instead.
	//
	// Node v0.11.13 called ReadableStream.prototype.read(0) synchronously, but
	// v0.11.14 does it in the next tick. For easier sync use, call it here.
	InternalSocket.prototype.readStart = function() { this.resume(); this.read(0) }
	InternalSocket.prototype.readStop = function() { this.pause() }
	InternalSocket.prototype.close = InternalSocket.prototype.end

	InternalSocket.prototype._read = noop

	InternalSocket.prototype._write = function(data, encoding, done) {
	  var remote = this.remote
	  process.nextTick(function() { remote.push(data, encoding); done() })
	}

	// NOTE: Node v0.10 expects InternalSocket to return write request objects with
	// a "oncomplete" and "cb" property. Node v0.11 expects it return an error
	// instead.

	// InternalSocket.prototype.writeBinaryString was introduced in Node v0.11.14.
	InternalSocket.prototype.writeBinaryString = function(req, data) {
	  this.write(data, "binary")
	}

	InternalSocket.prototype.writeBuffer = function(req, data) {
	  this.write(NODE_0_10 ? req : data)
	  if (NODE_0_10) return {}
	}

	InternalSocket.prototype.writeUtf8String = function(req, data) {
	  this.write(NODE_0_10 ? req : data, "utf8")
	  if (NODE_0_10) return {}
	}

	InternalSocket.prototype.writeAsciiString = function(req, data) {
	  this.write(NODE_0_10 ? req : data, "ascii")
	  if (NODE_0_10) return {}
	}

	InternalSocket.prototype.writeUcs2String = function(req, data) {
	  this.write(NODE_0_10 ? req : data, "ucs2")
	  if (NODE_0_10) return {}
	}

	// Node v0.10 will use writeQueueSize to see if it should set write request's
	// "cb" property or write more immediately.
	if (NODE_0_10) InternalSocket.prototype.writeQueueSize = 0

	function noop() {}


/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("stream");

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = Stubs

	function Stubs() {}

	Stubs.prototype = Object.create(Array.prototype)

	Stubs.prototype.stub = function(obj, prop, value) {
	  this.push([obj, prop, obj[prop]])
	  obj[prop] = value
	}

	Stubs.prototype.restore = function() {
	  var stub
	  while (stub = this.pop()) stub[0][stub[1]] = stub[2]
	}


/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = require("url");

/***/ },
/* 14 */
/***/ function(module, exports) {

	/**
	 * lodash 4.0.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/**
	 * Checks if `value` is `null` or `undefined`.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
	 * @example
	 *
	 * _.isNil(null);
	 * // => true
	 *
	 * _.isNil(void 0);
	 * // => true
	 *
	 * _.isNil(NaN);
	 * // => false
	 */
	function isNil(value) {
	  return value == null;
	}

	module.exports = isNil;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */
	var baseEach = __webpack_require__(16),
	    baseFind = __webpack_require__(17),
	    baseFindIndex = __webpack_require__(18),
	    baseIteratee = __webpack_require__(19);

	/**
	 * Iterates over elements of `collection`, returning the first element
	 * `predicate` returns truthy for. The predicate is invoked with three
	 * arguments: (value, index|key, collection).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to search.
	 * @param {Array|Function|Object|string} [predicate=_.identity]
	 *  The function invoked per iteration.
	 * @returns {*} Returns the matched element, else `undefined`.
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'barney',  'age': 36, 'active': true },
	 *   { 'user': 'fred',    'age': 40, 'active': false },
	 *   { 'user': 'pebbles', 'age': 1,  'active': true }
	 * ];
	 *
	 * _.find(users, function(o) { return o.age < 40; });
	 * // => object for 'barney'
	 *
	 * // The `_.matches` iteratee shorthand.
	 * _.find(users, { 'age': 1, 'active': true });
	 * // => object for 'pebbles'
	 *
	 * // The `_.matchesProperty` iteratee shorthand.
	 * _.find(users, ['active', false]);
	 * // => object for 'fred'
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.find(users, 'active');
	 * // => object for 'barney'
	 */
	function find(collection, predicate) {
	  predicate = baseIteratee(predicate, 3);
	  if (isArray(collection)) {
	    var index = baseFindIndex(collection, predicate);
	    return index > -1 ? collection[index] : undefined;
	  }
	  return baseFind(collection, predicate, baseEach);
	}

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @type {Function}
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	module.exports = find;


/***/ },
/* 16 */
/***/ function(module, exports) {

	/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    stringTag = '[object String]';

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetPrototype = Object.getPrototypeOf,
	    nativeKeys = Object.keys;

	/**
	 * The base implementation of `_.forEach` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 */
	var baseEach = createBaseEach(baseForOwn);

	/**
	 * The base implementation of `baseForOwn` which iterates over `object`
	 * properties returned by `keysFunc` and invokes `iteratee` for each property.
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();

	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return object && baseFor(object, iteratee, keys);
	}

	/**
	 * The base implementation of `_.has` without support for deep paths.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHas(object, key) {
	  // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
	  // that are composed entirely of index properties, return `false` for
	  // `hasOwnProperty` checks of them.
	  return hasOwnProperty.call(object, key) ||
	    (typeof object == 'object' && key in object && getPrototype(object) === null);
	}

	/**
	 * The base implementation of `_.keys` which doesn't skip the constructor
	 * property of prototypes or treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  return nativeKeys(Object(object));
	}

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	/**
	 * Creates a `baseEach` or `baseEachRight` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseEach(eachFunc, fromRight) {
	  return function(collection, iteratee) {
	    if (collection == null) {
	      return collection;
	    }
	    if (!isArrayLike(collection)) {
	      return eachFunc(collection, iteratee);
	    }
	    var length = collection.length,
	        index = fromRight ? length : -1,
	        iterable = Object(collection);

	    while ((fromRight ? index-- : ++index < length)) {
	      if (iteratee(iterable[index], index, iterable) === false) {
	        break;
	      }
	    }
	    return collection;
	  };
	}

	/**
	 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;

	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}

	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a
	 * [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792) that affects
	 * Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');

	/**
	 * Gets the `[[Prototype]]` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {null|Object} Returns the `[[Prototype]]`.
	 */
	function getPrototype(value) {
	  return nativeGetPrototype(Object(value));
	}

	/**
	 * Creates an array of index keys for `object` values of arrays,
	 * `arguments` objects, and strings, otherwise `null` is returned.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array|null} Returns index keys, else `null`.
	 */
	function indexKeys(object) {
	  var length = object ? object.length : undefined;
	  if (isLength(length) &&
	      (isArray(object) || isString(object) || isArguments(object))) {
	    return baseTimes(length, String);
	  }
	  return null;
	}

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return !!length &&
	    (typeof value == 'number' || reIsUint.test(value)) &&
	    (value > -1 && value % 1 == 0 && value < length);
	}

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

	  return value === proto;
	}

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
	    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
	}

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @type {Function}
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value)) && !isFunction(value);
	}

	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array and weak map constructors,
	  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length,
	 *  else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString(value) {
	  return typeof value == 'string' ||
	    (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
	}

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  var isProto = isPrototype(object);
	  if (!(isProto || isArrayLike(object))) {
	    return baseKeys(object);
	  }
	  var indexes = indexKeys(object),
	      skipIndexes = !!indexes,
	      result = indexes || [],
	      length = result.length;

	  for (var key in object) {
	    if (baseHas(object, key) &&
	        !(skipIndexes && (key == 'length' || isIndex(key, length))) &&
	        !(isProto && key == 'constructor')) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = baseEach;


/***/ },
/* 17 */
/***/ function(module, exports) {

	/**
	 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/**
	 * The base implementation of `_.find`, `_.findLast`, `_.findKey`, and `_.findLastKey`,
	 * without support for callback shorthands and `this` binding, which iterates
	 * over `collection` using the provided `eachFunc`.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to search.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {Function} eachFunc The function to iterate over `collection`.
	 * @param {boolean} [retKey] Specify returning the key of the found element
	 *  instead of the element itself.
	 * @returns {*} Returns the found element or its key, else `undefined`.
	 */
	function baseFind(collection, predicate, eachFunc, retKey) {
	  var result;
	  eachFunc(collection, function(value, key, collection) {
	    if (predicate(value, key, collection)) {
	      result = retKey ? key : value;
	      return false;
	    }
	  });
	  return result;
	}

	module.exports = baseFind;


/***/ },
/* 18 */
/***/ function(module, exports) {

	/**
	 * lodash 3.6.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/**
	 * The base implementation of `_.findIndex` and `_.findLastIndex` without
	 * support for callback shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseFindIndex(array, predicate, fromRight) {
	  var length = array.length,
	      index = fromRight ? length : -1;

	  while ((fromRight ? index-- : ++index < length)) {
	    if (predicate(array[index], index, array)) {
	      return index;
	    }
	  }
	  return -1;
	}

	module.exports = baseFindIndex;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */
	var stringToPath = __webpack_require__(21);

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/** Used to compose bitmasks for comparison styles. */
	var UNORDERED_COMPARE_FLAG = 1,
	    PARTIAL_COMPARE_FLAG = 2;

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0,
	    MAX_SAFE_INTEGER = 9007199254740991;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    promiseTag = '[object Promise]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
	typedArrayTags[errorTag] = typedArrayTags[funcTag] =
	typedArrayTags[mapTag] = typedArrayTags[numberTag] =
	typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
	typedArrayTags[setTag] = typedArrayTags[stringTag] =
	typedArrayTags[weakMapTag] = false;

	/** Used to determine if values are of the language type `Object`. */
	var objectTypes = {
	  'function': true,
	  'object': true
	};

	/** Detect free variable `exports`. */
	var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
	  ? exports
	  : undefined;

	/** Detect free variable `module`. */
	var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
	  ? module
	  : undefined;

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

	/** Detect free variable `self`. */
	var freeSelf = checkGlobal(objectTypes[typeof self] && self);

	/** Detect free variable `window`. */
	var freeWindow = checkGlobal(objectTypes[typeof window] && window);

	/** Detect `this` as the global object. */
	var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

	/**
	 * Used as a reference to the global object.
	 *
	 * The `this` value is used if it's the global object to avoid Greasemonkey's
	 * restricted `window` object, otherwise the `window` object is used.
	 */
	var root = freeGlobal ||
	  ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
	    freeSelf || thisGlobal || Function('return this')();

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array.length,
	      result = Array(length);

	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array.length;

	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}

	/**
	 * The base implementation of `_.toPairs` and `_.toPairsIn` which creates an array
	 * of key-value pairs for `object` corresponding to the property names of `props`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} props The property names to get values for.
	 * @returns {Object} Returns the key-value pairs.
	 */
	function baseToPairs(object, props) {
	  return arrayMap(props, function(key) {
	    return [key, object[key]];
	  });
	}

	/**
	 * Checks if `value` is a global object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
	 */
	function checkGlobal(value) {
	  return (value && value.Object === Object) ? value : null;
	}

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}

	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);

	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);

	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}

	/**
	 * Converts `set` to its value-value pairs.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the value-value pairs.
	 */
	function setToPairs(set) {
	  var index = -1,
	      result = Array(set.size);

	  set.forEach(function(value) {
	    result[++index] = [value, value];
	  });
	  return result;
	}

	/** Used for built-in method references. */
	var arrayProto = Array.prototype,
	    objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/** Built-in value references. */
	var Symbol = root.Symbol,
	    Uint8Array = root.Uint8Array,
	    propertyIsEnumerable = objectProto.propertyIsEnumerable,
	    splice = arrayProto.splice;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetPrototype = Object.getPrototypeOf,
	    nativeKeys = Object.keys;

	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView'),
	    Map = getNative(root, 'Map'),
	    Promise = getNative(root, 'Promise'),
	    Set = getNative(root, 'Set'),
	    WeakMap = getNative(root, 'WeakMap'),
	    nativeCreate = getNative(Object, 'create');

	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map),
	    promiseCtorString = toSource(Promise),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	}

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  return this.has(key) && delete this.__data__[key];
	}

	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}

	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
	}

	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}

	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	}

	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  return true;
	}

	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  return index < 0 ? undefined : data[index][1];
	}

	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}

	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}

	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}

	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  return getMapData(this, key)['delete'](key);
	}

	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}

	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}

	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  getMapData(this, key).set(key, value);
	  return this;
	}

	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;

	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache(values) {
	  var index = -1,
	      length = values ? values.length : 0;

	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}

	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd(value) {
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}

	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */
	function setCacheHas(value) {
	  return this.__data__.has(value);
	}

	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;

	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack(entries) {
	  this.__data__ = new ListCache(entries);
	}

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new ListCache;
	}

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  return this.__data__['delete'](key);
	}

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  return this.__data__.get(key);
	}

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  return this.__data__.has(key);
	}

	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet(key, value) {
	  var cache = this.__data__;
	  if (cache instanceof ListCache && cache.__data__.length == LARGE_ARRAY_SIZE) {
	    cache = this.__data__ = new MapCache(cache.__data__);
	  }
	  cache.set(key, value);
	  return this;
	}

	// Add methods to `Stack`.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;

	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path) {
	  path = isKey(path, object) ? [path] : castPath(path);

	  var index = 0,
	      length = path.length;

	  while (object != null && index < length) {
	    object = object[toKey(path[index++])];
	  }
	  return (index && index == length) ? object : undefined;
	}

	/**
	 * The base implementation of `_.has` without support for deep paths.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHas(object, key) {
	  // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
	  // that are composed entirely of index properties, return `false` for
	  // `hasOwnProperty` checks of them.
	  return hasOwnProperty.call(object, key) ||
	    (typeof object == 'object' && key in object && getPrototype(object) === null);
	}

	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHasIn(object, key) {
	  return key in Object(object);
	}

	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {boolean} [bitmask] The bitmask of comparison flags.
	 *  The bitmask may be composed of the following flags:
	 *     1 - Unordered comparison
	 *     2 - Partial comparison
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, customizer, bitmask, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
	}

	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = arrayTag,
	      othTag = arrayTag;

	  if (!objIsArr) {
	    objTag = getTag(object);
	    objTag = objTag == argsTag ? objectTag : objTag;
	  }
	  if (!othIsArr) {
	    othTag = getTag(other);
	    othTag = othTag == argsTag ? objectTag : othTag;
	  }
	  var objIsObj = objTag == objectTag && !isHostObject(object),
	      othIsObj = othTag == objectTag && !isHostObject(other),
	      isSameTag = objTag == othTag;

	  if (isSameTag && !objIsObj) {
	    stack || (stack = new Stack);
	    return (objIsArr || isTypedArray(object))
	      ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
	      : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
	  }
	  if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;

	      stack || (stack = new Stack);
	      return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack);
	  return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
	}

	/**
	 * The base implementation of `_.isMatch` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Object} source The object of property values to match.
	 * @param {Array} matchData The property names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, source, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;

	  if (object == null) {
	    return !length;
	  }
	  object = Object(object);
	  while (index--) {
	    var data = matchData[index];
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];

	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var stack = new Stack;
	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }
	      if (!(result === undefined
	            ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
	            : result
	          )) {
	        return false;
	      }
	    }
	  }
	  return true;
	}

	/**
	 * The base implementation of `_.iteratee`.
	 *
	 * @private
	 * @param {*} [value=_.identity] The value to convert to an iteratee.
	 * @returns {Function} Returns the iteratee.
	 */
	function baseIteratee(value) {
	  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
	  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
	  if (typeof value == 'function') {
	    return value;
	  }
	  if (value == null) {
	    return identity;
	  }
	  if (typeof value == 'object') {
	    return isArray(value)
	      ? baseMatchesProperty(value[0], value[1])
	      : baseMatches(value);
	  }
	  return property(value);
	}

	/**
	 * The base implementation of `_.keys` which doesn't skip the constructor
	 * property of prototypes or treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  return nativeKeys(Object(object));
	}

	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatches(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
	  }
	  return function(object) {
	    return object === source || baseIsMatch(object, source, matchData);
	  };
	}

	/**
	 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatchesProperty(path, srcValue) {
	  if (isKey(path) && isStrictComparable(srcValue)) {
	    return matchesStrictComparable(toKey(path), srcValue);
	  }
	  return function(object) {
	    var objValue = get(object, path);
	    return (objValue === undefined && objValue === srcValue)
	      ? hasIn(object, path)
	      : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
	  };
	}

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyDeep(path) {
	  return function(object) {
	    return baseGet(object, path);
	  };
	}

	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath(value) {
	  return isArray(value) ? value : stringToPath(value);
	}

	/**
	 * Creates a `_.toPairs` or `_.toPairsIn` function.
	 *
	 * @private
	 * @param {Function} keysFunc The function to get the keys of a given object.
	 * @returns {Function} Returns the new pairs function.
	 */
	function createToPairs(keysFunc) {
	  return function(object) {
	    var tag = getTag(object);
	    if (tag == mapTag) {
	      return mapToArray(object);
	    }
	    if (tag == setTag) {
	      return setToPairs(object);
	    }
	    return baseToPairs(object, keysFunc(object));
	  };
	}

	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
	  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
	      arrLength = array.length,
	      othLength = other.length;

	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(array);
	  if (stacked) {
	    return stacked == other;
	  }
	  var index = -1,
	      result = true,
	      seen = (bitmask & UNORDERED_COMPARE_FLAG) ? new SetCache : undefined;

	  stack.set(array, other);

	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, arrValue, index, other, array, stack)
	        : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (seen) {
	      if (!arraySome(other, function(othValue, othIndex) {
	            if (!seen.has(othIndex) &&
	                (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
	              return seen.add(othIndex);
	            }
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(
	          arrValue === othValue ||
	            equalFunc(arrValue, othValue, customizer, bitmask, stack)
	        )) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  return result;
	}

	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
	  switch (tag) {
	    case dataViewTag:
	      if ((object.byteLength != other.byteLength) ||
	          (object.byteOffset != other.byteOffset)) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;

	    case arrayBufferTag:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
	        return false;
	      }
	      return true;

	    case boolTag:
	    case dateTag:
	      // Coerce dates and booleans to numbers, dates to milliseconds and
	      // booleans to `1` or `0` treating invalid dates coerced to `NaN` as
	      // not equal.
	      return +object == +other;

	    case errorTag:
	      return object.name == other.name && object.message == other.message;

	    case numberTag:
	      // Treat `NaN` vs. `NaN` as equal.
	      return (object != +object) ? other != +other : object == +other;

	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/6.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');

	    case mapTag:
	      var convert = mapToArray;

	    case setTag:
	      var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
	      convert || (convert = setToArray);

	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= UNORDERED_COMPARE_FLAG;
	      stack.set(object, other);

	      // Recursively compare objects (susceptible to call stack limits).
	      return equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);

	    case symbolTag:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}

	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
	  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
	      objProps = keys(object),
	      objLength = objProps.length,
	      othProps = keys(other),
	      othLength = othProps.length;

	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : baseHas(other, key))) {
	      return false;
	    }
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(object);
	  if (stacked) {
	    return stacked == other;
	  }
	  var result = true;
	  stack.set(object, other);

	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, objValue, key, other, object, stack)
	        : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined
	          ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
	          : compared
	        )) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;

	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  return result;
	}

	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a
	 * [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792) that affects
	 * Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');

	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}

	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = toPairs(object),
	      length = result.length;

	  while (length--) {
	    result[length][2] = isStrictComparable(result[length][1]);
	  }
	  return result;
	}

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object[key];
	  return isNative(value) ? value : undefined;
	}

	/**
	 * Gets the `[[Prototype]]` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {null|Object} Returns the `[[Prototype]]`.
	 */
	function getPrototype(value) {
	  return nativeGetPrototype(Object(value));
	}

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function getTag(value) {
	  return objectToString.call(value);
	}

	// Fallback for data views, maps, sets, and weak maps in IE 11,
	// for data views in Edge, and promises in Node.js.
	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map && getTag(new Map) != mapTag) ||
	    (Promise && getTag(Promise.resolve()) != promiseTag) ||
	    (Set && getTag(new Set) != setTag) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	  getTag = function(value) {
	    var result = objectToString.call(value),
	        Ctor = result == objectTag ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : undefined;

	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag;
	        case mapCtorString: return mapTag;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}

	/**
	 * Checks if `path` exists on `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @param {Function} hasFunc The function to check properties.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 */
	function hasPath(object, path, hasFunc) {
	  path = isKey(path, object) ? [path] : castPath(path);

	  var result,
	      index = -1,
	      length = path.length;

	  while (++index < length) {
	    var key = toKey(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result) {
	    return result;
	  }
	  var length = object ? object.length : 0;
	  return !!length && isLength(length) && isIndex(key, length) &&
	    (isArray(object) || isString(object) || isArguments(object));
	}

	/**
	 * Creates an array of index keys for `object` values of arrays,
	 * `arguments` objects, and strings, otherwise `null` is returned.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array|null} Returns index keys, else `null`.
	 */
	function indexKeys(object) {
	  var length = object ? object.length : undefined;
	  if (isLength(length) &&
	      (isArray(object) || isString(object) || isArguments(object))) {
	    return baseTimes(length, String);
	  }
	  return null;
	}

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return !!length &&
	    (typeof value == 'number' || reIsUint.test(value)) &&
	    (value > -1 && value % 1 == 0 && value < length);
	}

	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey(value, object) {
	  if (isArray(value)) {
	    return false;
	  }
	  var type = typeof value;
	  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	      value == null || isSymbol(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	    (object != null && value in Object(object));
	}

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

	  return value === proto;
	}

	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && !isObject(value);
	}

	/**
	 * A specialized version of `matchesProperty` for source values suitable
	 * for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function matchesStrictComparable(key, srcValue) {
	  return function(object) {
	    if (object == null) {
	      return false;
	    }
	    return object[key] === srcValue &&
	      (srcValue !== undefined || (key in Object(object)));
	  };
	}

	/**
	 * Converts `value` to a string key if it's not a string or symbol.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {string|symbol} Returns the key.
	 */
	function toKey(value) {
	  if (typeof value == 'string' || isSymbol(value)) {
	    return value;
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}

	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to process.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 * var other = { 'user': 'fred' };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
	    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
	}

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @type {Function}
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value)) && !isFunction(value);
	}

	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array and weak map constructors,
	  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length,
	 *  else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (!isObject(value)) {
	    return false;
	  }
	  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}

	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString(value) {
	  return typeof value == 'string' ||
	    (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
	}

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	function isTypedArray(value) {
	  return isObjectLike(value) &&
	    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
	}

	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is used in its place.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.7.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */
	function get(object, path, defaultValue) {
	  var result = object == null ? undefined : baseGet(object, path);
	  return result === undefined ? defaultValue : result;
	}

	/**
	 * Checks if `path` is a direct or inherited property of `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
	 *
	 * _.hasIn(object, 'a');
	 * // => true
	 *
	 * _.hasIn(object, 'a.b');
	 * // => true
	 *
	 * _.hasIn(object, ['a', 'b']);
	 * // => true
	 *
	 * _.hasIn(object, 'b');
	 * // => false
	 */
	function hasIn(object, path) {
	  return object != null && hasPath(object, path, baseHasIn);
	}

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  var isProto = isPrototype(object);
	  if (!(isProto || isArrayLike(object))) {
	    return baseKeys(object);
	  }
	  var indexes = indexKeys(object),
	      skipIndexes = !!indexes,
	      result = indexes || [],
	      length = result.length;

	  for (var key in object) {
	    if (baseHas(object, key) &&
	        !(skipIndexes && (key == 'length' || isIndex(key, length))) &&
	        !(isProto && key == 'constructor')) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	/**
	 * Creates an array of own enumerable string keyed-value pairs for `object`
	 * which can be consumed by `_.fromPairs`. If `object` is a map or set, its
	 * entries are returned.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @alias entries
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the key-value pairs.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.toPairs(new Foo);
	 * // => [['a', 1], ['b', 2]] (iteration order is not guaranteed)
	 */
	var toPairs = createToPairs(keys);

	/**
	 * This method returns the first argument given to it.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * _.identity(object) === object;
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	/**
	 * Creates a function that returns the value at `path` of a given object.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': 2 } },
	 *   { 'a': { 'b': 1 } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b'));
	 * // => [2, 1]
	 *
	 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	 * // => [1, 2]
	 */
	function property(path) {
	  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
	}

	module.exports = baseIteratee;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(20)(module)))

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */
	var baseToString = __webpack_require__(22);

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/** `Object#toString` result references. */
	var funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]';

	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]/g;

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;

	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used to determine if values are of the language type `Object`. */
	var objectTypes = {
	  'function': true,
	  'object': true
	};

	/** Detect free variable `exports`. */
	var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
	  ? exports
	  : undefined;

	/** Detect free variable `module`. */
	var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
	  ? module
	  : undefined;

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

	/** Detect free variable `self`. */
	var freeSelf = checkGlobal(objectTypes[typeof self] && self);

	/** Detect free variable `window`. */
	var freeWindow = checkGlobal(objectTypes[typeof window] && window);

	/** Detect `this` as the global object. */
	var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

	/**
	 * Used as a reference to the global object.
	 *
	 * The `this` value is used if it's the global object to avoid Greasemonkey's
	 * restricted `window` object, otherwise the `window` object is used.
	 */
	var root = freeGlobal ||
	  ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
	    freeSelf || thisGlobal || Function('return this')();

	/**
	 * Checks if `value` is a global object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
	 */
	function checkGlobal(value) {
	  return (value && value.Object === Object) ? value : null;
	}

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}

	/** Used for built-in method references. */
	var arrayProto = Array.prototype,
	    objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/** Built-in value references. */
	var splice = arrayProto.splice;

	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map'),
	    nativeCreate = getNative(Object, 'create');

	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	}

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  return this.has(key) && delete this.__data__[key];
	}

	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}

	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
	}

	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}

	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	}

	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  return true;
	}

	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  return index < 0 ? undefined : data[index][1];
	}

	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}

	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}

	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}

	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  return getMapData(this, key)['delete'](key);
	}

	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}

	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}

	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  getMapData(this, key).set(key, value);
	  return this;
	}

	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;

	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object[key];
	  return isNative(value) ? value : undefined;
	}

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}

	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath = memoize(function(string) {
	  var result = [];
	  toString(string).replace(rePropName, function(match, number, quote, string) {
	    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	});

	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to process.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}

	/**
	 * Creates a function that memoizes the result of `func`. If `resolver` is
	 * provided, it determines the cache key for storing the result based on the
	 * arguments provided to the memoized function. By default, the first argument
	 * provided to the memoized function is used as the map cache key. The `func`
	 * is invoked with the `this` binding of the memoized function.
	 *
	 * **Note:** The cache is exposed as the `cache` property on the memoized
	 * function. Its creation may be customized by replacing the `_.memoize.Cache`
	 * constructor with one whose instances implement the
	 * [`Map`](http://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-map-prototype-object)
	 * method interface of `delete`, `get`, `has`, and `set`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to have its output memoized.
	 * @param {Function} [resolver] The function to resolve the cache key.
	 * @returns {Function} Returns the new memoized function.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': 2 };
	 * var other = { 'c': 3, 'd': 4 };
	 *
	 * var values = _.memoize(_.values);
	 * values(object);
	 * // => [1, 2]
	 *
	 * values(other);
	 * // => [3, 4]
	 *
	 * object.a = 2;
	 * values(object);
	 * // => [1, 2]
	 *
	 * // Modify the result cache.
	 * values.cache.set(object, ['a', 'b']);
	 * values(object);
	 * // => ['a', 'b']
	 *
	 * // Replace `_.memoize.Cache`.
	 * _.memoize.Cache = WeakMap;
	 */
	function memoize(func, resolver) {
	  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  var memoized = function() {
	    var args = arguments,
	        key = resolver ? resolver.apply(this, args) : args[0],
	        cache = memoized.cache;

	    if (cache.has(key)) {
	      return cache.get(key);
	    }
	    var result = func.apply(this, args);
	    memoized.cache = cache.set(key, result);
	    return result;
	  };
	  memoized.cache = new (memoize.Cache || MapCache);
	  return memoized;
	}

	// Assign cache to `_.memoize`.
	memoize.Cache = MapCache;

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 * var other = { 'user': 'fred' };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array and weak map constructors,
	  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (!isObject(value)) {
	    return false;
	  }
	  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}

	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  return value == null ? '' : baseToString(value);
	}

	module.exports = stringToPath;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(20)(module)))

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/** Used to determine if values are of the language type `Object`. */
	var objectTypes = {
	  'function': true,
	  'object': true
	};

	/** Detect free variable `exports`. */
	var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
	  ? exports
	  : undefined;

	/** Detect free variable `module`. */
	var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
	  ? module
	  : undefined;

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

	/** Detect free variable `self`. */
	var freeSelf = checkGlobal(objectTypes[typeof self] && self);

	/** Detect free variable `window`. */
	var freeWindow = checkGlobal(objectTypes[typeof window] && window);

	/** Detect `this` as the global object. */
	var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

	/**
	 * Used as a reference to the global object.
	 *
	 * The `this` value is used if it's the global object to avoid Greasemonkey's
	 * restricted `window` object, otherwise the `window` object is used.
	 */
	var root = freeGlobal ||
	  ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
	    freeSelf || thisGlobal || Function('return this')();

	/**
	 * Checks if `value` is a global object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
	 */
	function checkGlobal(value) {
	  return (value && value.Object === Object) ? value : null;
	}

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Built-in value references. */
	var Symbol = root.Symbol;

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;

	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}

	module.exports = baseToString;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(20)(module)))

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	// From https://gist.github.com/epeli/11209665

	var Promise = __webpack_require__(24);

	// So you can `var request = require("superagent-bluebird-promise")`
	var superagent = module.exports = __webpack_require__(60);
	var Request = superagent.Request;

	Promise.config({
	    // Enable cancellation.
	    cancellation: true
	});
	// Create custom error type.
	// Create a new object, that prototypally inherits from the Error constructor.
	var SuperagentPromiseError = function(message, originalError) {
	  var stack;
	  this.message = message;
	  this.name = 'SuperagentPromiseError';
	  this.originalError = originalError;

	  if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, this.constructor);
	    stack = this.stack;
	  }
	  else {
	    stack = (new Error(message)).stack;
	  }

	  if (Object.defineProperty) {
	    Object.defineProperty(this, 'stack', {
	      get: function() {
	        if (this.originalError) {
	          return stack + '\nCaused by:  ' + this.originalError.stack;
	        }

	        return stack;
	      }
	    });
	  }
	};

	SuperagentPromiseError.prototype = new Error();
	SuperagentPromiseError.prototype.constructor = SuperagentPromiseError;
	superagent.SuperagentPromiseError = SuperagentPromiseError;

	/**
	 * @namespace utils
	 * @class Superagent
	 */

	/**
	 *
	 * Add promise support for superagent/supertest
	 *
	 * Call .promise() to return promise for the request
	 *
	 * @method then
	 * @return {Bluebird.Promise}
	 */
	Request.prototype.promise = function() {
	  var req = this;
	  var error;

	  return new Promise(function(resolve, reject, onCancel) {
	      req.end(function(err, res) {
	        if (typeof res !== "undefined" && res.status >= 400) {
	          var msg = 'cannot ' + req.method + ' ' + req.url + ' (' + res.status + ')';
	          error = new SuperagentPromiseError(msg);
	          error.status = res.status;
	          error.body = res.body;
	          error.res = res;
	          reject(error);
	        } else if (err) {
	          reject(new SuperagentPromiseError('Bad request', err));
	        } else {
	          resolve(res);
	        }
	      });
	      onCancel(function() {
	        req.abort();
	       });

	    });
	};

	/**
	 *
	 * Make superagent requests Promises/A+ conformant
	 *
	 * Call .then([onFulfilled], [onRejected]) to register callbacks
	 *
	 * @method then
	 * @param {function} [onFulfilled]
	 * @param {function} [onRejected]
	 * @return {Bluebird.Promise}
	 */
	Request.prototype.then = function() {
	  var promise = this.promise();
	  return promise.then.apply(promise, arguments);
	};


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var old;
	if (typeof Promise !== "undefined") old = Promise;
	function noConflict() {
	    try { if (Promise === bluebird) Promise = old; }
	    catch (e) {}
	    return bluebird;
	}
	var bluebird = __webpack_require__(25)();
	bluebird.noConflict = noConflict;
	module.exports = bluebird;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function() {
	var makeSelfResolutionError = function () {
	    return new TypeError("circular promise resolution chain\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	};
	var reflectHandler = function() {
	    return new Promise.PromiseInspection(this._target());
	};
	var apiRejection = function(msg) {
	    return Promise.reject(new TypeError(msg));
	};
	function Proxyable() {}
	var UNDEFINED_BINDING = {};
	var util = __webpack_require__(26);

	var getDomain;
	if (util.isNode) {
	    getDomain = function() {
	        var ret = process.domain;
	        if (ret === undefined) ret = null;
	        return ret;
	    };
	} else {
	    getDomain = function() {
	        return null;
	    };
	}
	util.notEnumerableProp(Promise, "_getDomain", getDomain);

	var es5 = __webpack_require__(27);
	var Async = __webpack_require__(28);
	var async = new Async();
	es5.defineProperty(Promise, "_async", {value: async});
	var errors = __webpack_require__(31);
	var TypeError = Promise.TypeError = errors.TypeError;
	Promise.RangeError = errors.RangeError;
	var CancellationError = Promise.CancellationError = errors.CancellationError;
	Promise.TimeoutError = errors.TimeoutError;
	Promise.OperationalError = errors.OperationalError;
	Promise.RejectionError = errors.OperationalError;
	Promise.AggregateError = errors.AggregateError;
	var INTERNAL = function(){};
	var APPLY = {};
	var NEXT_FILTER = {};
	var tryConvertToPromise = __webpack_require__(32)(Promise, INTERNAL);
	var PromiseArray =
	    __webpack_require__(33)(Promise, INTERNAL,
	                               tryConvertToPromise, apiRejection, Proxyable);
	var Context = __webpack_require__(34)(Promise);
	 /*jshint unused:false*/
	var createContext = Context.create;
	var debug = __webpack_require__(35)(Promise, Context);
	var CapturedTrace = debug.CapturedTrace;
	var PassThroughHandlerContext =
	    __webpack_require__(36)(Promise, tryConvertToPromise);
	var catchFilter = __webpack_require__(37)(NEXT_FILTER);
	var nodebackForPromise = __webpack_require__(38);
	var errorObj = util.errorObj;
	var tryCatch = util.tryCatch;
	function check(self, executor) {
	    if (typeof executor !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(executor));
	    }
	    if (self.constructor !== Promise) {
	        throw new TypeError("the promise constructor cannot be invoked directly\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	}

	function Promise(executor) {
	    this._bitField = 0;
	    this._fulfillmentHandler0 = undefined;
	    this._rejectionHandler0 = undefined;
	    this._promise0 = undefined;
	    this._receiver0 = undefined;
	    if (executor !== INTERNAL) {
	        check(this, executor);
	        this._resolveFromExecutor(executor);
	    }
	    this._promiseCreated();
	    this._fireEvent("promiseCreated", this);
	}

	Promise.prototype.toString = function () {
	    return "[object Promise]";
	};

	Promise.prototype.caught = Promise.prototype["catch"] = function (fn) {
	    var len = arguments.length;
	    if (len > 1) {
	        var catchInstances = new Array(len - 1),
	            j = 0, i;
	        for (i = 0; i < len - 1; ++i) {
	            var item = arguments[i];
	            if (util.isObject(item)) {
	                catchInstances[j++] = item;
	            } else {
	                return apiRejection("expecting an object but got " + util.classString(item));
	            }
	        }
	        catchInstances.length = j;
	        fn = arguments[i];
	        return this.then(undefined, catchFilter(catchInstances, fn, this));
	    }
	    return this.then(undefined, fn);
	};

	Promise.prototype.reflect = function () {
	    return this._then(reflectHandler,
	        reflectHandler, undefined, this, undefined);
	};

	Promise.prototype.then = function (didFulfill, didReject) {
	    if (debug.warnings() && arguments.length > 0 &&
	        typeof didFulfill !== "function" &&
	        typeof didReject !== "function") {
	        var msg = ".then() only accepts functions but was passed: " +
	                util.classString(didFulfill);
	        if (arguments.length > 1) {
	            msg += ", " + util.classString(didReject);
	        }
	        this._warn(msg);
	    }
	    return this._then(didFulfill, didReject, undefined, undefined, undefined);
	};

	Promise.prototype.done = function (didFulfill, didReject) {
	    var promise =
	        this._then(didFulfill, didReject, undefined, undefined, undefined);
	    promise._setIsFinal();
	};

	Promise.prototype.spread = function (fn) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }
	    return this.all()._then(fn, undefined, undefined, APPLY, undefined);
	};

	Promise.prototype.toJSON = function () {
	    var ret = {
	        isFulfilled: false,
	        isRejected: false,
	        fulfillmentValue: undefined,
	        rejectionReason: undefined
	    };
	    if (this.isFulfilled()) {
	        ret.fulfillmentValue = this.value();
	        ret.isFulfilled = true;
	    } else if (this.isRejected()) {
	        ret.rejectionReason = this.reason();
	        ret.isRejected = true;
	    }
	    return ret;
	};

	Promise.prototype.all = function () {
	    if (arguments.length > 0) {
	        this._warn(".all() was passed arguments but it does not take any");
	    }
	    return new PromiseArray(this).promise();
	};

	Promise.prototype.error = function (fn) {
	    return this.caught(util.originatesFromRejection, fn);
	};

	Promise.is = function (val) {
	    return val instanceof Promise;
	};

	Promise.fromNode = Promise.fromCallback = function(fn) {
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    var multiArgs = arguments.length > 1 ? !!Object(arguments[1]).multiArgs
	                                         : false;
	    var result = tryCatch(fn)(nodebackForPromise(ret, multiArgs));
	    if (result === errorObj) {
	        ret._rejectCallback(result.e, true);
	    }
	    if (!ret._isFateSealed()) ret._setAsyncGuaranteed();
	    return ret;
	};

	Promise.all = function (promises) {
	    return new PromiseArray(promises).promise();
	};

	Promise.cast = function (obj) {
	    var ret = tryConvertToPromise(obj);
	    if (!(ret instanceof Promise)) {
	        ret = new Promise(INTERNAL);
	        ret._captureStackTrace();
	        ret._setFulfilled();
	        ret._rejectionHandler0 = obj;
	    }
	    return ret;
	};

	Promise.resolve = Promise.fulfilled = Promise.cast;

	Promise.reject = Promise.rejected = function (reason) {
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    ret._rejectCallback(reason, true);
	    return ret;
	};

	Promise.setScheduler = function(fn) {
	    if (typeof fn !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(fn));
	    }
	    return async.setScheduler(fn);
	};

	Promise.prototype._then = function (
	    didFulfill,
	    didReject,
	    _,    receiver,
	    internalData
	) {
	    var haveInternalData = internalData !== undefined;
	    var promise = haveInternalData ? internalData : new Promise(INTERNAL);
	    var target = this._target();
	    var bitField = target._bitField;

	    if (!haveInternalData) {
	        promise._propagateFrom(this, 3);
	        promise._captureStackTrace();
	        if (receiver === undefined &&
	            ((this._bitField & 2097152) !== 0)) {
	            if (!((bitField & 50397184) === 0)) {
	                receiver = this._boundValue();
	            } else {
	                receiver = target === this ? undefined : this._boundTo;
	            }
	        }
	        this._fireEvent("promiseChained", this, promise);
	    }

	    var domain = getDomain();
	    if (!((bitField & 50397184) === 0)) {
	        var handler, value, settler = target._settlePromiseCtx;
	        if (((bitField & 33554432) !== 0)) {
	            value = target._rejectionHandler0;
	            handler = didFulfill;
	        } else if (((bitField & 16777216) !== 0)) {
	            value = target._fulfillmentHandler0;
	            handler = didReject;
	            target._unsetRejectionIsUnhandled();
	        } else {
	            settler = target._settlePromiseLateCancellationObserver;
	            value = new CancellationError("late cancellation observer");
	            target._attachExtraTrace(value);
	            handler = didReject;
	        }

	        async.invoke(settler, target, {
	            handler: domain === null ? handler
	                : (typeof handler === "function" && domain.bind(handler)),
	            promise: promise,
	            receiver: receiver,
	            value: value
	        });
	    } else {
	        target._addCallbacks(didFulfill, didReject, promise, receiver, domain);
	    }

	    return promise;
	};

	Promise.prototype._length = function () {
	    return this._bitField & 65535;
	};

	Promise.prototype._isFateSealed = function () {
	    return (this._bitField & 117506048) !== 0;
	};

	Promise.prototype._isFollowing = function () {
	    return (this._bitField & 67108864) === 67108864;
	};

	Promise.prototype._setLength = function (len) {
	    this._bitField = (this._bitField & -65536) |
	        (len & 65535);
	};

	Promise.prototype._setFulfilled = function () {
	    this._bitField = this._bitField | 33554432;
	    this._fireEvent("promiseFulfilled", this);
	};

	Promise.prototype._setRejected = function () {
	    this._bitField = this._bitField | 16777216;
	    this._fireEvent("promiseRejected", this);
	};

	Promise.prototype._setFollowing = function () {
	    this._bitField = this._bitField | 67108864;
	    this._fireEvent("promiseResolved", this);
	};

	Promise.prototype._setIsFinal = function () {
	    this._bitField = this._bitField | 4194304;
	};

	Promise.prototype._isFinal = function () {
	    return (this._bitField & 4194304) > 0;
	};

	Promise.prototype._unsetCancelled = function() {
	    this._bitField = this._bitField & (~65536);
	};

	Promise.prototype._setCancelled = function() {
	    this._bitField = this._bitField | 65536;
	    this._fireEvent("promiseCancelled", this);
	};

	Promise.prototype._setAsyncGuaranteed = function() {
	    if (async.hasCustomScheduler()) return;
	    this._bitField = this._bitField | 134217728;
	};

	Promise.prototype._receiverAt = function (index) {
	    var ret = index === 0 ? this._receiver0 : this[
	            index * 4 - 4 + 3];
	    if (ret === UNDEFINED_BINDING) {
	        return undefined;
	    } else if (ret === undefined && this._isBound()) {
	        return this._boundValue();
	    }
	    return ret;
	};

	Promise.prototype._promiseAt = function (index) {
	    return this[
	            index * 4 - 4 + 2];
	};

	Promise.prototype._fulfillmentHandlerAt = function (index) {
	    return this[
	            index * 4 - 4 + 0];
	};

	Promise.prototype._rejectionHandlerAt = function (index) {
	    return this[
	            index * 4 - 4 + 1];
	};

	Promise.prototype._boundValue = function() {};

	Promise.prototype._migrateCallback0 = function (follower) {
	    var bitField = follower._bitField;
	    var fulfill = follower._fulfillmentHandler0;
	    var reject = follower._rejectionHandler0;
	    var promise = follower._promise0;
	    var receiver = follower._receiverAt(0);
	    if (receiver === undefined) receiver = UNDEFINED_BINDING;
	    this._addCallbacks(fulfill, reject, promise, receiver, null);
	};

	Promise.prototype._migrateCallbackAt = function (follower, index) {
	    var fulfill = follower._fulfillmentHandlerAt(index);
	    var reject = follower._rejectionHandlerAt(index);
	    var promise = follower._promiseAt(index);
	    var receiver = follower._receiverAt(index);
	    if (receiver === undefined) receiver = UNDEFINED_BINDING;
	    this._addCallbacks(fulfill, reject, promise, receiver, null);
	};

	Promise.prototype._addCallbacks = function (
	    fulfill,
	    reject,
	    promise,
	    receiver,
	    domain
	) {
	    var index = this._length();

	    if (index >= 65535 - 4) {
	        index = 0;
	        this._setLength(0);
	    }

	    if (index === 0) {
	        this._promise0 = promise;
	        this._receiver0 = receiver;
	        if (typeof fulfill === "function") {
	            this._fulfillmentHandler0 =
	                domain === null ? fulfill : domain.bind(fulfill);
	        }
	        if (typeof reject === "function") {
	            this._rejectionHandler0 =
	                domain === null ? reject : domain.bind(reject);
	        }
	    } else {
	        var base = index * 4 - 4;
	        this[base + 2] = promise;
	        this[base + 3] = receiver;
	        if (typeof fulfill === "function") {
	            this[base + 0] =
	                domain === null ? fulfill : domain.bind(fulfill);
	        }
	        if (typeof reject === "function") {
	            this[base + 1] =
	                domain === null ? reject : domain.bind(reject);
	        }
	    }
	    this._setLength(index + 1);
	    return index;
	};

	Promise.prototype._proxy = function (proxyable, arg) {
	    this._addCallbacks(undefined, undefined, arg, proxyable, null);
	};

	Promise.prototype._resolveCallback = function(value, shouldBind) {
	    if (((this._bitField & 117506048) !== 0)) return;
	    if (value === this)
	        return this._rejectCallback(makeSelfResolutionError(), false);
	    var maybePromise = tryConvertToPromise(value, this);
	    if (!(maybePromise instanceof Promise)) return this._fulfill(value);

	    if (shouldBind) this._propagateFrom(maybePromise, 2);

	    var promise = maybePromise._target();

	    if (promise === this) {
	        this._reject(makeSelfResolutionError());
	        return;
	    }

	    var bitField = promise._bitField;
	    if (((bitField & 50397184) === 0)) {
	        var len = this._length();
	        if (len > 0) promise._migrateCallback0(this);
	        for (var i = 1; i < len; ++i) {
	            promise._migrateCallbackAt(this, i);
	        }
	        this._setFollowing();
	        this._setLength(0);
	        this._setFollowee(promise);
	    } else if (((bitField & 33554432) !== 0)) {
	        this._fulfill(promise._value());
	    } else if (((bitField & 16777216) !== 0)) {
	        this._reject(promise._reason());
	    } else {
	        var reason = new CancellationError("late cancellation observer");
	        promise._attachExtraTrace(reason);
	        this._reject(reason);
	    }
	};

	Promise.prototype._rejectCallback =
	function(reason, synchronous, ignoreNonErrorWarnings) {
	    var trace = util.ensureErrorObject(reason);
	    var hasStack = trace === reason;
	    if (!hasStack && !ignoreNonErrorWarnings && debug.warnings()) {
	        var message = "a promise was rejected with a non-error: " +
	            util.classString(reason);
	        this._warn(message, true);
	    }
	    this._attachExtraTrace(trace, synchronous ? hasStack : false);
	    this._reject(reason);
	};

	Promise.prototype._resolveFromExecutor = function (executor) {
	    var promise = this;
	    this._captureStackTrace();
	    this._pushContext();
	    var synchronous = true;
	    var r = this._execute(executor, function(value) {
	        promise._resolveCallback(value);
	    }, function (reason) {
	        promise._rejectCallback(reason, synchronous);
	    });
	    synchronous = false;
	    this._popContext();

	    if (r !== undefined) {
	        promise._rejectCallback(r, true);
	    }
	};

	Promise.prototype._settlePromiseFromHandler = function (
	    handler, receiver, value, promise
	) {
	    var bitField = promise._bitField;
	    if (((bitField & 65536) !== 0)) return;
	    promise._pushContext();
	    var x;
	    if (receiver === APPLY) {
	        if (!value || typeof value.length !== "number") {
	            x = errorObj;
	            x.e = new TypeError("cannot .spread() a non-array: " +
	                                    util.classString(value));
	        } else {
	            x = tryCatch(handler).apply(this._boundValue(), value);
	        }
	    } else {
	        x = tryCatch(handler).call(receiver, value);
	    }
	    var promiseCreated = promise._popContext();
	    bitField = promise._bitField;
	    if (((bitField & 65536) !== 0)) return;

	    if (x === NEXT_FILTER) {
	        promise._reject(value);
	    } else if (x === errorObj) {
	        promise._rejectCallback(x.e, false);
	    } else {
	        debug.checkForgottenReturns(x, promiseCreated, "",  promise, this);
	        promise._resolveCallback(x);
	    }
	};

	Promise.prototype._target = function() {
	    var ret = this;
	    while (ret._isFollowing()) ret = ret._followee();
	    return ret;
	};

	Promise.prototype._followee = function() {
	    return this._rejectionHandler0;
	};

	Promise.prototype._setFollowee = function(promise) {
	    this._rejectionHandler0 = promise;
	};

	Promise.prototype._settlePromise = function(promise, handler, receiver, value) {
	    var isPromise = promise instanceof Promise;
	    var bitField = this._bitField;
	    var asyncGuaranteed = ((bitField & 134217728) !== 0);
	    if (((bitField & 65536) !== 0)) {
	        if (isPromise) promise._invokeInternalOnCancel();

	        if (receiver instanceof PassThroughHandlerContext &&
	            receiver.isFinallyHandler()) {
	            receiver.cancelPromise = promise;
	            if (tryCatch(handler).call(receiver, value) === errorObj) {
	                promise._reject(errorObj.e);
	            }
	        } else if (handler === reflectHandler) {
	            promise._fulfill(reflectHandler.call(receiver));
	        } else if (receiver instanceof Proxyable) {
	            receiver._promiseCancelled(promise);
	        } else if (isPromise || promise instanceof PromiseArray) {
	            promise._cancel();
	        } else {
	            receiver.cancel();
	        }
	    } else if (typeof handler === "function") {
	        if (!isPromise) {
	            handler.call(receiver, value, promise);
	        } else {
	            if (asyncGuaranteed) promise._setAsyncGuaranteed();
	            this._settlePromiseFromHandler(handler, receiver, value, promise);
	        }
	    } else if (receiver instanceof Proxyable) {
	        if (!receiver._isResolved()) {
	            if (((bitField & 33554432) !== 0)) {
	                receiver._promiseFulfilled(value, promise);
	            } else {
	                receiver._promiseRejected(value, promise);
	            }
	        }
	    } else if (isPromise) {
	        if (asyncGuaranteed) promise._setAsyncGuaranteed();
	        if (((bitField & 33554432) !== 0)) {
	            promise._fulfill(value);
	        } else {
	            promise._reject(value);
	        }
	    }
	};

	Promise.prototype._settlePromiseLateCancellationObserver = function(ctx) {
	    var handler = ctx.handler;
	    var promise = ctx.promise;
	    var receiver = ctx.receiver;
	    var value = ctx.value;
	    if (typeof handler === "function") {
	        if (!(promise instanceof Promise)) {
	            handler.call(receiver, value, promise);
	        } else {
	            this._settlePromiseFromHandler(handler, receiver, value, promise);
	        }
	    } else if (promise instanceof Promise) {
	        promise._reject(value);
	    }
	};

	Promise.prototype._settlePromiseCtx = function(ctx) {
	    this._settlePromise(ctx.promise, ctx.handler, ctx.receiver, ctx.value);
	};

	Promise.prototype._settlePromise0 = function(handler, value, bitField) {
	    var promise = this._promise0;
	    var receiver = this._receiverAt(0);
	    this._promise0 = undefined;
	    this._receiver0 = undefined;
	    this._settlePromise(promise, handler, receiver, value);
	};

	Promise.prototype._clearCallbackDataAtIndex = function(index) {
	    var base = index * 4 - 4;
	    this[base + 2] =
	    this[base + 3] =
	    this[base + 0] =
	    this[base + 1] = undefined;
	};

	Promise.prototype._fulfill = function (value) {
	    var bitField = this._bitField;
	    if (((bitField & 117506048) >>> 16)) return;
	    if (value === this) {
	        var err = makeSelfResolutionError();
	        this._attachExtraTrace(err);
	        return this._reject(err);
	    }
	    this._setFulfilled();
	    this._rejectionHandler0 = value;

	    if ((bitField & 65535) > 0) {
	        if (((bitField & 134217728) !== 0)) {
	            this._settlePromises();
	        } else {
	            async.settlePromises(this);
	        }
	    }
	};

	Promise.prototype._reject = function (reason) {
	    var bitField = this._bitField;
	    if (((bitField & 117506048) >>> 16)) return;
	    this._setRejected();
	    this._fulfillmentHandler0 = reason;

	    if (this._isFinal()) {
	        return async.fatalError(reason, util.isNode);
	    }

	    if ((bitField & 65535) > 0) {
	        async.settlePromises(this);
	    } else {
	        this._ensurePossibleRejectionHandled();
	    }
	};

	Promise.prototype._fulfillPromises = function (len, value) {
	    for (var i = 1; i < len; i++) {
	        var handler = this._fulfillmentHandlerAt(i);
	        var promise = this._promiseAt(i);
	        var receiver = this._receiverAt(i);
	        this._clearCallbackDataAtIndex(i);
	        this._settlePromise(promise, handler, receiver, value);
	    }
	};

	Promise.prototype._rejectPromises = function (len, reason) {
	    for (var i = 1; i < len; i++) {
	        var handler = this._rejectionHandlerAt(i);
	        var promise = this._promiseAt(i);
	        var receiver = this._receiverAt(i);
	        this._clearCallbackDataAtIndex(i);
	        this._settlePromise(promise, handler, receiver, reason);
	    }
	};

	Promise.prototype._settlePromises = function () {
	    var bitField = this._bitField;
	    var len = (bitField & 65535);

	    if (len > 0) {
	        if (((bitField & 16842752) !== 0)) {
	            var reason = this._fulfillmentHandler0;
	            this._settlePromise0(this._rejectionHandler0, reason, bitField);
	            this._rejectPromises(len, reason);
	        } else {
	            var value = this._rejectionHandler0;
	            this._settlePromise0(this._fulfillmentHandler0, value, bitField);
	            this._fulfillPromises(len, value);
	        }
	        this._setLength(0);
	    }
	    this._clearCancellationData();
	};

	Promise.prototype._settledValue = function() {
	    var bitField = this._bitField;
	    if (((bitField & 33554432) !== 0)) {
	        return this._rejectionHandler0;
	    } else if (((bitField & 16777216) !== 0)) {
	        return this._fulfillmentHandler0;
	    }
	};

	function deferResolve(v) {this.promise._resolveCallback(v);}
	function deferReject(v) {this.promise._rejectCallback(v, false);}

	Promise.defer = Promise.pending = function() {
	    debug.deprecated("Promise.defer", "new Promise");
	    var promise = new Promise(INTERNAL);
	    return {
	        promise: promise,
	        resolve: deferResolve,
	        reject: deferReject
	    };
	};

	util.notEnumerableProp(Promise,
	                       "_makeSelfResolutionError",
	                       makeSelfResolutionError);

	__webpack_require__(39)(Promise, INTERNAL, tryConvertToPromise, apiRejection,
	    debug);
	__webpack_require__(40)(Promise, INTERNAL, tryConvertToPromise, debug);
	__webpack_require__(41)(Promise, PromiseArray, apiRejection, debug);
	__webpack_require__(42)(Promise);
	__webpack_require__(43)(Promise);
	__webpack_require__(44)(
	    Promise, PromiseArray, tryConvertToPromise, INTERNAL, debug);
	Promise.Promise = Promise;
	Promise.version = "3.4.0";
	__webpack_require__(45)(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
	__webpack_require__(46)(Promise);
	__webpack_require__(47)(Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug);
	__webpack_require__(48)(Promise, INTERNAL, debug);
	__webpack_require__(49)(Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug);
	__webpack_require__(50)(Promise);
	__webpack_require__(51)(Promise, INTERNAL);
	__webpack_require__(52)(Promise, PromiseArray, tryConvertToPromise, apiRejection);
	__webpack_require__(53)(Promise, INTERNAL, tryConvertToPromise, apiRejection);
	__webpack_require__(54)(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
	__webpack_require__(55)(Promise, PromiseArray, debug);
	__webpack_require__(56)(Promise, PromiseArray, apiRejection);
	__webpack_require__(57)(Promise, INTERNAL);
	__webpack_require__(58)(Promise, INTERNAL);
	__webpack_require__(59)(Promise);
	                                                         
	    util.toFastProperties(Promise);                                          
	    util.toFastProperties(Promise.prototype);                                
	    function fillTypes(value) {                                              
	        var p = new Promise(INTERNAL);                                       
	        p._fulfillmentHandler0 = value;                                      
	        p._rejectionHandler0 = value;                                        
	        p._promise0 = value;                                                 
	        p._receiver0 = value;                                                
	    }                                                                        
	    // Complete slack tracking, opt out of field-type tracking and           
	    // stabilize map                                                         
	    fillTypes({a: 1});                                                       
	    fillTypes({b: 2});                                                       
	    fillTypes({c: 3});                                                       
	    fillTypes(1);                                                            
	    fillTypes(function(){});                                                 
	    fillTypes(undefined);                                                    
	    fillTypes(false);                                                        
	    fillTypes(new Promise(INTERNAL));                                        
	    debug.setBounds(Async.firstLineError, util.lastLineError);               
	    return Promise;                                                          

	};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var es5 = __webpack_require__(27);
	var canEvaluate = typeof navigator == "undefined";

	var errorObj = {e: {}};
	var tryCatchTarget;
	var globalObject = typeof self !== "undefined" ? self :
	    typeof window !== "undefined" ? window :
	    typeof global !== "undefined" ? global :
	    this !== undefined ? this : null;

	function tryCatcher() {
	    try {
	        var target = tryCatchTarget;
	        tryCatchTarget = null;
	        return target.apply(this, arguments);
	    } catch (e) {
	        errorObj.e = e;
	        return errorObj;
	    }
	}
	function tryCatch(fn) {
	    tryCatchTarget = fn;
	    return tryCatcher;
	}

	var inherits = function(Child, Parent) {
	    var hasProp = {}.hasOwnProperty;

	    function T() {
	        this.constructor = Child;
	        this.constructor$ = Parent;
	        for (var propertyName in Parent.prototype) {
	            if (hasProp.call(Parent.prototype, propertyName) &&
	                propertyName.charAt(propertyName.length-1) !== "$"
	           ) {
	                this[propertyName + "$"] = Parent.prototype[propertyName];
	            }
	        }
	    }
	    T.prototype = Parent.prototype;
	    Child.prototype = new T();
	    return Child.prototype;
	};


	function isPrimitive(val) {
	    return val == null || val === true || val === false ||
	        typeof val === "string" || typeof val === "number";

	}

	function isObject(value) {
	    return typeof value === "function" ||
	           typeof value === "object" && value !== null;
	}

	function maybeWrapAsError(maybeError) {
	    if (!isPrimitive(maybeError)) return maybeError;

	    return new Error(safeToString(maybeError));
	}

	function withAppended(target, appendee) {
	    var len = target.length;
	    var ret = new Array(len + 1);
	    var i;
	    for (i = 0; i < len; ++i) {
	        ret[i] = target[i];
	    }
	    ret[i] = appendee;
	    return ret;
	}

	function getDataPropertyOrDefault(obj, key, defaultValue) {
	    if (es5.isES5) {
	        var desc = Object.getOwnPropertyDescriptor(obj, key);

	        if (desc != null) {
	            return desc.get == null && desc.set == null
	                    ? desc.value
	                    : defaultValue;
	        }
	    } else {
	        return {}.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
	    }
	}

	function notEnumerableProp(obj, name, value) {
	    if (isPrimitive(obj)) return obj;
	    var descriptor = {
	        value: value,
	        configurable: true,
	        enumerable: false,
	        writable: true
	    };
	    es5.defineProperty(obj, name, descriptor);
	    return obj;
	}

	function thrower(r) {
	    throw r;
	}

	var inheritedDataKeys = (function() {
	    var excludedPrototypes = [
	        Array.prototype,
	        Object.prototype,
	        Function.prototype
	    ];

	    var isExcludedProto = function(val) {
	        for (var i = 0; i < excludedPrototypes.length; ++i) {
	            if (excludedPrototypes[i] === val) {
	                return true;
	            }
	        }
	        return false;
	    };

	    if (es5.isES5) {
	        var getKeys = Object.getOwnPropertyNames;
	        return function(obj) {
	            var ret = [];
	            var visitedKeys = Object.create(null);
	            while (obj != null && !isExcludedProto(obj)) {
	                var keys;
	                try {
	                    keys = getKeys(obj);
	                } catch (e) {
	                    return ret;
	                }
	                for (var i = 0; i < keys.length; ++i) {
	                    var key = keys[i];
	                    if (visitedKeys[key]) continue;
	                    visitedKeys[key] = true;
	                    var desc = Object.getOwnPropertyDescriptor(obj, key);
	                    if (desc != null && desc.get == null && desc.set == null) {
	                        ret.push(key);
	                    }
	                }
	                obj = es5.getPrototypeOf(obj);
	            }
	            return ret;
	        };
	    } else {
	        var hasProp = {}.hasOwnProperty;
	        return function(obj) {
	            if (isExcludedProto(obj)) return [];
	            var ret = [];

	            /*jshint forin:false */
	            enumeration: for (var key in obj) {
	                if (hasProp.call(obj, key)) {
	                    ret.push(key);
	                } else {
	                    for (var i = 0; i < excludedPrototypes.length; ++i) {
	                        if (hasProp.call(excludedPrototypes[i], key)) {
	                            continue enumeration;
	                        }
	                    }
	                    ret.push(key);
	                }
	            }
	            return ret;
	        };
	    }

	})();

	var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
	function isClass(fn) {
	    try {
	        if (typeof fn === "function") {
	            var keys = es5.names(fn.prototype);

	            var hasMethods = es5.isES5 && keys.length > 1;
	            var hasMethodsOtherThanConstructor = keys.length > 0 &&
	                !(keys.length === 1 && keys[0] === "constructor");
	            var hasThisAssignmentAndStaticMethods =
	                thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;

	            if (hasMethods || hasMethodsOtherThanConstructor ||
	                hasThisAssignmentAndStaticMethods) {
	                return true;
	            }
	        }
	        return false;
	    } catch (e) {
	        return false;
	    }
	}

	function toFastProperties(obj) {
	    /*jshint -W027,-W055,-W031*/
	    function FakeConstructor() {}
	    FakeConstructor.prototype = obj;
	    var l = 8;
	    while (l--) new FakeConstructor();
	    return obj;
	    eval(obj);
	}

	var rident = /^[a-z$_][a-z$_0-9]*$/i;
	function isIdentifier(str) {
	    return rident.test(str);
	}

	function filledRange(count, prefix, suffix) {
	    var ret = new Array(count);
	    for(var i = 0; i < count; ++i) {
	        ret[i] = prefix + i + suffix;
	    }
	    return ret;
	}

	function safeToString(obj) {
	    try {
	        return obj + "";
	    } catch (e) {
	        return "[no string representation]";
	    }
	}

	function isError(obj) {
	    return obj !== null &&
	           typeof obj === "object" &&
	           typeof obj.message === "string" &&
	           typeof obj.name === "string";
	}

	function markAsOriginatingFromRejection(e) {
	    try {
	        notEnumerableProp(e, "isOperational", true);
	    }
	    catch(ignore) {}
	}

	function originatesFromRejection(e) {
	    if (e == null) return false;
	    return ((e instanceof Error["__BluebirdErrorTypes__"].OperationalError) ||
	        e["isOperational"] === true);
	}

	function canAttachTrace(obj) {
	    return isError(obj) && es5.propertyIsWritable(obj, "stack");
	}

	var ensureErrorObject = (function() {
	    if (!("stack" in new Error())) {
	        return function(value) {
	            if (canAttachTrace(value)) return value;
	            try {throw new Error(safeToString(value));}
	            catch(err) {return err;}
	        };
	    } else {
	        return function(value) {
	            if (canAttachTrace(value)) return value;
	            return new Error(safeToString(value));
	        };
	    }
	})();

	function classString(obj) {
	    return {}.toString.call(obj);
	}

	function copyDescriptors(from, to, filter) {
	    var keys = es5.names(from);
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        if (filter(key)) {
	            try {
	                es5.defineProperty(to, key, es5.getDescriptor(from, key));
	            } catch (ignore) {}
	        }
	    }
	}

	var asArray = function(v) {
	    if (es5.isArray(v)) {
	        return v;
	    }
	    return null;
	};

	if (typeof Symbol !== "undefined" && Symbol.iterator) {
	    var ArrayFrom = typeof Array.from === "function" ? function(v) {
	        return Array.from(v);
	    } : function(v) {
	        var ret = [];
	        var it = v[Symbol.iterator]();
	        var itResult;
	        while (!((itResult = it.next()).done)) {
	            ret.push(itResult.value);
	        }
	        return ret;
	    };

	    asArray = function(v) {
	        if (es5.isArray(v)) {
	            return v;
	        } else if (v != null && typeof v[Symbol.iterator] === "function") {
	            return ArrayFrom(v);
	        }
	        return null;
	    };
	}

	var isNode = typeof process !== "undefined" &&
	        classString(process).toLowerCase() === "[object process]";

	function env(key, def) {
	    return isNode ? process.env[key] : def;
	}

	function getNativePromise() {
	    if (typeof Promise === "function") {
	        try {
	            var promise = new Promise(function(){});
	            if ({}.toString.call(promise) === "[object Promise]") {
	                return Promise;
	            }
	        } catch (e) {}
	    }
	}

	var ret = {
	    isClass: isClass,
	    isIdentifier: isIdentifier,
	    inheritedDataKeys: inheritedDataKeys,
	    getDataPropertyOrDefault: getDataPropertyOrDefault,
	    thrower: thrower,
	    isArray: es5.isArray,
	    asArray: asArray,
	    notEnumerableProp: notEnumerableProp,
	    isPrimitive: isPrimitive,
	    isObject: isObject,
	    isError: isError,
	    canEvaluate: canEvaluate,
	    errorObj: errorObj,
	    tryCatch: tryCatch,
	    inherits: inherits,
	    withAppended: withAppended,
	    maybeWrapAsError: maybeWrapAsError,
	    toFastProperties: toFastProperties,
	    filledRange: filledRange,
	    toString: safeToString,
	    canAttachTrace: canAttachTrace,
	    ensureErrorObject: ensureErrorObject,
	    originatesFromRejection: originatesFromRejection,
	    markAsOriginatingFromRejection: markAsOriginatingFromRejection,
	    classString: classString,
	    copyDescriptors: copyDescriptors,
	    hasDevTools: typeof chrome !== "undefined" && chrome &&
	                 typeof chrome.loadTimes === "function",
	    isNode: isNode,
	    env: env,
	    global: globalObject,
	    getNativePromise: getNativePromise
	};
	ret.isRecentNode = ret.isNode && (function() {
	    var version = process.versions.node.split(".").map(Number);
	    return (version[0] === 0 && version[1] > 10) || (version[0] > 0);
	})();

	if (ret.isNode) ret.toFastProperties(process);

	try {throw new Error(); } catch (e) {ret.lastLineError = e;}
	module.exports = ret;


/***/ },
/* 27 */
/***/ function(module, exports) {

	var isES5 = (function(){
	    "use strict";
	    return this === undefined;
	})();

	if (isES5) {
	    module.exports = {
	        freeze: Object.freeze,
	        defineProperty: Object.defineProperty,
	        getDescriptor: Object.getOwnPropertyDescriptor,
	        keys: Object.keys,
	        names: Object.getOwnPropertyNames,
	        getPrototypeOf: Object.getPrototypeOf,
	        isArray: Array.isArray,
	        isES5: isES5,
	        propertyIsWritable: function(obj, prop) {
	            var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
	            return !!(!descriptor || descriptor.writable || descriptor.set);
	        }
	    };
	} else {
	    var has = {}.hasOwnProperty;
	    var str = {}.toString;
	    var proto = {}.constructor.prototype;

	    var ObjectKeys = function (o) {
	        var ret = [];
	        for (var key in o) {
	            if (has.call(o, key)) {
	                ret.push(key);
	            }
	        }
	        return ret;
	    };

	    var ObjectGetDescriptor = function(o, key) {
	        return {value: o[key]};
	    };

	    var ObjectDefineProperty = function (o, key, desc) {
	        o[key] = desc.value;
	        return o;
	    };

	    var ObjectFreeze = function (obj) {
	        return obj;
	    };

	    var ObjectGetPrototypeOf = function (obj) {
	        try {
	            return Object(obj).constructor.prototype;
	        }
	        catch (e) {
	            return proto;
	        }
	    };

	    var ArrayIsArray = function (obj) {
	        try {
	            return str.call(obj) === "[object Array]";
	        }
	        catch(e) {
	            return false;
	        }
	    };

	    module.exports = {
	        isArray: ArrayIsArray,
	        keys: ObjectKeys,
	        names: ObjectKeys,
	        defineProperty: ObjectDefineProperty,
	        getDescriptor: ObjectGetDescriptor,
	        freeze: ObjectFreeze,
	        getPrototypeOf: ObjectGetPrototypeOf,
	        isES5: isES5,
	        propertyIsWritable: function() {
	            return true;
	        }
	    };
	}


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var firstLineError;
	try {throw new Error(); } catch (e) {firstLineError = e;}
	var schedule = __webpack_require__(29);
	var Queue = __webpack_require__(30);
	var util = __webpack_require__(26);

	function Async() {
	    this._customScheduler = false;
	    this._isTickUsed = false;
	    this._lateQueue = new Queue(16);
	    this._normalQueue = new Queue(16);
	    this._haveDrainedQueues = false;
	    this._trampolineEnabled = true;
	    var self = this;
	    this.drainQueues = function () {
	        self._drainQueues();
	    };
	    this._schedule = schedule;
	}

	Async.prototype.setScheduler = function(fn) {
	    var prev = this._schedule;
	    this._schedule = fn;
	    this._customScheduler = true;
	    return prev;
	};

	Async.prototype.hasCustomScheduler = function() {
	    return this._customScheduler;
	};

	Async.prototype.enableTrampoline = function() {
	    this._trampolineEnabled = true;
	};

	Async.prototype.disableTrampolineIfNecessary = function() {
	    if (util.hasDevTools) {
	        this._trampolineEnabled = false;
	    }
	};

	Async.prototype.haveItemsQueued = function () {
	    return this._isTickUsed || this._haveDrainedQueues;
	};


	Async.prototype.fatalError = function(e, isNode) {
	    if (isNode) {
	        process.stderr.write("Fatal " + (e instanceof Error ? e.stack : e) +
	            "\n");
	        process.exit(2);
	    } else {
	        this.throwLater(e);
	    }
	};

	Async.prototype.throwLater = function(fn, arg) {
	    if (arguments.length === 1) {
	        arg = fn;
	        fn = function () { throw arg; };
	    }
	    if (typeof setTimeout !== "undefined") {
	        setTimeout(function() {
	            fn(arg);
	        }, 0);
	    } else try {
	        this._schedule(function() {
	            fn(arg);
	        });
	    } catch (e) {
	        throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	};

	function AsyncInvokeLater(fn, receiver, arg) {
	    this._lateQueue.push(fn, receiver, arg);
	    this._queueTick();
	}

	function AsyncInvoke(fn, receiver, arg) {
	    this._normalQueue.push(fn, receiver, arg);
	    this._queueTick();
	}

	function AsyncSettlePromises(promise) {
	    this._normalQueue._pushOne(promise);
	    this._queueTick();
	}

	if (!util.hasDevTools) {
	    Async.prototype.invokeLater = AsyncInvokeLater;
	    Async.prototype.invoke = AsyncInvoke;
	    Async.prototype.settlePromises = AsyncSettlePromises;
	} else {
	    Async.prototype.invokeLater = function (fn, receiver, arg) {
	        if (this._trampolineEnabled) {
	            AsyncInvokeLater.call(this, fn, receiver, arg);
	        } else {
	            this._schedule(function() {
	                setTimeout(function() {
	                    fn.call(receiver, arg);
	                }, 100);
	            });
	        }
	    };

	    Async.prototype.invoke = function (fn, receiver, arg) {
	        if (this._trampolineEnabled) {
	            AsyncInvoke.call(this, fn, receiver, arg);
	        } else {
	            this._schedule(function() {
	                fn.call(receiver, arg);
	            });
	        }
	    };

	    Async.prototype.settlePromises = function(promise) {
	        if (this._trampolineEnabled) {
	            AsyncSettlePromises.call(this, promise);
	        } else {
	            this._schedule(function() {
	                promise._settlePromises();
	            });
	        }
	    };
	}

	Async.prototype.invokeFirst = function (fn, receiver, arg) {
	    this._normalQueue.unshift(fn, receiver, arg);
	    this._queueTick();
	};

	Async.prototype._drainQueue = function(queue) {
	    while (queue.length() > 0) {
	        var fn = queue.shift();
	        if (typeof fn !== "function") {
	            fn._settlePromises();
	            continue;
	        }
	        var receiver = queue.shift();
	        var arg = queue.shift();
	        fn.call(receiver, arg);
	    }
	};

	Async.prototype._drainQueues = function () {
	    this._drainQueue(this._normalQueue);
	    this._reset();
	    this._haveDrainedQueues = true;
	    this._drainQueue(this._lateQueue);
	};

	Async.prototype._queueTick = function () {
	    if (!this._isTickUsed) {
	        this._isTickUsed = true;
	        this._schedule(this.drainQueues);
	    }
	};

	Async.prototype._reset = function () {
	    this._isTickUsed = false;
	};

	module.exports = Async;
	module.exports.firstLineError = firstLineError;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var util = __webpack_require__(26);
	var schedule;
	var noAsyncScheduler = function() {
	    throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	};
	var NativePromise = util.getNativePromise();
	if (util.isNode && typeof MutationObserver === "undefined") {
	    var GlobalSetImmediate = global.setImmediate;
	    var ProcessNextTick = process.nextTick;
	    schedule = util.isRecentNode
	                ? function(fn) { GlobalSetImmediate.call(global, fn); }
	                : function(fn) { ProcessNextTick.call(process, fn); };
	} else if (typeof NativePromise === "function") {
	    var nativePromise = NativePromise.resolve();
	    schedule = function(fn) {
	        nativePromise.then(fn);
	    };
	} else if ((typeof MutationObserver !== "undefined") &&
	          !(typeof window !== "undefined" &&
	            window.navigator &&
	            window.navigator.standalone)) {
	    schedule = (function() {
	        var div = document.createElement("div");
	        var opts = {attributes: true};
	        var toggleScheduled = false;
	        var div2 = document.createElement("div");
	        var o2 = new MutationObserver(function() {
	            div.classList.toggle("foo");
	            toggleScheduled = false;
	        });
	        o2.observe(div2, opts);

	        var scheduleToggle = function() {
	            if (toggleScheduled) return;
	                toggleScheduled = true;
	                div2.classList.toggle("foo");
	            };

	            return function schedule(fn) {
	            var o = new MutationObserver(function() {
	                o.disconnect();
	                fn();
	            });
	            o.observe(div, opts);
	            scheduleToggle();
	        };
	    })();
	} else if (typeof setImmediate !== "undefined") {
	    schedule = function (fn) {
	        setImmediate(fn);
	    };
	} else if (typeof setTimeout !== "undefined") {
	    schedule = function (fn) {
	        setTimeout(fn, 0);
	    };
	} else {
	    schedule = noAsyncScheduler;
	}
	module.exports = schedule;


/***/ },
/* 30 */
/***/ function(module, exports) {

	"use strict";
	function arrayMove(src, srcIndex, dst, dstIndex, len) {
	    for (var j = 0; j < len; ++j) {
	        dst[j + dstIndex] = src[j + srcIndex];
	        src[j + srcIndex] = void 0;
	    }
	}

	function Queue(capacity) {
	    this._capacity = capacity;
	    this._length = 0;
	    this._front = 0;
	}

	Queue.prototype._willBeOverCapacity = function (size) {
	    return this._capacity < size;
	};

	Queue.prototype._pushOne = function (arg) {
	    var length = this.length();
	    this._checkCapacity(length + 1);
	    var i = (this._front + length) & (this._capacity - 1);
	    this[i] = arg;
	    this._length = length + 1;
	};

	Queue.prototype._unshiftOne = function(value) {
	    var capacity = this._capacity;
	    this._checkCapacity(this.length() + 1);
	    var front = this._front;
	    var i = (((( front - 1 ) &
	                    ( capacity - 1) ) ^ capacity ) - capacity );
	    this[i] = value;
	    this._front = i;
	    this._length = this.length() + 1;
	};

	Queue.prototype.unshift = function(fn, receiver, arg) {
	    this._unshiftOne(arg);
	    this._unshiftOne(receiver);
	    this._unshiftOne(fn);
	};

	Queue.prototype.push = function (fn, receiver, arg) {
	    var length = this.length() + 3;
	    if (this._willBeOverCapacity(length)) {
	        this._pushOne(fn);
	        this._pushOne(receiver);
	        this._pushOne(arg);
	        return;
	    }
	    var j = this._front + length - 3;
	    this._checkCapacity(length);
	    var wrapMask = this._capacity - 1;
	    this[(j + 0) & wrapMask] = fn;
	    this[(j + 1) & wrapMask] = receiver;
	    this[(j + 2) & wrapMask] = arg;
	    this._length = length;
	};

	Queue.prototype.shift = function () {
	    var front = this._front,
	        ret = this[front];

	    this[front] = undefined;
	    this._front = (front + 1) & (this._capacity - 1);
	    this._length--;
	    return ret;
	};

	Queue.prototype.length = function () {
	    return this._length;
	};

	Queue.prototype._checkCapacity = function (size) {
	    if (this._capacity < size) {
	        this._resizeTo(this._capacity << 1);
	    }
	};

	Queue.prototype._resizeTo = function (capacity) {
	    var oldCapacity = this._capacity;
	    this._capacity = capacity;
	    var front = this._front;
	    var length = this._length;
	    var moveItemsCount = (front + length) & (oldCapacity - 1);
	    arrayMove(this, 0, this, oldCapacity, moveItemsCount);
	};

	module.exports = Queue;


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var es5 = __webpack_require__(27);
	var Objectfreeze = es5.freeze;
	var util = __webpack_require__(26);
	var inherits = util.inherits;
	var notEnumerableProp = util.notEnumerableProp;

	function subError(nameProperty, defaultMessage) {
	    function SubError(message) {
	        if (!(this instanceof SubError)) return new SubError(message);
	        notEnumerableProp(this, "message",
	            typeof message === "string" ? message : defaultMessage);
	        notEnumerableProp(this, "name", nameProperty);
	        if (Error.captureStackTrace) {
	            Error.captureStackTrace(this, this.constructor);
	        } else {
	            Error.call(this);
	        }
	    }
	    inherits(SubError, Error);
	    return SubError;
	}

	var _TypeError, _RangeError;
	var Warning = subError("Warning", "warning");
	var CancellationError = subError("CancellationError", "cancellation error");
	var TimeoutError = subError("TimeoutError", "timeout error");
	var AggregateError = subError("AggregateError", "aggregate error");
	try {
	    _TypeError = TypeError;
	    _RangeError = RangeError;
	} catch(e) {
	    _TypeError = subError("TypeError", "type error");
	    _RangeError = subError("RangeError", "range error");
	}

	var methods = ("join pop push shift unshift slice filter forEach some " +
	    "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");

	for (var i = 0; i < methods.length; ++i) {
	    if (typeof Array.prototype[methods[i]] === "function") {
	        AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
	    }
	}

	es5.defineProperty(AggregateError.prototype, "length", {
	    value: 0,
	    configurable: false,
	    writable: true,
	    enumerable: true
	});
	AggregateError.prototype["isOperational"] = true;
	var level = 0;
	AggregateError.prototype.toString = function() {
	    var indent = Array(level * 4 + 1).join(" ");
	    var ret = "\n" + indent + "AggregateError of:" + "\n";
	    level++;
	    indent = Array(level * 4 + 1).join(" ");
	    for (var i = 0; i < this.length; ++i) {
	        var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
	        var lines = str.split("\n");
	        for (var j = 0; j < lines.length; ++j) {
	            lines[j] = indent + lines[j];
	        }
	        str = lines.join("\n");
	        ret += str + "\n";
	    }
	    level--;
	    return ret;
	};

	function OperationalError(message) {
	    if (!(this instanceof OperationalError))
	        return new OperationalError(message);
	    notEnumerableProp(this, "name", "OperationalError");
	    notEnumerableProp(this, "message", message);
	    this.cause = message;
	    this["isOperational"] = true;

	    if (message instanceof Error) {
	        notEnumerableProp(this, "message", message.message);
	        notEnumerableProp(this, "stack", message.stack);
	    } else if (Error.captureStackTrace) {
	        Error.captureStackTrace(this, this.constructor);
	    }

	}
	inherits(OperationalError, Error);

	var errorTypes = Error["__BluebirdErrorTypes__"];
	if (!errorTypes) {
	    errorTypes = Objectfreeze({
	        CancellationError: CancellationError,
	        TimeoutError: TimeoutError,
	        OperationalError: OperationalError,
	        RejectionError: OperationalError,
	        AggregateError: AggregateError
	    });
	    es5.defineProperty(Error, "__BluebirdErrorTypes__", {
	        value: errorTypes,
	        writable: false,
	        enumerable: false,
	        configurable: false
	    });
	}

	module.exports = {
	    Error: Error,
	    TypeError: _TypeError,
	    RangeError: _RangeError,
	    CancellationError: errorTypes.CancellationError,
	    OperationalError: errorTypes.OperationalError,
	    TimeoutError: errorTypes.TimeoutError,
	    AggregateError: errorTypes.AggregateError,
	    Warning: Warning
	};


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var util = __webpack_require__(26);
	var errorObj = util.errorObj;
	var isObject = util.isObject;

	function tryConvertToPromise(obj, context) {
	    if (isObject(obj)) {
	        if (obj instanceof Promise) return obj;
	        var then = getThen(obj);
	        if (then === errorObj) {
	            if (context) context._pushContext();
	            var ret = Promise.reject(then.e);
	            if (context) context._popContext();
	            return ret;
	        } else if (typeof then === "function") {
	            if (isAnyBluebirdPromise(obj)) {
	                var ret = new Promise(INTERNAL);
	                obj._then(
	                    ret._fulfill,
	                    ret._reject,
	                    undefined,
	                    ret,
	                    null
	                );
	                return ret;
	            }
	            return doThenable(obj, then, context);
	        }
	    }
	    return obj;
	}

	function doGetThen(obj) {
	    return obj.then;
	}

	function getThen(obj) {
	    try {
	        return doGetThen(obj);
	    } catch (e) {
	        errorObj.e = e;
	        return errorObj;
	    }
	}

	var hasProp = {}.hasOwnProperty;
	function isAnyBluebirdPromise(obj) {
	    try {
	        return hasProp.call(obj, "_promise0");
	    } catch (e) {
	        return false;
	    }
	}

	function doThenable(x, then, context) {
	    var promise = new Promise(INTERNAL);
	    var ret = promise;
	    if (context) context._pushContext();
	    promise._captureStackTrace();
	    if (context) context._popContext();
	    var synchronous = true;
	    var result = util.tryCatch(then).call(x, resolve, reject);
	    synchronous = false;

	    if (promise && result === errorObj) {
	        promise._rejectCallback(result.e, true, true);
	        promise = null;
	    }

	    function resolve(value) {
	        if (!promise) return;
	        promise._resolveCallback(value);
	        promise = null;
	    }

	    function reject(reason) {
	        if (!promise) return;
	        promise._rejectCallback(reason, synchronous, true);
	        promise = null;
	    }
	    return ret;
	}

	return tryConvertToPromise;
	};


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, INTERNAL, tryConvertToPromise,
	    apiRejection, Proxyable) {
	var util = __webpack_require__(26);
	var isArray = util.isArray;

	function toResolutionValue(val) {
	    switch(val) {
	    case -2: return [];
	    case -3: return {};
	    }
	}

	function PromiseArray(values) {
	    var promise = this._promise = new Promise(INTERNAL);
	    if (values instanceof Promise) {
	        promise._propagateFrom(values, 3);
	    }
	    promise._setOnCancel(this);
	    this._values = values;
	    this._length = 0;
	    this._totalResolved = 0;
	    this._init(undefined, -2);
	}
	util.inherits(PromiseArray, Proxyable);

	PromiseArray.prototype.length = function () {
	    return this._length;
	};

	PromiseArray.prototype.promise = function () {
	    return this._promise;
	};

	PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
	    var values = tryConvertToPromise(this._values, this._promise);
	    if (values instanceof Promise) {
	        values = values._target();
	        var bitField = values._bitField;
	        ;
	        this._values = values;

	        if (((bitField & 50397184) === 0)) {
	            this._promise._setAsyncGuaranteed();
	            return values._then(
	                init,
	                this._reject,
	                undefined,
	                this,
	                resolveValueIfEmpty
	           );
	        } else if (((bitField & 33554432) !== 0)) {
	            values = values._value();
	        } else if (((bitField & 16777216) !== 0)) {
	            return this._reject(values._reason());
	        } else {
	            return this._cancel();
	        }
	    }
	    values = util.asArray(values);
	    if (values === null) {
	        var err = apiRejection(
	            "expecting an array or an iterable object but got " + util.classString(values)).reason();
	        this._promise._rejectCallback(err, false);
	        return;
	    }

	    if (values.length === 0) {
	        if (resolveValueIfEmpty === -5) {
	            this._resolveEmptyArray();
	        }
	        else {
	            this._resolve(toResolutionValue(resolveValueIfEmpty));
	        }
	        return;
	    }
	    this._iterate(values);
	};

	PromiseArray.prototype._iterate = function(values) {
	    var len = this.getActualLength(values.length);
	    this._length = len;
	    this._values = this.shouldCopyValues() ? new Array(len) : this._values;
	    var result = this._promise;
	    var isResolved = false;
	    var bitField = null;
	    for (var i = 0; i < len; ++i) {
	        var maybePromise = tryConvertToPromise(values[i], result);

	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            bitField = maybePromise._bitField;
	        } else {
	            bitField = null;
	        }

	        if (isResolved) {
	            if (bitField !== null) {
	                maybePromise.suppressUnhandledRejections();
	            }
	        } else if (bitField !== null) {
	            if (((bitField & 50397184) === 0)) {
	                maybePromise._proxy(this, i);
	                this._values[i] = maybePromise;
	            } else if (((bitField & 33554432) !== 0)) {
	                isResolved = this._promiseFulfilled(maybePromise._value(), i);
	            } else if (((bitField & 16777216) !== 0)) {
	                isResolved = this._promiseRejected(maybePromise._reason(), i);
	            } else {
	                isResolved = this._promiseCancelled(i);
	            }
	        } else {
	            isResolved = this._promiseFulfilled(maybePromise, i);
	        }
	    }
	    if (!isResolved) result._setAsyncGuaranteed();
	};

	PromiseArray.prototype._isResolved = function () {
	    return this._values === null;
	};

	PromiseArray.prototype._resolve = function (value) {
	    this._values = null;
	    this._promise._fulfill(value);
	};

	PromiseArray.prototype._cancel = function() {
	    if (this._isResolved() || !this._promise.isCancellable()) return;
	    this._values = null;
	    this._promise._cancel();
	};

	PromiseArray.prototype._reject = function (reason) {
	    this._values = null;
	    this._promise._rejectCallback(reason, false);
	};

	PromiseArray.prototype._promiseFulfilled = function (value, index) {
	    this._values[index] = value;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        this._resolve(this._values);
	        return true;
	    }
	    return false;
	};

	PromiseArray.prototype._promiseCancelled = function() {
	    this._cancel();
	    return true;
	};

	PromiseArray.prototype._promiseRejected = function (reason) {
	    this._totalResolved++;
	    this._reject(reason);
	    return true;
	};

	PromiseArray.prototype._resultCancelled = function() {
	    if (this._isResolved()) return;
	    var values = this._values;
	    this._cancel();
	    if (values instanceof Promise) {
	        values.cancel();
	    } else {
	        for (var i = 0; i < values.length; ++i) {
	            if (values[i] instanceof Promise) {
	                values[i].cancel();
	            }
	        }
	    }
	};

	PromiseArray.prototype.shouldCopyValues = function () {
	    return true;
	};

	PromiseArray.prototype.getActualLength = function (len) {
	    return len;
	};

	return PromiseArray;
	};


/***/ },
/* 34 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise) {
	var longStackTraces = false;
	var contextStack = [];

	Promise.prototype._promiseCreated = function() {};
	Promise.prototype._pushContext = function() {};
	Promise.prototype._popContext = function() {return null;};
	Promise._peekContext = Promise.prototype._peekContext = function() {};

	function Context() {
	    this._trace = new Context.CapturedTrace(peekContext());
	}
	Context.prototype._pushContext = function () {
	    if (this._trace !== undefined) {
	        this._trace._promiseCreated = null;
	        contextStack.push(this._trace);
	    }
	};

	Context.prototype._popContext = function () {
	    if (this._trace !== undefined) {
	        var trace = contextStack.pop();
	        var ret = trace._promiseCreated;
	        trace._promiseCreated = null;
	        return ret;
	    }
	    return null;
	};

	function createContext() {
	    if (longStackTraces) return new Context();
	}

	function peekContext() {
	    var lastIndex = contextStack.length - 1;
	    if (lastIndex >= 0) {
	        return contextStack[lastIndex];
	    }
	    return undefined;
	}
	Context.CapturedTrace = null;
	Context.create = createContext;
	Context.deactivateLongStackTraces = function() {};
	Context.activateLongStackTraces = function() {
	    var Promise_pushContext = Promise.prototype._pushContext;
	    var Promise_popContext = Promise.prototype._popContext;
	    var Promise_PeekContext = Promise._peekContext;
	    var Promise_peekContext = Promise.prototype._peekContext;
	    var Promise_promiseCreated = Promise.prototype._promiseCreated;
	    Context.deactivateLongStackTraces = function() {
	        Promise.prototype._pushContext = Promise_pushContext;
	        Promise.prototype._popContext = Promise_popContext;
	        Promise._peekContext = Promise_PeekContext;
	        Promise.prototype._peekContext = Promise_peekContext;
	        Promise.prototype._promiseCreated = Promise_promiseCreated;
	        longStackTraces = false;
	    };
	    longStackTraces = true;
	    Promise.prototype._pushContext = Context.prototype._pushContext;
	    Promise.prototype._popContext = Context.prototype._popContext;
	    Promise._peekContext = Promise.prototype._peekContext = peekContext;
	    Promise.prototype._promiseCreated = function() {
	        var ctx = this._peekContext();
	        if (ctx && ctx._promiseCreated == null) ctx._promiseCreated = this;
	    };
	};
	return Context;
	};


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, Context) {
	var getDomain = Promise._getDomain;
	var async = Promise._async;
	var Warning = __webpack_require__(31).Warning;
	var util = __webpack_require__(26);
	var canAttachTrace = util.canAttachTrace;
	var unhandledRejectionHandled;
	var possiblyUnhandledRejection;
	var bluebirdFramePattern =
	    /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/;
	var stackFramePattern = null;
	var formatStack = null;
	var indentStackFrames = false;
	var printWarning;
	var debugging = !!(util.env("BLUEBIRD_DEBUG") != 0 &&
	                        (false ||
	                         util.env("BLUEBIRD_DEBUG") ||
	                         util.env("NODE_ENV") === "development"));

	var warnings = !!(util.env("BLUEBIRD_WARNINGS") != 0 &&
	    (debugging || util.env("BLUEBIRD_WARNINGS")));

	var longStackTraces = !!(util.env("BLUEBIRD_LONG_STACK_TRACES") != 0 &&
	    (debugging || util.env("BLUEBIRD_LONG_STACK_TRACES")));

	var wForgottenReturn = util.env("BLUEBIRD_W_FORGOTTEN_RETURN") != 0 &&
	    (warnings || !!util.env("BLUEBIRD_W_FORGOTTEN_RETURN"));

	Promise.prototype.suppressUnhandledRejections = function() {
	    var target = this._target();
	    target._bitField = ((target._bitField & (~1048576)) |
	                      524288);
	};

	Promise.prototype._ensurePossibleRejectionHandled = function () {
	    if ((this._bitField & 524288) !== 0) return;
	    this._setRejectionIsUnhandled();
	    async.invokeLater(this._notifyUnhandledRejection, this, undefined);
	};

	Promise.prototype._notifyUnhandledRejectionIsHandled = function () {
	    fireRejectionEvent("rejectionHandled",
	                                  unhandledRejectionHandled, undefined, this);
	};

	Promise.prototype._setReturnedNonUndefined = function() {
	    this._bitField = this._bitField | 268435456;
	};

	Promise.prototype._returnedNonUndefined = function() {
	    return (this._bitField & 268435456) !== 0;
	};

	Promise.prototype._notifyUnhandledRejection = function () {
	    if (this._isRejectionUnhandled()) {
	        var reason = this._settledValue();
	        this._setUnhandledRejectionIsNotified();
	        fireRejectionEvent("unhandledRejection",
	                                      possiblyUnhandledRejection, reason, this);
	    }
	};

	Promise.prototype._setUnhandledRejectionIsNotified = function () {
	    this._bitField = this._bitField | 262144;
	};

	Promise.prototype._unsetUnhandledRejectionIsNotified = function () {
	    this._bitField = this._bitField & (~262144);
	};

	Promise.prototype._isUnhandledRejectionNotified = function () {
	    return (this._bitField & 262144) > 0;
	};

	Promise.prototype._setRejectionIsUnhandled = function () {
	    this._bitField = this._bitField | 1048576;
	};

	Promise.prototype._unsetRejectionIsUnhandled = function () {
	    this._bitField = this._bitField & (~1048576);
	    if (this._isUnhandledRejectionNotified()) {
	        this._unsetUnhandledRejectionIsNotified();
	        this._notifyUnhandledRejectionIsHandled();
	    }
	};

	Promise.prototype._isRejectionUnhandled = function () {
	    return (this._bitField & 1048576) > 0;
	};

	Promise.prototype._warn = function(message, shouldUseOwnTrace, promise) {
	    return warn(message, shouldUseOwnTrace, promise || this);
	};

	Promise.onPossiblyUnhandledRejection = function (fn) {
	    var domain = getDomain();
	    possiblyUnhandledRejection =
	        typeof fn === "function" ? (domain === null ? fn : domain.bind(fn))
	                                 : undefined;
	};

	Promise.onUnhandledRejectionHandled = function (fn) {
	    var domain = getDomain();
	    unhandledRejectionHandled =
	        typeof fn === "function" ? (domain === null ? fn : domain.bind(fn))
	                                 : undefined;
	};

	var disableLongStackTraces = function() {};
	Promise.longStackTraces = function () {
	    if (async.haveItemsQueued() && !config.longStackTraces) {
	        throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    if (!config.longStackTraces && longStackTracesIsSupported()) {
	        var Promise_captureStackTrace = Promise.prototype._captureStackTrace;
	        var Promise_attachExtraTrace = Promise.prototype._attachExtraTrace;
	        config.longStackTraces = true;
	        disableLongStackTraces = function() {
	            if (async.haveItemsQueued() && !config.longStackTraces) {
	                throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	            }
	            Promise.prototype._captureStackTrace = Promise_captureStackTrace;
	            Promise.prototype._attachExtraTrace = Promise_attachExtraTrace;
	            Context.deactivateLongStackTraces();
	            async.enableTrampoline();
	            config.longStackTraces = false;
	        };
	        Promise.prototype._captureStackTrace = longStackTracesCaptureStackTrace;
	        Promise.prototype._attachExtraTrace = longStackTracesAttachExtraTrace;
	        Context.activateLongStackTraces();
	        async.disableTrampolineIfNecessary();
	    }
	};

	Promise.hasLongStackTraces = function () {
	    return config.longStackTraces && longStackTracesIsSupported();
	};

	var fireDomEvent = (function() {
	    try {
	        var event = document.createEvent("CustomEvent");
	        event.initCustomEvent("testingtheevent", false, true, {});
	        util.global.dispatchEvent(event);
	        return function(name, event) {
	            var domEvent = document.createEvent("CustomEvent");
	            domEvent.initCustomEvent(name.toLowerCase(), false, true, event);
	            return !util.global.dispatchEvent(domEvent);
	        };
	    } catch (e) {}
	    return function() {
	        return false;
	    };
	})();

	var fireGlobalEvent = (function() {
	    if (util.isNode) {
	        return function() {
	            return process.emit.apply(process, arguments);
	        };
	    } else {
	        if (!util.global) {
	            return function() {
	                return false;
	            };
	        }
	        return function(name) {
	            var methodName = "on" + name.toLowerCase();
	            var method = util.global[methodName];
	            if (!method) return false;
	            method.apply(util.global, [].slice.call(arguments, 1));
	            return true;
	        };
	    }
	})();

	function generatePromiseLifecycleEventObject(name, promise) {
	    return {promise: promise};
	}

	var eventToObjectGenerator = {
	    promiseCreated: generatePromiseLifecycleEventObject,
	    promiseFulfilled: generatePromiseLifecycleEventObject,
	    promiseRejected: generatePromiseLifecycleEventObject,
	    promiseResolved: generatePromiseLifecycleEventObject,
	    promiseCancelled: generatePromiseLifecycleEventObject,
	    promiseChained: function(name, promise, child) {
	        return {promise: promise, child: child};
	    },
	    warning: function(name, warning) {
	        return {warning: warning};
	    },
	    unhandledRejection: function (name, reason, promise) {
	        return {reason: reason, promise: promise};
	    },
	    rejectionHandled: generatePromiseLifecycleEventObject
	};

	var activeFireEvent = function (name) {
	    var globalEventFired = false;
	    try {
	        globalEventFired = fireGlobalEvent.apply(null, arguments);
	    } catch (e) {
	        async.throwLater(e);
	        globalEventFired = true;
	    }

	    var domEventFired = false;
	    try {
	        domEventFired = fireDomEvent(name,
	                    eventToObjectGenerator[name].apply(null, arguments));
	    } catch (e) {
	        async.throwLater(e);
	        domEventFired = true;
	    }

	    return domEventFired || globalEventFired;
	};

	Promise.config = function(opts) {
	    opts = Object(opts);
	    if ("longStackTraces" in opts) {
	        if (opts.longStackTraces) {
	            Promise.longStackTraces();
	        } else if (!opts.longStackTraces && Promise.hasLongStackTraces()) {
	            disableLongStackTraces();
	        }
	    }
	    if ("warnings" in opts) {
	        var warningsOption = opts.warnings;
	        config.warnings = !!warningsOption;
	        wForgottenReturn = config.warnings;

	        if (util.isObject(warningsOption)) {
	            if ("wForgottenReturn" in warningsOption) {
	                wForgottenReturn = !!warningsOption.wForgottenReturn;
	            }
	        }
	    }
	    if ("cancellation" in opts && opts.cancellation && !config.cancellation) {
	        if (async.haveItemsQueued()) {
	            throw new Error(
	                "cannot enable cancellation after promises are in use");
	        }
	        Promise.prototype._clearCancellationData =
	            cancellationClearCancellationData;
	        Promise.prototype._propagateFrom = cancellationPropagateFrom;
	        Promise.prototype._onCancel = cancellationOnCancel;
	        Promise.prototype._setOnCancel = cancellationSetOnCancel;
	        Promise.prototype._attachCancellationCallback =
	            cancellationAttachCancellationCallback;
	        Promise.prototype._execute = cancellationExecute;
	        propagateFromFunction = cancellationPropagateFrom;
	        config.cancellation = true;
	    }
	    if ("monitoring" in opts) {
	        if (opts.monitoring && !config.monitoring) {
	            config.monitoring = true;
	            Promise.prototype._fireEvent = activeFireEvent;
	        } else if (!opts.monitoring && config.monitoring) {
	            config.monitoring = false;
	            Promise.prototype._fireEvent = defaultFireEvent;
	        }
	    }
	};

	function defaultFireEvent() { return false; }

	Promise.prototype._fireEvent = defaultFireEvent;
	Promise.prototype._execute = function(executor, resolve, reject) {
	    try {
	        executor(resolve, reject);
	    } catch (e) {
	        return e;
	    }
	};
	Promise.prototype._onCancel = function () {};
	Promise.prototype._setOnCancel = function (handler) { ; };
	Promise.prototype._attachCancellationCallback = function(onCancel) {
	    ;
	};
	Promise.prototype._captureStackTrace = function () {};
	Promise.prototype._attachExtraTrace = function () {};
	Promise.prototype._clearCancellationData = function() {};
	Promise.prototype._propagateFrom = function (parent, flags) {
	    ;
	    ;
	};

	function cancellationExecute(executor, resolve, reject) {
	    var promise = this;
	    try {
	        executor(resolve, reject, function(onCancel) {
	            if (typeof onCancel !== "function") {
	                throw new TypeError("onCancel must be a function, got: " +
	                                    util.toString(onCancel));
	            }
	            promise._attachCancellationCallback(onCancel);
	        });
	    } catch (e) {
	        return e;
	    }
	}

	function cancellationAttachCancellationCallback(onCancel) {
	    if (!this.isCancellable()) return this;

	    var previousOnCancel = this._onCancel();
	    if (previousOnCancel !== undefined) {
	        if (util.isArray(previousOnCancel)) {
	            previousOnCancel.push(onCancel);
	        } else {
	            this._setOnCancel([previousOnCancel, onCancel]);
	        }
	    } else {
	        this._setOnCancel(onCancel);
	    }
	}

	function cancellationOnCancel() {
	    return this._onCancelField;
	}

	function cancellationSetOnCancel(onCancel) {
	    this._onCancelField = onCancel;
	}

	function cancellationClearCancellationData() {
	    this._cancellationParent = undefined;
	    this._onCancelField = undefined;
	}

	function cancellationPropagateFrom(parent, flags) {
	    if ((flags & 1) !== 0) {
	        this._cancellationParent = parent;
	        var branchesRemainingToCancel = parent._branchesRemainingToCancel;
	        if (branchesRemainingToCancel === undefined) {
	            branchesRemainingToCancel = 0;
	        }
	        parent._branchesRemainingToCancel = branchesRemainingToCancel + 1;
	    }
	    if ((flags & 2) !== 0 && parent._isBound()) {
	        this._setBoundTo(parent._boundTo);
	    }
	}

	function bindingPropagateFrom(parent, flags) {
	    if ((flags & 2) !== 0 && parent._isBound()) {
	        this._setBoundTo(parent._boundTo);
	    }
	}
	var propagateFromFunction = bindingPropagateFrom;

	function boundValueFunction() {
	    var ret = this._boundTo;
	    if (ret !== undefined) {
	        if (ret instanceof Promise) {
	            if (ret.isFulfilled()) {
	                return ret.value();
	            } else {
	                return undefined;
	            }
	        }
	    }
	    return ret;
	}

	function longStackTracesCaptureStackTrace() {
	    this._trace = new CapturedTrace(this._peekContext());
	}

	function longStackTracesAttachExtraTrace(error, ignoreSelf) {
	    if (canAttachTrace(error)) {
	        var trace = this._trace;
	        if (trace !== undefined) {
	            if (ignoreSelf) trace = trace._parent;
	        }
	        if (trace !== undefined) {
	            trace.attachExtraTrace(error);
	        } else if (!error.__stackCleaned__) {
	            var parsed = parseStackAndMessage(error);
	            util.notEnumerableProp(error, "stack",
	                parsed.message + "\n" + parsed.stack.join("\n"));
	            util.notEnumerableProp(error, "__stackCleaned__", true);
	        }
	    }
	}

	function checkForgottenReturns(returnValue, promiseCreated, name, promise,
	                               parent) {
	    if (returnValue === undefined && promiseCreated !== null &&
	        wForgottenReturn) {
	        if (parent !== undefined && parent._returnedNonUndefined()) return;
	        if ((promise._bitField & 65535) === 0) return;

	        if (name) name = name + " ";
	        var msg = "a promise was created in a " + name +
	            "handler but was not returned from it";
	        promise._warn(msg, true, promiseCreated);
	    }
	}

	function deprecated(name, replacement) {
	    var message = name +
	        " is deprecated and will be removed in a future version.";
	    if (replacement) message += " Use " + replacement + " instead.";
	    return warn(message);
	}

	function warn(message, shouldUseOwnTrace, promise) {
	    if (!config.warnings) return;
	    var warning = new Warning(message);
	    var ctx;
	    if (shouldUseOwnTrace) {
	        promise._attachExtraTrace(warning);
	    } else if (config.longStackTraces && (ctx = Promise._peekContext())) {
	        ctx.attachExtraTrace(warning);
	    } else {
	        var parsed = parseStackAndMessage(warning);
	        warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
	    }

	    if (!activeFireEvent("warning", warning)) {
	        formatAndLogError(warning, "", true);
	    }
	}

	function reconstructStack(message, stacks) {
	    for (var i = 0; i < stacks.length - 1; ++i) {
	        stacks[i].push("From previous event:");
	        stacks[i] = stacks[i].join("\n");
	    }
	    if (i < stacks.length) {
	        stacks[i] = stacks[i].join("\n");
	    }
	    return message + "\n" + stacks.join("\n");
	}

	function removeDuplicateOrEmptyJumps(stacks) {
	    for (var i = 0; i < stacks.length; ++i) {
	        if (stacks[i].length === 0 ||
	            ((i + 1 < stacks.length) && stacks[i][0] === stacks[i+1][0])) {
	            stacks.splice(i, 1);
	            i--;
	        }
	    }
	}

	function removeCommonRoots(stacks) {
	    var current = stacks[0];
	    for (var i = 1; i < stacks.length; ++i) {
	        var prev = stacks[i];
	        var currentLastIndex = current.length - 1;
	        var currentLastLine = current[currentLastIndex];
	        var commonRootMeetPoint = -1;

	        for (var j = prev.length - 1; j >= 0; --j) {
	            if (prev[j] === currentLastLine) {
	                commonRootMeetPoint = j;
	                break;
	            }
	        }

	        for (var j = commonRootMeetPoint; j >= 0; --j) {
	            var line = prev[j];
	            if (current[currentLastIndex] === line) {
	                current.pop();
	                currentLastIndex--;
	            } else {
	                break;
	            }
	        }
	        current = prev;
	    }
	}

	function cleanStack(stack) {
	    var ret = [];
	    for (var i = 0; i < stack.length; ++i) {
	        var line = stack[i];
	        var isTraceLine = "    (No stack trace)" === line ||
	            stackFramePattern.test(line);
	        var isInternalFrame = isTraceLine && shouldIgnore(line);
	        if (isTraceLine && !isInternalFrame) {
	            if (indentStackFrames && line.charAt(0) !== " ") {
	                line = "    " + line;
	            }
	            ret.push(line);
	        }
	    }
	    return ret;
	}

	function stackFramesAsArray(error) {
	    var stack = error.stack.replace(/\s+$/g, "").split("\n");
	    for (var i = 0; i < stack.length; ++i) {
	        var line = stack[i];
	        if ("    (No stack trace)" === line || stackFramePattern.test(line)) {
	            break;
	        }
	    }
	    if (i > 0) {
	        stack = stack.slice(i);
	    }
	    return stack;
	}

	function parseStackAndMessage(error) {
	    var stack = error.stack;
	    var message = error.toString();
	    stack = typeof stack === "string" && stack.length > 0
	                ? stackFramesAsArray(error) : ["    (No stack trace)"];
	    return {
	        message: message,
	        stack: cleanStack(stack)
	    };
	}

	function formatAndLogError(error, title, isSoft) {
	    if (typeof console !== "undefined") {
	        var message;
	        if (util.isObject(error)) {
	            var stack = error.stack;
	            message = title + formatStack(stack, error);
	        } else {
	            message = title + String(error);
	        }
	        if (typeof printWarning === "function") {
	            printWarning(message, isSoft);
	        } else if (typeof console.log === "function" ||
	            typeof console.log === "object") {
	            console.log(message);
	        }
	    }
	}

	function fireRejectionEvent(name, localHandler, reason, promise) {
	    var localEventFired = false;
	    try {
	        if (typeof localHandler === "function") {
	            localEventFired = true;
	            if (name === "rejectionHandled") {
	                localHandler(promise);
	            } else {
	                localHandler(reason, promise);
	            }
	        }
	    } catch (e) {
	        async.throwLater(e);
	    }

	    if (name === "unhandledRejection") {
	        if (!activeFireEvent(name, reason, promise) && !localEventFired) {
	            formatAndLogError(reason, "Unhandled rejection ");
	        }
	    } else {
	        activeFireEvent(name, promise);
	    }
	}

	function formatNonError(obj) {
	    var str;
	    if (typeof obj === "function") {
	        str = "[function " +
	            (obj.name || "anonymous") +
	            "]";
	    } else {
	        str = obj && typeof obj.toString === "function"
	            ? obj.toString() : util.toString(obj);
	        var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
	        if (ruselessToString.test(str)) {
	            try {
	                var newStr = JSON.stringify(obj);
	                str = newStr;
	            }
	            catch(e) {

	            }
	        }
	        if (str.length === 0) {
	            str = "(empty array)";
	        }
	    }
	    return ("(<" + snip(str) + ">, no stack trace)");
	}

	function snip(str) {
	    var maxChars = 41;
	    if (str.length < maxChars) {
	        return str;
	    }
	    return str.substr(0, maxChars - 3) + "...";
	}

	function longStackTracesIsSupported() {
	    return typeof captureStackTrace === "function";
	}

	var shouldIgnore = function() { return false; };
	var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
	function parseLineInfo(line) {
	    var matches = line.match(parseLineInfoRegex);
	    if (matches) {
	        return {
	            fileName: matches[1],
	            line: parseInt(matches[2], 10)
	        };
	    }
	}

	function setBounds(firstLineError, lastLineError) {
	    if (!longStackTracesIsSupported()) return;
	    var firstStackLines = firstLineError.stack.split("\n");
	    var lastStackLines = lastLineError.stack.split("\n");
	    var firstIndex = -1;
	    var lastIndex = -1;
	    var firstFileName;
	    var lastFileName;
	    for (var i = 0; i < firstStackLines.length; ++i) {
	        var result = parseLineInfo(firstStackLines[i]);
	        if (result) {
	            firstFileName = result.fileName;
	            firstIndex = result.line;
	            break;
	        }
	    }
	    for (var i = 0; i < lastStackLines.length; ++i) {
	        var result = parseLineInfo(lastStackLines[i]);
	        if (result) {
	            lastFileName = result.fileName;
	            lastIndex = result.line;
	            break;
	        }
	    }
	    if (firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName ||
	        firstFileName !== lastFileName || firstIndex >= lastIndex) {
	        return;
	    }

	    shouldIgnore = function(line) {
	        if (bluebirdFramePattern.test(line)) return true;
	        var info = parseLineInfo(line);
	        if (info) {
	            if (info.fileName === firstFileName &&
	                (firstIndex <= info.line && info.line <= lastIndex)) {
	                return true;
	            }
	        }
	        return false;
	    };
	}

	function CapturedTrace(parent) {
	    this._parent = parent;
	    this._promisesCreated = 0;
	    var length = this._length = 1 + (parent === undefined ? 0 : parent._length);
	    captureStackTrace(this, CapturedTrace);
	    if (length > 32) this.uncycle();
	}
	util.inherits(CapturedTrace, Error);
	Context.CapturedTrace = CapturedTrace;

	CapturedTrace.prototype.uncycle = function() {
	    var length = this._length;
	    if (length < 2) return;
	    var nodes = [];
	    var stackToIndex = {};

	    for (var i = 0, node = this; node !== undefined; ++i) {
	        nodes.push(node);
	        node = node._parent;
	    }
	    length = this._length = i;
	    for (var i = length - 1; i >= 0; --i) {
	        var stack = nodes[i].stack;
	        if (stackToIndex[stack] === undefined) {
	            stackToIndex[stack] = i;
	        }
	    }
	    for (var i = 0; i < length; ++i) {
	        var currentStack = nodes[i].stack;
	        var index = stackToIndex[currentStack];
	        if (index !== undefined && index !== i) {
	            if (index > 0) {
	                nodes[index - 1]._parent = undefined;
	                nodes[index - 1]._length = 1;
	            }
	            nodes[i]._parent = undefined;
	            nodes[i]._length = 1;
	            var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;

	            if (index < length - 1) {
	                cycleEdgeNode._parent = nodes[index + 1];
	                cycleEdgeNode._parent.uncycle();
	                cycleEdgeNode._length =
	                    cycleEdgeNode._parent._length + 1;
	            } else {
	                cycleEdgeNode._parent = undefined;
	                cycleEdgeNode._length = 1;
	            }
	            var currentChildLength = cycleEdgeNode._length + 1;
	            for (var j = i - 2; j >= 0; --j) {
	                nodes[j]._length = currentChildLength;
	                currentChildLength++;
	            }
	            return;
	        }
	    }
	};

	CapturedTrace.prototype.attachExtraTrace = function(error) {
	    if (error.__stackCleaned__) return;
	    this.uncycle();
	    var parsed = parseStackAndMessage(error);
	    var message = parsed.message;
	    var stacks = [parsed.stack];

	    var trace = this;
	    while (trace !== undefined) {
	        stacks.push(cleanStack(trace.stack.split("\n")));
	        trace = trace._parent;
	    }
	    removeCommonRoots(stacks);
	    removeDuplicateOrEmptyJumps(stacks);
	    util.notEnumerableProp(error, "stack", reconstructStack(message, stacks));
	    util.notEnumerableProp(error, "__stackCleaned__", true);
	};

	var captureStackTrace = (function stackDetection() {
	    var v8stackFramePattern = /^\s*at\s*/;
	    var v8stackFormatter = function(stack, error) {
	        if (typeof stack === "string") return stack;

	        if (error.name !== undefined &&
	            error.message !== undefined) {
	            return error.toString();
	        }
	        return formatNonError(error);
	    };

	    if (typeof Error.stackTraceLimit === "number" &&
	        typeof Error.captureStackTrace === "function") {
	        Error.stackTraceLimit += 6;
	        stackFramePattern = v8stackFramePattern;
	        formatStack = v8stackFormatter;
	        var captureStackTrace = Error.captureStackTrace;

	        shouldIgnore = function(line) {
	            return bluebirdFramePattern.test(line);
	        };
	        return function(receiver, ignoreUntil) {
	            Error.stackTraceLimit += 6;
	            captureStackTrace(receiver, ignoreUntil);
	            Error.stackTraceLimit -= 6;
	        };
	    }
	    var err = new Error();

	    if (typeof err.stack === "string" &&
	        err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) {
	        stackFramePattern = /@/;
	        formatStack = v8stackFormatter;
	        indentStackFrames = true;
	        return function captureStackTrace(o) {
	            o.stack = new Error().stack;
	        };
	    }

	    var hasStackAfterThrow;
	    try { throw new Error(); }
	    catch(e) {
	        hasStackAfterThrow = ("stack" in e);
	    }
	    if (!("stack" in err) && hasStackAfterThrow &&
	        typeof Error.stackTraceLimit === "number") {
	        stackFramePattern = v8stackFramePattern;
	        formatStack = v8stackFormatter;
	        return function captureStackTrace(o) {
	            Error.stackTraceLimit += 6;
	            try { throw new Error(); }
	            catch(e) { o.stack = e.stack; }
	            Error.stackTraceLimit -= 6;
	        };
	    }

	    formatStack = function(stack, error) {
	        if (typeof stack === "string") return stack;

	        if ((typeof error === "object" ||
	            typeof error === "function") &&
	            error.name !== undefined &&
	            error.message !== undefined) {
	            return error.toString();
	        }
	        return formatNonError(error);
	    };

	    return null;

	})([]);

	if (typeof console !== "undefined" && typeof console.warn !== "undefined") {
	    printWarning = function (message) {
	        console.warn(message);
	    };
	    if (util.isNode && process.stderr.isTTY) {
	        printWarning = function(message, isSoft) {
	            var color = isSoft ? "\u001b[33m" : "\u001b[31m";
	            console.warn(color + message + "\u001b[0m\n");
	        };
	    } else if (!util.isNode && typeof (new Error().stack) === "string") {
	        printWarning = function(message, isSoft) {
	            console.warn("%c" + message,
	                        isSoft ? "color: darkorange" : "color: red");
	        };
	    }
	}

	var config = {
	    warnings: warnings,
	    longStackTraces: false,
	    cancellation: false,
	    monitoring: false
	};

	if (longStackTraces) Promise.longStackTraces();

	return {
	    longStackTraces: function() {
	        return config.longStackTraces;
	    },
	    warnings: function() {
	        return config.warnings;
	    },
	    cancellation: function() {
	        return config.cancellation;
	    },
	    monitoring: function() {
	        return config.monitoring;
	    },
	    propagateFromFunction: function() {
	        return propagateFromFunction;
	    },
	    boundValueFunction: function() {
	        return boundValueFunction;
	    },
	    checkForgottenReturns: checkForgottenReturns,
	    setBounds: setBounds,
	    warn: warn,
	    deprecated: deprecated,
	    CapturedTrace: CapturedTrace,
	    fireDomEvent: fireDomEvent,
	    fireGlobalEvent: fireGlobalEvent
	};
	};


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, tryConvertToPromise) {
	var util = __webpack_require__(26);
	var CancellationError = Promise.CancellationError;
	var errorObj = util.errorObj;

	function PassThroughHandlerContext(promise, type, handler) {
	    this.promise = promise;
	    this.type = type;
	    this.handler = handler;
	    this.called = false;
	    this.cancelPromise = null;
	}

	PassThroughHandlerContext.prototype.isFinallyHandler = function() {
	    return this.type === 0;
	};

	function FinallyHandlerCancelReaction(finallyHandler) {
	    this.finallyHandler = finallyHandler;
	}

	FinallyHandlerCancelReaction.prototype._resultCancelled = function() {
	    checkCancel(this.finallyHandler);
	};

	function checkCancel(ctx, reason) {
	    if (ctx.cancelPromise != null) {
	        if (arguments.length > 1) {
	            ctx.cancelPromise._reject(reason);
	        } else {
	            ctx.cancelPromise._cancel();
	        }
	        ctx.cancelPromise = null;
	        return true;
	    }
	    return false;
	}

	function succeed() {
	    return finallyHandler.call(this, this.promise._target()._settledValue());
	}
	function fail(reason) {
	    if (checkCancel(this, reason)) return;
	    errorObj.e = reason;
	    return errorObj;
	}
	function finallyHandler(reasonOrValue) {
	    var promise = this.promise;
	    var handler = this.handler;

	    if (!this.called) {
	        this.called = true;
	        var ret = this.isFinallyHandler()
	            ? handler.call(promise._boundValue())
	            : handler.call(promise._boundValue(), reasonOrValue);
	        if (ret !== undefined) {
	            promise._setReturnedNonUndefined();
	            var maybePromise = tryConvertToPromise(ret, promise);
	            if (maybePromise instanceof Promise) {
	                if (this.cancelPromise != null) {
	                    if (maybePromise.isCancelled()) {
	                        var reason =
	                            new CancellationError("late cancellation observer");
	                        promise._attachExtraTrace(reason);
	                        errorObj.e = reason;
	                        return errorObj;
	                    } else if (maybePromise.isPending()) {
	                        maybePromise._attachCancellationCallback(
	                            new FinallyHandlerCancelReaction(this));
	                    }
	                }
	                return maybePromise._then(
	                    succeed, fail, undefined, this, undefined);
	            }
	        }
	    }

	    if (promise.isRejected()) {
	        checkCancel(this);
	        errorObj.e = reasonOrValue;
	        return errorObj;
	    } else {
	        checkCancel(this);
	        return reasonOrValue;
	    }
	}

	Promise.prototype._passThrough = function(handler, type, success, fail) {
	    if (typeof handler !== "function") return this.then();
	    return this._then(success,
	                      fail,
	                      undefined,
	                      new PassThroughHandlerContext(this, type, handler),
	                      undefined);
	};

	Promise.prototype.lastly =
	Promise.prototype["finally"] = function (handler) {
	    return this._passThrough(handler,
	                             0,
	                             finallyHandler,
	                             finallyHandler);
	};

	Promise.prototype.tap = function (handler) {
	    return this._passThrough(handler, 1, finallyHandler);
	};

	return PassThroughHandlerContext;
	};


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(NEXT_FILTER) {
	var util = __webpack_require__(26);
	var getKeys = __webpack_require__(27).keys;
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;

	function catchFilter(instances, cb, promise) {
	    return function(e) {
	        var boundTo = promise._boundValue();
	        predicateLoop: for (var i = 0; i < instances.length; ++i) {
	            var item = instances[i];

	            if (item === Error ||
	                (item != null && item.prototype instanceof Error)) {
	                if (e instanceof item) {
	                    return tryCatch(cb).call(boundTo, e);
	                }
	            } else if (typeof item === "function") {
	                var matchesPredicate = tryCatch(item).call(boundTo, e);
	                if (matchesPredicate === errorObj) {
	                    return matchesPredicate;
	                } else if (matchesPredicate) {
	                    return tryCatch(cb).call(boundTo, e);
	                }
	            } else if (util.isObject(e)) {
	                var keys = getKeys(item);
	                for (var j = 0; j < keys.length; ++j) {
	                    var key = keys[j];
	                    if (item[key] != e[key]) {
	                        continue predicateLoop;
	                    }
	                }
	                return tryCatch(cb).call(boundTo, e);
	            }
	        }
	        return NEXT_FILTER;
	    };
	}

	return catchFilter;
	};


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var util = __webpack_require__(26);
	var maybeWrapAsError = util.maybeWrapAsError;
	var errors = __webpack_require__(31);
	var OperationalError = errors.OperationalError;
	var es5 = __webpack_require__(27);

	function isUntypedError(obj) {
	    return obj instanceof Error &&
	        es5.getPrototypeOf(obj) === Error.prototype;
	}

	var rErrorKey = /^(?:name|message|stack|cause)$/;
	function wrapAsOperationalError(obj) {
	    var ret;
	    if (isUntypedError(obj)) {
	        ret = new OperationalError(obj);
	        ret.name = obj.name;
	        ret.message = obj.message;
	        ret.stack = obj.stack;
	        var keys = es5.keys(obj);
	        for (var i = 0; i < keys.length; ++i) {
	            var key = keys[i];
	            if (!rErrorKey.test(key)) {
	                ret[key] = obj[key];
	            }
	        }
	        return ret;
	    }
	    util.markAsOriginatingFromRejection(obj);
	    return obj;
	}

	function nodebackForPromise(promise, multiArgs) {
	    return function(err, value) {
	        if (promise === null) return;
	        if (err) {
	            var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
	            promise._attachExtraTrace(wrapped);
	            promise._reject(wrapped);
	        } else if (!multiArgs) {
	            promise._fulfill(value);
	        } else {
	            var $_len = arguments.length;var args = new Array(Math.max($_len - 1, 0)); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];};
	            promise._fulfill(args);
	        }
	        promise = null;
	    };
	}

	module.exports = nodebackForPromise;


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports =
	function(Promise, INTERNAL, tryConvertToPromise, apiRejection, debug) {
	var util = __webpack_require__(26);
	var tryCatch = util.tryCatch;

	Promise.method = function (fn) {
	    if (typeof fn !== "function") {
	        throw new Promise.TypeError("expecting a function but got " + util.classString(fn));
	    }
	    return function () {
	        var ret = new Promise(INTERNAL);
	        ret._captureStackTrace();
	        ret._pushContext();
	        var value = tryCatch(fn).apply(this, arguments);
	        var promiseCreated = ret._popContext();
	        debug.checkForgottenReturns(
	            value, promiseCreated, "Promise.method", ret);
	        ret._resolveFromSyncValue(value);
	        return ret;
	    };
	};

	Promise.attempt = Promise["try"] = function (fn) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }
	    var ret = new Promise(INTERNAL);
	    ret._captureStackTrace();
	    ret._pushContext();
	    var value;
	    if (arguments.length > 1) {
	        debug.deprecated("calling Promise.try with more than 1 argument");
	        var arg = arguments[1];
	        var ctx = arguments[2];
	        value = util.isArray(arg) ? tryCatch(fn).apply(ctx, arg)
	                                  : tryCatch(fn).call(ctx, arg);
	    } else {
	        value = tryCatch(fn)();
	    }
	    var promiseCreated = ret._popContext();
	    debug.checkForgottenReturns(
	        value, promiseCreated, "Promise.try", ret);
	    ret._resolveFromSyncValue(value);
	    return ret;
	};

	Promise.prototype._resolveFromSyncValue = function (value) {
	    if (value === util.errorObj) {
	        this._rejectCallback(value.e, false);
	    } else {
	        this._resolveCallback(value, true);
	    }
	};
	};


/***/ },
/* 40 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise, INTERNAL, tryConvertToPromise, debug) {
	var calledBind = false;
	var rejectThis = function(_, e) {
	    this._reject(e);
	};

	var targetRejected = function(e, context) {
	    context.promiseRejectionQueued = true;
	    context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
	};

	var bindingResolved = function(thisArg, context) {
	    if (((this._bitField & 50397184) === 0)) {
	        this._resolveCallback(context.target);
	    }
	};

	var bindingRejected = function(e, context) {
	    if (!context.promiseRejectionQueued) this._reject(e);
	};

	Promise.prototype.bind = function (thisArg) {
	    if (!calledBind) {
	        calledBind = true;
	        Promise.prototype._propagateFrom = debug.propagateFromFunction();
	        Promise.prototype._boundValue = debug.boundValueFunction();
	    }
	    var maybePromise = tryConvertToPromise(thisArg);
	    var ret = new Promise(INTERNAL);
	    ret._propagateFrom(this, 1);
	    var target = this._target();
	    ret._setBoundTo(maybePromise);
	    if (maybePromise instanceof Promise) {
	        var context = {
	            promiseRejectionQueued: false,
	            promise: ret,
	            target: target,
	            bindingPromise: maybePromise
	        };
	        target._then(INTERNAL, targetRejected, undefined, ret, context);
	        maybePromise._then(
	            bindingResolved, bindingRejected, undefined, ret, context);
	        ret._setOnCancel(maybePromise);
	    } else {
	        ret._resolveCallback(target);
	    }
	    return ret;
	};

	Promise.prototype._setBoundTo = function (obj) {
	    if (obj !== undefined) {
	        this._bitField = this._bitField | 2097152;
	        this._boundTo = obj;
	    } else {
	        this._bitField = this._bitField & (~2097152);
	    }
	};

	Promise.prototype._isBound = function () {
	    return (this._bitField & 2097152) === 2097152;
	};

	Promise.bind = function (thisArg, value) {
	    return Promise.resolve(value).bind(thisArg);
	};
	};


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, PromiseArray, apiRejection, debug) {
	var util = __webpack_require__(26);
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var async = Promise._async;

	Promise.prototype["break"] = Promise.prototype.cancel = function() {
	    if (!debug.cancellation()) return this._warn("cancellation is disabled");

	    var promise = this;
	    var child = promise;
	    while (promise.isCancellable()) {
	        if (!promise._cancelBy(child)) {
	            if (child._isFollowing()) {
	                child._followee().cancel();
	            } else {
	                child._cancelBranched();
	            }
	            break;
	        }

	        var parent = promise._cancellationParent;
	        if (parent == null || !parent.isCancellable()) {
	            if (promise._isFollowing()) {
	                promise._followee().cancel();
	            } else {
	                promise._cancelBranched();
	            }
	            break;
	        } else {
	            if (promise._isFollowing()) promise._followee().cancel();
	            child = promise;
	            promise = parent;
	        }
	    }
	};

	Promise.prototype._branchHasCancelled = function() {
	    this._branchesRemainingToCancel--;
	};

	Promise.prototype._enoughBranchesHaveCancelled = function() {
	    return this._branchesRemainingToCancel === undefined ||
	           this._branchesRemainingToCancel <= 0;
	};

	Promise.prototype._cancelBy = function(canceller) {
	    if (canceller === this) {
	        this._branchesRemainingToCancel = 0;
	        this._invokeOnCancel();
	        return true;
	    } else {
	        this._branchHasCancelled();
	        if (this._enoughBranchesHaveCancelled()) {
	            this._invokeOnCancel();
	            return true;
	        }
	    }
	    return false;
	};

	Promise.prototype._cancelBranched = function() {
	    if (this._enoughBranchesHaveCancelled()) {
	        this._cancel();
	    }
	};

	Promise.prototype._cancel = function() {
	    if (!this.isCancellable()) return;

	    this._setCancelled();
	    async.invoke(this._cancelPromises, this, undefined);
	};

	Promise.prototype._cancelPromises = function() {
	    if (this._length() > 0) this._settlePromises();
	};

	Promise.prototype._unsetOnCancel = function() {
	    this._onCancelField = undefined;
	};

	Promise.prototype.isCancellable = function() {
	    return this.isPending() && !this.isCancelled();
	};

	Promise.prototype._doInvokeOnCancel = function(onCancelCallback, internalOnly) {
	    if (util.isArray(onCancelCallback)) {
	        for (var i = 0; i < onCancelCallback.length; ++i) {
	            this._doInvokeOnCancel(onCancelCallback[i], internalOnly);
	        }
	    } else if (onCancelCallback !== undefined) {
	        if (typeof onCancelCallback === "function") {
	            if (!internalOnly) {
	                var e = tryCatch(onCancelCallback).call(this._boundValue());
	                if (e === errorObj) {
	                    this._attachExtraTrace(e.e);
	                    async.throwLater(e.e);
	                }
	            }
	        } else {
	            onCancelCallback._resultCancelled(this);
	        }
	    }
	};

	Promise.prototype._invokeOnCancel = function() {
	    var onCancelCallback = this._onCancel();
	    this._unsetOnCancel();
	    async.invoke(this._doInvokeOnCancel, this, onCancelCallback);
	};

	Promise.prototype._invokeInternalOnCancel = function() {
	    if (this.isCancellable()) {
	        this._doInvokeOnCancel(this._onCancel(), true);
	        this._unsetOnCancel();
	    }
	};

	Promise.prototype._resultCancelled = function() {
	    this.cancel();
	};

	};


/***/ },
/* 42 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise) {
	function returner() {
	    return this.value;
	}
	function thrower() {
	    throw this.reason;
	}

	Promise.prototype["return"] =
	Promise.prototype.thenReturn = function (value) {
	    if (value instanceof Promise) value.suppressUnhandledRejections();
	    return this._then(
	        returner, undefined, undefined, {value: value}, undefined);
	};

	Promise.prototype["throw"] =
	Promise.prototype.thenThrow = function (reason) {
	    return this._then(
	        thrower, undefined, undefined, {reason: reason}, undefined);
	};

	Promise.prototype.catchThrow = function (reason) {
	    if (arguments.length <= 1) {
	        return this._then(
	            undefined, thrower, undefined, {reason: reason}, undefined);
	    } else {
	        var _reason = arguments[1];
	        var handler = function() {throw _reason;};
	        return this.caught(reason, handler);
	    }
	};

	Promise.prototype.catchReturn = function (value) {
	    if (arguments.length <= 1) {
	        if (value instanceof Promise) value.suppressUnhandledRejections();
	        return this._then(
	            undefined, returner, undefined, {value: value}, undefined);
	    } else {
	        var _value = arguments[1];
	        if (_value instanceof Promise) _value.suppressUnhandledRejections();
	        var handler = function() {return _value;};
	        return this.caught(value, handler);
	    }
	};
	};


/***/ },
/* 43 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise) {
	function PromiseInspection(promise) {
	    if (promise !== undefined) {
	        promise = promise._target();
	        this._bitField = promise._bitField;
	        this._settledValueField = promise._isFateSealed()
	            ? promise._settledValue() : undefined;
	    }
	    else {
	        this._bitField = 0;
	        this._settledValueField = undefined;
	    }
	}

	PromiseInspection.prototype._settledValue = function() {
	    return this._settledValueField;
	};

	var value = PromiseInspection.prototype.value = function () {
	    if (!this.isFulfilled()) {
	        throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    return this._settledValue();
	};

	var reason = PromiseInspection.prototype.error =
	PromiseInspection.prototype.reason = function () {
	    if (!this.isRejected()) {
	        throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    return this._settledValue();
	};

	var isFulfilled = PromiseInspection.prototype.isFulfilled = function() {
	    return (this._bitField & 33554432) !== 0;
	};

	var isRejected = PromiseInspection.prototype.isRejected = function () {
	    return (this._bitField & 16777216) !== 0;
	};

	var isPending = PromiseInspection.prototype.isPending = function () {
	    return (this._bitField & 50397184) === 0;
	};

	var isResolved = PromiseInspection.prototype.isResolved = function () {
	    return (this._bitField & 50331648) !== 0;
	};

	PromiseInspection.prototype.isCancelled =
	Promise.prototype._isCancelled = function() {
	    return (this._bitField & 65536) === 65536;
	};

	Promise.prototype.isCancelled = function() {
	    return this._target()._isCancelled();
	};

	Promise.prototype.isPending = function() {
	    return isPending.call(this._target());
	};

	Promise.prototype.isRejected = function() {
	    return isRejected.call(this._target());
	};

	Promise.prototype.isFulfilled = function() {
	    return isFulfilled.call(this._target());
	};

	Promise.prototype.isResolved = function() {
	    return isResolved.call(this._target());
	};

	Promise.prototype.value = function() {
	    return value.call(this._target());
	};

	Promise.prototype.reason = function() {
	    var target = this._target();
	    target._unsetRejectionIsUnhandled();
	    return reason.call(target);
	};

	Promise.prototype._value = function() {
	    return this._settledValue();
	};

	Promise.prototype._reason = function() {
	    this._unsetRejectionIsUnhandled();
	    return this._settledValue();
	};

	Promise.PromiseInspection = PromiseInspection;
	};


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports =
	function(Promise, PromiseArray, tryConvertToPromise, INTERNAL) {
	var util = __webpack_require__(26);
	var canEvaluate = util.canEvaluate;
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var reject;

	if (true) {
	if (canEvaluate) {
	    var thenCallback = function(i) {
	        return new Function("value", "holder", "                             \n\
	            'use strict';                                                    \n\
	            holder.pIndex = value;                                           \n\
	            holder.checkFulfillment(this);                                   \n\
	            ".replace(/Index/g, i));
	    };

	    var promiseSetter = function(i) {
	        return new Function("promise", "holder", "                           \n\
	            'use strict';                                                    \n\
	            holder.pIndex = promise;                                         \n\
	            ".replace(/Index/g, i));
	    };

	    var generateHolderClass = function(total) {
	        var props = new Array(total);
	        for (var i = 0; i < props.length; ++i) {
	            props[i] = "this.p" + (i+1);
	        }
	        var assignment = props.join(" = ") + " = null;";
	        var cancellationCode= "var promise;\n" + props.map(function(prop) {
	            return "                                                         \n\
	                promise = " + prop + ";                                      \n\
	                if (promise instanceof Promise) {                            \n\
	                    promise.cancel();                                        \n\
	                }                                                            \n\
	            ";
	        }).join("\n");
	        var passedArguments = props.join(", ");
	        var name = "Holder$" + total;


	        var code = "return function(tryCatch, errorObj, Promise) {           \n\
	            'use strict';                                                    \n\
	            function [TheName](fn) {                                         \n\
	                [TheProperties]                                              \n\
	                this.fn = fn;                                                \n\
	                this.now = 0;                                                \n\
	            }                                                                \n\
	            [TheName].prototype.checkFulfillment = function(promise) {       \n\
	                var now = ++this.now;                                        \n\
	                if (now === [TheTotal]) {                                    \n\
	                    promise._pushContext();                                  \n\
	                    var callback = this.fn;                                  \n\
	                    var ret = tryCatch(callback)([ThePassedArguments]);      \n\
	                    promise._popContext();                                   \n\
	                    if (ret === errorObj) {                                  \n\
	                        promise._rejectCallback(ret.e, false);               \n\
	                    } else {                                                 \n\
	                        promise._resolveCallback(ret);                       \n\
	                    }                                                        \n\
	                }                                                            \n\
	            };                                                               \n\
	                                                                             \n\
	            [TheName].prototype._resultCancelled = function() {              \n\
	                [CancellationCode]                                           \n\
	            };                                                               \n\
	                                                                             \n\
	            return [TheName];                                                \n\
	        }(tryCatch, errorObj, Promise);                                      \n\
	        ";

	        code = code.replace(/\[TheName\]/g, name)
	            .replace(/\[TheTotal\]/g, total)
	            .replace(/\[ThePassedArguments\]/g, passedArguments)
	            .replace(/\[TheProperties\]/g, assignment)
	            .replace(/\[CancellationCode\]/g, cancellationCode);

	        return new Function("tryCatch", "errorObj", "Promise", code)
	                           (tryCatch, errorObj, Promise);
	    };

	    var holderClasses = [];
	    var thenCallbacks = [];
	    var promiseSetters = [];

	    for (var i = 0; i < 8; ++i) {
	        holderClasses.push(generateHolderClass(i + 1));
	        thenCallbacks.push(thenCallback(i + 1));
	        promiseSetters.push(promiseSetter(i + 1));
	    }

	    reject = function (reason) {
	        this._reject(reason);
	    };
	}}

	Promise.join = function () {
	    var last = arguments.length - 1;
	    var fn;
	    if (last > 0 && typeof arguments[last] === "function") {
	        fn = arguments[last];
	        if (true) {
	            if (last <= 8 && canEvaluate) {
	                var ret = new Promise(INTERNAL);
	                ret._captureStackTrace();
	                var HolderClass = holderClasses[last - 1];
	                var holder = new HolderClass(fn);
	                var callbacks = thenCallbacks;

	                for (var i = 0; i < last; ++i) {
	                    var maybePromise = tryConvertToPromise(arguments[i], ret);
	                    if (maybePromise instanceof Promise) {
	                        maybePromise = maybePromise._target();
	                        var bitField = maybePromise._bitField;
	                        ;
	                        if (((bitField & 50397184) === 0)) {
	                            maybePromise._then(callbacks[i], reject,
	                                               undefined, ret, holder);
	                            promiseSetters[i](maybePromise, holder);
	                        } else if (((bitField & 33554432) !== 0)) {
	                            callbacks[i].call(ret,
	                                              maybePromise._value(), holder);
	                        } else if (((bitField & 16777216) !== 0)) {
	                            ret._reject(maybePromise._reason());
	                        } else {
	                            ret._cancel();
	                        }
	                    } else {
	                        callbacks[i].call(ret, maybePromise, holder);
	                    }
	                }
	                if (!ret._isFateSealed()) {
	                    ret._setAsyncGuaranteed();
	                    ret._setOnCancel(holder);
	                }
	                return ret;
	            }
	        }
	    }
	    var $_len = arguments.length;var args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];};
	    if (fn) args.pop();
	    var ret = new PromiseArray(args).promise();
	    return fn !== undefined ? ret.spread(fn) : ret;
	};

	};


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise,
	                          PromiseArray,
	                          apiRejection,
	                          tryConvertToPromise,
	                          INTERNAL,
	                          debug) {
	var getDomain = Promise._getDomain;
	var util = __webpack_require__(26);
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;
	var EMPTY_ARRAY = [];

	function MappingPromiseArray(promises, fn, limit, _filter) {
	    this.constructor$(promises);
	    this._promise._captureStackTrace();
	    var domain = getDomain();
	    this._callback = domain === null ? fn : domain.bind(fn);
	    this._preservedValues = _filter === INTERNAL
	        ? new Array(this.length())
	        : null;
	    this._limit = limit;
	    this._inFlight = 0;
	    this._queue = limit >= 1 ? [] : EMPTY_ARRAY;
	    this._init$(undefined, -2);
	}
	util.inherits(MappingPromiseArray, PromiseArray);

	MappingPromiseArray.prototype._init = function () {};

	MappingPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    var values = this._values;
	    var length = this.length();
	    var preservedValues = this._preservedValues;
	    var limit = this._limit;

	    if (index < 0) {
	        index = (index * -1) - 1;
	        values[index] = value;
	        if (limit >= 1) {
	            this._inFlight--;
	            this._drainQueue();
	            if (this._isResolved()) return true;
	        }
	    } else {
	        if (limit >= 1 && this._inFlight >= limit) {
	            values[index] = value;
	            this._queue.push(index);
	            return false;
	        }
	        if (preservedValues !== null) preservedValues[index] = value;

	        var promise = this._promise;
	        var callback = this._callback;
	        var receiver = promise._boundValue();
	        promise._pushContext();
	        var ret = tryCatch(callback).call(receiver, value, index, length);
	        var promiseCreated = promise._popContext();
	        debug.checkForgottenReturns(
	            ret,
	            promiseCreated,
	            preservedValues !== null ? "Promise.filter" : "Promise.map",
	            promise
	        );
	        if (ret === errorObj) {
	            this._reject(ret.e);
	            return true;
	        }

	        var maybePromise = tryConvertToPromise(ret, this._promise);
	        if (maybePromise instanceof Promise) {
	            maybePromise = maybePromise._target();
	            var bitField = maybePromise._bitField;
	            ;
	            if (((bitField & 50397184) === 0)) {
	                if (limit >= 1) this._inFlight++;
	                values[index] = maybePromise;
	                maybePromise._proxy(this, (index + 1) * -1);
	                return false;
	            } else if (((bitField & 33554432) !== 0)) {
	                ret = maybePromise._value();
	            } else if (((bitField & 16777216) !== 0)) {
	                this._reject(maybePromise._reason());
	                return true;
	            } else {
	                this._cancel();
	                return true;
	            }
	        }
	        values[index] = ret;
	    }
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= length) {
	        if (preservedValues !== null) {
	            this._filter(values, preservedValues);
	        } else {
	            this._resolve(values);
	        }
	        return true;
	    }
	    return false;
	};

	MappingPromiseArray.prototype._drainQueue = function () {
	    var queue = this._queue;
	    var limit = this._limit;
	    var values = this._values;
	    while (queue.length > 0 && this._inFlight < limit) {
	        if (this._isResolved()) return;
	        var index = queue.pop();
	        this._promiseFulfilled(values[index], index);
	    }
	};

	MappingPromiseArray.prototype._filter = function (booleans, values) {
	    var len = values.length;
	    var ret = new Array(len);
	    var j = 0;
	    for (var i = 0; i < len; ++i) {
	        if (booleans[i]) ret[j++] = values[i];
	    }
	    ret.length = j;
	    this._resolve(ret);
	};

	MappingPromiseArray.prototype.preservedValues = function () {
	    return this._preservedValues;
	};

	function map(promises, fn, options, _filter) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }

	    var limit = 0;
	    if (options !== undefined) {
	        if (typeof options === "object" && options !== null) {
	            if (typeof options.concurrency !== "number") {
	                return Promise.reject(
	                    new TypeError("'concurrency' must be a number but it is " +
	                                    util.classString(options.concurrency)));
	            }
	            limit = options.concurrency;
	        } else {
	            return Promise.reject(new TypeError(
	                            "options argument must be an object but it is " +
	                             util.classString(options)));
	        }
	    }
	    limit = typeof limit === "number" &&
	        isFinite(limit) && limit >= 1 ? limit : 0;
	    return new MappingPromiseArray(promises, fn, limit, _filter).promise();
	}

	Promise.prototype.map = function (fn, options) {
	    return map(this, fn, options, null);
	};

	Promise.map = function (promises, fn, options, _filter) {
	    return map(promises, fn, options, _filter);
	};


	};


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var cr = Object.create;
	if (cr) {
	    var callerCache = cr(null);
	    var getterCache = cr(null);
	    callerCache[" size"] = getterCache[" size"] = 0;
	}

	module.exports = function(Promise) {
	var util = __webpack_require__(26);
	var canEvaluate = util.canEvaluate;
	var isIdentifier = util.isIdentifier;

	var getMethodCaller;
	var getGetter;
	if (true) {
	var makeMethodCaller = function (methodName) {
	    return new Function("ensureMethod", "                                    \n\
	        return function(obj) {                                               \n\
	            'use strict'                                                     \n\
	            var len = this.length;                                           \n\
	            ensureMethod(obj, 'methodName');                                 \n\
	            switch(len) {                                                    \n\
	                case 1: return obj.methodName(this[0]);                      \n\
	                case 2: return obj.methodName(this[0], this[1]);             \n\
	                case 3: return obj.methodName(this[0], this[1], this[2]);    \n\
	                case 0: return obj.methodName();                             \n\
	                default:                                                     \n\
	                    return obj.methodName.apply(obj, this);                  \n\
	            }                                                                \n\
	        };                                                                   \n\
	        ".replace(/methodName/g, methodName))(ensureMethod);
	};

	var makeGetter = function (propertyName) {
	    return new Function("obj", "                                             \n\
	        'use strict';                                                        \n\
	        return obj.propertyName;                                             \n\
	        ".replace("propertyName", propertyName));
	};

	var getCompiled = function(name, compiler, cache) {
	    var ret = cache[name];
	    if (typeof ret !== "function") {
	        if (!isIdentifier(name)) {
	            return null;
	        }
	        ret = compiler(name);
	        cache[name] = ret;
	        cache[" size"]++;
	        if (cache[" size"] > 512) {
	            var keys = Object.keys(cache);
	            for (var i = 0; i < 256; ++i) delete cache[keys[i]];
	            cache[" size"] = keys.length - 256;
	        }
	    }
	    return ret;
	};

	getMethodCaller = function(name) {
	    return getCompiled(name, makeMethodCaller, callerCache);
	};

	getGetter = function(name) {
	    return getCompiled(name, makeGetter, getterCache);
	};
	}

	function ensureMethod(obj, methodName) {
	    var fn;
	    if (obj != null) fn = obj[methodName];
	    if (typeof fn !== "function") {
	        var message = "Object " + util.classString(obj) + " has no method '" +
	            util.toString(methodName) + "'";
	        throw new Promise.TypeError(message);
	    }
	    return fn;
	}

	function caller(obj) {
	    var methodName = this.pop();
	    var fn = ensureMethod(obj, methodName);
	    return fn.apply(obj, this);
	}
	Promise.prototype.call = function (methodName) {
	    var $_len = arguments.length;var args = new Array(Math.max($_len - 1, 0)); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];};
	    if (true) {
	        if (canEvaluate) {
	            var maybeCaller = getMethodCaller(methodName);
	            if (maybeCaller !== null) {
	                return this._then(
	                    maybeCaller, undefined, undefined, args, undefined);
	            }
	        }
	    }
	    args.push(methodName);
	    return this._then(caller, undefined, undefined, args, undefined);
	};

	function namedGetter(obj) {
	    return obj[this];
	}
	function indexedGetter(obj) {
	    var index = +this;
	    if (index < 0) index = Math.max(0, index + obj.length);
	    return obj[index];
	}
	Promise.prototype.get = function (propertyName) {
	    var isIndex = (typeof propertyName === "number");
	    var getter;
	    if (!isIndex) {
	        if (canEvaluate) {
	            var maybeGetter = getGetter(propertyName);
	            getter = maybeGetter !== null ? maybeGetter : namedGetter;
	        } else {
	            getter = namedGetter;
	        }
	    } else {
	        getter = indexedGetter;
	    }
	    return this._then(getter, undefined, undefined, propertyName, undefined);
	};
	};


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function (Promise, apiRejection, tryConvertToPromise,
	    createContext, INTERNAL, debug) {
	    var util = __webpack_require__(26);
	    var TypeError = __webpack_require__(31).TypeError;
	    var inherits = __webpack_require__(26).inherits;
	    var errorObj = util.errorObj;
	    var tryCatch = util.tryCatch;
	    var NULL = {};

	    function thrower(e) {
	        setTimeout(function(){throw e;}, 0);
	    }

	    function castPreservingDisposable(thenable) {
	        var maybePromise = tryConvertToPromise(thenable);
	        if (maybePromise !== thenable &&
	            typeof thenable._isDisposable === "function" &&
	            typeof thenable._getDisposer === "function" &&
	            thenable._isDisposable()) {
	            maybePromise._setDisposable(thenable._getDisposer());
	        }
	        return maybePromise;
	    }
	    function dispose(resources, inspection) {
	        var i = 0;
	        var len = resources.length;
	        var ret = new Promise(INTERNAL);
	        function iterator() {
	            if (i >= len) return ret._fulfill();
	            var maybePromise = castPreservingDisposable(resources[i++]);
	            if (maybePromise instanceof Promise &&
	                maybePromise._isDisposable()) {
	                try {
	                    maybePromise = tryConvertToPromise(
	                        maybePromise._getDisposer().tryDispose(inspection),
	                        resources.promise);
	                } catch (e) {
	                    return thrower(e);
	                }
	                if (maybePromise instanceof Promise) {
	                    return maybePromise._then(iterator, thrower,
	                                              null, null, null);
	                }
	            }
	            iterator();
	        }
	        iterator();
	        return ret;
	    }

	    function Disposer(data, promise, context) {
	        this._data = data;
	        this._promise = promise;
	        this._context = context;
	    }

	    Disposer.prototype.data = function () {
	        return this._data;
	    };

	    Disposer.prototype.promise = function () {
	        return this._promise;
	    };

	    Disposer.prototype.resource = function () {
	        if (this.promise().isFulfilled()) {
	            return this.promise().value();
	        }
	        return NULL;
	    };

	    Disposer.prototype.tryDispose = function(inspection) {
	        var resource = this.resource();
	        var context = this._context;
	        if (context !== undefined) context._pushContext();
	        var ret = resource !== NULL
	            ? this.doDispose(resource, inspection) : null;
	        if (context !== undefined) context._popContext();
	        this._promise._unsetDisposable();
	        this._data = null;
	        return ret;
	    };

	    Disposer.isDisposer = function (d) {
	        return (d != null &&
	                typeof d.resource === "function" &&
	                typeof d.tryDispose === "function");
	    };

	    function FunctionDisposer(fn, promise, context) {
	        this.constructor$(fn, promise, context);
	    }
	    inherits(FunctionDisposer, Disposer);

	    FunctionDisposer.prototype.doDispose = function (resource, inspection) {
	        var fn = this.data();
	        return fn.call(resource, resource, inspection);
	    };

	    function maybeUnwrapDisposer(value) {
	        if (Disposer.isDisposer(value)) {
	            this.resources[this.index]._setDisposable(value);
	            return value.promise();
	        }
	        return value;
	    }

	    function ResourceList(length) {
	        this.length = length;
	        this.promise = null;
	        this[length-1] = null;
	    }

	    ResourceList.prototype._resultCancelled = function() {
	        var len = this.length;
	        for (var i = 0; i < len; ++i) {
	            var item = this[i];
	            if (item instanceof Promise) {
	                item.cancel();
	            }
	        }
	    };

	    Promise.using = function () {
	        var len = arguments.length;
	        if (len < 2) return apiRejection(
	                        "you must pass at least 2 arguments to Promise.using");
	        var fn = arguments[len - 1];
	        if (typeof fn !== "function") {
	            return apiRejection("expecting a function but got " + util.classString(fn));
	        }
	        var input;
	        var spreadArgs = true;
	        if (len === 2 && Array.isArray(arguments[0])) {
	            input = arguments[0];
	            len = input.length;
	            spreadArgs = false;
	        } else {
	            input = arguments;
	            len--;
	        }
	        var resources = new ResourceList(len);
	        for (var i = 0; i < len; ++i) {
	            var resource = input[i];
	            if (Disposer.isDisposer(resource)) {
	                var disposer = resource;
	                resource = resource.promise();
	                resource._setDisposable(disposer);
	            } else {
	                var maybePromise = tryConvertToPromise(resource);
	                if (maybePromise instanceof Promise) {
	                    resource =
	                        maybePromise._then(maybeUnwrapDisposer, null, null, {
	                            resources: resources,
	                            index: i
	                    }, undefined);
	                }
	            }
	            resources[i] = resource;
	        }

	        var reflectedResources = new Array(resources.length);
	        for (var i = 0; i < reflectedResources.length; ++i) {
	            reflectedResources[i] = Promise.resolve(resources[i]).reflect();
	        }

	        var resultPromise = Promise.all(reflectedResources)
	            .then(function(inspections) {
	                for (var i = 0; i < inspections.length; ++i) {
	                    var inspection = inspections[i];
	                    if (inspection.isRejected()) {
	                        errorObj.e = inspection.error();
	                        return errorObj;
	                    } else if (!inspection.isFulfilled()) {
	                        resultPromise.cancel();
	                        return;
	                    }
	                    inspections[i] = inspection.value();
	                }
	                promise._pushContext();

	                fn = tryCatch(fn);
	                var ret = spreadArgs
	                    ? fn.apply(undefined, inspections) : fn(inspections);
	                var promiseCreated = promise._popContext();
	                debug.checkForgottenReturns(
	                    ret, promiseCreated, "Promise.using", promise);
	                return ret;
	            });

	        var promise = resultPromise.lastly(function() {
	            var inspection = new Promise.PromiseInspection(resultPromise);
	            return dispose(resources, inspection);
	        });
	        resources.promise = promise;
	        promise._setOnCancel(resources);
	        return promise;
	    };

	    Promise.prototype._setDisposable = function (disposer) {
	        this._bitField = this._bitField | 131072;
	        this._disposer = disposer;
	    };

	    Promise.prototype._isDisposable = function () {
	        return (this._bitField & 131072) > 0;
	    };

	    Promise.prototype._getDisposer = function () {
	        return this._disposer;
	    };

	    Promise.prototype._unsetDisposable = function () {
	        this._bitField = this._bitField & (~131072);
	        this._disposer = undefined;
	    };

	    Promise.prototype.disposer = function (fn) {
	        if (typeof fn === "function") {
	            return new FunctionDisposer(fn, this, createContext());
	        }
	        throw new TypeError();
	    };

	};


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, INTERNAL, debug) {
	var util = __webpack_require__(26);
	var TimeoutError = Promise.TimeoutError;

	function HandleWrapper(handle)  {
	    this.handle = handle;
	}

	HandleWrapper.prototype._resultCancelled = function() {
	    clearTimeout(this.handle);
	};

	var afterValue = function(value) { return delay(+this).thenReturn(value); };
	var delay = Promise.delay = function (ms, value) {
	    var ret;
	    var handle;
	    if (value !== undefined) {
	        ret = Promise.resolve(value)
	                ._then(afterValue, null, null, ms, undefined);
	        if (debug.cancellation() && value instanceof Promise) {
	            ret._setOnCancel(value);
	        }
	    } else {
	        ret = new Promise(INTERNAL);
	        handle = setTimeout(function() { ret._fulfill(); }, +ms);
	        if (debug.cancellation()) {
	            ret._setOnCancel(new HandleWrapper(handle));
	        }
	    }
	    ret._setAsyncGuaranteed();
	    return ret;
	};

	Promise.prototype.delay = function (ms) {
	    return delay(ms, this);
	};

	var afterTimeout = function (promise, message, parent) {
	    var err;
	    if (typeof message !== "string") {
	        if (message instanceof Error) {
	            err = message;
	        } else {
	            err = new TimeoutError("operation timed out");
	        }
	    } else {
	        err = new TimeoutError(message);
	    }
	    util.markAsOriginatingFromRejection(err);
	    promise._attachExtraTrace(err);
	    promise._reject(err);

	    if (parent != null) {
	        parent.cancel();
	    }
	};

	function successClear(value) {
	    clearTimeout(this.handle);
	    return value;
	}

	function failureClear(reason) {
	    clearTimeout(this.handle);
	    throw reason;
	}

	Promise.prototype.timeout = function (ms, message) {
	    ms = +ms;
	    var ret, parent;

	    var handleWrapper = new HandleWrapper(setTimeout(function timeoutTimeout() {
	        if (ret.isPending()) {
	            afterTimeout(ret, message, parent);
	        }
	    }, ms));

	    if (debug.cancellation()) {
	        parent = this.then();
	        ret = parent._then(successClear, failureClear,
	                            undefined, handleWrapper, undefined);
	        ret._setOnCancel(handleWrapper);
	    } else {
	        ret = this._then(successClear, failureClear,
	                            undefined, handleWrapper, undefined);
	    }

	    return ret;
	};

	};


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise,
	                          apiRejection,
	                          INTERNAL,
	                          tryConvertToPromise,
	                          Proxyable,
	                          debug) {
	var errors = __webpack_require__(31);
	var TypeError = errors.TypeError;
	var util = __webpack_require__(26);
	var errorObj = util.errorObj;
	var tryCatch = util.tryCatch;
	var yieldHandlers = [];

	function promiseFromYieldHandler(value, yieldHandlers, traceParent) {
	    for (var i = 0; i < yieldHandlers.length; ++i) {
	        traceParent._pushContext();
	        var result = tryCatch(yieldHandlers[i])(value);
	        traceParent._popContext();
	        if (result === errorObj) {
	            traceParent._pushContext();
	            var ret = Promise.reject(errorObj.e);
	            traceParent._popContext();
	            return ret;
	        }
	        var maybePromise = tryConvertToPromise(result, traceParent);
	        if (maybePromise instanceof Promise) return maybePromise;
	    }
	    return null;
	}

	function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
	    if (debug.cancellation()) {
	        var internal = new Promise(INTERNAL);
	        var _finallyPromise = this._finallyPromise = new Promise(INTERNAL);
	        this._promise = internal.lastly(function() {
	            return _finallyPromise;
	        });
	        internal._captureStackTrace();
	        internal._setOnCancel(this);
	    } else {
	        var promise = this._promise = new Promise(INTERNAL);
	        promise._captureStackTrace();
	    }
	    this._stack = stack;
	    this._generatorFunction = generatorFunction;
	    this._receiver = receiver;
	    this._generator = undefined;
	    this._yieldHandlers = typeof yieldHandler === "function"
	        ? [yieldHandler].concat(yieldHandlers)
	        : yieldHandlers;
	    this._yieldedPromise = null;
	    this._cancellationPhase = false;
	}
	util.inherits(PromiseSpawn, Proxyable);

	PromiseSpawn.prototype._isResolved = function() {
	    return this._promise === null;
	};

	PromiseSpawn.prototype._cleanup = function() {
	    this._promise = this._generator = null;
	    if (debug.cancellation() && this._finallyPromise !== null) {
	        this._finallyPromise._fulfill();
	        this._finallyPromise = null;
	    }
	};

	PromiseSpawn.prototype._promiseCancelled = function() {
	    if (this._isResolved()) return;
	    var implementsReturn = typeof this._generator["return"] !== "undefined";

	    var result;
	    if (!implementsReturn) {
	        var reason = new Promise.CancellationError(
	            "generator .return() sentinel");
	        Promise.coroutine.returnSentinel = reason;
	        this._promise._attachExtraTrace(reason);
	        this._promise._pushContext();
	        result = tryCatch(this._generator["throw"]).call(this._generator,
	                                                         reason);
	        this._promise._popContext();
	    } else {
	        this._promise._pushContext();
	        result = tryCatch(this._generator["return"]).call(this._generator,
	                                                          undefined);
	        this._promise._popContext();
	    }
	    this._cancellationPhase = true;
	    this._yieldedPromise = null;
	    this._continue(result);
	};

	PromiseSpawn.prototype._promiseFulfilled = function(value) {
	    this._yieldedPromise = null;
	    this._promise._pushContext();
	    var result = tryCatch(this._generator.next).call(this._generator, value);
	    this._promise._popContext();
	    this._continue(result);
	};

	PromiseSpawn.prototype._promiseRejected = function(reason) {
	    this._yieldedPromise = null;
	    this._promise._attachExtraTrace(reason);
	    this._promise._pushContext();
	    var result = tryCatch(this._generator["throw"])
	        .call(this._generator, reason);
	    this._promise._popContext();
	    this._continue(result);
	};

	PromiseSpawn.prototype._resultCancelled = function() {
	    if (this._yieldedPromise instanceof Promise) {
	        var promise = this._yieldedPromise;
	        this._yieldedPromise = null;
	        promise.cancel();
	    }
	};

	PromiseSpawn.prototype.promise = function () {
	    return this._promise;
	};

	PromiseSpawn.prototype._run = function () {
	    this._generator = this._generatorFunction.call(this._receiver);
	    this._receiver =
	        this._generatorFunction = undefined;
	    this._promiseFulfilled(undefined);
	};

	PromiseSpawn.prototype._continue = function (result) {
	    var promise = this._promise;
	    if (result === errorObj) {
	        this._cleanup();
	        if (this._cancellationPhase) {
	            return promise.cancel();
	        } else {
	            return promise._rejectCallback(result.e, false);
	        }
	    }

	    var value = result.value;
	    if (result.done === true) {
	        this._cleanup();
	        if (this._cancellationPhase) {
	            return promise.cancel();
	        } else {
	            return promise._resolveCallback(value);
	        }
	    } else {
	        var maybePromise = tryConvertToPromise(value, this._promise);
	        if (!(maybePromise instanceof Promise)) {
	            maybePromise =
	                promiseFromYieldHandler(maybePromise,
	                                        this._yieldHandlers,
	                                        this._promise);
	            if (maybePromise === null) {
	                this._promiseRejected(
	                    new TypeError(
	                        "A value %s was yielded that could not be treated as a promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a\u000a".replace("%s", value) +
	                        "From coroutine:\u000a" +
	                        this._stack.split("\n").slice(1, -7).join("\n")
	                    )
	                );
	                return;
	            }
	        }
	        maybePromise = maybePromise._target();
	        var bitField = maybePromise._bitField;
	        ;
	        if (((bitField & 50397184) === 0)) {
	            this._yieldedPromise = maybePromise;
	            maybePromise._proxy(this, null);
	        } else if (((bitField & 33554432) !== 0)) {
	            this._promiseFulfilled(maybePromise._value());
	        } else if (((bitField & 16777216) !== 0)) {
	            this._promiseRejected(maybePromise._reason());
	        } else {
	            this._promiseCancelled();
	        }
	    }
	};

	Promise.coroutine = function (generatorFunction, options) {
	    if (typeof generatorFunction !== "function") {
	        throw new TypeError("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    var yieldHandler = Object(options).yieldHandler;
	    var PromiseSpawn$ = PromiseSpawn;
	    var stack = new Error().stack;
	    return function () {
	        var generator = generatorFunction.apply(this, arguments);
	        var spawn = new PromiseSpawn$(undefined, undefined, yieldHandler,
	                                      stack);
	        var ret = spawn.promise();
	        spawn._generator = generator;
	        spawn._promiseFulfilled(undefined);
	        return ret;
	    };
	};

	Promise.coroutine.addYieldHandler = function(fn) {
	    if (typeof fn !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(fn));
	    }
	    yieldHandlers.push(fn);
	};

	Promise.spawn = function (generatorFunction) {
	    debug.deprecated("Promise.spawn()", "Promise.coroutine()");
	    if (typeof generatorFunction !== "function") {
	        return apiRejection("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    var spawn = new PromiseSpawn(generatorFunction, this);
	    var ret = spawn.promise();
	    spawn._run(Promise.spawn);
	    return ret;
	};
	};


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise) {
	var util = __webpack_require__(26);
	var async = Promise._async;
	var tryCatch = util.tryCatch;
	var errorObj = util.errorObj;

	function spreadAdapter(val, nodeback) {
	    var promise = this;
	    if (!util.isArray(val)) return successAdapter.call(promise, val, nodeback);
	    var ret =
	        tryCatch(nodeback).apply(promise._boundValue(), [null].concat(val));
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}

	function successAdapter(val, nodeback) {
	    var promise = this;
	    var receiver = promise._boundValue();
	    var ret = val === undefined
	        ? tryCatch(nodeback).call(receiver, null)
	        : tryCatch(nodeback).call(receiver, null, val);
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}
	function errorAdapter(reason, nodeback) {
	    var promise = this;
	    if (!reason) {
	        var newReason = new Error(reason + "");
	        newReason.cause = reason;
	        reason = newReason;
	    }
	    var ret = tryCatch(nodeback).call(promise._boundValue(), reason);
	    if (ret === errorObj) {
	        async.throwLater(ret.e);
	    }
	}

	Promise.prototype.asCallback = Promise.prototype.nodeify = function (nodeback,
	                                                                     options) {
	    if (typeof nodeback == "function") {
	        var adapter = successAdapter;
	        if (options !== undefined && Object(options).spread) {
	            adapter = spreadAdapter;
	        }
	        this._then(
	            adapter,
	            errorAdapter,
	            undefined,
	            this,
	            nodeback
	        );
	    }
	    return this;
	};
	};


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var THIS = {};
	var util = __webpack_require__(26);
	var nodebackForPromise = __webpack_require__(38);
	var withAppended = util.withAppended;
	var maybeWrapAsError = util.maybeWrapAsError;
	var canEvaluate = util.canEvaluate;
	var TypeError = __webpack_require__(31).TypeError;
	var defaultSuffix = "Async";
	var defaultPromisified = {__isPromisified__: true};
	var noCopyProps = [
	    "arity",    "length",
	    "name",
	    "arguments",
	    "caller",
	    "callee",
	    "prototype",
	    "__isPromisified__"
	];
	var noCopyPropsPattern = new RegExp("^(?:" + noCopyProps.join("|") + ")$");

	var defaultFilter = function(name) {
	    return util.isIdentifier(name) &&
	        name.charAt(0) !== "_" &&
	        name !== "constructor";
	};

	function propsFilter(key) {
	    return !noCopyPropsPattern.test(key);
	}

	function isPromisified(fn) {
	    try {
	        return fn.__isPromisified__ === true;
	    }
	    catch (e) {
	        return false;
	    }
	}

	function hasPromisified(obj, key, suffix) {
	    var val = util.getDataPropertyOrDefault(obj, key + suffix,
	                                            defaultPromisified);
	    return val ? isPromisified(val) : false;
	}
	function checkValid(ret, suffix, suffixRegexp) {
	    for (var i = 0; i < ret.length; i += 2) {
	        var key = ret[i];
	        if (suffixRegexp.test(key)) {
	            var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
	            for (var j = 0; j < ret.length; j += 2) {
	                if (ret[j] === keyWithoutAsyncSuffix) {
	                    throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\u000a\u000a    See http://goo.gl/MqrFmX\u000a"
	                        .replace("%s", suffix));
	                }
	            }
	        }
	    }
	}

	function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
	    var keys = util.inheritedDataKeys(obj);
	    var ret = [];
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        var value = obj[key];
	        var passesDefaultFilter = filter === defaultFilter
	            ? true : defaultFilter(key, value, obj);
	        if (typeof value === "function" &&
	            !isPromisified(value) &&
	            !hasPromisified(obj, key, suffix) &&
	            filter(key, value, obj, passesDefaultFilter)) {
	            ret.push(key, value);
	        }
	    }
	    checkValid(ret, suffix, suffixRegexp);
	    return ret;
	}

	var escapeIdentRegex = function(str) {
	    return str.replace(/([$])/, "\\$");
	};

	var makeNodePromisifiedEval;
	if (true) {
	var switchCaseArgumentOrder = function(likelyArgumentCount) {
	    var ret = [likelyArgumentCount];
	    var min = Math.max(0, likelyArgumentCount - 1 - 3);
	    for(var i = likelyArgumentCount - 1; i >= min; --i) {
	        ret.push(i);
	    }
	    for(var i = likelyArgumentCount + 1; i <= 3; ++i) {
	        ret.push(i);
	    }
	    return ret;
	};

	var argumentSequence = function(argumentCount) {
	    return util.filledRange(argumentCount, "_arg", "");
	};

	var parameterDeclaration = function(parameterCount) {
	    return util.filledRange(
	        Math.max(parameterCount, 3), "_arg", "");
	};

	var parameterCount = function(fn) {
	    if (typeof fn.length === "number") {
	        return Math.max(Math.min(fn.length, 1023 + 1), 0);
	    }
	    return 0;
	};

	makeNodePromisifiedEval =
	function(callback, receiver, originalName, fn, _, multiArgs) {
	    var newParameterCount = Math.max(0, parameterCount(fn) - 1);
	    var argumentOrder = switchCaseArgumentOrder(newParameterCount);
	    var shouldProxyThis = typeof callback === "string" || receiver === THIS;

	    function generateCallForArgumentCount(count) {
	        var args = argumentSequence(count).join(", ");
	        var comma = count > 0 ? ", " : "";
	        var ret;
	        if (shouldProxyThis) {
	            ret = "ret = callback.call(this, {{args}}, nodeback); break;\n";
	        } else {
	            ret = receiver === undefined
	                ? "ret = callback({{args}}, nodeback); break;\n"
	                : "ret = callback.call(receiver, {{args}}, nodeback); break;\n";
	        }
	        return ret.replace("{{args}}", args).replace(", ", comma);
	    }

	    function generateArgumentSwitchCase() {
	        var ret = "";
	        for (var i = 0; i < argumentOrder.length; ++i) {
	            ret += "case " + argumentOrder[i] +":" +
	                generateCallForArgumentCount(argumentOrder[i]);
	        }

	        ret += "                                                             \n\
	        default:                                                             \n\
	            var args = new Array(len + 1);                                   \n\
	            var i = 0;                                                       \n\
	            for (var i = 0; i < len; ++i) {                                  \n\
	               args[i] = arguments[i];                                       \n\
	            }                                                                \n\
	            args[i] = nodeback;                                              \n\
	            [CodeForCall]                                                    \n\
	            break;                                                           \n\
	        ".replace("[CodeForCall]", (shouldProxyThis
	                                ? "ret = callback.apply(this, args);\n"
	                                : "ret = callback.apply(receiver, args);\n"));
	        return ret;
	    }

	    var getFunctionCode = typeof callback === "string"
	                                ? ("this != null ? this['"+callback+"'] : fn")
	                                : "fn";
	    var body = "'use strict';                                                \n\
	        var ret = function (Parameters) {                                    \n\
	            'use strict';                                                    \n\
	            var len = arguments.length;                                      \n\
	            var promise = new Promise(INTERNAL);                             \n\
	            promise._captureStackTrace();                                    \n\
	            var nodeback = nodebackForPromise(promise, " + multiArgs + ");   \n\
	            var ret;                                                         \n\
	            var callback = tryCatch([GetFunctionCode]);                      \n\
	            switch(len) {                                                    \n\
	                [CodeForSwitchCase]                                          \n\
	            }                                                                \n\
	            if (ret === errorObj) {                                          \n\
	                promise._rejectCallback(maybeWrapAsError(ret.e), true, true);\n\
	            }                                                                \n\
	            if (!promise._isFateSealed()) promise._setAsyncGuaranteed();     \n\
	            return promise;                                                  \n\
	        };                                                                   \n\
	        notEnumerableProp(ret, '__isPromisified__', true);                   \n\
	        return ret;                                                          \n\
	    ".replace("[CodeForSwitchCase]", generateArgumentSwitchCase())
	        .replace("[GetFunctionCode]", getFunctionCode);
	    body = body.replace("Parameters", parameterDeclaration(newParameterCount));
	    return new Function("Promise",
	                        "fn",
	                        "receiver",
	                        "withAppended",
	                        "maybeWrapAsError",
	                        "nodebackForPromise",
	                        "tryCatch",
	                        "errorObj",
	                        "notEnumerableProp",
	                        "INTERNAL",
	                        body)(
	                    Promise,
	                    fn,
	                    receiver,
	                    withAppended,
	                    maybeWrapAsError,
	                    nodebackForPromise,
	                    util.tryCatch,
	                    util.errorObj,
	                    util.notEnumerableProp,
	                    INTERNAL);
	};
	}

	function makeNodePromisifiedClosure(callback, receiver, _, fn, __, multiArgs) {
	    var defaultThis = (function() {return this;})();
	    var method = callback;
	    if (typeof method === "string") {
	        callback = fn;
	    }
	    function promisified() {
	        var _receiver = receiver;
	        if (receiver === THIS) _receiver = this;
	        var promise = new Promise(INTERNAL);
	        promise._captureStackTrace();
	        var cb = typeof method === "string" && this !== defaultThis
	            ? this[method] : callback;
	        var fn = nodebackForPromise(promise, multiArgs);
	        try {
	            cb.apply(_receiver, withAppended(arguments, fn));
	        } catch(e) {
	            promise._rejectCallback(maybeWrapAsError(e), true, true);
	        }
	        if (!promise._isFateSealed()) promise._setAsyncGuaranteed();
	        return promise;
	    }
	    util.notEnumerableProp(promisified, "__isPromisified__", true);
	    return promisified;
	}

	var makeNodePromisified = canEvaluate
	    ? makeNodePromisifiedEval
	    : makeNodePromisifiedClosure;

	function promisifyAll(obj, suffix, filter, promisifier, multiArgs) {
	    var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
	    var methods =
	        promisifiableMethods(obj, suffix, suffixRegexp, filter);

	    for (var i = 0, len = methods.length; i < len; i+= 2) {
	        var key = methods[i];
	        var fn = methods[i+1];
	        var promisifiedKey = key + suffix;
	        if (promisifier === makeNodePromisified) {
	            obj[promisifiedKey] =
	                makeNodePromisified(key, THIS, key, fn, suffix, multiArgs);
	        } else {
	            var promisified = promisifier(fn, function() {
	                return makeNodePromisified(key, THIS, key,
	                                           fn, suffix, multiArgs);
	            });
	            util.notEnumerableProp(promisified, "__isPromisified__", true);
	            obj[promisifiedKey] = promisified;
	        }
	    }
	    util.toFastProperties(obj);
	    return obj;
	}

	function promisify(callback, receiver, multiArgs) {
	    return makeNodePromisified(callback, receiver, undefined,
	                                callback, null, multiArgs);
	}

	Promise.promisify = function (fn, options) {
	    if (typeof fn !== "function") {
	        throw new TypeError("expecting a function but got " + util.classString(fn));
	    }
	    if (isPromisified(fn)) {
	        return fn;
	    }
	    options = Object(options);
	    var receiver = options.context === undefined ? THIS : options.context;
	    var multiArgs = !!options.multiArgs;
	    var ret = promisify(fn, receiver, multiArgs);
	    util.copyDescriptors(fn, ret, propsFilter);
	    return ret;
	};

	Promise.promisifyAll = function (target, options) {
	    if (typeof target !== "function" && typeof target !== "object") {
	        throw new TypeError("the target of promisifyAll must be an object or a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    options = Object(options);
	    var multiArgs = !!options.multiArgs;
	    var suffix = options.suffix;
	    if (typeof suffix !== "string") suffix = defaultSuffix;
	    var filter = options.filter;
	    if (typeof filter !== "function") filter = defaultFilter;
	    var promisifier = options.promisifier;
	    if (typeof promisifier !== "function") promisifier = makeNodePromisified;

	    if (!util.isIdentifier(suffix)) {
	        throw new RangeError("suffix must be a valid identifier\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }

	    var keys = util.inheritedDataKeys(target);
	    for (var i = 0; i < keys.length; ++i) {
	        var value = target[keys[i]];
	        if (keys[i] !== "constructor" &&
	            util.isClass(value)) {
	            promisifyAll(value.prototype, suffix, filter, promisifier,
	                multiArgs);
	            promisifyAll(value, suffix, filter, promisifier, multiArgs);
	        }
	    }

	    return promisifyAll(target, suffix, filter, promisifier, multiArgs);
	};
	};



/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(
	    Promise, PromiseArray, tryConvertToPromise, apiRejection) {
	var util = __webpack_require__(26);
	var isObject = util.isObject;
	var es5 = __webpack_require__(27);
	var Es6Map;
	if (typeof Map === "function") Es6Map = Map;

	var mapToEntries = (function() {
	    var index = 0;
	    var size = 0;

	    function extractEntry(value, key) {
	        this[index] = value;
	        this[index + size] = key;
	        index++;
	    }

	    return function mapToEntries(map) {
	        size = map.size;
	        index = 0;
	        var ret = new Array(map.size * 2);
	        map.forEach(extractEntry, ret);
	        return ret;
	    };
	})();

	var entriesToMap = function(entries) {
	    var ret = new Es6Map();
	    var length = entries.length / 2 | 0;
	    for (var i = 0; i < length; ++i) {
	        var key = entries[length + i];
	        var value = entries[i];
	        ret.set(key, value);
	    }
	    return ret;
	};

	function PropertiesPromiseArray(obj) {
	    var isMap = false;
	    var entries;
	    if (Es6Map !== undefined && obj instanceof Es6Map) {
	        entries = mapToEntries(obj);
	        isMap = true;
	    } else {
	        var keys = es5.keys(obj);
	        var len = keys.length;
	        entries = new Array(len * 2);
	        for (var i = 0; i < len; ++i) {
	            var key = keys[i];
	            entries[i] = obj[key];
	            entries[i + len] = key;
	        }
	    }
	    this.constructor$(entries);
	    this._isMap = isMap;
	    this._init$(undefined, -3);
	}
	util.inherits(PropertiesPromiseArray, PromiseArray);

	PropertiesPromiseArray.prototype._init = function () {};

	PropertiesPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    this._values[index] = value;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        var val;
	        if (this._isMap) {
	            val = entriesToMap(this._values);
	        } else {
	            val = {};
	            var keyOffset = this.length();
	            for (var i = 0, len = this.length(); i < len; ++i) {
	                val[this._values[i + keyOffset]] = this._values[i];
	            }
	        }
	        this._resolve(val);
	        return true;
	    }
	    return false;
	};

	PropertiesPromiseArray.prototype.shouldCopyValues = function () {
	    return false;
	};

	PropertiesPromiseArray.prototype.getActualLength = function (len) {
	    return len >> 1;
	};

	function props(promises) {
	    var ret;
	    var castValue = tryConvertToPromise(promises);

	    if (!isObject(castValue)) {
	        return apiRejection("cannot await properties of a non-object\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    } else if (castValue instanceof Promise) {
	        ret = castValue._then(
	            Promise.props, undefined, undefined, undefined, undefined);
	    } else {
	        ret = new PropertiesPromiseArray(castValue).promise();
	    }

	    if (castValue instanceof Promise) {
	        ret._propagateFrom(castValue, 2);
	    }
	    return ret;
	}

	Promise.prototype.props = function () {
	    return props(this);
	};

	Promise.props = function (promises) {
	    return props(promises);
	};
	};


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(
	    Promise, INTERNAL, tryConvertToPromise, apiRejection) {
	var util = __webpack_require__(26);

	var raceLater = function (promise) {
	    return promise.then(function(array) {
	        return race(array, promise);
	    });
	};

	function race(promises, parent) {
	    var maybePromise = tryConvertToPromise(promises);

	    if (maybePromise instanceof Promise) {
	        return raceLater(maybePromise);
	    } else {
	        promises = util.asArray(promises);
	        if (promises === null)
	            return apiRejection("expecting an array or an iterable object but got " + util.classString(promises));
	    }

	    var ret = new Promise(INTERNAL);
	    if (parent !== undefined) {
	        ret._propagateFrom(parent, 3);
	    }
	    var fulfill = ret._fulfill;
	    var reject = ret._reject;
	    for (var i = 0, len = promises.length; i < len; ++i) {
	        var val = promises[i];

	        if (val === undefined && !(i in promises)) {
	            continue;
	        }

	        Promise.cast(val)._then(fulfill, reject, undefined, ret, null);
	    }
	    return ret;
	}

	Promise.race = function (promises) {
	    return race(promises, undefined);
	};

	Promise.prototype.race = function () {
	    return race(this, undefined);
	};

	};


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports = function(Promise,
	                          PromiseArray,
	                          apiRejection,
	                          tryConvertToPromise,
	                          INTERNAL,
	                          debug) {
	var getDomain = Promise._getDomain;
	var util = __webpack_require__(26);
	var tryCatch = util.tryCatch;

	function ReductionPromiseArray(promises, fn, initialValue, _each) {
	    this.constructor$(promises);
	    var domain = getDomain();
	    this._fn = domain === null ? fn : domain.bind(fn);
	    if (initialValue !== undefined) {
	        initialValue = Promise.resolve(initialValue);
	        initialValue._attachCancellationCallback(this);
	    }
	    this._initialValue = initialValue;
	    this._currentCancellable = null;
	    this._eachValues = _each === INTERNAL ? [] : undefined;
	    this._promise._captureStackTrace();
	    this._init$(undefined, -5);
	}
	util.inherits(ReductionPromiseArray, PromiseArray);

	ReductionPromiseArray.prototype._gotAccum = function(accum) {
	    if (this._eachValues !== undefined && accum !== INTERNAL) {
	        this._eachValues.push(accum);
	    }
	};

	ReductionPromiseArray.prototype._eachComplete = function(value) {
	    this._eachValues.push(value);
	    return this._eachValues;
	};

	ReductionPromiseArray.prototype._init = function() {};

	ReductionPromiseArray.prototype._resolveEmptyArray = function() {
	    this._resolve(this._eachValues !== undefined ? this._eachValues
	                                                 : this._initialValue);
	};

	ReductionPromiseArray.prototype.shouldCopyValues = function () {
	    return false;
	};

	ReductionPromiseArray.prototype._resolve = function(value) {
	    this._promise._resolveCallback(value);
	    this._values = null;
	};

	ReductionPromiseArray.prototype._resultCancelled = function(sender) {
	    if (sender === this._initialValue) return this._cancel();
	    if (this._isResolved()) return;
	    this._resultCancelled$();
	    if (this._currentCancellable instanceof Promise) {
	        this._currentCancellable.cancel();
	    }
	    if (this._initialValue instanceof Promise) {
	        this._initialValue.cancel();
	    }
	};

	ReductionPromiseArray.prototype._iterate = function (values) {
	    this._values = values;
	    var value;
	    var i;
	    var length = values.length;
	    if (this._initialValue !== undefined) {
	        value = this._initialValue;
	        i = 0;
	    } else {
	        value = Promise.resolve(values[0]);
	        i = 1;
	    }

	    this._currentCancellable = value;

	    if (!value.isRejected()) {
	        for (; i < length; ++i) {
	            var ctx = {
	                accum: null,
	                value: values[i],
	                index: i,
	                length: length,
	                array: this
	            };
	            value = value._then(gotAccum, undefined, undefined, ctx, undefined);
	        }
	    }

	    if (this._eachValues !== undefined) {
	        value = value
	            ._then(this._eachComplete, undefined, undefined, this, undefined);
	    }
	    value._then(completed, completed, undefined, value, this);
	};

	Promise.prototype.reduce = function (fn, initialValue) {
	    return reduce(this, fn, initialValue, null);
	};

	Promise.reduce = function (promises, fn, initialValue, _each) {
	    return reduce(promises, fn, initialValue, _each);
	};

	function completed(valueOrReason, array) {
	    if (this.isFulfilled()) {
	        array._resolve(valueOrReason);
	    } else {
	        array._reject(valueOrReason);
	    }
	}

	function reduce(promises, fn, initialValue, _each) {
	    if (typeof fn !== "function") {
	        return apiRejection("expecting a function but got " + util.classString(fn));
	    }
	    var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
	    return array.promise();
	}

	function gotAccum(accum) {
	    this.accum = accum;
	    this.array._gotAccum(accum);
	    var value = tryConvertToPromise(this.value, this.array._promise);
	    if (value instanceof Promise) {
	        this.array._currentCancellable = value;
	        return value._then(gotValue, undefined, undefined, this, undefined);
	    } else {
	        return gotValue.call(this, value);
	    }
	}

	function gotValue(value) {
	    var array = this.array;
	    var promise = array._promise;
	    var fn = tryCatch(array._fn);
	    promise._pushContext();
	    var ret;
	    if (array._eachValues !== undefined) {
	        ret = fn.call(promise._boundValue(), value, this.index, this.length);
	    } else {
	        ret = fn.call(promise._boundValue(),
	                              this.accum, value, this.index, this.length);
	    }
	    if (ret instanceof Promise) {
	        array._currentCancellable = ret;
	    }
	    var promiseCreated = promise._popContext();
	    debug.checkForgottenReturns(
	        ret,
	        promiseCreated,
	        array._eachValues !== undefined ? "Promise.each" : "Promise.reduce",
	        promise
	    );
	    return ret;
	}
	};


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports =
	    function(Promise, PromiseArray, debug) {
	var PromiseInspection = Promise.PromiseInspection;
	var util = __webpack_require__(26);

	function SettledPromiseArray(values) {
	    this.constructor$(values);
	}
	util.inherits(SettledPromiseArray, PromiseArray);

	SettledPromiseArray.prototype._promiseResolved = function (index, inspection) {
	    this._values[index] = inspection;
	    var totalResolved = ++this._totalResolved;
	    if (totalResolved >= this._length) {
	        this._resolve(this._values);
	        return true;
	    }
	    return false;
	};

	SettledPromiseArray.prototype._promiseFulfilled = function (value, index) {
	    var ret = new PromiseInspection();
	    ret._bitField = 33554432;
	    ret._settledValueField = value;
	    return this._promiseResolved(index, ret);
	};
	SettledPromiseArray.prototype._promiseRejected = function (reason, index) {
	    var ret = new PromiseInspection();
	    ret._bitField = 16777216;
	    ret._settledValueField = reason;
	    return this._promiseResolved(index, ret);
	};

	Promise.settle = function (promises) {
	    debug.deprecated(".settle()", ".reflect()");
	    return new SettledPromiseArray(promises).promise();
	};

	Promise.prototype.settle = function () {
	    return Promise.settle(this);
	};
	};


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	module.exports =
	function(Promise, PromiseArray, apiRejection) {
	var util = __webpack_require__(26);
	var RangeError = __webpack_require__(31).RangeError;
	var AggregateError = __webpack_require__(31).AggregateError;
	var isArray = util.isArray;
	var CANCELLATION = {};


	function SomePromiseArray(values) {
	    this.constructor$(values);
	    this._howMany = 0;
	    this._unwrap = false;
	    this._initialized = false;
	}
	util.inherits(SomePromiseArray, PromiseArray);

	SomePromiseArray.prototype._init = function () {
	    if (!this._initialized) {
	        return;
	    }
	    if (this._howMany === 0) {
	        this._resolve([]);
	        return;
	    }
	    this._init$(undefined, -5);
	    var isArrayResolved = isArray(this._values);
	    if (!this._isResolved() &&
	        isArrayResolved &&
	        this._howMany > this._canPossiblyFulfill()) {
	        this._reject(this._getRangeError(this.length()));
	    }
	};

	SomePromiseArray.prototype.init = function () {
	    this._initialized = true;
	    this._init();
	};

	SomePromiseArray.prototype.setUnwrap = function () {
	    this._unwrap = true;
	};

	SomePromiseArray.prototype.howMany = function () {
	    return this._howMany;
	};

	SomePromiseArray.prototype.setHowMany = function (count) {
	    this._howMany = count;
	};

	SomePromiseArray.prototype._promiseFulfilled = function (value) {
	    this._addFulfilled(value);
	    if (this._fulfilled() === this.howMany()) {
	        this._values.length = this.howMany();
	        if (this.howMany() === 1 && this._unwrap) {
	            this._resolve(this._values[0]);
	        } else {
	            this._resolve(this._values);
	        }
	        return true;
	    }
	    return false;

	};
	SomePromiseArray.prototype._promiseRejected = function (reason) {
	    this._addRejected(reason);
	    return this._checkOutcome();
	};

	SomePromiseArray.prototype._promiseCancelled = function () {
	    if (this._values instanceof Promise || this._values == null) {
	        return this._cancel();
	    }
	    this._addRejected(CANCELLATION);
	    return this._checkOutcome();
	};

	SomePromiseArray.prototype._checkOutcome = function() {
	    if (this.howMany() > this._canPossiblyFulfill()) {
	        var e = new AggregateError();
	        for (var i = this.length(); i < this._values.length; ++i) {
	            if (this._values[i] !== CANCELLATION) {
	                e.push(this._values[i]);
	            }
	        }
	        if (e.length > 0) {
	            this._reject(e);
	        } else {
	            this._cancel();
	        }
	        return true;
	    }
	    return false;
	};

	SomePromiseArray.prototype._fulfilled = function () {
	    return this._totalResolved;
	};

	SomePromiseArray.prototype._rejected = function () {
	    return this._values.length - this.length();
	};

	SomePromiseArray.prototype._addRejected = function (reason) {
	    this._values.push(reason);
	};

	SomePromiseArray.prototype._addFulfilled = function (value) {
	    this._values[this._totalResolved++] = value;
	};

	SomePromiseArray.prototype._canPossiblyFulfill = function () {
	    return this.length() - this._rejected();
	};

	SomePromiseArray.prototype._getRangeError = function (count) {
	    var message = "Input array must contain at least " +
	            this._howMany + " items but contains only " + count + " items";
	    return new RangeError(message);
	};

	SomePromiseArray.prototype._resolveEmptyArray = function () {
	    this._reject(this._getRangeError(0));
	};

	function some(promises, howMany) {
	    if ((howMany | 0) !== howMany || howMany < 0) {
	        return apiRejection("expecting a positive integer\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
	    }
	    var ret = new SomePromiseArray(promises);
	    var promise = ret.promise();
	    ret.setHowMany(howMany);
	    ret.init();
	    return promise;
	}

	Promise.some = function (promises, howMany) {
	    return some(promises, howMany);
	};

	Promise.prototype.some = function (howMany) {
	    return some(this, howMany);
	};

	Promise._SomePromiseArray = SomePromiseArray;
	};


/***/ },
/* 57 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var PromiseMap = Promise.map;

	Promise.prototype.filter = function (fn, options) {
	    return PromiseMap(this, fn, options, INTERNAL);
	};

	Promise.filter = function (promises, fn, options) {
	    return PromiseMap(promises, fn, options, INTERNAL);
	};
	};


/***/ },
/* 58 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise, INTERNAL) {
	var PromiseReduce = Promise.reduce;
	var PromiseAll = Promise.all;

	function promiseAllThis() {
	    return PromiseAll(this);
	}

	function PromiseMapSeries(promises, fn) {
	    return PromiseReduce(promises, fn, INTERNAL, INTERNAL);
	}

	Promise.prototype.each = function (fn) {
	    return this.mapSeries(fn)
	            ._then(promiseAllThis, undefined, undefined, this, undefined);
	};

	Promise.prototype.mapSeries = function (fn) {
	    return PromiseReduce(this, fn, INTERNAL, INTERNAL);
	};

	Promise.each = function (promises, fn) {
	    return PromiseMapSeries(promises, fn)
	            ._then(promiseAllThis, undefined, undefined, promises, undefined);
	};

	Promise.mapSeries = PromiseMapSeries;
	};


/***/ },
/* 59 */
/***/ function(module, exports) {

	"use strict";
	module.exports = function(Promise) {
	var SomePromiseArray = Promise._SomePromiseArray;
	function any(promises) {
	    var ret = new SomePromiseArray(promises);
	    var promise = ret.promise();
	    ret.setHowMany(1);
	    ret.setUnwrap();
	    ret.init();
	    return promise;
	}

	Promise.any = function (promises) {
	    return any(promises);
	};

	Promise.prototype.any = function () {
	    return any(this);
	};

	};


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var debug = __webpack_require__(61)('superagent');
	var formidable = __webpack_require__(67);
	var FormData = __webpack_require__(80);
	var Response = __webpack_require__(87);
	var parse = __webpack_require__(13).parse;
	var format = __webpack_require__(13).format;
	var resolve = __webpack_require__(13).resolve;
	var methods = __webpack_require__(90);
	var Stream = __webpack_require__(11);
	var utils = __webpack_require__(88);
	var extend = __webpack_require__(91);
	var Part = __webpack_require__(92);
	var mime = __webpack_require__(93);
	var https = __webpack_require__(6);
	var http = __webpack_require__(5);
	var fs = __webpack_require__(66);
	var qs = __webpack_require__(105);
	var zlib = __webpack_require__(89);
	var util = __webpack_require__(63);
	var pkg = __webpack_require__(110);
	var requestBase = __webpack_require__(111);
	var isObject = __webpack_require__(112);

	/**
	 * Expose the request function.
	 */

	var request = exports = module.exports = __webpack_require__(113).bind(null, Request);

	/**
	 * Expose the agent function
	 */

	exports.agent = __webpack_require__(114);

	/**
	 * Expose `Part`.
	 */

	exports.Part = Part;

	/**
	 * Noop.
	 */

	function noop(){};

	/**
	 * Expose `Response`.
	 */

	exports.Response = Response;

	/**
	 * Define "form" mime type.
	 */

	mime.define({
	  'application/x-www-form-urlencoded': ['form', 'urlencoded', 'form-data']
	});

	/**
	 * Protocol map.
	 */

	exports.protocols = {
	  'http:': http,
	  'https:': https
	};

	/**
	 * Default serialization map.
	 *
	 *     superagent.serialize['application/xml'] = function(obj){
	 *       return 'generated xml here';
	 *     };
	 *
	 */

	exports.serialize = {
	  'application/x-www-form-urlencoded': qs.stringify,
	  'application/json': JSON.stringify
	};

	/**
	 * Default parsers.
	 *
	 *     superagent.parse['application/xml'] = function(res, fn){
	 *       fn(null, res);
	 *     };
	 *
	 */

	exports.parse = __webpack_require__(116);

	/**
	 * Initialize internal header tracking properties on a request instance.
	 *
	 * @param {Object} req the instance
	 * @api private
	 */
	function _initHeaders(req) {
	  var ua = 'node-superagent/' + pkg.version;
	  req._header = { // coerces header names to lowercase
	    'user-agent': ua
	  };
	  req.header = { // preserves header name case
	    'User-Agent': ua
	  };
	}

	/**
	 * Initialize a new `Request` with the given `method` and `url`.
	 *
	 * @param {String} method
	 * @param {String|Object} url
	 * @api public
	 */

	function Request(method, url) {
	  Stream.call(this);
	  var self = this;
	  if ('string' != typeof url) url = format(url);
	  this._agent = false;
	  this._formData = null;
	  this.method = method;
	  this.url = url;
	  _initHeaders(this);
	  this.writable = true;
	  this._redirects = 0;
	  this.redirects(5);
	  this.cookies = '';
	  this.qs = {};
	  this.qsRaw = [];
	  this._redirectList = [];
	  this._streamRequest = false;
	  this.on('end', this.clearTimeout.bind(this));
	}

	/**
	 * Inherit from `Stream` (which inherits from `EventEmitter`).
	 * Mixin `requestBase`.
	 */
	util.inherits(Request, Stream);
	for (var key in requestBase) {
	  Request.prototype[key] = requestBase[key];
	}

	/**
	 * Queue the given `file` as an attachment to the specified `field`,
	 * with optional `filename`.
	 *
	 * ``` js
	 * request.post('http://localhost/upload')
	 *   .attach(new Buffer('<b>Hello world</b>'), 'hello.html')
	 *   .end(callback);
	 * ```
	 *
	 * A filename may also be used:
	 *
	 * ``` js
	 * request.post('http://localhost/upload')
	 *   .attach('files', 'image.jpg')
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} field
	 * @param {String|fs.ReadStream|Buffer} file
	 * @param {String} filename
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.attach = function(field, file, filename){
	  if ('string' == typeof file) {
	    if (!filename) filename = file;
	    debug('creating `fs.ReadStream` instance for file: %s', file);
	    file = fs.createReadStream(file);
	  } else if (!filename && file.path) {
	    filename = file.path;
	  }
	  this._getFormData().append(field, file, { filename: filename });
	  return this;
	};

	Request.prototype._getFormData = function() {
	  if (!this._formData) {
	    this._formData = new FormData();
	    this._formData.on('error', function(err) {
	      this.emit('error', err);
	      this.abort();
	    }.bind(this));
	  }
	  return this._formData;
	};

	/**
	 * Set the max redirects to `n`.
	 *
	 * @param {Number} n
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.redirects = function(n){
	  debug('max redirects %s', n);
	  this._maxRedirects = n;
	  return this;
	};

	/**
	 * Return a new `Part` for this request.
	 *
	 * @return {Part}
	 * @api public
	 * @deprecated pass a readable stream in to `Request#attach()` instead
	 */

	Request.prototype.part = util.deprecate(function(){
	  return new Part(this);
	}, '`Request#part()` is deprecated. ' +
	   'Pass a readable stream in to `Request#attach()` instead.');

	/**
	 * Gets/sets the `Agent` to use for this HTTP request. The default (if this
	 * function is not called) is to opt out of connection pooling (`agent: false`).
	 *
	 * @param {http.Agent} agent
	 * @return {http.Agent}
	 * @api public
	 */

	Request.prototype.agent = function(agent){
	  if (!arguments.length) return this._agent;
	  this._agent = agent;
	  return this;
	};

	/**
	 * Set _Content-Type_ response header passed through `mime.lookup()`.
	 *
	 * Examples:
	 *
	 *      request.post('/')
	 *        .type('xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 *      request.post('/')
	 *        .type('json')
	 *        .send(jsonstring)
	 *        .end(callback);
	 *
	 *      request.post('/')
	 *        .type('application/json')
	 *        .send(jsonstring)
	 *        .end(callback);
	 *
	 * @param {String} type
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.type = function(type){
	  return this.set('Content-Type', ~type.indexOf('/')
	    ? type
	    : mime.lookup(type));
	};

	/**
	 * Set _Accept_ response header passed through `mime.lookup()`.
	 *
	 * Examples:
	 *
	 *      superagent.types.json = 'application/json';
	 *
	 *      request.get('/agent')
	 *        .accept('json')
	 *        .end(callback);
	 *
	 *      request.get('/agent')
	 *        .accept('application/json')
	 *        .end(callback);
	 *
	 * @param {String} accept
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.accept = function(type){
	  return this.set('Accept', ~type.indexOf('/')
	    ? type
	    : mime.lookup(type));
	};

	/**
	 * Add query-string `val`.
	 *
	 * Examples:
	 *
	 *   request.get('/shoes')
	 *     .query('size=10')
	 *     .query({ color: 'blue' })
	 *
	 * @param {Object|String} val
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.query = function(val){
	  if ('string' == typeof val) {
	    this.qsRaw.push(val);
	    return this;
	  }

	  extend(this.qs, val);
	  return this;
	};

	/**
	 * Send `data` as the request body, defaulting the `.type()` to "json" when
	 * an object is given.
	 *
	 * Examples:
	 *
	 *       // manual json
	 *       request.post('/user')
	 *         .type('json')
	 *         .send('{"name":"tj"}')
	 *         .end(callback)
	 *
	 *       // auto json
	 *       request.post('/user')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // manual x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send('name=tj')
	 *         .end(callback)
	 *
	 *       // auto x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // string defaults to x-www-form-urlencoded
	 *       request.post('/user')
	 *         .send('name=tj')
	 *         .send('foo=bar')
	 *         .send('bar=baz')
	 *         .end(callback)
	 *
	 * @param {String|Object} data
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.send = function(data){
	  var obj = isObject(data);
	  var type = this._header['content-type'];
	  // merge
	  if (obj && isObject(this._data)) {
	    for (var key in data) {
	      this._data[key] = data[key];
	    }
	  // string
	  } else if ('string' == typeof data) {
	    // default to x-www-form-urlencoded
	    if (!type) this.type('form');
	    type = this._header['content-type'];

	    // concat &
	    if ('application/x-www-form-urlencoded' == type) {
	      this._data = this._data
	        ? this._data + '&' + data
	        : data;
	    } else {
	      this._data = (this._data || '') + data;
	    }
	  } else {
	    this._data = data;
	  }

	  if (!obj) return this;

	  // default to json
	  if (!type) this.type('json');
	  return this;
	};

	/**
	 * Write raw `data` / `encoding` to the socket.
	 *
	 * @param {Buffer|String} data
	 * @param {String} encoding
	 * @return {Boolean}
	 * @api public
	 */

	Request.prototype.write = function(data, encoding){
	  var req = this.request();
	  if (!this._streamRequest) {
	    this._streamRequest = true;
	    try {
	      // ensure querystring is appended before headers are sent
	      this.appendQueryString(req);
	    } catch (e) {
	      return this.emit('error', e);
	    }
	  }
	  return req.write(data, encoding);
	};

	/**
	 * Pipe the request body to `stream`.
	 *
	 * @param {Stream} stream
	 * @param {Object} options
	 * @return {Stream}
	 * @api public
	 */

	Request.prototype.pipe = function(stream, options){
	  this.piped = true; // HACK...
	  this.buffer(false);
	  var self = this;
	  this.end().req.on('response', function(res){
	    // redirect
	    var redirect = isRedirect(res.statusCode);
	    if (redirect && self._redirects++ != self._maxRedirects) {
	      return self.redirect(res).pipe(stream, options);
	    }

	    if (self._shouldUnzip(res)) {
	      res.pipe(zlib.createUnzip()).pipe(stream, options);
	    } else {
	      res.pipe(stream, options);
	    }
	    res.on('end', function(){
	      self.emit('end');
	    });
	  });
	  return stream;
	};

	/**
	 * Enable / disable buffering.
	 *
	 * @return {Boolean} [val]
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.buffer = function(val){
	  this._buffer = false === val
	    ? false
	    : true;
	  return this;
	};

	/**
	 * Abort and clear timeout.
	 *
	 * @api public
	 */

	Request.prototype.abort = function(){
	  debug('abort %s %s', this.method, this.url);
	  this._aborted = true;
	  this.clearTimeout();
	  this.req.abort();
	  this.emit('abort');
	};

	/**
	 * Redirect to `url
	 *
	 * @param {IncomingMessage} res
	 * @return {Request} for chaining
	 * @api private
	 */

	Request.prototype.redirect = function(res){
	  var url = res.headers.location;
	  if (!url) {
	    return this.callback(new Error('No location header for redirect'), res);
	  }

	  debug('redirect %s -> %s', this.url, url);

	  // location
	  url = resolve(this.url, url);

	  // ensure the response is being consumed
	  // this is required for Node v0.10+
	  res.resume();

	  var headers = this.req._headers;

	  var shouldStripCookie = parse(url).host !== parse(this.url).host;

	  // implementation of 302 following defacto standard
	  if (res.statusCode == 301 || res.statusCode == 302){
	    // strip Content-* related fields
	    // in case of POST etc
	    headers = utils.cleanHeader(this.req._headers, shouldStripCookie);

	    // force GET
	    this.method = 'HEAD' == this.method
	      ? 'HEAD'
	      : 'GET';

	    // clear data
	    this._data = null;
	  }
	  // 303 is always GET
	  if (res.statusCode == 303) {
	    // strip Content-* related fields
	    // in case of POST etc
	    headers = utils.cleanHeader(this.req._headers, shouldStripCookie);

	    // force method
	    this.method = 'GET';

	    // clear data
	    this._data = null;
	  }
	  // 307 preserves method
	  // 308 preserves method
	  delete headers.host;

	  delete this.req;
	  delete this._formData;

	  // remove all add header except User-Agent
	  _initHeaders(this)

	  // redirect
	  this.url = url;
	  this._redirectList.push(url);
	  this.emit('redirect', res);
	  this.qs = {};
	  this.qsRaw = [];
	  this.set(headers);
	  this.end(this._callback);
	  return this;
	};

	/**
	 * Set Authorization field value with `user` and `pass`.
	 *
	 * Examples:
	 *
	 *   .auth('tobi', 'learnboost')
	 *   .auth('tobi:learnboost')
	 *   .auth('tobi')
	 *
	 * @param {String} user
	 * @param {String} pass
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.auth = function(user, pass){
	  if (1 === arguments.length) pass = '';
	  if (!~user.indexOf(':')) user = user + ':';
	  var str = new Buffer(user + pass).toString('base64');
	  return this.set('Authorization', 'Basic ' + str);
	};

	/**
	 * Set the certificate authority option for https request.
	 *
	 * @param {Buffer | Array} cert
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.ca = function(cert){
	  this._ca = cert;
	  return this;
	};

	/**
	 * Return an http[s] request.
	 *
	 * @return {OutgoingMessage}
	 * @api private
	 */

	Request.prototype.request = function(){
	  if (this.req) return this.req;

	  var self = this;
	  var options = {};
	  var data = this._data;
	  var url = this.url;

	  // default to http://
	  if (0 != url.indexOf('http')) url = 'http://' + url;
	  url = parse(url);

	  // options
	  options.method = this.method;
	  options.port = url.port;
	  options.path = url.pathname;
	  options.host = url.hostname;
	  options.ca = this._ca;
	  options.agent = this._agent;

	  // initiate request
	  var mod = exports.protocols[url.protocol];

	  // request
	  var req = this.req = mod.request(options);
	  if ('HEAD' != options.method) req.setHeader('Accept-Encoding', 'gzip, deflate');
	  this.protocol = url.protocol;
	  this.host = url.host;

	  // expose events
	  req.on('drain', function(){ self.emit('drain'); });

	  req.on('error', function(err){
	    // flag abortion here for out timeouts
	    // because node will emit a faux-error "socket hang up"
	    // when request is aborted before a connection is made
	    if (self._aborted) return;
	    // if we've recieved a response then we don't want to let
	    // an error in the request blow up the response
	    if (self.response) return;
	    self.callback(err);
	  });

	  // auth
	  if (url.auth) {
	    var auth = url.auth.split(':');
	    this.auth(auth[0], auth[1]);
	  }

	  // query
	  if (url.search)
	    this.query(url.search.substr(1));

	  // add cookies
	  if (this.cookies) req.setHeader('Cookie', this.cookies);

	  for (var key in this.header) {
	    req.setHeader(key, this.header[key]);
	  }

	  return req;
	};

	/**
	 * Invoke the callback with `err` and `res`
	 * and handle arity check.
	 *
	 * @param {Error} err
	 * @param {Response} res
	 * @api private
	 */

	Request.prototype.callback = function(err, res){
	  // Avoid the error which is emitted from 'socket hang up' to cause the fn undefined error on JS runtime.
	  var fn = this._callback || noop;
	  this.clearTimeout();
	  if (this.called) return console.warn('double callback!');
	  this.called = true;

	  if (err) {
	    err.response = res;
	  }

	  // only emit error event if there is a listener
	  // otherwise we assume the callback to `.end()` will get the error
	  if (err && this.listeners('error').length > 0) this.emit('error', err);

	  if (err) {
	    return fn(err, res);
	  }

	  if (res && res.status >= 200 && res.status < 300) {
	    return fn(err, res);
	  }

	  var msg = 'Unsuccessful HTTP response';
	  if (res) {
	    msg = http.STATUS_CODES[res.status] || msg;
	  }
	  var new_err = new Error(msg);
	  new_err.original = err;
	  new_err.response = res;
	  new_err.status = (res) ? res.status : undefined;

	  fn(err || new_err, res);
	};

	/**
	 * Compose querystring to append to req.path
	 *
	 * @return {String} querystring
	 * @api private
	 */

	Request.prototype.appendQueryString = function(req){
	  var querystring = qs.stringify(this.qs, { indices: false });
	  querystring += ((querystring.length && this.qsRaw.length) ? '&' : '') + this.qsRaw.join('&');
	  req.path += querystring.length
	    ? (~req.path.indexOf('?') ? '&' : '?') + querystring
	    : '';
	};

	/**
	 * Initiate request, invoking callback `fn(err, res)`
	 * with an instanceof `Response`.
	 *
	 * @param {Function} fn
	 * @return {Request} for chaining
	 * @api public
	 */

	/**
	* Client API parity, irrelevant in a Node context.
	*
	* @api public
	*/

	Request.prototype.withCredentials = function(){
	  return this;
	};

	Request.prototype.end = function(fn){
	  var self = this;
	  var data = this._data;
	  var req = this.request();
	  var buffer = this._buffer;
	  var method = this.method;
	  var timeout = this._timeout;
	  debug('%s %s', this.method, this.url);

	  // store callback
	  this._callback = fn || noop;

	  // querystring
	  try {
	    this.appendQueryString(req);
	  } catch (e) {
	    return this.callback(e);
	  }

	  // timeout
	  if (timeout && !this._timer) {
	    debug('timeout %sms %s %s', timeout, this.method, this.url);
	    this._timer = setTimeout(function(){
	      var err = new Error('timeout of ' + timeout + 'ms exceeded');
	      err.timeout = timeout;
	      err.code = 'ECONNABORTED';
	      self.abort();
	      self.callback(err);
	    }, timeout);
	  }

	  // body
	  if ('HEAD' != method && !req._headerSent) {
	    // serialize stuff
	    if ('string' != typeof data) {
	      var contentType = req.getHeader('Content-Type')
	      // Parse out just the content type from the header (ignore the charset)
	      if (contentType) contentType = contentType.split(';')[0]
	      var serialize = exports.serialize[contentType];
	      if (!serialize && isJSON(contentType)) serialize = exports.serialize['application/json'];
	      if (serialize) data = serialize(data);
	    }

	    // content-length
	    if (data && !req.getHeader('Content-Length')) {
	      req.setHeader('Content-Length', Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data));
	    }
	  }

	  // response
	  req.on('response', function(res){
	    debug('%s %s -> %s', self.method, self.url, res.statusCode);
	    var max = self._maxRedirects;
	    var mime = utils.type(res.headers['content-type'] || '') || 'text/plain';
	    var len = res.headers['content-length'];
	    var type = mime.split('/');
	    var subtype = type[1];
	    var type = type[0];
	    var multipart = 'multipart' == type;
	    var redirect = isRedirect(res.statusCode);
	    var parser = self._parser;

	    self.res = res;

	    if ('HEAD' == self.method) {
	      var response = new Response(self);
	      self.response = response;
	      response.redirects = self._redirectList;
	      self.emit('response', response);
	      self.callback(null, response);
	      self.emit('end');
	      return;
	    }

	    if (self.piped) {
	      return;
	    }

	    // redirect
	    if (redirect && self._redirects++ != max) {
	      return self.redirect(res);
	    }

	    // zlib support
	    if (self._shouldUnzip(res)) {
	      utils.unzip(req, res);
	    }


	    // don't buffer multipart
	    if (multipart) buffer = false;

	    // TODO: make all parsers take callbacks
	    if (!parser && multipart) {
	      var form = new formidable.IncomingForm;

	      form.parse(res, function(err, fields, files){
	        if (err) return self.callback(err);
	        var response = new Response(self);
	        self.response = response;
	        response.body = fields;
	        response.files = files;
	        response.redirects = self._redirectList;
	        self.emit('end');
	        self.callback(null, response);
	      });
	      return;
	    }

	    // check for images, one more special treatment
	    if (!parser && isImage(mime)) {
	      exports.parse.image(res, function(err, obj){
	        if (err) return self.callback(err);
	        var response = new Response(self);
	        self.response = response;
	        response.body = obj;
	        response.redirects = self._redirectList;
	        self.emit('end');
	        self.callback(null, response);
	      });
	      return;
	    }

	    // by default only buffer text/*, json and messed up thing from hell
	    if (null == buffer && isText(mime) || isJSON(mime)) buffer = true;

	    // parser
	    var parse = 'text' == type
	      ? exports.parse.text
	      : exports.parse[mime];

	    // everyone wants their own white-labeled json
	    if (!parse && isJSON(mime)) parse = exports.parse['application/json'];

	    // buffered response
	    if (buffer) parse = parse || exports.parse.text;

	    // explicit parser
	    if (parser) parse = parser;

	    // parse
	    if (parse) {
	      try {
	        parse(res, function(err, obj){
	          if (err && !self._aborted) self.callback(err);
	          res.body = obj;
	        });
	      } catch (err) {
	        self.callback(err);
	        return;
	      }
	    }

	    // unbuffered
	    if (!buffer) {
	      debug('unbuffered %s %s', self.method, self.url);
	      self.res = res;
	      var response = new Response(self);
	      self.response = response;
	      response.redirects = self._redirectList;
	      self.emit('response', response);
	      self.callback(null, response);
	      if (multipart) return // allow multipart to handle end event
	      res.on('end', function(){
	        debug('end %s %s', self.method, self.url);
	        self.emit('end');
	      })
	      return;
	    }

	    // terminating events
	    self.res = res;
	    res.on('error', function(err){
	      self.callback(err, null);
	    });
	    res.on('end', function(){
	      debug('end %s %s', self.method, self.url);
	      // TODO: unless buffering emit earlier to stream
	      var response = new Response(self);
	      self.response = response;
	      response.redirects = self._redirectList;
	      self.emit('response', response);
	      self.callback(null, response);
	      self.emit('end');
	    });
	  });

	  this.emit('request', this);

	  // if a FormData instance got created, then we send that as the request body
	  var formData = this._formData;
	  if (formData) {

	    // set headers
	    var headers = formData.getHeaders();
	    for (var i in headers) {
	      debug('setting FormData header: "%s: %s"', i, headers[i]);
	      req.setHeader(i, headers[i]);
	    }

	    // attempt to get "Content-Length" header
	    formData.getLength(function(err, length) {
	      // TODO: Add chunked encoding when no length (if err)

	      debug('got FormData Content-Length: %s', length);
	      if ('number' == typeof length) {
	        req.setHeader('Content-Length', length);
	      }

	      var getProgressMonitor = function () {
	        var lengthComputable = true;
	        var total = req.getHeader('Content-Length');
	        var loaded = 0;

	        var progress = new Stream.Transform();
	        progress._transform = function (chunk, encoding, cb) {
	          loaded += chunk.length;
	          self.emit('progress', {
	            direction: 'upload',
	            lengthComputable: lengthComputable,
	            loaded: loaded,
	            total: total
	          });
	          cb(null, chunk);
	        };
	        return progress;
	      };
	      formData.pipe(getProgressMonitor()).pipe(req);
	    });
	  } else {
	    req.end(data);
	  }

	  return this;
	};

	/**
	 * Check whether response has a non-0-sized gzip-encoded body
	 */
	Request.prototype._shouldUnzip = function(res){
	  if (res.statusCode === 204 || res.statusCode === 304) {
	    // These aren't supposed to have any body
	    return false;
	  }

	  // header content is a string, and distinction between 0 and no information is crucial
	  if ('0' === res.headers['content-length']) {
	    // We know that the body is empty (unfortunately, this check does not cover chunked encoding)
	    return false;
	  }

	  // console.log(res);
	  return /^\s*(?:deflate|gzip)\s*$/.test(res.headers['content-encoding']);
	};

	/**
	 * To json.
	 *
	 * @return {Object}
	 * @api public
	 */

	Request.prototype.toJSON = function(){
	  return {
	    method: this.method,
	    url: this.url,
	    data: this._data
	  };
	};

	/**
	 * Expose `Request`.
	 */

	exports.Request = Request;

	// generate HTTP verb methods
	if (methods.indexOf('del') == -1) {
	  // create a copy so we don't cause conflicts with
	  // other packages using the methods package and
	  // npm 3.x
	  methods = methods.slice(0);
	  methods.push('del');
	}
	methods.forEach(function(method){
	  var name = method;
	  method = 'del' == method ? 'delete' : method;

	  method = method.toUpperCase();
	  request[name] = function(url, data, fn){
	    var req = request(method, url);
	    if ('function' == typeof data) fn = data, data = null;
	    if (data) req.send(data);
	    fn && req.end(fn);
	    return req;
	  };
	});

	/**
	 * Check if `mime` is text and should be buffered.
	 *
	 * @param {String} mime
	 * @return {Boolean}
	 * @api public
	 */

	function isText(mime) {
	  var parts = mime.split('/');
	  var type = parts[0];
	  var subtype = parts[1];

	  return 'text' == type
	    || 'x-www-form-urlencoded' == subtype;
	}

	/**
	 * Check if `mime` is image
	 *
	 * @param {String} mime
	 * @return {Boolean}
	 * @api public
	 */

	function isImage(mime) {
	  var parts = mime.split('/');
	  var type = parts[0];
	  var subtype = parts[1];

	  return 'image' == type;
	}

	/**
	 * Check if `mime` is json or has +json structured syntax suffix.
	 *
	 * @param {String} mime
	 * @return {Boolean}
	 * @api private
	 */

	function isJSON(mime) {
	  return /[\/+]json\b/.test(mime);
	}

	/**
	 * Check if we should follow the redirect `code`.
	 *
	 * @param {Number} code
	 * @return {Boolean}
	 * @api private
	 */

	function isRedirect(code) {
	  return ~[301, 302, 303, 305, 307, 308].indexOf(code);
	}


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var tty = __webpack_require__(62);
	var util = __webpack_require__(63);

	/**
	 * This is the Node.js implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(64);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;

	/**
	 * Colors.
	 */

	exports.colors = [6, 2, 3, 4, 5, 1];

	/**
	 * The file descriptor to write the `debug()` calls to.
	 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
	 *
	 *   $ DEBUG_FD=3 node script.js 3>debug.log
	 */

	var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
	var stream = 1 === fd ? process.stdout :
	             2 === fd ? process.stderr :
	             createWritableStdioStream(fd);

	/**
	 * Is stdout a TTY? Colored output is enabled when `true`.
	 */

	function useColors() {
	  var debugColors = (process.env.DEBUG_COLORS || '').trim().toLowerCase();
	  if (0 === debugColors.length) {
	    return tty.isatty(fd);
	  } else {
	    return '0' !== debugColors
	        && 'no' !== debugColors
	        && 'false' !== debugColors
	        && 'disabled' !== debugColors;
	  }
	}

	/**
	 * Map %o to `util.inspect()`, since Node doesn't do that out of the box.
	 */

	var inspect = (4 === util.inspect.length ?
	  // node <= 0.8.x
	  function (v, colors) {
	    return util.inspect(v, void 0, void 0, colors);
	  } :
	  // node > 0.8.x
	  function (v, colors) {
	    return util.inspect(v, { colors: colors });
	  }
	);

	exports.formatters.o = function(v) {
	  return inspect(v, this.useColors)
	    .replace(/\s*\n\s*/g, ' ');
	};

	/**
	 * Adds ANSI color escape codes if enabled.
	 *
	 * @api public
	 */

	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;
	  var name = this.namespace;

	  if (useColors) {
	    var c = this.color;

	    args[0] = '  \u001b[3' + c + ';1m' + name + ' '
	      + '\u001b[0m'
	      + args[0] + '\u001b[3' + c + 'm'
	      + ' +' + exports.humanize(this.diff) + '\u001b[0m';
	  } else {
	    args[0] = new Date().toUTCString()
	      + ' ' + name + ' ' + args[0];
	  }
	  return args;
	}

	/**
	 * Invokes `console.error()` with the specified arguments.
	 */

	function log() {
	  return stream.write(util.format.apply(this, arguments) + '\n');
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  if (null == namespaces) {
	    // If you set a process.env field to null or undefined, it gets cast to the
	    // string 'null' or 'undefined'. Just delete instead.
	    delete process.env.DEBUG;
	  } else {
	    process.env.DEBUG = namespaces;
	  }
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  return process.env.DEBUG;
	}

	/**
	 * Copied from `node/src/node.js`.
	 *
	 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
	 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
	 */

	function createWritableStdioStream (fd) {
	  var stream;
	  var tty_wrap = process.binding('tty_wrap');

	  // Note stream._type is used for test-module-load-list.js

	  switch (tty_wrap.guessHandleType(fd)) {
	    case 'TTY':
	      stream = new tty.WriteStream(fd);
	      stream._type = 'tty';

	      // Hack to have stream not keep the event loop alive.
	      // See https://github.com/joyent/node/issues/1726
	      if (stream._handle && stream._handle.unref) {
	        stream._handle.unref();
	      }
	      break;

	    case 'FILE':
	      var fs = __webpack_require__(66);
	      stream = new fs.SyncWriteStream(fd, { autoClose: false });
	      stream._type = 'fs';
	      break;

	    case 'PIPE':
	    case 'TCP':
	      var net = __webpack_require__(3);
	      stream = new net.Socket({
	        fd: fd,
	        readable: false,
	        writable: true
	      });

	      // FIXME Should probably have an option in net.Socket to create a
	      // stream from an existing fd which is writable only. But for now
	      // we'll just add this hack and set the `readable` member to false.
	      // Test: ./node test/fixtures/echo.js < /etc/passwd
	      stream.readable = false;
	      stream.read = null;
	      stream._type = 'pipe';

	      // FIXME Hack to have stream not keep the event loop alive.
	      // See https://github.com/joyent/node/issues/1726
	      if (stream._handle && stream._handle.unref) {
	        stream._handle.unref();
	      }
	      break;

	    default:
	      // Probably an error on in uv_guess_handle()
	      throw new Error('Implement me. Unknown stream file type!');
	  }

	  // For supporting legacy API we put the FD here.
	  stream.fd = fd;

	  stream._isStdio = true;

	  return stream;
	}

	/**
	 * Enable namespaces listed in `process.env.DEBUG` initially.
	 */

	exports.enable(load());


/***/ },
/* 62 */
/***/ function(module, exports) {

	module.exports = require("tty");

/***/ },
/* 63 */
/***/ function(module, exports) {

	module.exports = require("util");

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(65);

	/**
	 * The currently active debug mode names, and names to skip.
	 */

	exports.names = [];
	exports.skips = [];

	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */

	exports.formatters = {};

	/**
	 * Previously assigned color.
	 */

	var prevColor = 0;

	/**
	 * Previous log timestamp.
	 */

	var prevTime;

	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */

	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}

	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */

	function debug(namespace) {

	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;

	  // define the `enabled` version
	  function enabled() {

	    var self = enabled;

	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;

	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();

	    var args = Array.prototype.slice.call(arguments);

	    args[0] = exports.coerce(args[0]);

	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }

	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);

	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });

	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;

	  var fn = exports.enabled(namespace) ? enabled : disabled;

	  fn.namespace = namespace;

	  return fn;
	}

	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */

	function enable(namespaces) {
	  exports.save(namespaces);

	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;

	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	function disable() {
	  exports.enable('');
	}

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 65 */
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */

	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = '' + str;
	  if (str.length > 10000) return;
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ },
/* 66 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var IncomingForm = __webpack_require__(68).IncomingForm;
	IncomingForm.IncomingForm = IncomingForm;
	module.exports = IncomingForm;


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	if (false) require = GENTLY.hijack(require);

	var crypto = __webpack_require__(69);
	var fs = __webpack_require__(66);
	var util = __webpack_require__(63),
	    path = __webpack_require__(70),
	    File = __webpack_require__(71),
	    MultipartParser = __webpack_require__(72).MultipartParser,
	    QuerystringParser = __webpack_require__(74).QuerystringParser,
	    OctetParser       = __webpack_require__(76).OctetParser,
	    JSONParser = __webpack_require__(77).JSONParser,
	    StringDecoder = __webpack_require__(78).StringDecoder,
	    EventEmitter = __webpack_require__(9).EventEmitter,
	    Stream = __webpack_require__(11).Stream,
	    os = __webpack_require__(79);

	function IncomingForm(opts) {
	  if (!(this instanceof IncomingForm)) return new IncomingForm(opts);
	  EventEmitter.call(this);

	  opts=opts||{};

	  this.error = null;
	  this.ended = false;

	  this.maxFields = opts.maxFields || 1000;
	  this.maxFieldsSize = opts.maxFieldsSize || 2 * 1024 * 1024;
	  this.keepExtensions = opts.keepExtensions || false;
	  this.uploadDir = opts.uploadDir || os.tmpDir();
	  this.encoding = opts.encoding || 'utf-8';
	  this.headers = null;
	  this.type = null;
	  this.hash = opts.hash || false;
	  this.multiples = opts.multiples || false;

	  this.bytesReceived = null;
	  this.bytesExpected = null;

	  this._parser = null;
	  this._flushing = 0;
	  this._fieldsSize = 0;
	  this.openedFiles = [];

	  return this;
	}
	util.inherits(IncomingForm, EventEmitter);
	exports.IncomingForm = IncomingForm;

	IncomingForm.prototype.parse = function(req, cb) {
	  this.pause = function() {
	    try {
	      req.pause();
	    } catch (err) {
	      // the stream was destroyed
	      if (!this.ended) {
	        // before it was completed, crash & burn
	        this._error(err);
	      }
	      return false;
	    }
	    return true;
	  };

	  this.resume = function() {
	    try {
	      req.resume();
	    } catch (err) {
	      // the stream was destroyed
	      if (!this.ended) {
	        // before it was completed, crash & burn
	        this._error(err);
	      }
	      return false;
	    }

	    return true;
	  };

	  // Setup callback first, so we don't miss anything from data events emitted
	  // immediately.
	  if (cb) {
	    var fields = {}, files = {};
	    this
	      .on('field', function(name, value) {
	        fields[name] = value;
	      })
	      .on('file', function(name, file) {
	        if (this.multiples) {
	          if (files[name]) {
	            if (!Array.isArray(files[name])) {
	              files[name] = [files[name]];
	            }
	            files[name].push(file);
	          } else {
	            files[name] = file;
	          }
	        } else {
	          files[name] = file;
	        }
	      })
	      .on('error', function(err) {
	        cb(err, fields, files);
	      })
	      .on('end', function() {
	        cb(null, fields, files);
	      });
	  }

	  // Parse headers and setup the parser, ready to start listening for data.
	  this.writeHeaders(req.headers);

	  // Start listening for data.
	  var self = this;
	  req
	    .on('error', function(err) {
	      self._error(err);
	    })
	    .on('aborted', function() {
	      self.emit('aborted');
	      self._error(new Error('Request aborted'));
	    })
	    .on('data', function(buffer) {
	      self.write(buffer);
	    })
	    .on('end', function() {
	      if (self.error) {
	        return;
	      }

	      var err = self._parser.end();
	      if (err) {
	        self._error(err);
	      }
	    });

	  return this;
	};

	IncomingForm.prototype.writeHeaders = function(headers) {
	  this.headers = headers;
	  this._parseContentLength();
	  this._parseContentType();
	};

	IncomingForm.prototype.write = function(buffer) {
	  if (this.error) {
	    return;
	  }
	  if (!this._parser) {
	    this._error(new Error('uninitialized parser'));
	    return;
	  }

	  this.bytesReceived += buffer.length;
	  this.emit('progress', this.bytesReceived, this.bytesExpected);

	  var bytesParsed = this._parser.write(buffer);
	  if (bytesParsed !== buffer.length) {
	    this._error(new Error('parser error, '+bytesParsed+' of '+buffer.length+' bytes parsed'));
	  }

	  return bytesParsed;
	};

	IncomingForm.prototype.pause = function() {
	  // this does nothing, unless overwritten in IncomingForm.parse
	  return false;
	};

	IncomingForm.prototype.resume = function() {
	  // this does nothing, unless overwritten in IncomingForm.parse
	  return false;
	};

	IncomingForm.prototype.onPart = function(part) {
	  // this method can be overwritten by the user
	  this.handlePart(part);
	};

	IncomingForm.prototype.handlePart = function(part) {
	  var self = this;

	  if (part.filename === undefined) {
	    var value = ''
	      , decoder = new StringDecoder(this.encoding);

	    part.on('data', function(buffer) {
	      self._fieldsSize += buffer.length;
	      if (self._fieldsSize > self.maxFieldsSize) {
	        self._error(new Error('maxFieldsSize exceeded, received '+self._fieldsSize+' bytes of field data'));
	        return;
	      }
	      value += decoder.write(buffer);
	    });

	    part.on('end', function() {
	      self.emit('field', part.name, value);
	    });
	    return;
	  }

	  this._flushing++;

	  var file = new File({
	    path: this._uploadPath(part.filename),
	    name: part.filename,
	    type: part.mime,
	    hash: self.hash
	  });

	  this.emit('fileBegin', part.name, file);

	  file.open();
	  this.openedFiles.push(file);

	  part.on('data', function(buffer) {
	    if (buffer.length == 0) {
	      return;
	    }
	    self.pause();
	    file.write(buffer, function() {
	      self.resume();
	    });
	  });

	  part.on('end', function() {
	    file.end(function() {
	      self._flushing--;
	      self.emit('file', part.name, file);
	      self._maybeEnd();
	    });
	  });
	};

	function dummyParser(self) {
	  return {
	    end: function () {
	      self.ended = true;
	      self._maybeEnd();
	      return null;
	    }
	  };
	}

	IncomingForm.prototype._parseContentType = function() {
	  if (this.bytesExpected === 0) {
	    this._parser = dummyParser(this);
	    return;
	  }

	  if (!this.headers['content-type']) {
	    this._error(new Error('bad content-type header, no content-type'));
	    return;
	  }

	  if (this.headers['content-type'].match(/octet-stream/i)) {
	    this._initOctetStream();
	    return;
	  }

	  if (this.headers['content-type'].match(/urlencoded/i)) {
	    this._initUrlencoded();
	    return;
	  }

	  if (this.headers['content-type'].match(/multipart/i)) {
	    var m = this.headers['content-type'].match(/boundary=(?:"([^"]+)"|([^;]+))/i);
	    if (m) {
	      this._initMultipart(m[1] || m[2]);
	    } else {
	      this._error(new Error('bad content-type header, no multipart boundary'));
	    }
	    return;
	  }

	  if (this.headers['content-type'].match(/json/i)) {
	    this._initJSONencoded();
	    return;
	  }

	  this._error(new Error('bad content-type header, unknown content-type: '+this.headers['content-type']));
	};

	IncomingForm.prototype._error = function(err) {
	  if (this.error || this.ended) {
	    return;
	  }

	  this.error = err;
	  this.emit('error', err);

	  if (Array.isArray(this.openedFiles)) {
	    this.openedFiles.forEach(function(file) {
	      file._writeStream.destroy();
	      setTimeout(fs.unlink, 0, file.path, function(error) { });
	    });
	  }
	};

	IncomingForm.prototype._parseContentLength = function() {
	  this.bytesReceived = 0;
	  if (this.headers['content-length']) {
	    this.bytesExpected = parseInt(this.headers['content-length'], 10);
	  } else if (this.headers['transfer-encoding'] === undefined) {
	    this.bytesExpected = 0;
	  }

	  if (this.bytesExpected !== null) {
	    this.emit('progress', this.bytesReceived, this.bytesExpected);
	  }
	};

	IncomingForm.prototype._newParser = function() {
	  return new MultipartParser();
	};

	IncomingForm.prototype._initMultipart = function(boundary) {
	  this.type = 'multipart';

	  var parser = new MultipartParser(),
	      self = this,
	      headerField,
	      headerValue,
	      part;

	  parser.initWithBoundary(boundary);

	  parser.onPartBegin = function() {
	    part = new Stream();
	    part.readable = true;
	    part.headers = {};
	    part.name = null;
	    part.filename = null;
	    part.mime = null;

	    part.transferEncoding = 'binary';
	    part.transferBuffer = '';

	    headerField = '';
	    headerValue = '';
	  };

	  parser.onHeaderField = function(b, start, end) {
	    headerField += b.toString(self.encoding, start, end);
	  };

	  parser.onHeaderValue = function(b, start, end) {
	    headerValue += b.toString(self.encoding, start, end);
	  };

	  parser.onHeaderEnd = function() {
	    headerField = headerField.toLowerCase();
	    part.headers[headerField] = headerValue;

	    var m = headerValue.match(/\bname="([^"]+)"/i);
	    if (headerField == 'content-disposition') {
	      if (m) {
	        part.name = m[1];
	      }

	      part.filename = self._fileName(headerValue);
	    } else if (headerField == 'content-type') {
	      part.mime = headerValue;
	    } else if (headerField == 'content-transfer-encoding') {
	      part.transferEncoding = headerValue.toLowerCase();
	    }

	    headerField = '';
	    headerValue = '';
	  };

	  parser.onHeadersEnd = function() {
	    switch(part.transferEncoding){
	      case 'binary':
	      case '7bit':
	      case '8bit':
	      parser.onPartData = function(b, start, end) {
	        part.emit('data', b.slice(start, end));
	      };

	      parser.onPartEnd = function() {
	        part.emit('end');
	      };
	      break;

	      case 'base64':
	      parser.onPartData = function(b, start, end) {
	        part.transferBuffer += b.slice(start, end).toString('ascii');

	        /*
	        four bytes (chars) in base64 converts to three bytes in binary
	        encoding. So we should always work with a number of bytes that
	        can be divided by 4, it will result in a number of buytes that
	        can be divided vy 3.
	        */
	        var offset = parseInt(part.transferBuffer.length / 4, 10) * 4;
	        part.emit('data', new Buffer(part.transferBuffer.substring(0, offset), 'base64'));
	        part.transferBuffer = part.transferBuffer.substring(offset);
	      };

	      parser.onPartEnd = function() {
	        part.emit('data', new Buffer(part.transferBuffer, 'base64'));
	        part.emit('end');
	      };
	      break;

	      default:
	      return self._error(new Error('unknown transfer-encoding'));
	    }

	    self.onPart(part);
	  };


	  parser.onEnd = function() {
	    self.ended = true;
	    self._maybeEnd();
	  };

	  this._parser = parser;
	};

	IncomingForm.prototype._fileName = function(headerValue) {
	  var m = headerValue.match(/\bfilename="(.*?)"($|; )/i);
	  if (!m) return;

	  var filename = m[1].substr(m[1].lastIndexOf('\\') + 1);
	  filename = filename.replace(/%22/g, '"');
	  filename = filename.replace(/&#([\d]{4});/g, function(m, code) {
	    return String.fromCharCode(code);
	  });
	  return filename;
	};

	IncomingForm.prototype._initUrlencoded = function() {
	  this.type = 'urlencoded';

	  var parser = new QuerystringParser(this.maxFields)
	    , self = this;

	  parser.onField = function(key, val) {
	    self.emit('field', key, val);
	  };

	  parser.onEnd = function() {
	    self.ended = true;
	    self._maybeEnd();
	  };

	  this._parser = parser;
	};

	IncomingForm.prototype._initOctetStream = function() {
	  this.type = 'octet-stream';
	  var filename = this.headers['x-file-name'];
	  var mime = this.headers['content-type'];

	  var file = new File({
	    path: this._uploadPath(filename),
	    name: filename,
	    type: mime
	  });

	  this.emit('fileBegin', filename, file);
	  file.open();

	  this._flushing++;

	  var self = this;

	  self._parser = new OctetParser();

	  //Keep track of writes that haven't finished so we don't emit the file before it's done being written
	  var outstandingWrites = 0;

	  self._parser.on('data', function(buffer){
	    self.pause();
	    outstandingWrites++;

	    file.write(buffer, function() {
	      outstandingWrites--;
	      self.resume();

	      if(self.ended){
	        self._parser.emit('doneWritingFile');
	      }
	    });
	  });

	  self._parser.on('end', function(){
	    self._flushing--;
	    self.ended = true;

	    var done = function(){
	      file.end(function() {
	        self.emit('file', 'file', file);
	        self._maybeEnd();
	      });
	    };

	    if(outstandingWrites === 0){
	      done();
	    } else {
	      self._parser.once('doneWritingFile', done);
	    }
	  });
	};

	IncomingForm.prototype._initJSONencoded = function() {
	  this.type = 'json';

	  var parser = new JSONParser()
	    , self = this;

	  if (this.bytesExpected) {
	    parser.initWithLength(this.bytesExpected);
	  }

	  parser.onField = function(key, val) {
	    self.emit('field', key, val);
	  };

	  parser.onEnd = function() {
	    self.ended = true;
	    self._maybeEnd();
	  };

	  this._parser = parser;
	};

	IncomingForm.prototype._uploadPath = function(filename) {
	  var name = 'upload_';
	  var buf = crypto.randomBytes(16);
	  for (var i = 0; i < buf.length; ++i) {
	    name += ('0' + buf[i].toString(16)).slice(-2);
	  }

	  if (this.keepExtensions) {
	    var ext = path.extname(filename);
	    ext     = ext.replace(/(\.[a-z0-9]+).*/i, '$1');

	    name += ext;
	  }

	  return path.join(this.uploadDir, name);
	};

	IncomingForm.prototype._maybeEnd = function() {
	  if (!this.ended || this._flushing || this.error) {
	    return;
	  }

	  this.emit('end');
	};



/***/ },
/* 69 */
/***/ function(module, exports) {

	module.exports = require("crypto");

/***/ },
/* 70 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	if (false) require = GENTLY.hijack(require);

	var util = __webpack_require__(63),
	    WriteStream = __webpack_require__(66).WriteStream,
	    EventEmitter = __webpack_require__(9).EventEmitter,
	    crypto = __webpack_require__(69);

	function File(properties) {
	  EventEmitter.call(this);

	  this.size = 0;
	  this.path = null;
	  this.name = null;
	  this.type = null;
	  this.hash = null;
	  this.lastModifiedDate = null;

	  this._writeStream = null;
	  
	  for (var key in properties) {
	    this[key] = properties[key];
	  }

	  if(typeof this.hash === 'string') {
	    this.hash = crypto.createHash(properties.hash);
	  } else {
	    this.hash = null;
	  }
	}
	module.exports = File;
	util.inherits(File, EventEmitter);

	File.prototype.open = function() {
	  this._writeStream = new WriteStream(this.path);
	};

	File.prototype.toJSON = function() {
	  return {
	    size: this.size,
	    path: this.path,
	    name: this.name,
	    type: this.type,
	    mtime: this.lastModifiedDate,
	    length: this.length,
	    filename: this.filename,
	    mime: this.mime
	  };
	};

	File.prototype.write = function(buffer, cb) {
	  var self = this;
	  if (self.hash) {
	    self.hash.update(buffer);
	  }
	  this._writeStream.write(buffer, function() {
	    self.lastModifiedDate = new Date();
	    self.size += buffer.length;
	    self.emit('progress', self.size);
	    cb();
	  });
	};

	File.prototype.end = function(cb) {
	  var self = this;
	  if (self.hash) {
	    self.hash = self.hash.digest('hex');
	  }
	  this._writeStream.end(function() {
	    self.emit('end');
	    cb();
	  });
	};


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	var Buffer = __webpack_require__(73).Buffer,
	    s = 0,
	    S =
	    { PARSER_UNINITIALIZED: s++,
	      START: s++,
	      START_BOUNDARY: s++,
	      HEADER_FIELD_START: s++,
	      HEADER_FIELD: s++,
	      HEADER_VALUE_START: s++,
	      HEADER_VALUE: s++,
	      HEADER_VALUE_ALMOST_DONE: s++,
	      HEADERS_ALMOST_DONE: s++,
	      PART_DATA_START: s++,
	      PART_DATA: s++,
	      PART_END: s++,
	      END: s++
	    },

	    f = 1,
	    F =
	    { PART_BOUNDARY: f,
	      LAST_BOUNDARY: f *= 2
	    },

	    LF = 10,
	    CR = 13,
	    SPACE = 32,
	    HYPHEN = 45,
	    COLON = 58,
	    A = 97,
	    Z = 122,

	    lower = function(c) {
	      return c | 0x20;
	    };

	for (s in S) {
	  exports[s] = S[s];
	}

	function MultipartParser() {
	  this.boundary = null;
	  this.boundaryChars = null;
	  this.lookbehind = null;
	  this.state = S.PARSER_UNINITIALIZED;

	  this.index = null;
	  this.flags = 0;
	}
	exports.MultipartParser = MultipartParser;

	MultipartParser.stateToString = function(stateNumber) {
	  for (var state in S) {
	    var number = S[state];
	    if (number === stateNumber) return state;
	  }
	};

	MultipartParser.prototype.initWithBoundary = function(str) {
	  this.boundary = new Buffer(str.length+4);
	  this.boundary.write('\r\n--', 0);
	  this.boundary.write(str, 4);
	  this.lookbehind = new Buffer(this.boundary.length+8);
	  this.state = S.START;

	  this.boundaryChars = {};
	  for (var i = 0; i < this.boundary.length; i++) {
	    this.boundaryChars[this.boundary[i]] = true;
	  }
	};

	MultipartParser.prototype.write = function(buffer) {
	  var self = this,
	      i = 0,
	      len = buffer.length,
	      prevIndex = this.index,
	      index = this.index,
	      state = this.state,
	      flags = this.flags,
	      lookbehind = this.lookbehind,
	      boundary = this.boundary,
	      boundaryChars = this.boundaryChars,
	      boundaryLength = this.boundary.length,
	      boundaryEnd = boundaryLength - 1,
	      bufferLength = buffer.length,
	      c,
	      cl,

	      mark = function(name) {
	        self[name+'Mark'] = i;
	      },
	      clear = function(name) {
	        delete self[name+'Mark'];
	      },
	      callback = function(name, buffer, start, end) {
	        if (start !== undefined && start === end) {
	          return;
	        }

	        var callbackSymbol = 'on'+name.substr(0, 1).toUpperCase()+name.substr(1);
	        if (callbackSymbol in self) {
	          self[callbackSymbol](buffer, start, end);
	        }
	      },
	      dataCallback = function(name, clear) {
	        var markSymbol = name+'Mark';
	        if (!(markSymbol in self)) {
	          return;
	        }

	        if (!clear) {
	          callback(name, buffer, self[markSymbol], buffer.length);
	          self[markSymbol] = 0;
	        } else {
	          callback(name, buffer, self[markSymbol], i);
	          delete self[markSymbol];
	        }
	      };

	  for (i = 0; i < len; i++) {
	    c = buffer[i];
	    switch (state) {
	      case S.PARSER_UNINITIALIZED:
	        return i;
	      case S.START:
	        index = 0;
	        state = S.START_BOUNDARY;
	      case S.START_BOUNDARY:
	        if (index == boundary.length - 2) {
	          if (c == HYPHEN) {
	            flags |= F.LAST_BOUNDARY;
	          } else if (c != CR) {
	            return i;
	          }
	          index++;
	          break;
	        } else if (index - 1 == boundary.length - 2) {
	          if (flags & F.LAST_BOUNDARY && c == HYPHEN){
	            callback('end');
	            state = S.END;
	            flags = 0;
	          } else if (!(flags & F.LAST_BOUNDARY) && c == LF) {
	            index = 0;
	            callback('partBegin');
	            state = S.HEADER_FIELD_START;
	          } else {
	            return i;
	          }
	          break;
	        }

	        if (c != boundary[index+2]) {
	          index = -2;
	        }
	        if (c == boundary[index+2]) {
	          index++;
	        }
	        break;
	      case S.HEADER_FIELD_START:
	        state = S.HEADER_FIELD;
	        mark('headerField');
	        index = 0;
	      case S.HEADER_FIELD:
	        if (c == CR) {
	          clear('headerField');
	          state = S.HEADERS_ALMOST_DONE;
	          break;
	        }

	        index++;
	        if (c == HYPHEN) {
	          break;
	        }

	        if (c == COLON) {
	          if (index == 1) {
	            // empty header field
	            return i;
	          }
	          dataCallback('headerField', true);
	          state = S.HEADER_VALUE_START;
	          break;
	        }

	        cl = lower(c);
	        if (cl < A || cl > Z) {
	          return i;
	        }
	        break;
	      case S.HEADER_VALUE_START:
	        if (c == SPACE) {
	          break;
	        }

	        mark('headerValue');
	        state = S.HEADER_VALUE;
	      case S.HEADER_VALUE:
	        if (c == CR) {
	          dataCallback('headerValue', true);
	          callback('headerEnd');
	          state = S.HEADER_VALUE_ALMOST_DONE;
	        }
	        break;
	      case S.HEADER_VALUE_ALMOST_DONE:
	        if (c != LF) {
	          return i;
	        }
	        state = S.HEADER_FIELD_START;
	        break;
	      case S.HEADERS_ALMOST_DONE:
	        if (c != LF) {
	          return i;
	        }

	        callback('headersEnd');
	        state = S.PART_DATA_START;
	        break;
	      case S.PART_DATA_START:
	        state = S.PART_DATA;
	        mark('partData');
	      case S.PART_DATA:
	        prevIndex = index;

	        if (index === 0) {
	          // boyer-moore derrived algorithm to safely skip non-boundary data
	          i += boundaryEnd;
	          while (i < bufferLength && !(buffer[i] in boundaryChars)) {
	            i += boundaryLength;
	          }
	          i -= boundaryEnd;
	          c = buffer[i];
	        }

	        if (index < boundary.length) {
	          if (boundary[index] == c) {
	            if (index === 0) {
	              dataCallback('partData', true);
	            }
	            index++;
	          } else {
	            index = 0;
	          }
	        } else if (index == boundary.length) {
	          index++;
	          if (c == CR) {
	            // CR = part boundary
	            flags |= F.PART_BOUNDARY;
	          } else if (c == HYPHEN) {
	            // HYPHEN = end boundary
	            flags |= F.LAST_BOUNDARY;
	          } else {
	            index = 0;
	          }
	        } else if (index - 1 == boundary.length)  {
	          if (flags & F.PART_BOUNDARY) {
	            index = 0;
	            if (c == LF) {
	              // unset the PART_BOUNDARY flag
	              flags &= ~F.PART_BOUNDARY;
	              callback('partEnd');
	              callback('partBegin');
	              state = S.HEADER_FIELD_START;
	              break;
	            }
	          } else if (flags & F.LAST_BOUNDARY) {
	            if (c == HYPHEN) {
	              callback('partEnd');
	              callback('end');
	              state = S.END;
	              flags = 0;
	            } else {
	              index = 0;
	            }
	          } else {
	            index = 0;
	          }
	        }

	        if (index > 0) {
	          // when matching a possible boundary, keep a lookbehind reference
	          // in case it turns out to be a false lead
	          lookbehind[index-1] = c;
	        } else if (prevIndex > 0) {
	          // if our boundary turned out to be rubbish, the captured lookbehind
	          // belongs to partData
	          callback('partData', lookbehind, 0, prevIndex);
	          prevIndex = 0;
	          mark('partData');

	          // reconsider the current character even so it interrupted the sequence
	          // it could be the beginning of a new sequence
	          i--;
	        }

	        break;
	      case S.END:
	        break;
	      default:
	        return i;
	    }
	  }

	  dataCallback('headerField');
	  dataCallback('headerValue');
	  dataCallback('partData');

	  this.index = index;
	  this.state = state;
	  this.flags = flags;

	  return len;
	};

	MultipartParser.prototype.end = function() {
	  var callback = function(self, name) {
	    var callbackSymbol = 'on'+name.substr(0, 1).toUpperCase()+name.substr(1);
	    if (callbackSymbol in self) {
	      self[callbackSymbol]();
	    }
	  };
	  if ((this.state == S.HEADER_FIELD_START && this.index === 0) ||
	      (this.state == S.PART_DATA && this.index == this.boundary.length)) {
	    callback(this, 'partEnd');
	    callback(this, 'end');
	  } else if (this.state != S.END) {
	    return new Error('MultipartParser.end(): stream ended unexpectedly: ' + this.explain());
	  }
	};

	MultipartParser.prototype.explain = function() {
	  return 'state = ' + MultipartParser.stateToString(this.state);
	};


/***/ },
/* 73 */
/***/ function(module, exports) {

	module.exports = require("buffer");

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	if (false) require = GENTLY.hijack(require);

	// This is a buffering parser, not quite as nice as the multipart one.
	// If I find time I'll rewrite this to be fully streaming as well
	var querystring = __webpack_require__(75);

	function QuerystringParser(maxKeys) {
	  this.maxKeys = maxKeys;
	  this.buffer = '';
	}
	exports.QuerystringParser = QuerystringParser;

	QuerystringParser.prototype.write = function(buffer) {
	  this.buffer += buffer.toString('ascii');
	  return buffer.length;
	};

	QuerystringParser.prototype.end = function() {
	  var fields = querystring.parse(this.buffer, '&', '=', { maxKeys: this.maxKeys });
	  for (var field in fields) {
	    this.onField(field, fields[field]);
	  }
	  this.buffer = '';

	  this.onEnd();
	};



/***/ },
/* 75 */
/***/ function(module, exports) {

	module.exports = require("querystring");

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var EventEmitter = __webpack_require__(9).EventEmitter
		, util = __webpack_require__(63);

	function OctetParser(options){
		if(!(this instanceof OctetParser)) return new OctetParser(options);
		EventEmitter.call(this);
	}

	util.inherits(OctetParser, EventEmitter);

	exports.OctetParser = OctetParser;

	OctetParser.prototype.write = function(buffer) {
	    this.emit('data', buffer);
		return buffer.length;
	};

	OctetParser.prototype.end = function() {
		this.emit('end');
	};


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	if (false) require = GENTLY.hijack(require);

	var Buffer = __webpack_require__(73).Buffer;

	function JSONParser() {
	  this.data = new Buffer('');
	  this.bytesWritten = 0;
	}
	exports.JSONParser = JSONParser;

	JSONParser.prototype.initWithLength = function(length) {
	  this.data = new Buffer(length);
	};

	JSONParser.prototype.write = function(buffer) {
	  if (this.data.length >= this.bytesWritten + buffer.length) {
	    buffer.copy(this.data, this.bytesWritten);
	  } else {
	    this.data = Buffer.concat([this.data, buffer]);
	  }
	  this.bytesWritten += buffer.length;
	  return buffer.length;
	};

	JSONParser.prototype.end = function() {
	  try {
	    var fields = JSON.parse(this.data.toString('utf8'));
	    for (var field in fields) {
	      this.onField(field, fields[field]);
	    }
	  } catch (e) {}
	  this.data = null;

	  this.onEnd();
	};


/***/ },
/* 78 */
/***/ function(module, exports) {

	module.exports = require("string_decoder");

/***/ },
/* 79 */
/***/ function(module, exports) {

	module.exports = require("os");

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	var CombinedStream = __webpack_require__(81);
	var util = __webpack_require__(63);
	var path = __webpack_require__(70);
	var http = __webpack_require__(5);
	var https = __webpack_require__(6);
	var parseUrl = __webpack_require__(13).parse;
	var fs = __webpack_require__(66);
	var mime = __webpack_require__(83);
	var async = __webpack_require__(86);

	module.exports = FormData;
	function FormData() {
	  this._overheadLength = 0;
	  this._valueLength = 0;
	  this._lengthRetrievers = [];

	  CombinedStream.call(this);
	}
	util.inherits(FormData, CombinedStream);

	FormData.LINE_BREAK = '\r\n';
	FormData.DEFAULT_CONTENT_TYPE = 'application/octet-stream';

	FormData.prototype.append = function(field, value, options) {
	  options = (typeof options === 'string')
	    ? { filename: options }
	    : options || {};

	  var append = CombinedStream.prototype.append.bind(this);

	  // all that streamy business can't handle numbers
	  if (typeof value == 'number') value = ''+value;

	  // https://github.com/felixge/node-form-data/issues/38
	  if (util.isArray(value)) {
	    // Please convert your array into string
	    // the way web server expects it
	    this._error(new Error('Arrays are not supported.'));
	    return;
	  }

	  var header = this._multiPartHeader(field, value, options);
	  var footer = this._multiPartFooter(field, value, options);

	  append(header);
	  append(value);
	  append(footer);

	  // pass along options.knownLength
	  this._trackLength(header, value, options);
	};

	FormData.prototype._trackLength = function(header, value, options) {
	  var valueLength = 0;

	  // used w/ getLengthSync(), when length is known.
	  // e.g. for streaming directly from a remote server,
	  // w/ a known file a size, and not wanting to wait for
	  // incoming file to finish to get its size.
	  if (options.knownLength != null) {
	    valueLength += +options.knownLength;
	  } else if (Buffer.isBuffer(value)) {
	    valueLength = value.length;
	  } else if (typeof value === 'string') {
	    valueLength = Buffer.byteLength(value);
	  }

	  this._valueLength += valueLength;

	  // @check why add CRLF? does this account for custom/multiple CRLFs?
	  this._overheadLength +=
	    Buffer.byteLength(header) +
	    FormData.LINE_BREAK.length;

	  // empty or either doesn't have path or not an http response
	  if (!value || ( !value.path && !(value.readable && value.hasOwnProperty('httpVersion')) )) {
	    return;
	  }

	  // no need to bother with the length
	  if (!options.knownLength)
	  this._lengthRetrievers.push(function(next) {

	    if (value.hasOwnProperty('fd')) {

	      // take read range into a account
	      // `end` = Infinity –> read file till the end
	      //
	      // TODO: Looks like there is bug in Node fs.createReadStream
	      // it doesn't respect `end` options without `start` options
	      // Fix it when node fixes it.
	      // https://github.com/joyent/node/issues/7819
	      if (value.end != undefined && value.end != Infinity && value.start != undefined) {

	        // when end specified
	        // no need to calculate range
	        // inclusive, starts with 0
	        next(null, value.end+1 - (value.start ? value.start : 0));

	      // not that fast snoopy
	      } else {
	        // still need to fetch file size from fs
	        fs.stat(value.path, function(err, stat) {

	          var fileSize;

	          if (err) {
	            next(err);
	            return;
	          }

	          // update final size based on the range options
	          fileSize = stat.size - (value.start ? value.start : 0);
	          next(null, fileSize);
	        });
	      }

	    // or http response
	    } else if (value.hasOwnProperty('httpVersion')) {
	      next(null, +value.headers['content-length']);

	    // or request stream http://github.com/mikeal/request
	    } else if (value.hasOwnProperty('httpModule')) {
	      // wait till response come back
	      value.on('response', function(response) {
	        value.pause();
	        next(null, +response.headers['content-length']);
	      });
	      value.resume();

	    // something else
	    } else {
	      next('Unknown stream');
	    }
	  });
	};

	FormData.prototype._multiPartHeader = function(field, value, options) {
	  // custom header specified (as string)?
	  // it becomes responsible for boundary
	  // (e.g. to handle extra CRLFs on .NET servers)
	  if (options.header != null) {
	    return options.header;
	  }

	  var contents = '';
	  var headers  = {
	    'Content-Disposition': ['form-data', 'name="' + field + '"'],
	    'Content-Type': []
	  };

	  // fs- and request- streams have path property
	  // or use custom filename and/or contentType
	  // TODO: Use request's response mime-type
	  if (options.filename || value.path) {
	    headers['Content-Disposition'].push(
	      'filename="' + path.basename(options.filename || value.path) + '"'
	    );
	    headers['Content-Type'].push(
	      options.contentType ||
	      mime.lookup(options.filename || value.path) ||
	      FormData.DEFAULT_CONTENT_TYPE
	    );
	  // http response has not
	  } else if (value.readable && value.hasOwnProperty('httpVersion')) {
	    headers['Content-Disposition'].push(
	      'filename="' + path.basename(value.client._httpMessage.path) + '"'
	    );
	    headers['Content-Type'].push(
	      options.contentType ||
	      value.headers['content-type'] ||
	      FormData.DEFAULT_CONTENT_TYPE
	    );
	  } else if (Buffer.isBuffer(value)) {
	    headers['Content-Type'].push(
	      options.contentType ||
	      FormData.DEFAULT_CONTENT_TYPE
	    );
	  } else if (options.contentType) {
	    headers['Content-Type'].push(options.contentType);
	  }

	  for (var prop in headers) {
	    if (headers[prop].length) {
	      contents += prop + ': ' + headers[prop].join('; ') + FormData.LINE_BREAK;
	    }
	  }
	  
	  return '--' + this.getBoundary() + FormData.LINE_BREAK + contents + FormData.LINE_BREAK;
	};

	FormData.prototype._multiPartFooter = function(field, value, options) {
	  return function(next) {
	    var footer = FormData.LINE_BREAK;

	    var lastPart = (this._streams.length === 0);
	    if (lastPart) {
	      footer += this._lastBoundary();
	    }

	    next(footer);
	  }.bind(this);
	};

	FormData.prototype._lastBoundary = function() {
	  return '--' + this.getBoundary() + '--' + FormData.LINE_BREAK;
	};

	FormData.prototype.getHeaders = function(userHeaders) {
	  var formHeaders = {
	    'content-type': 'multipart/form-data; boundary=' + this.getBoundary()
	  };

	  for (var header in userHeaders) {
	    formHeaders[header.toLowerCase()] = userHeaders[header];
	  }

	  return formHeaders;
	}

	FormData.prototype.getCustomHeaders = function(contentType) {
	    contentType = contentType ? contentType : 'multipart/form-data';

	    var formHeaders = {
	        'content-type': contentType + '; boundary=' + this.getBoundary(),
	        'content-length': this.getLengthSync()
	    };

	    return formHeaders;
	}

	FormData.prototype.getBoundary = function() {
	  if (!this._boundary) {
	    this._generateBoundary();
	  }

	  return this._boundary;
	};

	FormData.prototype._generateBoundary = function() {
	  // This generates a 50 character boundary similar to those used by Firefox.
	  // They are optimized for boyer-moore parsing.
	  var boundary = '--------------------------';
	  for (var i = 0; i < 24; i++) {
	    boundary += Math.floor(Math.random() * 10).toString(16);
	  }

	  this._boundary = boundary;
	};

	// Note: getLengthSync DOESN'T calculate streams length
	// As workaround one can calculate file size manually
	// and add it as knownLength option
	FormData.prototype.getLengthSync = function(debug) {
	  var knownLength = this._overheadLength + this._valueLength;

	  // Don't get confused, there are 3 "internal" streams for each keyval pair
	  // so it basically checks if there is any value added to the form
	  if (this._streams.length) {
	    knownLength += this._lastBoundary().length;
	  }

	  // https://github.com/felixge/node-form-data/issues/40
	  if (this._lengthRetrievers.length) {
	    // Some async length retrivers are present
	    // therefore synchronous length calculation is false.
	    // Please use getLength(callback) to get proper length
	    this._error(new Error('Cannot calculate proper length in synchronous way.'));
	  }

	  return knownLength;
	};

	FormData.prototype.getLength = function(cb) {
	  var knownLength = this._overheadLength + this._valueLength;

	  if (this._streams.length) {
	    knownLength += this._lastBoundary().length;
	  }

	  if (!this._lengthRetrievers.length) {
	    process.nextTick(cb.bind(this, null, knownLength));
	    return;
	  }

	  async.parallel(this._lengthRetrievers, function(err, values) {
	    if (err) {
	      cb(err);
	      return;
	    }

	    values.forEach(function(length) {
	      knownLength += length;
	    });

	    cb(null, knownLength);
	  });
	};

	FormData.prototype.submit = function(params, cb) {

	  var request
	    , options
	    , defaults = {
	        method : 'post'
	    };

	  // parse provided url if it's string
	  // or treat it as options object
	  if (typeof params == 'string') {
	    params = parseUrl(params);

	    options = populate({
	      port: params.port,
	      path: params.pathname,
	      host: params.hostname
	    }, defaults);
	  }
	  else // use custom params
	  {
	    options = populate(params, defaults);
	    // if no port provided use default one
	    if (!options.port) {
	      options.port = options.protocol == 'https:' ? 443 : 80;
	    }
	  }

	  // put that good code in getHeaders to some use
	  options.headers = this.getHeaders(params.headers);

	  // https if specified, fallback to http in any other case
	  if (options.protocol == 'https:') {
	    request = https.request(options);
	  } else {
	    request = http.request(options);
	  }

	  // get content length and fire away
	  this.getLength(function(err, length) {

	    // TODO: Add chunked encoding when no length (if err)

	    // add content length
	    request.setHeader('Content-Length', length);

	    this.pipe(request);
	    if (cb) {
	      request.on('error', cb);
	      request.on('response', cb.bind(this, null));
	    }
	  }.bind(this));

	  return request;
	};

	FormData.prototype._error = function(err) {
	  if (this.error) return;

	  this.error = err;
	  this.pause();
	  this.emit('error', err);
	};

	/*
	 * Santa's little helpers
	 */

	// populates missing values
	function populate(dst, src) {
	  for (var prop in src) {
	    if (!dst[prop]) dst[prop] = src[prop];
	  }
	  return dst;
	}


/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(63);
	var Stream = __webpack_require__(11).Stream;
	var DelayedStream = __webpack_require__(82);

	module.exports = CombinedStream;
	function CombinedStream() {
	  this.writable = false;
	  this.readable = true;
	  this.dataSize = 0;
	  this.maxDataSize = 2 * 1024 * 1024;
	  this.pauseStreams = true;

	  this._released = false;
	  this._streams = [];
	  this._currentStream = null;
	}
	util.inherits(CombinedStream, Stream);

	CombinedStream.create = function(options) {
	  var combinedStream = new this();

	  options = options || {};
	  for (var option in options) {
	    combinedStream[option] = options[option];
	  }

	  return combinedStream;
	};

	CombinedStream.isStreamLike = function(stream) {
	  return (typeof stream !== 'function')
	    && (typeof stream !== 'string')
	    && (typeof stream !== 'boolean')
	    && (typeof stream !== 'number')
	    && (!Buffer.isBuffer(stream));
	};

	CombinedStream.prototype.append = function(stream) {
	  var isStreamLike = CombinedStream.isStreamLike(stream);

	  if (isStreamLike) {
	    if (!(stream instanceof DelayedStream)) {
	      var newStream = DelayedStream.create(stream, {
	        maxDataSize: Infinity,
	        pauseStream: this.pauseStreams,
	      });
	      stream.on('data', this._checkDataSize.bind(this));
	      stream = newStream;
	    }

	    this._handleErrors(stream);

	    if (this.pauseStreams) {
	      stream.pause();
	    }
	  }

	  this._streams.push(stream);
	  return this;
	};

	CombinedStream.prototype.pipe = function(dest, options) {
	  Stream.prototype.pipe.call(this, dest, options);
	  this.resume();
	  return dest;
	};

	CombinedStream.prototype._getNext = function() {
	  this._currentStream = null;
	  var stream = this._streams.shift();


	  if (typeof stream == 'undefined') {
	    this.end();
	    return;
	  }

	  if (typeof stream !== 'function') {
	    this._pipeNext(stream);
	    return;
	  }

	  var getStream = stream;
	  getStream(function(stream) {
	    var isStreamLike = CombinedStream.isStreamLike(stream);
	    if (isStreamLike) {
	      stream.on('data', this._checkDataSize.bind(this));
	      this._handleErrors(stream);
	    }

	    this._pipeNext(stream);
	  }.bind(this));
	};

	CombinedStream.prototype._pipeNext = function(stream) {
	  this._currentStream = stream;

	  var isStreamLike = CombinedStream.isStreamLike(stream);
	  if (isStreamLike) {
	    stream.on('end', this._getNext.bind(this));
	    stream.pipe(this, {end: false});
	    return;
	  }

	  var value = stream;
	  this.write(value);
	  this._getNext();
	};

	CombinedStream.prototype._handleErrors = function(stream) {
	  var self = this;
	  stream.on('error', function(err) {
	    self._emitError(err);
	  });
	};

	CombinedStream.prototype.write = function(data) {
	  this.emit('data', data);
	};

	CombinedStream.prototype.pause = function() {
	  if (!this.pauseStreams) {
	    return;
	  }

	  if(this.pauseStreams && this._currentStream && typeof(this._currentStream.pause) == 'function') this._currentStream.pause();
	  this.emit('pause');
	};

	CombinedStream.prototype.resume = function() {
	  if (!this._released) {
	    this._released = true;
	    this.writable = true;
	    this._getNext();
	  }

	  if(this.pauseStreams && this._currentStream && typeof(this._currentStream.resume) == 'function') this._currentStream.resume();
	  this.emit('resume');
	};

	CombinedStream.prototype.end = function() {
	  this._reset();
	  this.emit('end');
	};

	CombinedStream.prototype.destroy = function() {
	  this._reset();
	  this.emit('close');
	};

	CombinedStream.prototype._reset = function() {
	  this.writable = false;
	  this._streams = [];
	  this._currentStream = null;
	};

	CombinedStream.prototype._checkDataSize = function() {
	  this._updateDataSize();
	  if (this.dataSize <= this.maxDataSize) {
	    return;
	  }

	  var message =
	    'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.';
	  this._emitError(new Error(message));
	};

	CombinedStream.prototype._updateDataSize = function() {
	  this.dataSize = 0;

	  var self = this;
	  this._streams.forEach(function(stream) {
	    if (!stream.dataSize) {
	      return;
	    }

	    self.dataSize += stream.dataSize;
	  });

	  if (this._currentStream && this._currentStream.dataSize) {
	    this.dataSize += this._currentStream.dataSize;
	  }
	};

	CombinedStream.prototype._emitError = function(err) {
	  this._reset();
	  this.emit('error', err);
	};


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	var Stream = __webpack_require__(11).Stream;
	var util = __webpack_require__(63);

	module.exports = DelayedStream;
	function DelayedStream() {
	  this.source = null;
	  this.dataSize = 0;
	  this.maxDataSize = 1024 * 1024;
	  this.pauseStream = true;

	  this._maxDataSizeExceeded = false;
	  this._released = false;
	  this._bufferedEvents = [];
	}
	util.inherits(DelayedStream, Stream);

	DelayedStream.create = function(source, options) {
	  var delayedStream = new this();

	  options = options || {};
	  for (var option in options) {
	    delayedStream[option] = options[option];
	  }

	  delayedStream.source = source;

	  var realEmit = source.emit;
	  source.emit = function() {
	    delayedStream._handleEmit(arguments);
	    return realEmit.apply(source, arguments);
	  };

	  source.on('error', function() {});
	  if (delayedStream.pauseStream) {
	    source.pause();
	  }

	  return delayedStream;
	};

	Object.defineProperty(DelayedStream.prototype, 'readable', {
	  configurable: true,
	  enumerable: true,
	  get: function() {
	    return this.source.readable;
	  }
	});

	DelayedStream.prototype.setEncoding = function() {
	  return this.source.setEncoding.apply(this.source, arguments);
	};

	DelayedStream.prototype.resume = function() {
	  if (!this._released) {
	    this.release();
	  }

	  this.source.resume();
	};

	DelayedStream.prototype.pause = function() {
	  this.source.pause();
	};

	DelayedStream.prototype.release = function() {
	  this._released = true;

	  this._bufferedEvents.forEach(function(args) {
	    this.emit.apply(this, args);
	  }.bind(this));
	  this._bufferedEvents = [];
	};

	DelayedStream.prototype.pipe = function() {
	  var r = Stream.prototype.pipe.apply(this, arguments);
	  this.resume();
	  return r;
	};

	DelayedStream.prototype._handleEmit = function(args) {
	  if (this._released) {
	    this.emit.apply(this, args);
	    return;
	  }

	  if (args[0] === 'data') {
	    this.dataSize += args[1].length;
	    this._checkIfMaxDataSizeExceeded();
	  }

	  this._bufferedEvents.push(args);
	};

	DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
	  if (this._maxDataSizeExceeded) {
	    return;
	  }

	  if (this.dataSize <= this.maxDataSize) {
	    return;
	  }

	  this._maxDataSizeExceeded = true;
	  var message =
	    'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.'
	  this.emit('error', new Error(message));
	};


/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * mime-types
	 * Copyright(c) 2014 Jonathan Ong
	 * Copyright(c) 2015 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	'use strict'

	/**
	 * Module dependencies.
	 * @private
	 */

	var db = __webpack_require__(84)
	var extname = __webpack_require__(70).extname

	/**
	 * Module variables.
	 * @private
	 */

	var extractTypeRegExp = /^\s*([^;\s]*)(?:;|\s|$)/
	var textTypeRegExp = /^text\//i

	/**
	 * Module exports.
	 * @public
	 */

	exports.charset = charset
	exports.charsets = { lookup: charset }
	exports.contentType = contentType
	exports.extension = extension
	exports.extensions = Object.create(null)
	exports.lookup = lookup
	exports.types = Object.create(null)

	// Populate the extensions/types maps
	populateMaps(exports.extensions, exports.types)

	/**
	 * Get the default charset for a MIME type.
	 *
	 * @param {string} type
	 * @return {boolean|string}
	 */

	function charset(type) {
	  if (!type || typeof type !== 'string') {
	    return false
	  }

	  // TODO: use media-typer
	  var match = extractTypeRegExp.exec(type)
	  var mime = match && db[match[1].toLowerCase()]

	  if (mime && mime.charset) {
	    return mime.charset
	  }

	  // default text/* to utf-8
	  if (match && textTypeRegExp.test(match[1])) {
	    return 'UTF-8'
	  }

	  return false
	}

	/**
	 * Create a full Content-Type header given a MIME type or extension.
	 *
	 * @param {string} str
	 * @return {boolean|string}
	 */

	function contentType(str) {
	  // TODO: should this even be in this module?
	  if (!str || typeof str !== 'string') {
	    return false
	  }

	  var mime = str.indexOf('/') === -1
	    ? exports.lookup(str)
	    : str

	  if (!mime) {
	    return false
	  }

	  // TODO: use content-type or other module
	  if (mime.indexOf('charset') === -1) {
	    var charset = exports.charset(mime)
	    if (charset) mime += '; charset=' + charset.toLowerCase()
	  }

	  return mime
	}

	/**
	 * Get the default extension for a MIME type.
	 *
	 * @param {string} type
	 * @return {boolean|string}
	 */

	function extension(type) {
	  if (!type || typeof type !== 'string') {
	    return false
	  }

	  // TODO: use media-typer
	  var match = extractTypeRegExp.exec(type)

	  // get extensions
	  var exts = match && exports.extensions[match[1].toLowerCase()]

	  if (!exts || !exts.length) {
	    return false
	  }

	  return exts[0]
	}

	/**
	 * Lookup the MIME type for a file path/extension.
	 *
	 * @param {string} path
	 * @return {boolean|string}
	 */

	function lookup(path) {
	  if (!path || typeof path !== 'string') {
	    return false
	  }

	  // get the extension ("ext" or ".ext" or full path)
	  var extension = extname('x.' + path)
	    .toLowerCase()
	    .substr(1)

	  if (!extension) {
	    return false
	  }

	  return exports.types[extension] || false
	}

	/**
	 * Populate the extensions and types maps.
	 * @private
	 */

	function populateMaps(extensions, types) {
	  // source preference (least -> most)
	  var preference = ['nginx', 'apache', undefined, 'iana']

	  Object.keys(db).forEach(function forEachMimeType(type) {
	    var mime = db[type]
	    var exts = mime.extensions

	    if (!exts || !exts.length) {
	      return
	    }

	    // mime -> extensions
	    extensions[type] = exts

	    // extension -> mime
	    for (var i = 0; i < exts.length; i++) {
	      var extension = exts[i]

	      if (types[extension]) {
	        var from = preference.indexOf(db[types[extension]].source)
	        var to = preference.indexOf(mime.source)

	        if (types[extension] !== 'application/octet-stream'
	          && from > to || (from === to && types[extension].substr(0, 12) === 'application/')) {
	          // skip the remapping
	          continue
	        }
	      }

	      // set the extension -> mime
	      types[extension] = type
	    }
	  })
	}


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * mime-db
	 * Copyright(c) 2014 Jonathan Ong
	 * MIT Licensed
	 */

	/**
	 * Module exports.
	 */

	module.exports = __webpack_require__(85)


/***/ },
/* 85 */
/***/ function(module, exports) {

	module.exports = {
		"application/1d-interleaved-parityfec": {
			"source": "iana"
		},
		"application/3gpdash-qoe-report+xml": {
			"source": "iana"
		},
		"application/3gpp-ims+xml": {
			"source": "iana"
		},
		"application/a2l": {
			"source": "iana"
		},
		"application/activemessage": {
			"source": "iana"
		},
		"application/alto-costmap+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-costmapfilter+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-directory+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-endpointcost+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-endpointcostparams+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-endpointprop+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-endpointpropparams+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-error+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-networkmap+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-networkmapfilter+json": {
			"source": "iana",
			"compressible": true
		},
		"application/aml": {
			"source": "iana"
		},
		"application/andrew-inset": {
			"source": "iana",
			"extensions": [
				"ez"
			]
		},
		"application/applefile": {
			"source": "iana"
		},
		"application/applixware": {
			"source": "apache",
			"extensions": [
				"aw"
			]
		},
		"application/atf": {
			"source": "iana"
		},
		"application/atfx": {
			"source": "iana"
		},
		"application/atom+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"atom"
			]
		},
		"application/atomcat+xml": {
			"source": "iana",
			"extensions": [
				"atomcat"
			]
		},
		"application/atomdeleted+xml": {
			"source": "iana"
		},
		"application/atomicmail": {
			"source": "iana"
		},
		"application/atomsvc+xml": {
			"source": "iana",
			"extensions": [
				"atomsvc"
			]
		},
		"application/atxml": {
			"source": "iana"
		},
		"application/auth-policy+xml": {
			"source": "iana"
		},
		"application/bacnet-xdd+zip": {
			"source": "iana"
		},
		"application/batch-smtp": {
			"source": "iana"
		},
		"application/bdoc": {
			"compressible": false,
			"extensions": [
				"bdoc"
			]
		},
		"application/beep+xml": {
			"source": "iana"
		},
		"application/calendar+json": {
			"source": "iana",
			"compressible": true
		},
		"application/calendar+xml": {
			"source": "iana"
		},
		"application/call-completion": {
			"source": "iana"
		},
		"application/cals-1840": {
			"source": "iana"
		},
		"application/cbor": {
			"source": "iana"
		},
		"application/ccmp+xml": {
			"source": "iana"
		},
		"application/ccxml+xml": {
			"source": "iana",
			"extensions": [
				"ccxml"
			]
		},
		"application/cdfx+xml": {
			"source": "iana"
		},
		"application/cdmi-capability": {
			"source": "iana",
			"extensions": [
				"cdmia"
			]
		},
		"application/cdmi-container": {
			"source": "iana",
			"extensions": [
				"cdmic"
			]
		},
		"application/cdmi-domain": {
			"source": "iana",
			"extensions": [
				"cdmid"
			]
		},
		"application/cdmi-object": {
			"source": "iana",
			"extensions": [
				"cdmio"
			]
		},
		"application/cdmi-queue": {
			"source": "iana",
			"extensions": [
				"cdmiq"
			]
		},
		"application/cdni": {
			"source": "iana"
		},
		"application/cea": {
			"source": "iana"
		},
		"application/cea-2018+xml": {
			"source": "iana"
		},
		"application/cellml+xml": {
			"source": "iana"
		},
		"application/cfw": {
			"source": "iana"
		},
		"application/cms": {
			"source": "iana"
		},
		"application/cnrp+xml": {
			"source": "iana"
		},
		"application/coap-group+json": {
			"source": "iana",
			"compressible": true
		},
		"application/commonground": {
			"source": "iana"
		},
		"application/conference-info+xml": {
			"source": "iana"
		},
		"application/cpl+xml": {
			"source": "iana"
		},
		"application/csrattrs": {
			"source": "iana"
		},
		"application/csta+xml": {
			"source": "iana"
		},
		"application/cstadata+xml": {
			"source": "iana"
		},
		"application/csvm+json": {
			"source": "iana",
			"compressible": true
		},
		"application/cu-seeme": {
			"source": "apache",
			"extensions": [
				"cu"
			]
		},
		"application/cybercash": {
			"source": "iana"
		},
		"application/dart": {
			"compressible": true
		},
		"application/dash+xml": {
			"source": "iana",
			"extensions": [
				"mpd"
			]
		},
		"application/dashdelta": {
			"source": "iana"
		},
		"application/davmount+xml": {
			"source": "iana",
			"extensions": [
				"davmount"
			]
		},
		"application/dca-rft": {
			"source": "iana"
		},
		"application/dcd": {
			"source": "iana"
		},
		"application/dec-dx": {
			"source": "iana"
		},
		"application/dialog-info+xml": {
			"source": "iana"
		},
		"application/dicom": {
			"source": "iana"
		},
		"application/dii": {
			"source": "iana"
		},
		"application/dit": {
			"source": "iana"
		},
		"application/dns": {
			"source": "iana"
		},
		"application/docbook+xml": {
			"source": "apache",
			"extensions": [
				"dbk"
			]
		},
		"application/dskpp+xml": {
			"source": "iana"
		},
		"application/dssc+der": {
			"source": "iana",
			"extensions": [
				"dssc"
			]
		},
		"application/dssc+xml": {
			"source": "iana",
			"extensions": [
				"xdssc"
			]
		},
		"application/dvcs": {
			"source": "iana"
		},
		"application/ecmascript": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"ecma"
			]
		},
		"application/edi-consent": {
			"source": "iana"
		},
		"application/edi-x12": {
			"source": "iana",
			"compressible": false
		},
		"application/edifact": {
			"source": "iana",
			"compressible": false
		},
		"application/efi": {
			"source": "iana"
		},
		"application/emergencycalldata.comment+xml": {
			"source": "iana"
		},
		"application/emergencycalldata.deviceinfo+xml": {
			"source": "iana"
		},
		"application/emergencycalldata.providerinfo+xml": {
			"source": "iana"
		},
		"application/emergencycalldata.serviceinfo+xml": {
			"source": "iana"
		},
		"application/emergencycalldata.subscriberinfo+xml": {
			"source": "iana"
		},
		"application/emma+xml": {
			"source": "iana",
			"extensions": [
				"emma"
			]
		},
		"application/emotionml+xml": {
			"source": "iana"
		},
		"application/encaprtp": {
			"source": "iana"
		},
		"application/epp+xml": {
			"source": "iana"
		},
		"application/epub+zip": {
			"source": "iana",
			"extensions": [
				"epub"
			]
		},
		"application/eshop": {
			"source": "iana"
		},
		"application/exi": {
			"source": "iana",
			"extensions": [
				"exi"
			]
		},
		"application/fastinfoset": {
			"source": "iana"
		},
		"application/fastsoap": {
			"source": "iana"
		},
		"application/fdt+xml": {
			"source": "iana"
		},
		"application/fits": {
			"source": "iana"
		},
		"application/font-sfnt": {
			"source": "iana"
		},
		"application/font-tdpfr": {
			"source": "iana",
			"extensions": [
				"pfr"
			]
		},
		"application/font-woff": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"woff"
			]
		},
		"application/font-woff2": {
			"compressible": false,
			"extensions": [
				"woff2"
			]
		},
		"application/framework-attributes+xml": {
			"source": "iana"
		},
		"application/gml+xml": {
			"source": "apache",
			"extensions": [
				"gml"
			]
		},
		"application/gpx+xml": {
			"source": "apache",
			"extensions": [
				"gpx"
			]
		},
		"application/gxf": {
			"source": "apache",
			"extensions": [
				"gxf"
			]
		},
		"application/gzip": {
			"source": "iana",
			"compressible": false
		},
		"application/h224": {
			"source": "iana"
		},
		"application/held+xml": {
			"source": "iana"
		},
		"application/http": {
			"source": "iana"
		},
		"application/hyperstudio": {
			"source": "iana",
			"extensions": [
				"stk"
			]
		},
		"application/ibe-key-request+xml": {
			"source": "iana"
		},
		"application/ibe-pkg-reply+xml": {
			"source": "iana"
		},
		"application/ibe-pp-data": {
			"source": "iana"
		},
		"application/iges": {
			"source": "iana"
		},
		"application/im-iscomposing+xml": {
			"source": "iana"
		},
		"application/index": {
			"source": "iana"
		},
		"application/index.cmd": {
			"source": "iana"
		},
		"application/index.obj": {
			"source": "iana"
		},
		"application/index.response": {
			"source": "iana"
		},
		"application/index.vnd": {
			"source": "iana"
		},
		"application/inkml+xml": {
			"source": "iana",
			"extensions": [
				"ink",
				"inkml"
			]
		},
		"application/iotp": {
			"source": "iana"
		},
		"application/ipfix": {
			"source": "iana",
			"extensions": [
				"ipfix"
			]
		},
		"application/ipp": {
			"source": "iana"
		},
		"application/isup": {
			"source": "iana"
		},
		"application/its+xml": {
			"source": "iana"
		},
		"application/java-archive": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"jar",
				"war",
				"ear"
			]
		},
		"application/java-serialized-object": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"ser"
			]
		},
		"application/java-vm": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"class"
			]
		},
		"application/javascript": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": [
				"js"
			]
		},
		"application/jose": {
			"source": "iana"
		},
		"application/jose+json": {
			"source": "iana",
			"compressible": true
		},
		"application/jrd+json": {
			"source": "iana",
			"compressible": true
		},
		"application/json": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": [
				"json",
				"map"
			]
		},
		"application/json-patch+json": {
			"source": "iana",
			"compressible": true
		},
		"application/json-seq": {
			"source": "iana"
		},
		"application/json5": {
			"extensions": [
				"json5"
			]
		},
		"application/jsonml+json": {
			"source": "apache",
			"compressible": true,
			"extensions": [
				"jsonml"
			]
		},
		"application/jwk+json": {
			"source": "iana",
			"compressible": true
		},
		"application/jwk-set+json": {
			"source": "iana",
			"compressible": true
		},
		"application/jwt": {
			"source": "iana"
		},
		"application/kpml-request+xml": {
			"source": "iana"
		},
		"application/kpml-response+xml": {
			"source": "iana"
		},
		"application/ld+json": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"jsonld"
			]
		},
		"application/link-format": {
			"source": "iana"
		},
		"application/load-control+xml": {
			"source": "iana"
		},
		"application/lost+xml": {
			"source": "iana",
			"extensions": [
				"lostxml"
			]
		},
		"application/lostsync+xml": {
			"source": "iana"
		},
		"application/lxf": {
			"source": "iana"
		},
		"application/mac-binhex40": {
			"source": "iana",
			"extensions": [
				"hqx"
			]
		},
		"application/mac-compactpro": {
			"source": "apache",
			"extensions": [
				"cpt"
			]
		},
		"application/macwriteii": {
			"source": "iana"
		},
		"application/mads+xml": {
			"source": "iana",
			"extensions": [
				"mads"
			]
		},
		"application/manifest+json": {
			"charset": "UTF-8",
			"compressible": true,
			"extensions": [
				"webmanifest"
			]
		},
		"application/marc": {
			"source": "iana",
			"extensions": [
				"mrc"
			]
		},
		"application/marcxml+xml": {
			"source": "iana",
			"extensions": [
				"mrcx"
			]
		},
		"application/mathematica": {
			"source": "iana",
			"extensions": [
				"ma",
				"nb",
				"mb"
			]
		},
		"application/mathml+xml": {
			"source": "iana",
			"extensions": [
				"mathml"
			]
		},
		"application/mathml-content+xml": {
			"source": "iana"
		},
		"application/mathml-presentation+xml": {
			"source": "iana"
		},
		"application/mbms-associated-procedure-description+xml": {
			"source": "iana"
		},
		"application/mbms-deregister+xml": {
			"source": "iana"
		},
		"application/mbms-envelope+xml": {
			"source": "iana"
		},
		"application/mbms-msk+xml": {
			"source": "iana"
		},
		"application/mbms-msk-response+xml": {
			"source": "iana"
		},
		"application/mbms-protection-description+xml": {
			"source": "iana"
		},
		"application/mbms-reception-report+xml": {
			"source": "iana"
		},
		"application/mbms-register+xml": {
			"source": "iana"
		},
		"application/mbms-register-response+xml": {
			"source": "iana"
		},
		"application/mbms-schedule+xml": {
			"source": "iana"
		},
		"application/mbms-user-service-description+xml": {
			"source": "iana"
		},
		"application/mbox": {
			"source": "iana",
			"extensions": [
				"mbox"
			]
		},
		"application/media-policy-dataset+xml": {
			"source": "iana"
		},
		"application/media_control+xml": {
			"source": "iana"
		},
		"application/mediaservercontrol+xml": {
			"source": "iana",
			"extensions": [
				"mscml"
			]
		},
		"application/merge-patch+json": {
			"source": "iana",
			"compressible": true
		},
		"application/metalink+xml": {
			"source": "apache",
			"extensions": [
				"metalink"
			]
		},
		"application/metalink4+xml": {
			"source": "iana",
			"extensions": [
				"meta4"
			]
		},
		"application/mets+xml": {
			"source": "iana",
			"extensions": [
				"mets"
			]
		},
		"application/mf4": {
			"source": "iana"
		},
		"application/mikey": {
			"source": "iana"
		},
		"application/mods+xml": {
			"source": "iana",
			"extensions": [
				"mods"
			]
		},
		"application/moss-keys": {
			"source": "iana"
		},
		"application/moss-signature": {
			"source": "iana"
		},
		"application/mosskey-data": {
			"source": "iana"
		},
		"application/mosskey-request": {
			"source": "iana"
		},
		"application/mp21": {
			"source": "iana",
			"extensions": [
				"m21",
				"mp21"
			]
		},
		"application/mp4": {
			"source": "iana",
			"extensions": [
				"mp4s",
				"m4p"
			]
		},
		"application/mpeg4-generic": {
			"source": "iana"
		},
		"application/mpeg4-iod": {
			"source": "iana"
		},
		"application/mpeg4-iod-xmt": {
			"source": "iana"
		},
		"application/mrb-consumer+xml": {
			"source": "iana"
		},
		"application/mrb-publish+xml": {
			"source": "iana"
		},
		"application/msc-ivr+xml": {
			"source": "iana"
		},
		"application/msc-mixer+xml": {
			"source": "iana"
		},
		"application/msword": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"doc",
				"dot"
			]
		},
		"application/mxf": {
			"source": "iana",
			"extensions": [
				"mxf"
			]
		},
		"application/nasdata": {
			"source": "iana"
		},
		"application/news-checkgroups": {
			"source": "iana"
		},
		"application/news-groupinfo": {
			"source": "iana"
		},
		"application/news-transmission": {
			"source": "iana"
		},
		"application/nlsml+xml": {
			"source": "iana"
		},
		"application/nss": {
			"source": "iana"
		},
		"application/ocsp-request": {
			"source": "iana"
		},
		"application/ocsp-response": {
			"source": "iana"
		},
		"application/octet-stream": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"bin",
				"dms",
				"lrf",
				"mar",
				"so",
				"dist",
				"distz",
				"pkg",
				"bpk",
				"dump",
				"elc",
				"deploy",
				"exe",
				"dll",
				"deb",
				"dmg",
				"iso",
				"img",
				"msi",
				"msp",
				"msm",
				"buffer"
			]
		},
		"application/oda": {
			"source": "iana",
			"extensions": [
				"oda"
			]
		},
		"application/odx": {
			"source": "iana"
		},
		"application/oebps-package+xml": {
			"source": "iana",
			"extensions": [
				"opf"
			]
		},
		"application/ogg": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"ogx"
			]
		},
		"application/omdoc+xml": {
			"source": "apache",
			"extensions": [
				"omdoc"
			]
		},
		"application/onenote": {
			"source": "apache",
			"extensions": [
				"onetoc",
				"onetoc2",
				"onetmp",
				"onepkg"
			]
		},
		"application/oxps": {
			"source": "iana",
			"extensions": [
				"oxps"
			]
		},
		"application/p2p-overlay+xml": {
			"source": "iana"
		},
		"application/parityfec": {
			"source": "iana"
		},
		"application/patch-ops-error+xml": {
			"source": "iana",
			"extensions": [
				"xer"
			]
		},
		"application/pdf": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"pdf"
			]
		},
		"application/pdx": {
			"source": "iana"
		},
		"application/pgp-encrypted": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"pgp"
			]
		},
		"application/pgp-keys": {
			"source": "iana"
		},
		"application/pgp-signature": {
			"source": "iana",
			"extensions": [
				"asc",
				"sig"
			]
		},
		"application/pics-rules": {
			"source": "apache",
			"extensions": [
				"prf"
			]
		},
		"application/pidf+xml": {
			"source": "iana"
		},
		"application/pidf-diff+xml": {
			"source": "iana"
		},
		"application/pkcs10": {
			"source": "iana",
			"extensions": [
				"p10"
			]
		},
		"application/pkcs12": {
			"source": "iana"
		},
		"application/pkcs7-mime": {
			"source": "iana",
			"extensions": [
				"p7m",
				"p7c"
			]
		},
		"application/pkcs7-signature": {
			"source": "iana",
			"extensions": [
				"p7s"
			]
		},
		"application/pkcs8": {
			"source": "iana",
			"extensions": [
				"p8"
			]
		},
		"application/pkix-attr-cert": {
			"source": "iana",
			"extensions": [
				"ac"
			]
		},
		"application/pkix-cert": {
			"source": "iana",
			"extensions": [
				"cer"
			]
		},
		"application/pkix-crl": {
			"source": "iana",
			"extensions": [
				"crl"
			]
		},
		"application/pkix-pkipath": {
			"source": "iana",
			"extensions": [
				"pkipath"
			]
		},
		"application/pkixcmp": {
			"source": "iana",
			"extensions": [
				"pki"
			]
		},
		"application/pls+xml": {
			"source": "iana",
			"extensions": [
				"pls"
			]
		},
		"application/poc-settings+xml": {
			"source": "iana"
		},
		"application/postscript": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"ai",
				"eps",
				"ps"
			]
		},
		"application/ppsp-tracker+json": {
			"source": "iana",
			"compressible": true
		},
		"application/problem+json": {
			"source": "iana",
			"compressible": true
		},
		"application/problem+xml": {
			"source": "iana"
		},
		"application/provenance+xml": {
			"source": "iana"
		},
		"application/prs.alvestrand.titrax-sheet": {
			"source": "iana"
		},
		"application/prs.cww": {
			"source": "iana",
			"extensions": [
				"cww"
			]
		},
		"application/prs.hpub+zip": {
			"source": "iana"
		},
		"application/prs.nprend": {
			"source": "iana"
		},
		"application/prs.plucker": {
			"source": "iana"
		},
		"application/prs.rdf-xml-crypt": {
			"source": "iana"
		},
		"application/prs.xsf+xml": {
			"source": "iana"
		},
		"application/pskc+xml": {
			"source": "iana",
			"extensions": [
				"pskcxml"
			]
		},
		"application/qsig": {
			"source": "iana"
		},
		"application/raptorfec": {
			"source": "iana"
		},
		"application/rdap+json": {
			"source": "iana",
			"compressible": true
		},
		"application/rdf+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"rdf"
			]
		},
		"application/reginfo+xml": {
			"source": "iana",
			"extensions": [
				"rif"
			]
		},
		"application/relax-ng-compact-syntax": {
			"source": "iana",
			"extensions": [
				"rnc"
			]
		},
		"application/remote-printing": {
			"source": "iana"
		},
		"application/reputon+json": {
			"source": "iana",
			"compressible": true
		},
		"application/resource-lists+xml": {
			"source": "iana",
			"extensions": [
				"rl"
			]
		},
		"application/resource-lists-diff+xml": {
			"source": "iana",
			"extensions": [
				"rld"
			]
		},
		"application/rfc+xml": {
			"source": "iana"
		},
		"application/riscos": {
			"source": "iana"
		},
		"application/rlmi+xml": {
			"source": "iana"
		},
		"application/rls-services+xml": {
			"source": "iana",
			"extensions": [
				"rs"
			]
		},
		"application/rpki-ghostbusters": {
			"source": "iana",
			"extensions": [
				"gbr"
			]
		},
		"application/rpki-manifest": {
			"source": "iana",
			"extensions": [
				"mft"
			]
		},
		"application/rpki-roa": {
			"source": "iana",
			"extensions": [
				"roa"
			]
		},
		"application/rpki-updown": {
			"source": "iana"
		},
		"application/rsd+xml": {
			"source": "apache",
			"extensions": [
				"rsd"
			]
		},
		"application/rss+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": [
				"rss"
			]
		},
		"application/rtf": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"rtf"
			]
		},
		"application/rtploopback": {
			"source": "iana"
		},
		"application/rtx": {
			"source": "iana"
		},
		"application/samlassertion+xml": {
			"source": "iana"
		},
		"application/samlmetadata+xml": {
			"source": "iana"
		},
		"application/sbml+xml": {
			"source": "iana",
			"extensions": [
				"sbml"
			]
		},
		"application/scaip+xml": {
			"source": "iana"
		},
		"application/scim+json": {
			"source": "iana",
			"compressible": true
		},
		"application/scvp-cv-request": {
			"source": "iana",
			"extensions": [
				"scq"
			]
		},
		"application/scvp-cv-response": {
			"source": "iana",
			"extensions": [
				"scs"
			]
		},
		"application/scvp-vp-request": {
			"source": "iana",
			"extensions": [
				"spq"
			]
		},
		"application/scvp-vp-response": {
			"source": "iana",
			"extensions": [
				"spp"
			]
		},
		"application/sdp": {
			"source": "iana",
			"extensions": [
				"sdp"
			]
		},
		"application/sep+xml": {
			"source": "iana"
		},
		"application/sep-exi": {
			"source": "iana"
		},
		"application/session-info": {
			"source": "iana"
		},
		"application/set-payment": {
			"source": "iana"
		},
		"application/set-payment-initiation": {
			"source": "iana",
			"extensions": [
				"setpay"
			]
		},
		"application/set-registration": {
			"source": "iana"
		},
		"application/set-registration-initiation": {
			"source": "iana",
			"extensions": [
				"setreg"
			]
		},
		"application/sgml": {
			"source": "iana"
		},
		"application/sgml-open-catalog": {
			"source": "iana"
		},
		"application/shf+xml": {
			"source": "iana",
			"extensions": [
				"shf"
			]
		},
		"application/sieve": {
			"source": "iana"
		},
		"application/simple-filter+xml": {
			"source": "iana"
		},
		"application/simple-message-summary": {
			"source": "iana"
		},
		"application/simplesymbolcontainer": {
			"source": "iana"
		},
		"application/slate": {
			"source": "iana"
		},
		"application/smil": {
			"source": "iana"
		},
		"application/smil+xml": {
			"source": "iana",
			"extensions": [
				"smi",
				"smil"
			]
		},
		"application/smpte336m": {
			"source": "iana"
		},
		"application/soap+fastinfoset": {
			"source": "iana"
		},
		"application/soap+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/sparql-query": {
			"source": "iana",
			"extensions": [
				"rq"
			]
		},
		"application/sparql-results+xml": {
			"source": "iana",
			"extensions": [
				"srx"
			]
		},
		"application/spirits-event+xml": {
			"source": "iana"
		},
		"application/sql": {
			"source": "iana"
		},
		"application/srgs": {
			"source": "iana",
			"extensions": [
				"gram"
			]
		},
		"application/srgs+xml": {
			"source": "iana",
			"extensions": [
				"grxml"
			]
		},
		"application/sru+xml": {
			"source": "iana",
			"extensions": [
				"sru"
			]
		},
		"application/ssdl+xml": {
			"source": "apache",
			"extensions": [
				"ssdl"
			]
		},
		"application/ssml+xml": {
			"source": "iana",
			"extensions": [
				"ssml"
			]
		},
		"application/tamp-apex-update": {
			"source": "iana"
		},
		"application/tamp-apex-update-confirm": {
			"source": "iana"
		},
		"application/tamp-community-update": {
			"source": "iana"
		},
		"application/tamp-community-update-confirm": {
			"source": "iana"
		},
		"application/tamp-error": {
			"source": "iana"
		},
		"application/tamp-sequence-adjust": {
			"source": "iana"
		},
		"application/tamp-sequence-adjust-confirm": {
			"source": "iana"
		},
		"application/tamp-status-query": {
			"source": "iana"
		},
		"application/tamp-status-response": {
			"source": "iana"
		},
		"application/tamp-update": {
			"source": "iana"
		},
		"application/tamp-update-confirm": {
			"source": "iana"
		},
		"application/tar": {
			"compressible": true
		},
		"application/tei+xml": {
			"source": "iana",
			"extensions": [
				"tei",
				"teicorpus"
			]
		},
		"application/thraud+xml": {
			"source": "iana",
			"extensions": [
				"tfi"
			]
		},
		"application/timestamp-query": {
			"source": "iana"
		},
		"application/timestamp-reply": {
			"source": "iana"
		},
		"application/timestamped-data": {
			"source": "iana",
			"extensions": [
				"tsd"
			]
		},
		"application/ttml+xml": {
			"source": "iana"
		},
		"application/tve-trigger": {
			"source": "iana"
		},
		"application/ulpfec": {
			"source": "iana"
		},
		"application/urc-grpsheet+xml": {
			"source": "iana"
		},
		"application/urc-ressheet+xml": {
			"source": "iana"
		},
		"application/urc-targetdesc+xml": {
			"source": "iana"
		},
		"application/urc-uisocketdesc+xml": {
			"source": "iana"
		},
		"application/vcard+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vcard+xml": {
			"source": "iana"
		},
		"application/vemmi": {
			"source": "iana"
		},
		"application/vividence.scriptfile": {
			"source": "apache"
		},
		"application/vnd.3gpp-prose+xml": {
			"source": "iana"
		},
		"application/vnd.3gpp-prose-pc3ch+xml": {
			"source": "iana"
		},
		"application/vnd.3gpp.access-transfer-events+xml": {
			"source": "iana"
		},
		"application/vnd.3gpp.bsf+xml": {
			"source": "iana"
		},
		"application/vnd.3gpp.mid-call+xml": {
			"source": "iana"
		},
		"application/vnd.3gpp.pic-bw-large": {
			"source": "iana",
			"extensions": [
				"plb"
			]
		},
		"application/vnd.3gpp.pic-bw-small": {
			"source": "iana",
			"extensions": [
				"psb"
			]
		},
		"application/vnd.3gpp.pic-bw-var": {
			"source": "iana",
			"extensions": [
				"pvb"
			]
		},
		"application/vnd.3gpp.sms": {
			"source": "iana"
		},
		"application/vnd.3gpp.sms+xml": {
			"source": "iana"
		},
		"application/vnd.3gpp.srvcc-ext+xml": {
			"source": "iana"
		},
		"application/vnd.3gpp.srvcc-info+xml": {
			"source": "iana"
		},
		"application/vnd.3gpp.state-and-event-info+xml": {
			"source": "iana"
		},
		"application/vnd.3gpp.ussd+xml": {
			"source": "iana"
		},
		"application/vnd.3gpp2.bcmcsinfo+xml": {
			"source": "iana"
		},
		"application/vnd.3gpp2.sms": {
			"source": "iana"
		},
		"application/vnd.3gpp2.tcap": {
			"source": "iana",
			"extensions": [
				"tcap"
			]
		},
		"application/vnd.3lightssoftware.imagescal": {
			"source": "iana"
		},
		"application/vnd.3m.post-it-notes": {
			"source": "iana",
			"extensions": [
				"pwn"
			]
		},
		"application/vnd.accpac.simply.aso": {
			"source": "iana",
			"extensions": [
				"aso"
			]
		},
		"application/vnd.accpac.simply.imp": {
			"source": "iana",
			"extensions": [
				"imp"
			]
		},
		"application/vnd.acucobol": {
			"source": "iana",
			"extensions": [
				"acu"
			]
		},
		"application/vnd.acucorp": {
			"source": "iana",
			"extensions": [
				"atc",
				"acutc"
			]
		},
		"application/vnd.adobe.air-application-installer-package+zip": {
			"source": "apache",
			"extensions": [
				"air"
			]
		},
		"application/vnd.adobe.flash.movie": {
			"source": "iana"
		},
		"application/vnd.adobe.formscentral.fcdt": {
			"source": "iana",
			"extensions": [
				"fcdt"
			]
		},
		"application/vnd.adobe.fxp": {
			"source": "iana",
			"extensions": [
				"fxp",
				"fxpl"
			]
		},
		"application/vnd.adobe.partial-upload": {
			"source": "iana"
		},
		"application/vnd.adobe.xdp+xml": {
			"source": "iana",
			"extensions": [
				"xdp"
			]
		},
		"application/vnd.adobe.xfdf": {
			"source": "iana",
			"extensions": [
				"xfdf"
			]
		},
		"application/vnd.aether.imp": {
			"source": "iana"
		},
		"application/vnd.ah-barcode": {
			"source": "iana"
		},
		"application/vnd.ahead.space": {
			"source": "iana",
			"extensions": [
				"ahead"
			]
		},
		"application/vnd.airzip.filesecure.azf": {
			"source": "iana",
			"extensions": [
				"azf"
			]
		},
		"application/vnd.airzip.filesecure.azs": {
			"source": "iana",
			"extensions": [
				"azs"
			]
		},
		"application/vnd.amazon.ebook": {
			"source": "apache",
			"extensions": [
				"azw"
			]
		},
		"application/vnd.americandynamics.acc": {
			"source": "iana",
			"extensions": [
				"acc"
			]
		},
		"application/vnd.amiga.ami": {
			"source": "iana",
			"extensions": [
				"ami"
			]
		},
		"application/vnd.amundsen.maze+xml": {
			"source": "iana"
		},
		"application/vnd.android.package-archive": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"apk"
			]
		},
		"application/vnd.anki": {
			"source": "iana"
		},
		"application/vnd.anser-web-certificate-issue-initiation": {
			"source": "iana",
			"extensions": [
				"cii"
			]
		},
		"application/vnd.anser-web-funds-transfer-initiation": {
			"source": "apache",
			"extensions": [
				"fti"
			]
		},
		"application/vnd.antix.game-component": {
			"source": "iana",
			"extensions": [
				"atx"
			]
		},
		"application/vnd.apache.thrift.binary": {
			"source": "iana"
		},
		"application/vnd.apache.thrift.compact": {
			"source": "iana"
		},
		"application/vnd.apache.thrift.json": {
			"source": "iana"
		},
		"application/vnd.api+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.apple.installer+xml": {
			"source": "iana",
			"extensions": [
				"mpkg"
			]
		},
		"application/vnd.apple.mpegurl": {
			"source": "iana",
			"extensions": [
				"m3u8"
			]
		},
		"application/vnd.apple.pkpass": {
			"compressible": false,
			"extensions": [
				"pkpass"
			]
		},
		"application/vnd.arastra.swi": {
			"source": "iana"
		},
		"application/vnd.aristanetworks.swi": {
			"source": "iana",
			"extensions": [
				"swi"
			]
		},
		"application/vnd.artsquare": {
			"source": "iana"
		},
		"application/vnd.astraea-software.iota": {
			"source": "iana",
			"extensions": [
				"iota"
			]
		},
		"application/vnd.audiograph": {
			"source": "iana",
			"extensions": [
				"aep"
			]
		},
		"application/vnd.autopackage": {
			"source": "iana"
		},
		"application/vnd.avistar+xml": {
			"source": "iana"
		},
		"application/vnd.balsamiq.bmml+xml": {
			"source": "iana"
		},
		"application/vnd.balsamiq.bmpr": {
			"source": "iana"
		},
		"application/vnd.bekitzur-stech+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.biopax.rdf+xml": {
			"source": "iana"
		},
		"application/vnd.blueice.multipass": {
			"source": "iana",
			"extensions": [
				"mpm"
			]
		},
		"application/vnd.bluetooth.ep.oob": {
			"source": "iana"
		},
		"application/vnd.bluetooth.le.oob": {
			"source": "iana"
		},
		"application/vnd.bmi": {
			"source": "iana",
			"extensions": [
				"bmi"
			]
		},
		"application/vnd.businessobjects": {
			"source": "iana",
			"extensions": [
				"rep"
			]
		},
		"application/vnd.cab-jscript": {
			"source": "iana"
		},
		"application/vnd.canon-cpdl": {
			"source": "iana"
		},
		"application/vnd.canon-lips": {
			"source": "iana"
		},
		"application/vnd.cendio.thinlinc.clientconf": {
			"source": "iana"
		},
		"application/vnd.century-systems.tcp_stream": {
			"source": "iana"
		},
		"application/vnd.chemdraw+xml": {
			"source": "iana",
			"extensions": [
				"cdxml"
			]
		},
		"application/vnd.chipnuts.karaoke-mmd": {
			"source": "iana",
			"extensions": [
				"mmd"
			]
		},
		"application/vnd.cinderella": {
			"source": "iana",
			"extensions": [
				"cdy"
			]
		},
		"application/vnd.cirpack.isdn-ext": {
			"source": "iana"
		},
		"application/vnd.citationstyles.style+xml": {
			"source": "iana"
		},
		"application/vnd.claymore": {
			"source": "iana",
			"extensions": [
				"cla"
			]
		},
		"application/vnd.cloanto.rp9": {
			"source": "iana",
			"extensions": [
				"rp9"
			]
		},
		"application/vnd.clonk.c4group": {
			"source": "iana",
			"extensions": [
				"c4g",
				"c4d",
				"c4f",
				"c4p",
				"c4u"
			]
		},
		"application/vnd.cluetrust.cartomobile-config": {
			"source": "iana",
			"extensions": [
				"c11amc"
			]
		},
		"application/vnd.cluetrust.cartomobile-config-pkg": {
			"source": "iana",
			"extensions": [
				"c11amz"
			]
		},
		"application/vnd.coffeescript": {
			"source": "iana"
		},
		"application/vnd.collection+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.collection.doc+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.collection.next+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.commerce-battelle": {
			"source": "iana"
		},
		"application/vnd.commonspace": {
			"source": "iana",
			"extensions": [
				"csp"
			]
		},
		"application/vnd.contact.cmsg": {
			"source": "iana",
			"extensions": [
				"cdbcmsg"
			]
		},
		"application/vnd.coreos.ignition+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.cosmocaller": {
			"source": "iana",
			"extensions": [
				"cmc"
			]
		},
		"application/vnd.crick.clicker": {
			"source": "iana",
			"extensions": [
				"clkx"
			]
		},
		"application/vnd.crick.clicker.keyboard": {
			"source": "iana",
			"extensions": [
				"clkk"
			]
		},
		"application/vnd.crick.clicker.palette": {
			"source": "iana",
			"extensions": [
				"clkp"
			]
		},
		"application/vnd.crick.clicker.template": {
			"source": "iana",
			"extensions": [
				"clkt"
			]
		},
		"application/vnd.crick.clicker.wordbank": {
			"source": "iana",
			"extensions": [
				"clkw"
			]
		},
		"application/vnd.criticaltools.wbs+xml": {
			"source": "iana",
			"extensions": [
				"wbs"
			]
		},
		"application/vnd.ctc-posml": {
			"source": "iana",
			"extensions": [
				"pml"
			]
		},
		"application/vnd.ctct.ws+xml": {
			"source": "iana"
		},
		"application/vnd.cups-pdf": {
			"source": "iana"
		},
		"application/vnd.cups-postscript": {
			"source": "iana"
		},
		"application/vnd.cups-ppd": {
			"source": "iana",
			"extensions": [
				"ppd"
			]
		},
		"application/vnd.cups-raster": {
			"source": "iana"
		},
		"application/vnd.cups-raw": {
			"source": "iana"
		},
		"application/vnd.curl": {
			"source": "iana"
		},
		"application/vnd.curl.car": {
			"source": "apache",
			"extensions": [
				"car"
			]
		},
		"application/vnd.curl.pcurl": {
			"source": "apache",
			"extensions": [
				"pcurl"
			]
		},
		"application/vnd.cyan.dean.root+xml": {
			"source": "iana"
		},
		"application/vnd.cybank": {
			"source": "iana"
		},
		"application/vnd.dart": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"dart"
			]
		},
		"application/vnd.data-vision.rdz": {
			"source": "iana",
			"extensions": [
				"rdz"
			]
		},
		"application/vnd.debian.binary-package": {
			"source": "iana"
		},
		"application/vnd.dece.data": {
			"source": "iana",
			"extensions": [
				"uvf",
				"uvvf",
				"uvd",
				"uvvd"
			]
		},
		"application/vnd.dece.ttml+xml": {
			"source": "iana",
			"extensions": [
				"uvt",
				"uvvt"
			]
		},
		"application/vnd.dece.unspecified": {
			"source": "iana",
			"extensions": [
				"uvx",
				"uvvx"
			]
		},
		"application/vnd.dece.zip": {
			"source": "iana",
			"extensions": [
				"uvz",
				"uvvz"
			]
		},
		"application/vnd.denovo.fcselayout-link": {
			"source": "iana",
			"extensions": [
				"fe_launch"
			]
		},
		"application/vnd.desmume-movie": {
			"source": "iana"
		},
		"application/vnd.desmume.movie": {
			"source": "apache"
		},
		"application/vnd.dir-bi.plate-dl-nosuffix": {
			"source": "iana"
		},
		"application/vnd.dm.delegation+xml": {
			"source": "iana"
		},
		"application/vnd.dna": {
			"source": "iana",
			"extensions": [
				"dna"
			]
		},
		"application/vnd.document+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dolby.mlp": {
			"source": "apache",
			"extensions": [
				"mlp"
			]
		},
		"application/vnd.dolby.mobile.1": {
			"source": "iana"
		},
		"application/vnd.dolby.mobile.2": {
			"source": "iana"
		},
		"application/vnd.doremir.scorecloud-binary-document": {
			"source": "iana"
		},
		"application/vnd.dpgraph": {
			"source": "iana",
			"extensions": [
				"dpg"
			]
		},
		"application/vnd.dreamfactory": {
			"source": "iana",
			"extensions": [
				"dfac"
			]
		},
		"application/vnd.drive+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ds-keypoint": {
			"source": "apache",
			"extensions": [
				"kpxx"
			]
		},
		"application/vnd.dtg.local": {
			"source": "iana"
		},
		"application/vnd.dtg.local.flash": {
			"source": "iana"
		},
		"application/vnd.dtg.local.html": {
			"source": "iana"
		},
		"application/vnd.dvb.ait": {
			"source": "iana",
			"extensions": [
				"ait"
			]
		},
		"application/vnd.dvb.dvbj": {
			"source": "iana"
		},
		"application/vnd.dvb.esgcontainer": {
			"source": "iana"
		},
		"application/vnd.dvb.ipdcdftnotifaccess": {
			"source": "iana"
		},
		"application/vnd.dvb.ipdcesgaccess": {
			"source": "iana"
		},
		"application/vnd.dvb.ipdcesgaccess2": {
			"source": "iana"
		},
		"application/vnd.dvb.ipdcesgpdd": {
			"source": "iana"
		},
		"application/vnd.dvb.ipdcroaming": {
			"source": "iana"
		},
		"application/vnd.dvb.iptv.alfec-base": {
			"source": "iana"
		},
		"application/vnd.dvb.iptv.alfec-enhancement": {
			"source": "iana"
		},
		"application/vnd.dvb.notif-aggregate-root+xml": {
			"source": "iana"
		},
		"application/vnd.dvb.notif-container+xml": {
			"source": "iana"
		},
		"application/vnd.dvb.notif-generic+xml": {
			"source": "iana"
		},
		"application/vnd.dvb.notif-ia-msglist+xml": {
			"source": "iana"
		},
		"application/vnd.dvb.notif-ia-registration-request+xml": {
			"source": "iana"
		},
		"application/vnd.dvb.notif-ia-registration-response+xml": {
			"source": "iana"
		},
		"application/vnd.dvb.notif-init+xml": {
			"source": "iana"
		},
		"application/vnd.dvb.pfr": {
			"source": "iana"
		},
		"application/vnd.dvb.service": {
			"source": "iana",
			"extensions": [
				"svc"
			]
		},
		"application/vnd.dxr": {
			"source": "iana"
		},
		"application/vnd.dynageo": {
			"source": "iana",
			"extensions": [
				"geo"
			]
		},
		"application/vnd.dzr": {
			"source": "iana"
		},
		"application/vnd.easykaraoke.cdgdownload": {
			"source": "iana"
		},
		"application/vnd.ecdis-update": {
			"source": "iana"
		},
		"application/vnd.ecowin.chart": {
			"source": "iana",
			"extensions": [
				"mag"
			]
		},
		"application/vnd.ecowin.filerequest": {
			"source": "iana"
		},
		"application/vnd.ecowin.fileupdate": {
			"source": "iana"
		},
		"application/vnd.ecowin.series": {
			"source": "iana"
		},
		"application/vnd.ecowin.seriesrequest": {
			"source": "iana"
		},
		"application/vnd.ecowin.seriesupdate": {
			"source": "iana"
		},
		"application/vnd.emclient.accessrequest+xml": {
			"source": "iana"
		},
		"application/vnd.enliven": {
			"source": "iana",
			"extensions": [
				"nml"
			]
		},
		"application/vnd.enphase.envoy": {
			"source": "iana"
		},
		"application/vnd.eprints.data+xml": {
			"source": "iana"
		},
		"application/vnd.epson.esf": {
			"source": "iana",
			"extensions": [
				"esf"
			]
		},
		"application/vnd.epson.msf": {
			"source": "iana",
			"extensions": [
				"msf"
			]
		},
		"application/vnd.epson.quickanime": {
			"source": "iana",
			"extensions": [
				"qam"
			]
		},
		"application/vnd.epson.salt": {
			"source": "iana",
			"extensions": [
				"slt"
			]
		},
		"application/vnd.epson.ssf": {
			"source": "iana",
			"extensions": [
				"ssf"
			]
		},
		"application/vnd.ericsson.quickcall": {
			"source": "iana"
		},
		"application/vnd.eszigno3+xml": {
			"source": "iana",
			"extensions": [
				"es3",
				"et3"
			]
		},
		"application/vnd.etsi.aoc+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.asic-e+zip": {
			"source": "iana"
		},
		"application/vnd.etsi.asic-s+zip": {
			"source": "iana"
		},
		"application/vnd.etsi.cug+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.iptvcommand+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.iptvdiscovery+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.iptvprofile+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.iptvsad-bc+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.iptvsad-cod+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.iptvsad-npvr+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.iptvservice+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.iptvsync+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.iptvueprofile+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.mcid+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.mheg5": {
			"source": "iana"
		},
		"application/vnd.etsi.overload-control-policy-dataset+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.pstn+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.sci+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.simservs+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.timestamp-token": {
			"source": "iana"
		},
		"application/vnd.etsi.tsl+xml": {
			"source": "iana"
		},
		"application/vnd.etsi.tsl.der": {
			"source": "iana"
		},
		"application/vnd.eudora.data": {
			"source": "iana"
		},
		"application/vnd.ezpix-album": {
			"source": "iana",
			"extensions": [
				"ez2"
			]
		},
		"application/vnd.ezpix-package": {
			"source": "iana",
			"extensions": [
				"ez3"
			]
		},
		"application/vnd.f-secure.mobile": {
			"source": "iana"
		},
		"application/vnd.fastcopy-disk-image": {
			"source": "iana"
		},
		"application/vnd.fdf": {
			"source": "iana",
			"extensions": [
				"fdf"
			]
		},
		"application/vnd.fdsn.mseed": {
			"source": "iana",
			"extensions": [
				"mseed"
			]
		},
		"application/vnd.fdsn.seed": {
			"source": "iana",
			"extensions": [
				"seed",
				"dataless"
			]
		},
		"application/vnd.ffsns": {
			"source": "iana"
		},
		"application/vnd.filmit.zfc": {
			"source": "iana"
		},
		"application/vnd.fints": {
			"source": "iana"
		},
		"application/vnd.firemonkeys.cloudcell": {
			"source": "iana"
		},
		"application/vnd.flographit": {
			"source": "iana",
			"extensions": [
				"gph"
			]
		},
		"application/vnd.fluxtime.clip": {
			"source": "iana",
			"extensions": [
				"ftc"
			]
		},
		"application/vnd.font-fontforge-sfd": {
			"source": "iana"
		},
		"application/vnd.framemaker": {
			"source": "iana",
			"extensions": [
				"fm",
				"frame",
				"maker",
				"book"
			]
		},
		"application/vnd.frogans.fnc": {
			"source": "iana",
			"extensions": [
				"fnc"
			]
		},
		"application/vnd.frogans.ltf": {
			"source": "iana",
			"extensions": [
				"ltf"
			]
		},
		"application/vnd.fsc.weblaunch": {
			"source": "iana",
			"extensions": [
				"fsc"
			]
		},
		"application/vnd.fujitsu.oasys": {
			"source": "iana",
			"extensions": [
				"oas"
			]
		},
		"application/vnd.fujitsu.oasys2": {
			"source": "iana",
			"extensions": [
				"oa2"
			]
		},
		"application/vnd.fujitsu.oasys3": {
			"source": "iana",
			"extensions": [
				"oa3"
			]
		},
		"application/vnd.fujitsu.oasysgp": {
			"source": "iana",
			"extensions": [
				"fg5"
			]
		},
		"application/vnd.fujitsu.oasysprs": {
			"source": "iana",
			"extensions": [
				"bh2"
			]
		},
		"application/vnd.fujixerox.art-ex": {
			"source": "iana"
		},
		"application/vnd.fujixerox.art4": {
			"source": "iana"
		},
		"application/vnd.fujixerox.ddd": {
			"source": "iana",
			"extensions": [
				"ddd"
			]
		},
		"application/vnd.fujixerox.docuworks": {
			"source": "iana",
			"extensions": [
				"xdw"
			]
		},
		"application/vnd.fujixerox.docuworks.binder": {
			"source": "iana",
			"extensions": [
				"xbd"
			]
		},
		"application/vnd.fujixerox.docuworks.container": {
			"source": "iana"
		},
		"application/vnd.fujixerox.hbpl": {
			"source": "iana"
		},
		"application/vnd.fut-misnet": {
			"source": "iana"
		},
		"application/vnd.fuzzysheet": {
			"source": "iana",
			"extensions": [
				"fzs"
			]
		},
		"application/vnd.genomatix.tuxedo": {
			"source": "iana",
			"extensions": [
				"txd"
			]
		},
		"application/vnd.geo+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.geocube+xml": {
			"source": "iana"
		},
		"application/vnd.geogebra.file": {
			"source": "iana",
			"extensions": [
				"ggb"
			]
		},
		"application/vnd.geogebra.tool": {
			"source": "iana",
			"extensions": [
				"ggt"
			]
		},
		"application/vnd.geometry-explorer": {
			"source": "iana",
			"extensions": [
				"gex",
				"gre"
			]
		},
		"application/vnd.geonext": {
			"source": "iana",
			"extensions": [
				"gxt"
			]
		},
		"application/vnd.geoplan": {
			"source": "iana",
			"extensions": [
				"g2w"
			]
		},
		"application/vnd.geospace": {
			"source": "iana",
			"extensions": [
				"g3w"
			]
		},
		"application/vnd.gerber": {
			"source": "iana"
		},
		"application/vnd.globalplatform.card-content-mgt": {
			"source": "iana"
		},
		"application/vnd.globalplatform.card-content-mgt-response": {
			"source": "iana"
		},
		"application/vnd.gmx": {
			"source": "iana",
			"extensions": [
				"gmx"
			]
		},
		"application/vnd.google-apps.document": {
			"compressible": false,
			"extensions": [
				"gdoc"
			]
		},
		"application/vnd.google-apps.presentation": {
			"compressible": false,
			"extensions": [
				"gslides"
			]
		},
		"application/vnd.google-apps.spreadsheet": {
			"compressible": false,
			"extensions": [
				"gsheet"
			]
		},
		"application/vnd.google-earth.kml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"kml"
			]
		},
		"application/vnd.google-earth.kmz": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"kmz"
			]
		},
		"application/vnd.gov.sk.e-form+xml": {
			"source": "iana"
		},
		"application/vnd.gov.sk.e-form+zip": {
			"source": "iana"
		},
		"application/vnd.gov.sk.xmldatacontainer+xml": {
			"source": "iana"
		},
		"application/vnd.grafeq": {
			"source": "iana",
			"extensions": [
				"gqf",
				"gqs"
			]
		},
		"application/vnd.gridmp": {
			"source": "iana"
		},
		"application/vnd.groove-account": {
			"source": "iana",
			"extensions": [
				"gac"
			]
		},
		"application/vnd.groove-help": {
			"source": "iana",
			"extensions": [
				"ghf"
			]
		},
		"application/vnd.groove-identity-message": {
			"source": "iana",
			"extensions": [
				"gim"
			]
		},
		"application/vnd.groove-injector": {
			"source": "iana",
			"extensions": [
				"grv"
			]
		},
		"application/vnd.groove-tool-message": {
			"source": "iana",
			"extensions": [
				"gtm"
			]
		},
		"application/vnd.groove-tool-template": {
			"source": "iana",
			"extensions": [
				"tpl"
			]
		},
		"application/vnd.groove-vcard": {
			"source": "iana",
			"extensions": [
				"vcg"
			]
		},
		"application/vnd.hal+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.hal+xml": {
			"source": "iana",
			"extensions": [
				"hal"
			]
		},
		"application/vnd.handheld-entertainment+xml": {
			"source": "iana",
			"extensions": [
				"zmm"
			]
		},
		"application/vnd.hbci": {
			"source": "iana",
			"extensions": [
				"hbci"
			]
		},
		"application/vnd.hcl-bireports": {
			"source": "iana"
		},
		"application/vnd.hdt": {
			"source": "iana"
		},
		"application/vnd.heroku+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.hhe.lesson-player": {
			"source": "iana",
			"extensions": [
				"les"
			]
		},
		"application/vnd.hp-hpgl": {
			"source": "iana",
			"extensions": [
				"hpgl"
			]
		},
		"application/vnd.hp-hpid": {
			"source": "iana",
			"extensions": [
				"hpid"
			]
		},
		"application/vnd.hp-hps": {
			"source": "iana",
			"extensions": [
				"hps"
			]
		},
		"application/vnd.hp-jlyt": {
			"source": "iana",
			"extensions": [
				"jlt"
			]
		},
		"application/vnd.hp-pcl": {
			"source": "iana",
			"extensions": [
				"pcl"
			]
		},
		"application/vnd.hp-pclxl": {
			"source": "iana",
			"extensions": [
				"pclxl"
			]
		},
		"application/vnd.httphone": {
			"source": "iana"
		},
		"application/vnd.hydrostatix.sof-data": {
			"source": "iana",
			"extensions": [
				"sfd-hdstx"
			]
		},
		"application/vnd.hyperdrive+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.hzn-3d-crossword": {
			"source": "iana"
		},
		"application/vnd.ibm.afplinedata": {
			"source": "iana"
		},
		"application/vnd.ibm.electronic-media": {
			"source": "iana"
		},
		"application/vnd.ibm.minipay": {
			"source": "iana",
			"extensions": [
				"mpy"
			]
		},
		"application/vnd.ibm.modcap": {
			"source": "iana",
			"extensions": [
				"afp",
				"listafp",
				"list3820"
			]
		},
		"application/vnd.ibm.rights-management": {
			"source": "iana",
			"extensions": [
				"irm"
			]
		},
		"application/vnd.ibm.secure-container": {
			"source": "iana",
			"extensions": [
				"sc"
			]
		},
		"application/vnd.iccprofile": {
			"source": "iana",
			"extensions": [
				"icc",
				"icm"
			]
		},
		"application/vnd.ieee.1905": {
			"source": "iana"
		},
		"application/vnd.igloader": {
			"source": "iana",
			"extensions": [
				"igl"
			]
		},
		"application/vnd.immervision-ivp": {
			"source": "iana",
			"extensions": [
				"ivp"
			]
		},
		"application/vnd.immervision-ivu": {
			"source": "iana",
			"extensions": [
				"ivu"
			]
		},
		"application/vnd.ims.imsccv1p1": {
			"source": "iana"
		},
		"application/vnd.ims.imsccv1p2": {
			"source": "iana"
		},
		"application/vnd.ims.imsccv1p3": {
			"source": "iana"
		},
		"application/vnd.ims.lis.v2.result+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ims.lti.v2.toolconsumerprofile+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ims.lti.v2.toolproxy+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ims.lti.v2.toolproxy.id+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ims.lti.v2.toolsettings+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ims.lti.v2.toolsettings.simple+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.informedcontrol.rms+xml": {
			"source": "iana"
		},
		"application/vnd.informix-visionary": {
			"source": "iana"
		},
		"application/vnd.infotech.project": {
			"source": "iana"
		},
		"application/vnd.infotech.project+xml": {
			"source": "iana"
		},
		"application/vnd.innopath.wamp.notification": {
			"source": "iana"
		},
		"application/vnd.insors.igm": {
			"source": "iana",
			"extensions": [
				"igm"
			]
		},
		"application/vnd.intercon.formnet": {
			"source": "iana",
			"extensions": [
				"xpw",
				"xpx"
			]
		},
		"application/vnd.intergeo": {
			"source": "iana",
			"extensions": [
				"i2g"
			]
		},
		"application/vnd.intertrust.digibox": {
			"source": "iana"
		},
		"application/vnd.intertrust.nncp": {
			"source": "iana"
		},
		"application/vnd.intu.qbo": {
			"source": "iana",
			"extensions": [
				"qbo"
			]
		},
		"application/vnd.intu.qfx": {
			"source": "iana",
			"extensions": [
				"qfx"
			]
		},
		"application/vnd.iptc.g2.catalogitem+xml": {
			"source": "iana"
		},
		"application/vnd.iptc.g2.conceptitem+xml": {
			"source": "iana"
		},
		"application/vnd.iptc.g2.knowledgeitem+xml": {
			"source": "iana"
		},
		"application/vnd.iptc.g2.newsitem+xml": {
			"source": "iana"
		},
		"application/vnd.iptc.g2.newsmessage+xml": {
			"source": "iana"
		},
		"application/vnd.iptc.g2.packageitem+xml": {
			"source": "iana"
		},
		"application/vnd.iptc.g2.planningitem+xml": {
			"source": "iana"
		},
		"application/vnd.ipunplugged.rcprofile": {
			"source": "iana",
			"extensions": [
				"rcprofile"
			]
		},
		"application/vnd.irepository.package+xml": {
			"source": "iana",
			"extensions": [
				"irp"
			]
		},
		"application/vnd.is-xpr": {
			"source": "iana",
			"extensions": [
				"xpr"
			]
		},
		"application/vnd.isac.fcs": {
			"source": "iana",
			"extensions": [
				"fcs"
			]
		},
		"application/vnd.jam": {
			"source": "iana",
			"extensions": [
				"jam"
			]
		},
		"application/vnd.japannet-directory-service": {
			"source": "iana"
		},
		"application/vnd.japannet-jpnstore-wakeup": {
			"source": "iana"
		},
		"application/vnd.japannet-payment-wakeup": {
			"source": "iana"
		},
		"application/vnd.japannet-registration": {
			"source": "iana"
		},
		"application/vnd.japannet-registration-wakeup": {
			"source": "iana"
		},
		"application/vnd.japannet-setstore-wakeup": {
			"source": "iana"
		},
		"application/vnd.japannet-verification": {
			"source": "iana"
		},
		"application/vnd.japannet-verification-wakeup": {
			"source": "iana"
		},
		"application/vnd.jcp.javame.midlet-rms": {
			"source": "iana",
			"extensions": [
				"rms"
			]
		},
		"application/vnd.jisp": {
			"source": "iana",
			"extensions": [
				"jisp"
			]
		},
		"application/vnd.joost.joda-archive": {
			"source": "iana",
			"extensions": [
				"joda"
			]
		},
		"application/vnd.jsk.isdn-ngn": {
			"source": "iana"
		},
		"application/vnd.kahootz": {
			"source": "iana",
			"extensions": [
				"ktz",
				"ktr"
			]
		},
		"application/vnd.kde.karbon": {
			"source": "iana",
			"extensions": [
				"karbon"
			]
		},
		"application/vnd.kde.kchart": {
			"source": "iana",
			"extensions": [
				"chrt"
			]
		},
		"application/vnd.kde.kformula": {
			"source": "iana",
			"extensions": [
				"kfo"
			]
		},
		"application/vnd.kde.kivio": {
			"source": "iana",
			"extensions": [
				"flw"
			]
		},
		"application/vnd.kde.kontour": {
			"source": "iana",
			"extensions": [
				"kon"
			]
		},
		"application/vnd.kde.kpresenter": {
			"source": "iana",
			"extensions": [
				"kpr",
				"kpt"
			]
		},
		"application/vnd.kde.kspread": {
			"source": "iana",
			"extensions": [
				"ksp"
			]
		},
		"application/vnd.kde.kword": {
			"source": "iana",
			"extensions": [
				"kwd",
				"kwt"
			]
		},
		"application/vnd.kenameaapp": {
			"source": "iana",
			"extensions": [
				"htke"
			]
		},
		"application/vnd.kidspiration": {
			"source": "iana",
			"extensions": [
				"kia"
			]
		},
		"application/vnd.kinar": {
			"source": "iana",
			"extensions": [
				"kne",
				"knp"
			]
		},
		"application/vnd.koan": {
			"source": "iana",
			"extensions": [
				"skp",
				"skd",
				"skt",
				"skm"
			]
		},
		"application/vnd.kodak-descriptor": {
			"source": "iana",
			"extensions": [
				"sse"
			]
		},
		"application/vnd.las.las+xml": {
			"source": "iana",
			"extensions": [
				"lasxml"
			]
		},
		"application/vnd.liberty-request+xml": {
			"source": "iana"
		},
		"application/vnd.llamagraphics.life-balance.desktop": {
			"source": "iana",
			"extensions": [
				"lbd"
			]
		},
		"application/vnd.llamagraphics.life-balance.exchange+xml": {
			"source": "iana",
			"extensions": [
				"lbe"
			]
		},
		"application/vnd.lotus-1-2-3": {
			"source": "iana",
			"extensions": [
				"123"
			]
		},
		"application/vnd.lotus-approach": {
			"source": "iana",
			"extensions": [
				"apr"
			]
		},
		"application/vnd.lotus-freelance": {
			"source": "iana",
			"extensions": [
				"pre"
			]
		},
		"application/vnd.lotus-notes": {
			"source": "iana",
			"extensions": [
				"nsf"
			]
		},
		"application/vnd.lotus-organizer": {
			"source": "iana",
			"extensions": [
				"org"
			]
		},
		"application/vnd.lotus-screencam": {
			"source": "iana",
			"extensions": [
				"scm"
			]
		},
		"application/vnd.lotus-wordpro": {
			"source": "iana",
			"extensions": [
				"lwp"
			]
		},
		"application/vnd.macports.portpkg": {
			"source": "iana",
			"extensions": [
				"portpkg"
			]
		},
		"application/vnd.mapbox-vector-tile": {
			"source": "iana"
		},
		"application/vnd.marlin.drm.actiontoken+xml": {
			"source": "iana"
		},
		"application/vnd.marlin.drm.conftoken+xml": {
			"source": "iana"
		},
		"application/vnd.marlin.drm.license+xml": {
			"source": "iana"
		},
		"application/vnd.marlin.drm.mdcf": {
			"source": "iana"
		},
		"application/vnd.mason+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.maxmind.maxmind-db": {
			"source": "iana"
		},
		"application/vnd.mcd": {
			"source": "iana",
			"extensions": [
				"mcd"
			]
		},
		"application/vnd.medcalcdata": {
			"source": "iana",
			"extensions": [
				"mc1"
			]
		},
		"application/vnd.mediastation.cdkey": {
			"source": "iana",
			"extensions": [
				"cdkey"
			]
		},
		"application/vnd.meridian-slingshot": {
			"source": "iana"
		},
		"application/vnd.mfer": {
			"source": "iana",
			"extensions": [
				"mwf"
			]
		},
		"application/vnd.mfmp": {
			"source": "iana",
			"extensions": [
				"mfm"
			]
		},
		"application/vnd.micro+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.micrografx.flo": {
			"source": "iana",
			"extensions": [
				"flo"
			]
		},
		"application/vnd.micrografx.igx": {
			"source": "iana",
			"extensions": [
				"igx"
			]
		},
		"application/vnd.microsoft.portable-executable": {
			"source": "iana"
		},
		"application/vnd.miele+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.mif": {
			"source": "iana",
			"extensions": [
				"mif"
			]
		},
		"application/vnd.minisoft-hp3000-save": {
			"source": "iana"
		},
		"application/vnd.mitsubishi.misty-guard.trustweb": {
			"source": "iana"
		},
		"application/vnd.mobius.daf": {
			"source": "iana",
			"extensions": [
				"daf"
			]
		},
		"application/vnd.mobius.dis": {
			"source": "iana",
			"extensions": [
				"dis"
			]
		},
		"application/vnd.mobius.mbk": {
			"source": "iana",
			"extensions": [
				"mbk"
			]
		},
		"application/vnd.mobius.mqy": {
			"source": "iana",
			"extensions": [
				"mqy"
			]
		},
		"application/vnd.mobius.msl": {
			"source": "iana",
			"extensions": [
				"msl"
			]
		},
		"application/vnd.mobius.plc": {
			"source": "iana",
			"extensions": [
				"plc"
			]
		},
		"application/vnd.mobius.txf": {
			"source": "iana",
			"extensions": [
				"txf"
			]
		},
		"application/vnd.mophun.application": {
			"source": "iana",
			"extensions": [
				"mpn"
			]
		},
		"application/vnd.mophun.certificate": {
			"source": "iana",
			"extensions": [
				"mpc"
			]
		},
		"application/vnd.motorola.flexsuite": {
			"source": "iana"
		},
		"application/vnd.motorola.flexsuite.adsi": {
			"source": "iana"
		},
		"application/vnd.motorola.flexsuite.fis": {
			"source": "iana"
		},
		"application/vnd.motorola.flexsuite.gotap": {
			"source": "iana"
		},
		"application/vnd.motorola.flexsuite.kmr": {
			"source": "iana"
		},
		"application/vnd.motorola.flexsuite.ttc": {
			"source": "iana"
		},
		"application/vnd.motorola.flexsuite.wem": {
			"source": "iana"
		},
		"application/vnd.motorola.iprm": {
			"source": "iana"
		},
		"application/vnd.mozilla.xul+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"xul"
			]
		},
		"application/vnd.ms-3mfdocument": {
			"source": "iana"
		},
		"application/vnd.ms-artgalry": {
			"source": "iana",
			"extensions": [
				"cil"
			]
		},
		"application/vnd.ms-asf": {
			"source": "iana"
		},
		"application/vnd.ms-cab-compressed": {
			"source": "iana",
			"extensions": [
				"cab"
			]
		},
		"application/vnd.ms-color.iccprofile": {
			"source": "apache"
		},
		"application/vnd.ms-excel": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"xls",
				"xlm",
				"xla",
				"xlc",
				"xlt",
				"xlw"
			]
		},
		"application/vnd.ms-excel.addin.macroenabled.12": {
			"source": "iana",
			"extensions": [
				"xlam"
			]
		},
		"application/vnd.ms-excel.sheet.binary.macroenabled.12": {
			"source": "iana",
			"extensions": [
				"xlsb"
			]
		},
		"application/vnd.ms-excel.sheet.macroenabled.12": {
			"source": "iana",
			"extensions": [
				"xlsm"
			]
		},
		"application/vnd.ms-excel.template.macroenabled.12": {
			"source": "iana",
			"extensions": [
				"xltm"
			]
		},
		"application/vnd.ms-fontobject": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"eot"
			]
		},
		"application/vnd.ms-htmlhelp": {
			"source": "iana",
			"extensions": [
				"chm"
			]
		},
		"application/vnd.ms-ims": {
			"source": "iana",
			"extensions": [
				"ims"
			]
		},
		"application/vnd.ms-lrm": {
			"source": "iana",
			"extensions": [
				"lrm"
			]
		},
		"application/vnd.ms-office.activex+xml": {
			"source": "iana"
		},
		"application/vnd.ms-officetheme": {
			"source": "iana",
			"extensions": [
				"thmx"
			]
		},
		"application/vnd.ms-opentype": {
			"source": "apache",
			"compressible": true
		},
		"application/vnd.ms-package.obfuscated-opentype": {
			"source": "apache"
		},
		"application/vnd.ms-pki.seccat": {
			"source": "apache",
			"extensions": [
				"cat"
			]
		},
		"application/vnd.ms-pki.stl": {
			"source": "apache",
			"extensions": [
				"stl"
			]
		},
		"application/vnd.ms-playready.initiator+xml": {
			"source": "iana"
		},
		"application/vnd.ms-powerpoint": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"ppt",
				"pps",
				"pot"
			]
		},
		"application/vnd.ms-powerpoint.addin.macroenabled.12": {
			"source": "iana",
			"extensions": [
				"ppam"
			]
		},
		"application/vnd.ms-powerpoint.presentation.macroenabled.12": {
			"source": "iana",
			"extensions": [
				"pptm"
			]
		},
		"application/vnd.ms-powerpoint.slide.macroenabled.12": {
			"source": "iana",
			"extensions": [
				"sldm"
			]
		},
		"application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
			"source": "iana",
			"extensions": [
				"ppsm"
			]
		},
		"application/vnd.ms-powerpoint.template.macroenabled.12": {
			"source": "iana",
			"extensions": [
				"potm"
			]
		},
		"application/vnd.ms-printdevicecapabilities+xml": {
			"source": "iana"
		},
		"application/vnd.ms-printing.printticket+xml": {
			"source": "apache"
		},
		"application/vnd.ms-printschematicket+xml": {
			"source": "iana"
		},
		"application/vnd.ms-project": {
			"source": "iana",
			"extensions": [
				"mpp",
				"mpt"
			]
		},
		"application/vnd.ms-tnef": {
			"source": "iana"
		},
		"application/vnd.ms-windows.devicepairing": {
			"source": "iana"
		},
		"application/vnd.ms-windows.nwprinting.oob": {
			"source": "iana"
		},
		"application/vnd.ms-windows.printerpairing": {
			"source": "iana"
		},
		"application/vnd.ms-windows.wsd.oob": {
			"source": "iana"
		},
		"application/vnd.ms-wmdrm.lic-chlg-req": {
			"source": "iana"
		},
		"application/vnd.ms-wmdrm.lic-resp": {
			"source": "iana"
		},
		"application/vnd.ms-wmdrm.meter-chlg-req": {
			"source": "iana"
		},
		"application/vnd.ms-wmdrm.meter-resp": {
			"source": "iana"
		},
		"application/vnd.ms-word.document.macroenabled.12": {
			"source": "iana",
			"extensions": [
				"docm"
			]
		},
		"application/vnd.ms-word.template.macroenabled.12": {
			"source": "iana",
			"extensions": [
				"dotm"
			]
		},
		"application/vnd.ms-works": {
			"source": "iana",
			"extensions": [
				"wps",
				"wks",
				"wcm",
				"wdb"
			]
		},
		"application/vnd.ms-wpl": {
			"source": "iana",
			"extensions": [
				"wpl"
			]
		},
		"application/vnd.ms-xpsdocument": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"xps"
			]
		},
		"application/vnd.msa-disk-image": {
			"source": "iana"
		},
		"application/vnd.mseq": {
			"source": "iana",
			"extensions": [
				"mseq"
			]
		},
		"application/vnd.msign": {
			"source": "iana"
		},
		"application/vnd.multiad.creator": {
			"source": "iana"
		},
		"application/vnd.multiad.creator.cif": {
			"source": "iana"
		},
		"application/vnd.music-niff": {
			"source": "iana"
		},
		"application/vnd.musician": {
			"source": "iana",
			"extensions": [
				"mus"
			]
		},
		"application/vnd.muvee.style": {
			"source": "iana",
			"extensions": [
				"msty"
			]
		},
		"application/vnd.mynfc": {
			"source": "iana",
			"extensions": [
				"taglet"
			]
		},
		"application/vnd.ncd.control": {
			"source": "iana"
		},
		"application/vnd.ncd.reference": {
			"source": "iana"
		},
		"application/vnd.nervana": {
			"source": "iana"
		},
		"application/vnd.netfpx": {
			"source": "iana"
		},
		"application/vnd.neurolanguage.nlu": {
			"source": "iana",
			"extensions": [
				"nlu"
			]
		},
		"application/vnd.nintendo.nitro.rom": {
			"source": "iana"
		},
		"application/vnd.nintendo.snes.rom": {
			"source": "iana"
		},
		"application/vnd.nitf": {
			"source": "iana",
			"extensions": [
				"ntf",
				"nitf"
			]
		},
		"application/vnd.noblenet-directory": {
			"source": "iana",
			"extensions": [
				"nnd"
			]
		},
		"application/vnd.noblenet-sealer": {
			"source": "iana",
			"extensions": [
				"nns"
			]
		},
		"application/vnd.noblenet-web": {
			"source": "iana",
			"extensions": [
				"nnw"
			]
		},
		"application/vnd.nokia.catalogs": {
			"source": "iana"
		},
		"application/vnd.nokia.conml+wbxml": {
			"source": "iana"
		},
		"application/vnd.nokia.conml+xml": {
			"source": "iana"
		},
		"application/vnd.nokia.iptv.config+xml": {
			"source": "iana"
		},
		"application/vnd.nokia.isds-radio-presets": {
			"source": "iana"
		},
		"application/vnd.nokia.landmark+wbxml": {
			"source": "iana"
		},
		"application/vnd.nokia.landmark+xml": {
			"source": "iana"
		},
		"application/vnd.nokia.landmarkcollection+xml": {
			"source": "iana"
		},
		"application/vnd.nokia.n-gage.ac+xml": {
			"source": "iana"
		},
		"application/vnd.nokia.n-gage.data": {
			"source": "iana",
			"extensions": [
				"ngdat"
			]
		},
		"application/vnd.nokia.n-gage.symbian.install": {
			"source": "iana",
			"extensions": [
				"n-gage"
			]
		},
		"application/vnd.nokia.ncd": {
			"source": "iana"
		},
		"application/vnd.nokia.pcd+wbxml": {
			"source": "iana"
		},
		"application/vnd.nokia.pcd+xml": {
			"source": "iana"
		},
		"application/vnd.nokia.radio-preset": {
			"source": "iana",
			"extensions": [
				"rpst"
			]
		},
		"application/vnd.nokia.radio-presets": {
			"source": "iana",
			"extensions": [
				"rpss"
			]
		},
		"application/vnd.novadigm.edm": {
			"source": "iana",
			"extensions": [
				"edm"
			]
		},
		"application/vnd.novadigm.edx": {
			"source": "iana",
			"extensions": [
				"edx"
			]
		},
		"application/vnd.novadigm.ext": {
			"source": "iana",
			"extensions": [
				"ext"
			]
		},
		"application/vnd.ntt-local.content-share": {
			"source": "iana"
		},
		"application/vnd.ntt-local.file-transfer": {
			"source": "iana"
		},
		"application/vnd.ntt-local.ogw_remote-access": {
			"source": "iana"
		},
		"application/vnd.ntt-local.sip-ta_remote": {
			"source": "iana"
		},
		"application/vnd.ntt-local.sip-ta_tcp_stream": {
			"source": "iana"
		},
		"application/vnd.oasis.opendocument.chart": {
			"source": "iana",
			"extensions": [
				"odc"
			]
		},
		"application/vnd.oasis.opendocument.chart-template": {
			"source": "iana",
			"extensions": [
				"otc"
			]
		},
		"application/vnd.oasis.opendocument.database": {
			"source": "iana",
			"extensions": [
				"odb"
			]
		},
		"application/vnd.oasis.opendocument.formula": {
			"source": "iana",
			"extensions": [
				"odf"
			]
		},
		"application/vnd.oasis.opendocument.formula-template": {
			"source": "iana",
			"extensions": [
				"odft"
			]
		},
		"application/vnd.oasis.opendocument.graphics": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"odg"
			]
		},
		"application/vnd.oasis.opendocument.graphics-template": {
			"source": "iana",
			"extensions": [
				"otg"
			]
		},
		"application/vnd.oasis.opendocument.image": {
			"source": "iana",
			"extensions": [
				"odi"
			]
		},
		"application/vnd.oasis.opendocument.image-template": {
			"source": "iana",
			"extensions": [
				"oti"
			]
		},
		"application/vnd.oasis.opendocument.presentation": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"odp"
			]
		},
		"application/vnd.oasis.opendocument.presentation-template": {
			"source": "iana",
			"extensions": [
				"otp"
			]
		},
		"application/vnd.oasis.opendocument.spreadsheet": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"ods"
			]
		},
		"application/vnd.oasis.opendocument.spreadsheet-template": {
			"source": "iana",
			"extensions": [
				"ots"
			]
		},
		"application/vnd.oasis.opendocument.text": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"odt"
			]
		},
		"application/vnd.oasis.opendocument.text-master": {
			"source": "iana",
			"extensions": [
				"odm"
			]
		},
		"application/vnd.oasis.opendocument.text-template": {
			"source": "iana",
			"extensions": [
				"ott"
			]
		},
		"application/vnd.oasis.opendocument.text-web": {
			"source": "iana",
			"extensions": [
				"oth"
			]
		},
		"application/vnd.obn": {
			"source": "iana"
		},
		"application/vnd.oftn.l10n+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.contentaccessdownload+xml": {
			"source": "iana"
		},
		"application/vnd.oipf.contentaccessstreaming+xml": {
			"source": "iana"
		},
		"application/vnd.oipf.cspg-hexbinary": {
			"source": "iana"
		},
		"application/vnd.oipf.dae.svg+xml": {
			"source": "iana"
		},
		"application/vnd.oipf.dae.xhtml+xml": {
			"source": "iana"
		},
		"application/vnd.oipf.mippvcontrolmessage+xml": {
			"source": "iana"
		},
		"application/vnd.oipf.pae.gem": {
			"source": "iana"
		},
		"application/vnd.oipf.spdiscovery+xml": {
			"source": "iana"
		},
		"application/vnd.oipf.spdlist+xml": {
			"source": "iana"
		},
		"application/vnd.oipf.ueprofile+xml": {
			"source": "iana"
		},
		"application/vnd.oipf.userprofile+xml": {
			"source": "iana"
		},
		"application/vnd.olpc-sugar": {
			"source": "iana",
			"extensions": [
				"xo"
			]
		},
		"application/vnd.oma-scws-config": {
			"source": "iana"
		},
		"application/vnd.oma-scws-http-request": {
			"source": "iana"
		},
		"application/vnd.oma-scws-http-response": {
			"source": "iana"
		},
		"application/vnd.oma.bcast.associated-procedure-parameter+xml": {
			"source": "iana"
		},
		"application/vnd.oma.bcast.drm-trigger+xml": {
			"source": "iana"
		},
		"application/vnd.oma.bcast.imd+xml": {
			"source": "iana"
		},
		"application/vnd.oma.bcast.ltkm": {
			"source": "iana"
		},
		"application/vnd.oma.bcast.notification+xml": {
			"source": "iana"
		},
		"application/vnd.oma.bcast.provisioningtrigger": {
			"source": "iana"
		},
		"application/vnd.oma.bcast.sgboot": {
			"source": "iana"
		},
		"application/vnd.oma.bcast.sgdd+xml": {
			"source": "iana"
		},
		"application/vnd.oma.bcast.sgdu": {
			"source": "iana"
		},
		"application/vnd.oma.bcast.simple-symbol-container": {
			"source": "iana"
		},
		"application/vnd.oma.bcast.smartcard-trigger+xml": {
			"source": "iana"
		},
		"application/vnd.oma.bcast.sprov+xml": {
			"source": "iana"
		},
		"application/vnd.oma.bcast.stkm": {
			"source": "iana"
		},
		"application/vnd.oma.cab-address-book+xml": {
			"source": "iana"
		},
		"application/vnd.oma.cab-feature-handler+xml": {
			"source": "iana"
		},
		"application/vnd.oma.cab-pcc+xml": {
			"source": "iana"
		},
		"application/vnd.oma.cab-subs-invite+xml": {
			"source": "iana"
		},
		"application/vnd.oma.cab-user-prefs+xml": {
			"source": "iana"
		},
		"application/vnd.oma.dcd": {
			"source": "iana"
		},
		"application/vnd.oma.dcdc": {
			"source": "iana"
		},
		"application/vnd.oma.dd2+xml": {
			"source": "iana",
			"extensions": [
				"dd2"
			]
		},
		"application/vnd.oma.drm.risd+xml": {
			"source": "iana"
		},
		"application/vnd.oma.group-usage-list+xml": {
			"source": "iana"
		},
		"application/vnd.oma.pal+xml": {
			"source": "iana"
		},
		"application/vnd.oma.poc.detailed-progress-report+xml": {
			"source": "iana"
		},
		"application/vnd.oma.poc.final-report+xml": {
			"source": "iana"
		},
		"application/vnd.oma.poc.groups+xml": {
			"source": "iana"
		},
		"application/vnd.oma.poc.invocation-descriptor+xml": {
			"source": "iana"
		},
		"application/vnd.oma.poc.optimized-progress-report+xml": {
			"source": "iana"
		},
		"application/vnd.oma.push": {
			"source": "iana"
		},
		"application/vnd.oma.scidm.messages+xml": {
			"source": "iana"
		},
		"application/vnd.oma.xcap-directory+xml": {
			"source": "iana"
		},
		"application/vnd.omads-email+xml": {
			"source": "iana"
		},
		"application/vnd.omads-file+xml": {
			"source": "iana"
		},
		"application/vnd.omads-folder+xml": {
			"source": "iana"
		},
		"application/vnd.omaloc-supl-init": {
			"source": "iana"
		},
		"application/vnd.onepager": {
			"source": "iana"
		},
		"application/vnd.openblox.game+xml": {
			"source": "iana"
		},
		"application/vnd.openblox.game-binary": {
			"source": "iana"
		},
		"application/vnd.openeye.oeb": {
			"source": "iana"
		},
		"application/vnd.openofficeorg.extension": {
			"source": "apache",
			"extensions": [
				"oxt"
			]
		},
		"application/vnd.openxmlformats-officedocument.custom-properties+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.drawing+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.extended-properties+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml-template": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.presentation": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"pptx"
			]
		},
		"application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slide": {
			"source": "iana",
			"extensions": [
				"sldx"
			]
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
			"source": "iana",
			"extensions": [
				"ppsx"
			]
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.template": {
			"source": "apache",
			"extensions": [
				"potx"
			]
		},
		"application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml-template": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"xlsx"
			]
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
			"source": "apache",
			"extensions": [
				"xltx"
			]
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.theme+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.themeoverride+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.vmldrawing": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml-template": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"docx"
			]
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
			"source": "apache",
			"extensions": [
				"dotx"
			]
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-package.core-properties+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
			"source": "iana"
		},
		"application/vnd.openxmlformats-package.relationships+xml": {
			"source": "iana"
		},
		"application/vnd.oracle.resource+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.orange.indata": {
			"source": "iana"
		},
		"application/vnd.osa.netdeploy": {
			"source": "iana"
		},
		"application/vnd.osgeo.mapguide.package": {
			"source": "iana",
			"extensions": [
				"mgp"
			]
		},
		"application/vnd.osgi.bundle": {
			"source": "iana"
		},
		"application/vnd.osgi.dp": {
			"source": "iana",
			"extensions": [
				"dp"
			]
		},
		"application/vnd.osgi.subsystem": {
			"source": "iana",
			"extensions": [
				"esa"
			]
		},
		"application/vnd.otps.ct-kip+xml": {
			"source": "iana"
		},
		"application/vnd.oxli.countgraph": {
			"source": "iana"
		},
		"application/vnd.pagerduty+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.palm": {
			"source": "iana",
			"extensions": [
				"pdb",
				"pqa",
				"oprc"
			]
		},
		"application/vnd.panoply": {
			"source": "iana"
		},
		"application/vnd.paos+xml": {
			"source": "iana"
		},
		"application/vnd.paos.xml": {
			"source": "apache"
		},
		"application/vnd.pawaafile": {
			"source": "iana",
			"extensions": [
				"paw"
			]
		},
		"application/vnd.pcos": {
			"source": "iana"
		},
		"application/vnd.pg.format": {
			"source": "iana",
			"extensions": [
				"str"
			]
		},
		"application/vnd.pg.osasli": {
			"source": "iana",
			"extensions": [
				"ei6"
			]
		},
		"application/vnd.piaccess.application-licence": {
			"source": "iana"
		},
		"application/vnd.picsel": {
			"source": "iana",
			"extensions": [
				"efif"
			]
		},
		"application/vnd.pmi.widget": {
			"source": "iana",
			"extensions": [
				"wg"
			]
		},
		"application/vnd.poc.group-advertisement+xml": {
			"source": "iana"
		},
		"application/vnd.pocketlearn": {
			"source": "iana",
			"extensions": [
				"plf"
			]
		},
		"application/vnd.powerbuilder6": {
			"source": "iana",
			"extensions": [
				"pbd"
			]
		},
		"application/vnd.powerbuilder6-s": {
			"source": "iana"
		},
		"application/vnd.powerbuilder7": {
			"source": "iana"
		},
		"application/vnd.powerbuilder7-s": {
			"source": "iana"
		},
		"application/vnd.powerbuilder75": {
			"source": "iana"
		},
		"application/vnd.powerbuilder75-s": {
			"source": "iana"
		},
		"application/vnd.preminet": {
			"source": "iana"
		},
		"application/vnd.previewsystems.box": {
			"source": "iana",
			"extensions": [
				"box"
			]
		},
		"application/vnd.proteus.magazine": {
			"source": "iana",
			"extensions": [
				"mgz"
			]
		},
		"application/vnd.publishare-delta-tree": {
			"source": "iana",
			"extensions": [
				"qps"
			]
		},
		"application/vnd.pvi.ptid1": {
			"source": "iana",
			"extensions": [
				"ptid"
			]
		},
		"application/vnd.pwg-multiplexed": {
			"source": "iana"
		},
		"application/vnd.pwg-xhtml-print+xml": {
			"source": "iana"
		},
		"application/vnd.qualcomm.brew-app-res": {
			"source": "iana"
		},
		"application/vnd.quark.quarkxpress": {
			"source": "iana",
			"extensions": [
				"qxd",
				"qxt",
				"qwd",
				"qwt",
				"qxl",
				"qxb"
			]
		},
		"application/vnd.quobject-quoxdocument": {
			"source": "iana"
		},
		"application/vnd.radisys.moml+xml": {
			"source": "iana"
		},
		"application/vnd.radisys.msml+xml": {
			"source": "iana"
		},
		"application/vnd.radisys.msml-audit+xml": {
			"source": "iana"
		},
		"application/vnd.radisys.msml-audit-conf+xml": {
			"source": "iana"
		},
		"application/vnd.radisys.msml-audit-conn+xml": {
			"source": "iana"
		},
		"application/vnd.radisys.msml-audit-dialog+xml": {
			"source": "iana"
		},
		"application/vnd.radisys.msml-audit-stream+xml": {
			"source": "iana"
		},
		"application/vnd.radisys.msml-conf+xml": {
			"source": "iana"
		},
		"application/vnd.radisys.msml-dialog+xml": {
			"source": "iana"
		},
		"application/vnd.radisys.msml-dialog-base+xml": {
			"source": "iana"
		},
		"application/vnd.radisys.msml-dialog-fax-detect+xml": {
			"source": "iana"
		},
		"application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
			"source": "iana"
		},
		"application/vnd.radisys.msml-dialog-group+xml": {
			"source": "iana"
		},
		"application/vnd.radisys.msml-dialog-speech+xml": {
			"source": "iana"
		},
		"application/vnd.radisys.msml-dialog-transform+xml": {
			"source": "iana"
		},
		"application/vnd.rainstor.data": {
			"source": "iana"
		},
		"application/vnd.rapid": {
			"source": "iana"
		},
		"application/vnd.realvnc.bed": {
			"source": "iana",
			"extensions": [
				"bed"
			]
		},
		"application/vnd.recordare.musicxml": {
			"source": "iana",
			"extensions": [
				"mxl"
			]
		},
		"application/vnd.recordare.musicxml+xml": {
			"source": "iana",
			"extensions": [
				"musicxml"
			]
		},
		"application/vnd.renlearn.rlprint": {
			"source": "iana"
		},
		"application/vnd.rig.cryptonote": {
			"source": "iana",
			"extensions": [
				"cryptonote"
			]
		},
		"application/vnd.rim.cod": {
			"source": "apache",
			"extensions": [
				"cod"
			]
		},
		"application/vnd.rn-realmedia": {
			"source": "apache",
			"extensions": [
				"rm"
			]
		},
		"application/vnd.rn-realmedia-vbr": {
			"source": "apache",
			"extensions": [
				"rmvb"
			]
		},
		"application/vnd.route66.link66+xml": {
			"source": "iana",
			"extensions": [
				"link66"
			]
		},
		"application/vnd.rs-274x": {
			"source": "iana"
		},
		"application/vnd.ruckus.download": {
			"source": "iana"
		},
		"application/vnd.s3sms": {
			"source": "iana"
		},
		"application/vnd.sailingtracker.track": {
			"source": "iana",
			"extensions": [
				"st"
			]
		},
		"application/vnd.sbm.cid": {
			"source": "iana"
		},
		"application/vnd.sbm.mid2": {
			"source": "iana"
		},
		"application/vnd.scribus": {
			"source": "iana"
		},
		"application/vnd.sealed.3df": {
			"source": "iana"
		},
		"application/vnd.sealed.csf": {
			"source": "iana"
		},
		"application/vnd.sealed.doc": {
			"source": "iana"
		},
		"application/vnd.sealed.eml": {
			"source": "iana"
		},
		"application/vnd.sealed.mht": {
			"source": "iana"
		},
		"application/vnd.sealed.net": {
			"source": "iana"
		},
		"application/vnd.sealed.ppt": {
			"source": "iana"
		},
		"application/vnd.sealed.tiff": {
			"source": "iana"
		},
		"application/vnd.sealed.xls": {
			"source": "iana"
		},
		"application/vnd.sealedmedia.softseal.html": {
			"source": "iana"
		},
		"application/vnd.sealedmedia.softseal.pdf": {
			"source": "iana"
		},
		"application/vnd.seemail": {
			"source": "iana",
			"extensions": [
				"see"
			]
		},
		"application/vnd.sema": {
			"source": "iana",
			"extensions": [
				"sema"
			]
		},
		"application/vnd.semd": {
			"source": "iana",
			"extensions": [
				"semd"
			]
		},
		"application/vnd.semf": {
			"source": "iana",
			"extensions": [
				"semf"
			]
		},
		"application/vnd.shana.informed.formdata": {
			"source": "iana",
			"extensions": [
				"ifm"
			]
		},
		"application/vnd.shana.informed.formtemplate": {
			"source": "iana",
			"extensions": [
				"itp"
			]
		},
		"application/vnd.shana.informed.interchange": {
			"source": "iana",
			"extensions": [
				"iif"
			]
		},
		"application/vnd.shana.informed.package": {
			"source": "iana",
			"extensions": [
				"ipk"
			]
		},
		"application/vnd.simtech-mindmapper": {
			"source": "iana",
			"extensions": [
				"twd",
				"twds"
			]
		},
		"application/vnd.siren+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.smaf": {
			"source": "iana",
			"extensions": [
				"mmf"
			]
		},
		"application/vnd.smart.notebook": {
			"source": "iana"
		},
		"application/vnd.smart.teacher": {
			"source": "iana",
			"extensions": [
				"teacher"
			]
		},
		"application/vnd.software602.filler.form+xml": {
			"source": "iana"
		},
		"application/vnd.software602.filler.form-xml-zip": {
			"source": "iana"
		},
		"application/vnd.solent.sdkm+xml": {
			"source": "iana",
			"extensions": [
				"sdkm",
				"sdkd"
			]
		},
		"application/vnd.spotfire.dxp": {
			"source": "iana",
			"extensions": [
				"dxp"
			]
		},
		"application/vnd.spotfire.sfs": {
			"source": "iana",
			"extensions": [
				"sfs"
			]
		},
		"application/vnd.sss-cod": {
			"source": "iana"
		},
		"application/vnd.sss-dtf": {
			"source": "iana"
		},
		"application/vnd.sss-ntf": {
			"source": "iana"
		},
		"application/vnd.stardivision.calc": {
			"source": "apache",
			"extensions": [
				"sdc"
			]
		},
		"application/vnd.stardivision.draw": {
			"source": "apache",
			"extensions": [
				"sda"
			]
		},
		"application/vnd.stardivision.impress": {
			"source": "apache",
			"extensions": [
				"sdd"
			]
		},
		"application/vnd.stardivision.math": {
			"source": "apache",
			"extensions": [
				"smf"
			]
		},
		"application/vnd.stardivision.writer": {
			"source": "apache",
			"extensions": [
				"sdw",
				"vor"
			]
		},
		"application/vnd.stardivision.writer-global": {
			"source": "apache",
			"extensions": [
				"sgl"
			]
		},
		"application/vnd.stepmania.package": {
			"source": "iana",
			"extensions": [
				"smzip"
			]
		},
		"application/vnd.stepmania.stepchart": {
			"source": "iana",
			"extensions": [
				"sm"
			]
		},
		"application/vnd.street-stream": {
			"source": "iana"
		},
		"application/vnd.sun.wadl+xml": {
			"source": "iana"
		},
		"application/vnd.sun.xml.calc": {
			"source": "apache",
			"extensions": [
				"sxc"
			]
		},
		"application/vnd.sun.xml.calc.template": {
			"source": "apache",
			"extensions": [
				"stc"
			]
		},
		"application/vnd.sun.xml.draw": {
			"source": "apache",
			"extensions": [
				"sxd"
			]
		},
		"application/vnd.sun.xml.draw.template": {
			"source": "apache",
			"extensions": [
				"std"
			]
		},
		"application/vnd.sun.xml.impress": {
			"source": "apache",
			"extensions": [
				"sxi"
			]
		},
		"application/vnd.sun.xml.impress.template": {
			"source": "apache",
			"extensions": [
				"sti"
			]
		},
		"application/vnd.sun.xml.math": {
			"source": "apache",
			"extensions": [
				"sxm"
			]
		},
		"application/vnd.sun.xml.writer": {
			"source": "apache",
			"extensions": [
				"sxw"
			]
		},
		"application/vnd.sun.xml.writer.global": {
			"source": "apache",
			"extensions": [
				"sxg"
			]
		},
		"application/vnd.sun.xml.writer.template": {
			"source": "apache",
			"extensions": [
				"stw"
			]
		},
		"application/vnd.sus-calendar": {
			"source": "iana",
			"extensions": [
				"sus",
				"susp"
			]
		},
		"application/vnd.svd": {
			"source": "iana",
			"extensions": [
				"svd"
			]
		},
		"application/vnd.swiftview-ics": {
			"source": "iana"
		},
		"application/vnd.symbian.install": {
			"source": "apache",
			"extensions": [
				"sis",
				"sisx"
			]
		},
		"application/vnd.syncml+xml": {
			"source": "iana",
			"extensions": [
				"xsm"
			]
		},
		"application/vnd.syncml.dm+wbxml": {
			"source": "iana",
			"extensions": [
				"bdm"
			]
		},
		"application/vnd.syncml.dm+xml": {
			"source": "iana",
			"extensions": [
				"xdm"
			]
		},
		"application/vnd.syncml.dm.notification": {
			"source": "iana"
		},
		"application/vnd.syncml.dmddf+wbxml": {
			"source": "iana"
		},
		"application/vnd.syncml.dmddf+xml": {
			"source": "iana"
		},
		"application/vnd.syncml.dmtnds+wbxml": {
			"source": "iana"
		},
		"application/vnd.syncml.dmtnds+xml": {
			"source": "iana"
		},
		"application/vnd.syncml.ds.notification": {
			"source": "iana"
		},
		"application/vnd.tao.intent-module-archive": {
			"source": "iana",
			"extensions": [
				"tao"
			]
		},
		"application/vnd.tcpdump.pcap": {
			"source": "iana",
			"extensions": [
				"pcap",
				"cap",
				"dmp"
			]
		},
		"application/vnd.tmd.mediaflex.api+xml": {
			"source": "iana"
		},
		"application/vnd.tml": {
			"source": "iana"
		},
		"application/vnd.tmobile-livetv": {
			"source": "iana",
			"extensions": [
				"tmo"
			]
		},
		"application/vnd.trid.tpt": {
			"source": "iana",
			"extensions": [
				"tpt"
			]
		},
		"application/vnd.triscape.mxs": {
			"source": "iana",
			"extensions": [
				"mxs"
			]
		},
		"application/vnd.trueapp": {
			"source": "iana",
			"extensions": [
				"tra"
			]
		},
		"application/vnd.truedoc": {
			"source": "iana"
		},
		"application/vnd.ubisoft.webplayer": {
			"source": "iana"
		},
		"application/vnd.ufdl": {
			"source": "iana",
			"extensions": [
				"ufd",
				"ufdl"
			]
		},
		"application/vnd.uiq.theme": {
			"source": "iana",
			"extensions": [
				"utz"
			]
		},
		"application/vnd.umajin": {
			"source": "iana",
			"extensions": [
				"umj"
			]
		},
		"application/vnd.unity": {
			"source": "iana",
			"extensions": [
				"unityweb"
			]
		},
		"application/vnd.uoml+xml": {
			"source": "iana",
			"extensions": [
				"uoml"
			]
		},
		"application/vnd.uplanet.alert": {
			"source": "iana"
		},
		"application/vnd.uplanet.alert-wbxml": {
			"source": "iana"
		},
		"application/vnd.uplanet.bearer-choice": {
			"source": "iana"
		},
		"application/vnd.uplanet.bearer-choice-wbxml": {
			"source": "iana"
		},
		"application/vnd.uplanet.cacheop": {
			"source": "iana"
		},
		"application/vnd.uplanet.cacheop-wbxml": {
			"source": "iana"
		},
		"application/vnd.uplanet.channel": {
			"source": "iana"
		},
		"application/vnd.uplanet.channel-wbxml": {
			"source": "iana"
		},
		"application/vnd.uplanet.list": {
			"source": "iana"
		},
		"application/vnd.uplanet.list-wbxml": {
			"source": "iana"
		},
		"application/vnd.uplanet.listcmd": {
			"source": "iana"
		},
		"application/vnd.uplanet.listcmd-wbxml": {
			"source": "iana"
		},
		"application/vnd.uplanet.signal": {
			"source": "iana"
		},
		"application/vnd.uri-map": {
			"source": "iana"
		},
		"application/vnd.valve.source.material": {
			"source": "iana"
		},
		"application/vnd.vcx": {
			"source": "iana",
			"extensions": [
				"vcx"
			]
		},
		"application/vnd.vd-study": {
			"source": "iana"
		},
		"application/vnd.vectorworks": {
			"source": "iana"
		},
		"application/vnd.vel+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.verimatrix.vcas": {
			"source": "iana"
		},
		"application/vnd.vidsoft.vidconference": {
			"source": "iana"
		},
		"application/vnd.visio": {
			"source": "iana",
			"extensions": [
				"vsd",
				"vst",
				"vss",
				"vsw"
			]
		},
		"application/vnd.visionary": {
			"source": "iana",
			"extensions": [
				"vis"
			]
		},
		"application/vnd.vividence.scriptfile": {
			"source": "iana"
		},
		"application/vnd.vsf": {
			"source": "iana",
			"extensions": [
				"vsf"
			]
		},
		"application/vnd.wap.sic": {
			"source": "iana"
		},
		"application/vnd.wap.slc": {
			"source": "iana"
		},
		"application/vnd.wap.wbxml": {
			"source": "iana",
			"extensions": [
				"wbxml"
			]
		},
		"application/vnd.wap.wmlc": {
			"source": "iana",
			"extensions": [
				"wmlc"
			]
		},
		"application/vnd.wap.wmlscriptc": {
			"source": "iana",
			"extensions": [
				"wmlsc"
			]
		},
		"application/vnd.webturbo": {
			"source": "iana",
			"extensions": [
				"wtb"
			]
		},
		"application/vnd.wfa.p2p": {
			"source": "iana"
		},
		"application/vnd.wfa.wsc": {
			"source": "iana"
		},
		"application/vnd.windows.devicepairing": {
			"source": "iana"
		},
		"application/vnd.wmc": {
			"source": "iana"
		},
		"application/vnd.wmf.bootstrap": {
			"source": "iana"
		},
		"application/vnd.wolfram.mathematica": {
			"source": "iana"
		},
		"application/vnd.wolfram.mathematica.package": {
			"source": "iana"
		},
		"application/vnd.wolfram.player": {
			"source": "iana",
			"extensions": [
				"nbp"
			]
		},
		"application/vnd.wordperfect": {
			"source": "iana",
			"extensions": [
				"wpd"
			]
		},
		"application/vnd.wqd": {
			"source": "iana",
			"extensions": [
				"wqd"
			]
		},
		"application/vnd.wrq-hp3000-labelled": {
			"source": "iana"
		},
		"application/vnd.wt.stf": {
			"source": "iana",
			"extensions": [
				"stf"
			]
		},
		"application/vnd.wv.csp+wbxml": {
			"source": "iana"
		},
		"application/vnd.wv.csp+xml": {
			"source": "iana"
		},
		"application/vnd.wv.ssp+xml": {
			"source": "iana"
		},
		"application/vnd.xacml+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.xara": {
			"source": "iana",
			"extensions": [
				"xar"
			]
		},
		"application/vnd.xfdl": {
			"source": "iana",
			"extensions": [
				"xfdl"
			]
		},
		"application/vnd.xfdl.webform": {
			"source": "iana"
		},
		"application/vnd.xmi+xml": {
			"source": "iana"
		},
		"application/vnd.xmpie.cpkg": {
			"source": "iana"
		},
		"application/vnd.xmpie.dpkg": {
			"source": "iana"
		},
		"application/vnd.xmpie.plan": {
			"source": "iana"
		},
		"application/vnd.xmpie.ppkg": {
			"source": "iana"
		},
		"application/vnd.xmpie.xlim": {
			"source": "iana"
		},
		"application/vnd.yamaha.hv-dic": {
			"source": "iana",
			"extensions": [
				"hvd"
			]
		},
		"application/vnd.yamaha.hv-script": {
			"source": "iana",
			"extensions": [
				"hvs"
			]
		},
		"application/vnd.yamaha.hv-voice": {
			"source": "iana",
			"extensions": [
				"hvp"
			]
		},
		"application/vnd.yamaha.openscoreformat": {
			"source": "iana",
			"extensions": [
				"osf"
			]
		},
		"application/vnd.yamaha.openscoreformat.osfpvg+xml": {
			"source": "iana",
			"extensions": [
				"osfpvg"
			]
		},
		"application/vnd.yamaha.remote-setup": {
			"source": "iana"
		},
		"application/vnd.yamaha.smaf-audio": {
			"source": "iana",
			"extensions": [
				"saf"
			]
		},
		"application/vnd.yamaha.smaf-phrase": {
			"source": "iana",
			"extensions": [
				"spf"
			]
		},
		"application/vnd.yamaha.through-ngn": {
			"source": "iana"
		},
		"application/vnd.yamaha.tunnel-udpencap": {
			"source": "iana"
		},
		"application/vnd.yaoweme": {
			"source": "iana"
		},
		"application/vnd.yellowriver-custom-menu": {
			"source": "iana",
			"extensions": [
				"cmp"
			]
		},
		"application/vnd.zul": {
			"source": "iana",
			"extensions": [
				"zir",
				"zirz"
			]
		},
		"application/vnd.zzazz.deck+xml": {
			"source": "iana",
			"extensions": [
				"zaz"
			]
		},
		"application/voicexml+xml": {
			"source": "iana",
			"extensions": [
				"vxml"
			]
		},
		"application/vq-rtcpxr": {
			"source": "iana"
		},
		"application/watcherinfo+xml": {
			"source": "iana"
		},
		"application/whoispp-query": {
			"source": "iana"
		},
		"application/whoispp-response": {
			"source": "iana"
		},
		"application/widget": {
			"source": "iana",
			"extensions": [
				"wgt"
			]
		},
		"application/winhlp": {
			"source": "apache",
			"extensions": [
				"hlp"
			]
		},
		"application/wita": {
			"source": "iana"
		},
		"application/wordperfect5.1": {
			"source": "iana"
		},
		"application/wsdl+xml": {
			"source": "iana",
			"extensions": [
				"wsdl"
			]
		},
		"application/wspolicy+xml": {
			"source": "iana",
			"extensions": [
				"wspolicy"
			]
		},
		"application/x-7z-compressed": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"7z"
			]
		},
		"application/x-abiword": {
			"source": "apache",
			"extensions": [
				"abw"
			]
		},
		"application/x-ace-compressed": {
			"source": "apache",
			"extensions": [
				"ace"
			]
		},
		"application/x-amf": {
			"source": "apache"
		},
		"application/x-apple-diskimage": {
			"source": "apache",
			"extensions": [
				"dmg"
			]
		},
		"application/x-authorware-bin": {
			"source": "apache",
			"extensions": [
				"aab",
				"x32",
				"u32",
				"vox"
			]
		},
		"application/x-authorware-map": {
			"source": "apache",
			"extensions": [
				"aam"
			]
		},
		"application/x-authorware-seg": {
			"source": "apache",
			"extensions": [
				"aas"
			]
		},
		"application/x-bcpio": {
			"source": "apache",
			"extensions": [
				"bcpio"
			]
		},
		"application/x-bdoc": {
			"compressible": false,
			"extensions": [
				"bdoc"
			]
		},
		"application/x-bittorrent": {
			"source": "apache",
			"extensions": [
				"torrent"
			]
		},
		"application/x-blorb": {
			"source": "apache",
			"extensions": [
				"blb",
				"blorb"
			]
		},
		"application/x-bzip": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"bz"
			]
		},
		"application/x-bzip2": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"bz2",
				"boz"
			]
		},
		"application/x-cbr": {
			"source": "apache",
			"extensions": [
				"cbr",
				"cba",
				"cbt",
				"cbz",
				"cb7"
			]
		},
		"application/x-cdlink": {
			"source": "apache",
			"extensions": [
				"vcd"
			]
		},
		"application/x-cfs-compressed": {
			"source": "apache",
			"extensions": [
				"cfs"
			]
		},
		"application/x-chat": {
			"source": "apache",
			"extensions": [
				"chat"
			]
		},
		"application/x-chess-pgn": {
			"source": "apache",
			"extensions": [
				"pgn"
			]
		},
		"application/x-chrome-extension": {
			"extensions": [
				"crx"
			]
		},
		"application/x-cocoa": {
			"source": "nginx",
			"extensions": [
				"cco"
			]
		},
		"application/x-compress": {
			"source": "apache"
		},
		"application/x-conference": {
			"source": "apache",
			"extensions": [
				"nsc"
			]
		},
		"application/x-cpio": {
			"source": "apache",
			"extensions": [
				"cpio"
			]
		},
		"application/x-csh": {
			"source": "apache",
			"extensions": [
				"csh"
			]
		},
		"application/x-deb": {
			"compressible": false
		},
		"application/x-debian-package": {
			"source": "apache",
			"extensions": [
				"deb",
				"udeb"
			]
		},
		"application/x-dgc-compressed": {
			"source": "apache",
			"extensions": [
				"dgc"
			]
		},
		"application/x-director": {
			"source": "apache",
			"extensions": [
				"dir",
				"dcr",
				"dxr",
				"cst",
				"cct",
				"cxt",
				"w3d",
				"fgd",
				"swa"
			]
		},
		"application/x-doom": {
			"source": "apache",
			"extensions": [
				"wad"
			]
		},
		"application/x-dtbncx+xml": {
			"source": "apache",
			"extensions": [
				"ncx"
			]
		},
		"application/x-dtbook+xml": {
			"source": "apache",
			"extensions": [
				"dtb"
			]
		},
		"application/x-dtbresource+xml": {
			"source": "apache",
			"extensions": [
				"res"
			]
		},
		"application/x-dvi": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"dvi"
			]
		},
		"application/x-envoy": {
			"source": "apache",
			"extensions": [
				"evy"
			]
		},
		"application/x-eva": {
			"source": "apache",
			"extensions": [
				"eva"
			]
		},
		"application/x-font-bdf": {
			"source": "apache",
			"extensions": [
				"bdf"
			]
		},
		"application/x-font-dos": {
			"source": "apache"
		},
		"application/x-font-framemaker": {
			"source": "apache"
		},
		"application/x-font-ghostscript": {
			"source": "apache",
			"extensions": [
				"gsf"
			]
		},
		"application/x-font-libgrx": {
			"source": "apache"
		},
		"application/x-font-linux-psf": {
			"source": "apache",
			"extensions": [
				"psf"
			]
		},
		"application/x-font-otf": {
			"source": "apache",
			"compressible": true,
			"extensions": [
				"otf"
			]
		},
		"application/x-font-pcf": {
			"source": "apache",
			"extensions": [
				"pcf"
			]
		},
		"application/x-font-snf": {
			"source": "apache",
			"extensions": [
				"snf"
			]
		},
		"application/x-font-speedo": {
			"source": "apache"
		},
		"application/x-font-sunos-news": {
			"source": "apache"
		},
		"application/x-font-ttf": {
			"source": "apache",
			"compressible": true,
			"extensions": [
				"ttf",
				"ttc"
			]
		},
		"application/x-font-type1": {
			"source": "apache",
			"extensions": [
				"pfa",
				"pfb",
				"pfm",
				"afm"
			]
		},
		"application/x-font-vfont": {
			"source": "apache"
		},
		"application/x-freearc": {
			"source": "apache",
			"extensions": [
				"arc"
			]
		},
		"application/x-futuresplash": {
			"source": "apache",
			"extensions": [
				"spl"
			]
		},
		"application/x-gca-compressed": {
			"source": "apache",
			"extensions": [
				"gca"
			]
		},
		"application/x-glulx": {
			"source": "apache",
			"extensions": [
				"ulx"
			]
		},
		"application/x-gnumeric": {
			"source": "apache",
			"extensions": [
				"gnumeric"
			]
		},
		"application/x-gramps-xml": {
			"source": "apache",
			"extensions": [
				"gramps"
			]
		},
		"application/x-gtar": {
			"source": "apache",
			"extensions": [
				"gtar"
			]
		},
		"application/x-gzip": {
			"source": "apache"
		},
		"application/x-hdf": {
			"source": "apache",
			"extensions": [
				"hdf"
			]
		},
		"application/x-httpd-php": {
			"compressible": true,
			"extensions": [
				"php"
			]
		},
		"application/x-install-instructions": {
			"source": "apache",
			"extensions": [
				"install"
			]
		},
		"application/x-iso9660-image": {
			"source": "apache",
			"extensions": [
				"iso"
			]
		},
		"application/x-java-archive-diff": {
			"source": "nginx",
			"extensions": [
				"jardiff"
			]
		},
		"application/x-java-jnlp-file": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"jnlp"
			]
		},
		"application/x-javascript": {
			"compressible": true
		},
		"application/x-latex": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"latex"
			]
		},
		"application/x-lua-bytecode": {
			"extensions": [
				"luac"
			]
		},
		"application/x-lzh-compressed": {
			"source": "apache",
			"extensions": [
				"lzh",
				"lha"
			]
		},
		"application/x-makeself": {
			"source": "nginx",
			"extensions": [
				"run"
			]
		},
		"application/x-mie": {
			"source": "apache",
			"extensions": [
				"mie"
			]
		},
		"application/x-mobipocket-ebook": {
			"source": "apache",
			"extensions": [
				"prc",
				"mobi"
			]
		},
		"application/x-mpegurl": {
			"compressible": false
		},
		"application/x-ms-application": {
			"source": "apache",
			"extensions": [
				"application"
			]
		},
		"application/x-ms-shortcut": {
			"source": "apache",
			"extensions": [
				"lnk"
			]
		},
		"application/x-ms-wmd": {
			"source": "apache",
			"extensions": [
				"wmd"
			]
		},
		"application/x-ms-wmz": {
			"source": "apache",
			"extensions": [
				"wmz"
			]
		},
		"application/x-ms-xbap": {
			"source": "apache",
			"extensions": [
				"xbap"
			]
		},
		"application/x-msaccess": {
			"source": "apache",
			"extensions": [
				"mdb"
			]
		},
		"application/x-msbinder": {
			"source": "apache",
			"extensions": [
				"obd"
			]
		},
		"application/x-mscardfile": {
			"source": "apache",
			"extensions": [
				"crd"
			]
		},
		"application/x-msclip": {
			"source": "apache",
			"extensions": [
				"clp"
			]
		},
		"application/x-msdos-program": {
			"extensions": [
				"exe"
			]
		},
		"application/x-msdownload": {
			"source": "apache",
			"extensions": [
				"exe",
				"dll",
				"com",
				"bat",
				"msi"
			]
		},
		"application/x-msmediaview": {
			"source": "apache",
			"extensions": [
				"mvb",
				"m13",
				"m14"
			]
		},
		"application/x-msmetafile": {
			"source": "apache",
			"extensions": [
				"wmf",
				"wmz",
				"emf",
				"emz"
			]
		},
		"application/x-msmoney": {
			"source": "apache",
			"extensions": [
				"mny"
			]
		},
		"application/x-mspublisher": {
			"source": "apache",
			"extensions": [
				"pub"
			]
		},
		"application/x-msschedule": {
			"source": "apache",
			"extensions": [
				"scd"
			]
		},
		"application/x-msterminal": {
			"source": "apache",
			"extensions": [
				"trm"
			]
		},
		"application/x-mswrite": {
			"source": "apache",
			"extensions": [
				"wri"
			]
		},
		"application/x-netcdf": {
			"source": "apache",
			"extensions": [
				"nc",
				"cdf"
			]
		},
		"application/x-ns-proxy-autoconfig": {
			"compressible": true,
			"extensions": [
				"pac"
			]
		},
		"application/x-nzb": {
			"source": "apache",
			"extensions": [
				"nzb"
			]
		},
		"application/x-perl": {
			"source": "nginx",
			"extensions": [
				"pl",
				"pm"
			]
		},
		"application/x-pilot": {
			"source": "nginx",
			"extensions": [
				"prc",
				"pdb"
			]
		},
		"application/x-pkcs12": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"p12",
				"pfx"
			]
		},
		"application/x-pkcs7-certificates": {
			"source": "apache",
			"extensions": [
				"p7b",
				"spc"
			]
		},
		"application/x-pkcs7-certreqresp": {
			"source": "apache",
			"extensions": [
				"p7r"
			]
		},
		"application/x-rar-compressed": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"rar"
			]
		},
		"application/x-redhat-package-manager": {
			"source": "nginx",
			"extensions": [
				"rpm"
			]
		},
		"application/x-research-info-systems": {
			"source": "apache",
			"extensions": [
				"ris"
			]
		},
		"application/x-sea": {
			"source": "nginx",
			"extensions": [
				"sea"
			]
		},
		"application/x-sh": {
			"source": "apache",
			"compressible": true,
			"extensions": [
				"sh"
			]
		},
		"application/x-shar": {
			"source": "apache",
			"extensions": [
				"shar"
			]
		},
		"application/x-shockwave-flash": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"swf"
			]
		},
		"application/x-silverlight-app": {
			"source": "apache",
			"extensions": [
				"xap"
			]
		},
		"application/x-sql": {
			"source": "apache",
			"extensions": [
				"sql"
			]
		},
		"application/x-stuffit": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"sit"
			]
		},
		"application/x-stuffitx": {
			"source": "apache",
			"extensions": [
				"sitx"
			]
		},
		"application/x-subrip": {
			"source": "apache",
			"extensions": [
				"srt"
			]
		},
		"application/x-sv4cpio": {
			"source": "apache",
			"extensions": [
				"sv4cpio"
			]
		},
		"application/x-sv4crc": {
			"source": "apache",
			"extensions": [
				"sv4crc"
			]
		},
		"application/x-t3vm-image": {
			"source": "apache",
			"extensions": [
				"t3"
			]
		},
		"application/x-tads": {
			"source": "apache",
			"extensions": [
				"gam"
			]
		},
		"application/x-tar": {
			"source": "apache",
			"compressible": true,
			"extensions": [
				"tar"
			]
		},
		"application/x-tcl": {
			"source": "apache",
			"extensions": [
				"tcl",
				"tk"
			]
		},
		"application/x-tex": {
			"source": "apache",
			"extensions": [
				"tex"
			]
		},
		"application/x-tex-tfm": {
			"source": "apache",
			"extensions": [
				"tfm"
			]
		},
		"application/x-texinfo": {
			"source": "apache",
			"extensions": [
				"texinfo",
				"texi"
			]
		},
		"application/x-tgif": {
			"source": "apache",
			"extensions": [
				"obj"
			]
		},
		"application/x-ustar": {
			"source": "apache",
			"extensions": [
				"ustar"
			]
		},
		"application/x-wais-source": {
			"source": "apache",
			"extensions": [
				"src"
			]
		},
		"application/x-web-app-manifest+json": {
			"compressible": true,
			"extensions": [
				"webapp"
			]
		},
		"application/x-www-form-urlencoded": {
			"source": "iana",
			"compressible": true
		},
		"application/x-x509-ca-cert": {
			"source": "apache",
			"extensions": [
				"der",
				"crt",
				"pem"
			]
		},
		"application/x-xfig": {
			"source": "apache",
			"extensions": [
				"fig"
			]
		},
		"application/x-xliff+xml": {
			"source": "apache",
			"extensions": [
				"xlf"
			]
		},
		"application/x-xpinstall": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"xpi"
			]
		},
		"application/x-xz": {
			"source": "apache",
			"extensions": [
				"xz"
			]
		},
		"application/x-zmachine": {
			"source": "apache",
			"extensions": [
				"z1",
				"z2",
				"z3",
				"z4",
				"z5",
				"z6",
				"z7",
				"z8"
			]
		},
		"application/x400-bp": {
			"source": "iana"
		},
		"application/xacml+xml": {
			"source": "iana"
		},
		"application/xaml+xml": {
			"source": "apache",
			"extensions": [
				"xaml"
			]
		},
		"application/xcap-att+xml": {
			"source": "iana"
		},
		"application/xcap-caps+xml": {
			"source": "iana"
		},
		"application/xcap-diff+xml": {
			"source": "iana",
			"extensions": [
				"xdf"
			]
		},
		"application/xcap-el+xml": {
			"source": "iana"
		},
		"application/xcap-error+xml": {
			"source": "iana"
		},
		"application/xcap-ns+xml": {
			"source": "iana"
		},
		"application/xcon-conference-info+xml": {
			"source": "iana"
		},
		"application/xcon-conference-info-diff+xml": {
			"source": "iana"
		},
		"application/xenc+xml": {
			"source": "iana",
			"extensions": [
				"xenc"
			]
		},
		"application/xhtml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"xhtml",
				"xht"
			]
		},
		"application/xhtml-voice+xml": {
			"source": "apache"
		},
		"application/xml": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"xml",
				"xsl",
				"xsd",
				"rng"
			]
		},
		"application/xml-dtd": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"dtd"
			]
		},
		"application/xml-external-parsed-entity": {
			"source": "iana"
		},
		"application/xml-patch+xml": {
			"source": "iana"
		},
		"application/xmpp+xml": {
			"source": "iana"
		},
		"application/xop+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"xop"
			]
		},
		"application/xproc+xml": {
			"source": "apache",
			"extensions": [
				"xpl"
			]
		},
		"application/xslt+xml": {
			"source": "iana",
			"extensions": [
				"xslt"
			]
		},
		"application/xspf+xml": {
			"source": "apache",
			"extensions": [
				"xspf"
			]
		},
		"application/xv+xml": {
			"source": "iana",
			"extensions": [
				"mxml",
				"xhvml",
				"xvml",
				"xvm"
			]
		},
		"application/yang": {
			"source": "iana",
			"extensions": [
				"yang"
			]
		},
		"application/yin+xml": {
			"source": "iana",
			"extensions": [
				"yin"
			]
		},
		"application/zip": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"zip"
			]
		},
		"application/zlib": {
			"source": "iana"
		},
		"audio/1d-interleaved-parityfec": {
			"source": "iana"
		},
		"audio/32kadpcm": {
			"source": "iana"
		},
		"audio/3gpp": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"3gpp"
			]
		},
		"audio/3gpp2": {
			"source": "iana"
		},
		"audio/ac3": {
			"source": "iana"
		},
		"audio/adpcm": {
			"source": "apache",
			"extensions": [
				"adp"
			]
		},
		"audio/amr": {
			"source": "iana"
		},
		"audio/amr-wb": {
			"source": "iana"
		},
		"audio/amr-wb+": {
			"source": "iana"
		},
		"audio/aptx": {
			"source": "iana"
		},
		"audio/asc": {
			"source": "iana"
		},
		"audio/atrac-advanced-lossless": {
			"source": "iana"
		},
		"audio/atrac-x": {
			"source": "iana"
		},
		"audio/atrac3": {
			"source": "iana"
		},
		"audio/basic": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"au",
				"snd"
			]
		},
		"audio/bv16": {
			"source": "iana"
		},
		"audio/bv32": {
			"source": "iana"
		},
		"audio/clearmode": {
			"source": "iana"
		},
		"audio/cn": {
			"source": "iana"
		},
		"audio/dat12": {
			"source": "iana"
		},
		"audio/dls": {
			"source": "iana"
		},
		"audio/dsr-es201108": {
			"source": "iana"
		},
		"audio/dsr-es202050": {
			"source": "iana"
		},
		"audio/dsr-es202211": {
			"source": "iana"
		},
		"audio/dsr-es202212": {
			"source": "iana"
		},
		"audio/dv": {
			"source": "iana"
		},
		"audio/dvi4": {
			"source": "iana"
		},
		"audio/eac3": {
			"source": "iana"
		},
		"audio/encaprtp": {
			"source": "iana"
		},
		"audio/evrc": {
			"source": "iana"
		},
		"audio/evrc-qcp": {
			"source": "iana"
		},
		"audio/evrc0": {
			"source": "iana"
		},
		"audio/evrc1": {
			"source": "iana"
		},
		"audio/evrcb": {
			"source": "iana"
		},
		"audio/evrcb0": {
			"source": "iana"
		},
		"audio/evrcb1": {
			"source": "iana"
		},
		"audio/evrcnw": {
			"source": "iana"
		},
		"audio/evrcnw0": {
			"source": "iana"
		},
		"audio/evrcnw1": {
			"source": "iana"
		},
		"audio/evrcwb": {
			"source": "iana"
		},
		"audio/evrcwb0": {
			"source": "iana"
		},
		"audio/evrcwb1": {
			"source": "iana"
		},
		"audio/evs": {
			"source": "iana"
		},
		"audio/fwdred": {
			"source": "iana"
		},
		"audio/g711-0": {
			"source": "iana"
		},
		"audio/g719": {
			"source": "iana"
		},
		"audio/g722": {
			"source": "iana"
		},
		"audio/g7221": {
			"source": "iana"
		},
		"audio/g723": {
			"source": "iana"
		},
		"audio/g726-16": {
			"source": "iana"
		},
		"audio/g726-24": {
			"source": "iana"
		},
		"audio/g726-32": {
			"source": "iana"
		},
		"audio/g726-40": {
			"source": "iana"
		},
		"audio/g728": {
			"source": "iana"
		},
		"audio/g729": {
			"source": "iana"
		},
		"audio/g7291": {
			"source": "iana"
		},
		"audio/g729d": {
			"source": "iana"
		},
		"audio/g729e": {
			"source": "iana"
		},
		"audio/gsm": {
			"source": "iana"
		},
		"audio/gsm-efr": {
			"source": "iana"
		},
		"audio/gsm-hr-08": {
			"source": "iana"
		},
		"audio/ilbc": {
			"source": "iana"
		},
		"audio/ip-mr_v2.5": {
			"source": "iana"
		},
		"audio/isac": {
			"source": "apache"
		},
		"audio/l16": {
			"source": "iana"
		},
		"audio/l20": {
			"source": "iana"
		},
		"audio/l24": {
			"source": "iana",
			"compressible": false
		},
		"audio/l8": {
			"source": "iana"
		},
		"audio/lpc": {
			"source": "iana"
		},
		"audio/midi": {
			"source": "apache",
			"extensions": [
				"mid",
				"midi",
				"kar",
				"rmi"
			]
		},
		"audio/mobile-xmf": {
			"source": "iana"
		},
		"audio/mp4": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"m4a",
				"mp4a"
			]
		},
		"audio/mp4a-latm": {
			"source": "iana"
		},
		"audio/mpa": {
			"source": "iana"
		},
		"audio/mpa-robust": {
			"source": "iana"
		},
		"audio/mpeg": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"mpga",
				"mp2",
				"mp2a",
				"mp3",
				"m2a",
				"m3a"
			]
		},
		"audio/mpeg4-generic": {
			"source": "iana"
		},
		"audio/musepack": {
			"source": "apache"
		},
		"audio/ogg": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"oga",
				"ogg",
				"spx"
			]
		},
		"audio/opus": {
			"source": "iana"
		},
		"audio/parityfec": {
			"source": "iana"
		},
		"audio/pcma": {
			"source": "iana"
		},
		"audio/pcma-wb": {
			"source": "iana"
		},
		"audio/pcmu": {
			"source": "iana"
		},
		"audio/pcmu-wb": {
			"source": "iana"
		},
		"audio/prs.sid": {
			"source": "iana"
		},
		"audio/qcelp": {
			"source": "iana"
		},
		"audio/raptorfec": {
			"source": "iana"
		},
		"audio/red": {
			"source": "iana"
		},
		"audio/rtp-enc-aescm128": {
			"source": "iana"
		},
		"audio/rtp-midi": {
			"source": "iana"
		},
		"audio/rtploopback": {
			"source": "iana"
		},
		"audio/rtx": {
			"source": "iana"
		},
		"audio/s3m": {
			"source": "apache",
			"extensions": [
				"s3m"
			]
		},
		"audio/silk": {
			"source": "apache",
			"extensions": [
				"sil"
			]
		},
		"audio/smv": {
			"source": "iana"
		},
		"audio/smv-qcp": {
			"source": "iana"
		},
		"audio/smv0": {
			"source": "iana"
		},
		"audio/sp-midi": {
			"source": "iana"
		},
		"audio/speex": {
			"source": "iana"
		},
		"audio/t140c": {
			"source": "iana"
		},
		"audio/t38": {
			"source": "iana"
		},
		"audio/telephone-event": {
			"source": "iana"
		},
		"audio/tone": {
			"source": "iana"
		},
		"audio/uemclip": {
			"source": "iana"
		},
		"audio/ulpfec": {
			"source": "iana"
		},
		"audio/vdvi": {
			"source": "iana"
		},
		"audio/vmr-wb": {
			"source": "iana"
		},
		"audio/vnd.3gpp.iufp": {
			"source": "iana"
		},
		"audio/vnd.4sb": {
			"source": "iana"
		},
		"audio/vnd.audiokoz": {
			"source": "iana"
		},
		"audio/vnd.celp": {
			"source": "iana"
		},
		"audio/vnd.cisco.nse": {
			"source": "iana"
		},
		"audio/vnd.cmles.radio-events": {
			"source": "iana"
		},
		"audio/vnd.cns.anp1": {
			"source": "iana"
		},
		"audio/vnd.cns.inf1": {
			"source": "iana"
		},
		"audio/vnd.dece.audio": {
			"source": "iana",
			"extensions": [
				"uva",
				"uvva"
			]
		},
		"audio/vnd.digital-winds": {
			"source": "iana",
			"extensions": [
				"eol"
			]
		},
		"audio/vnd.dlna.adts": {
			"source": "iana"
		},
		"audio/vnd.dolby.heaac.1": {
			"source": "iana"
		},
		"audio/vnd.dolby.heaac.2": {
			"source": "iana"
		},
		"audio/vnd.dolby.mlp": {
			"source": "iana"
		},
		"audio/vnd.dolby.mps": {
			"source": "iana"
		},
		"audio/vnd.dolby.pl2": {
			"source": "iana"
		},
		"audio/vnd.dolby.pl2x": {
			"source": "iana"
		},
		"audio/vnd.dolby.pl2z": {
			"source": "iana"
		},
		"audio/vnd.dolby.pulse.1": {
			"source": "iana"
		},
		"audio/vnd.dra": {
			"source": "iana",
			"extensions": [
				"dra"
			]
		},
		"audio/vnd.dts": {
			"source": "iana",
			"extensions": [
				"dts"
			]
		},
		"audio/vnd.dts.hd": {
			"source": "iana",
			"extensions": [
				"dtshd"
			]
		},
		"audio/vnd.dvb.file": {
			"source": "iana"
		},
		"audio/vnd.everad.plj": {
			"source": "iana"
		},
		"audio/vnd.hns.audio": {
			"source": "iana"
		},
		"audio/vnd.lucent.voice": {
			"source": "iana",
			"extensions": [
				"lvp"
			]
		},
		"audio/vnd.ms-playready.media.pya": {
			"source": "iana",
			"extensions": [
				"pya"
			]
		},
		"audio/vnd.nokia.mobile-xmf": {
			"source": "iana"
		},
		"audio/vnd.nortel.vbk": {
			"source": "iana"
		},
		"audio/vnd.nuera.ecelp4800": {
			"source": "iana",
			"extensions": [
				"ecelp4800"
			]
		},
		"audio/vnd.nuera.ecelp7470": {
			"source": "iana",
			"extensions": [
				"ecelp7470"
			]
		},
		"audio/vnd.nuera.ecelp9600": {
			"source": "iana",
			"extensions": [
				"ecelp9600"
			]
		},
		"audio/vnd.octel.sbc": {
			"source": "iana"
		},
		"audio/vnd.qcelp": {
			"source": "iana"
		},
		"audio/vnd.rhetorex.32kadpcm": {
			"source": "iana"
		},
		"audio/vnd.rip": {
			"source": "iana",
			"extensions": [
				"rip"
			]
		},
		"audio/vnd.rn-realaudio": {
			"compressible": false
		},
		"audio/vnd.sealedmedia.softseal.mpeg": {
			"source": "iana"
		},
		"audio/vnd.vmx.cvsd": {
			"source": "iana"
		},
		"audio/vnd.wave": {
			"compressible": false
		},
		"audio/vorbis": {
			"source": "iana",
			"compressible": false
		},
		"audio/vorbis-config": {
			"source": "iana"
		},
		"audio/wav": {
			"compressible": false,
			"extensions": [
				"wav"
			]
		},
		"audio/wave": {
			"compressible": false,
			"extensions": [
				"wav"
			]
		},
		"audio/webm": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"weba"
			]
		},
		"audio/x-aac": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"aac"
			]
		},
		"audio/x-aiff": {
			"source": "apache",
			"extensions": [
				"aif",
				"aiff",
				"aifc"
			]
		},
		"audio/x-caf": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"caf"
			]
		},
		"audio/x-flac": {
			"source": "apache",
			"extensions": [
				"flac"
			]
		},
		"audio/x-m4a": {
			"source": "nginx",
			"extensions": [
				"m4a"
			]
		},
		"audio/x-matroska": {
			"source": "apache",
			"extensions": [
				"mka"
			]
		},
		"audio/x-mpegurl": {
			"source": "apache",
			"extensions": [
				"m3u"
			]
		},
		"audio/x-ms-wax": {
			"source": "apache",
			"extensions": [
				"wax"
			]
		},
		"audio/x-ms-wma": {
			"source": "apache",
			"extensions": [
				"wma"
			]
		},
		"audio/x-pn-realaudio": {
			"source": "apache",
			"extensions": [
				"ram",
				"ra"
			]
		},
		"audio/x-pn-realaudio-plugin": {
			"source": "apache",
			"extensions": [
				"rmp"
			]
		},
		"audio/x-realaudio": {
			"source": "nginx",
			"extensions": [
				"ra"
			]
		},
		"audio/x-tta": {
			"source": "apache"
		},
		"audio/x-wav": {
			"source": "apache",
			"extensions": [
				"wav"
			]
		},
		"audio/xm": {
			"source": "apache",
			"extensions": [
				"xm"
			]
		},
		"chemical/x-cdx": {
			"source": "apache",
			"extensions": [
				"cdx"
			]
		},
		"chemical/x-cif": {
			"source": "apache",
			"extensions": [
				"cif"
			]
		},
		"chemical/x-cmdf": {
			"source": "apache",
			"extensions": [
				"cmdf"
			]
		},
		"chemical/x-cml": {
			"source": "apache",
			"extensions": [
				"cml"
			]
		},
		"chemical/x-csml": {
			"source": "apache",
			"extensions": [
				"csml"
			]
		},
		"chemical/x-pdb": {
			"source": "apache"
		},
		"chemical/x-xyz": {
			"source": "apache",
			"extensions": [
				"xyz"
			]
		},
		"font/opentype": {
			"compressible": true,
			"extensions": [
				"otf"
			]
		},
		"image/bmp": {
			"source": "apache",
			"compressible": true,
			"extensions": [
				"bmp"
			]
		},
		"image/cgm": {
			"source": "iana",
			"extensions": [
				"cgm"
			]
		},
		"image/fits": {
			"source": "iana"
		},
		"image/g3fax": {
			"source": "iana",
			"extensions": [
				"g3"
			]
		},
		"image/gif": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"gif"
			]
		},
		"image/ief": {
			"source": "iana",
			"extensions": [
				"ief"
			]
		},
		"image/jp2": {
			"source": "iana"
		},
		"image/jpeg": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"jpeg",
				"jpg",
				"jpe"
			]
		},
		"image/jpm": {
			"source": "iana"
		},
		"image/jpx": {
			"source": "iana"
		},
		"image/ktx": {
			"source": "iana",
			"extensions": [
				"ktx"
			]
		},
		"image/naplps": {
			"source": "iana"
		},
		"image/pjpeg": {
			"compressible": false
		},
		"image/png": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"png"
			]
		},
		"image/prs.btif": {
			"source": "iana",
			"extensions": [
				"btif"
			]
		},
		"image/prs.pti": {
			"source": "iana"
		},
		"image/pwg-raster": {
			"source": "iana"
		},
		"image/sgi": {
			"source": "apache",
			"extensions": [
				"sgi"
			]
		},
		"image/svg+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"svg",
				"svgz"
			]
		},
		"image/t38": {
			"source": "iana"
		},
		"image/tiff": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"tiff",
				"tif"
			]
		},
		"image/tiff-fx": {
			"source": "iana"
		},
		"image/vnd.adobe.photoshop": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"psd"
			]
		},
		"image/vnd.airzip.accelerator.azv": {
			"source": "iana"
		},
		"image/vnd.cns.inf2": {
			"source": "iana"
		},
		"image/vnd.dece.graphic": {
			"source": "iana",
			"extensions": [
				"uvi",
				"uvvi",
				"uvg",
				"uvvg"
			]
		},
		"image/vnd.djvu": {
			"source": "iana",
			"extensions": [
				"djvu",
				"djv"
			]
		},
		"image/vnd.dvb.subtitle": {
			"source": "iana",
			"extensions": [
				"sub"
			]
		},
		"image/vnd.dwg": {
			"source": "iana",
			"extensions": [
				"dwg"
			]
		},
		"image/vnd.dxf": {
			"source": "iana",
			"extensions": [
				"dxf"
			]
		},
		"image/vnd.fastbidsheet": {
			"source": "iana",
			"extensions": [
				"fbs"
			]
		},
		"image/vnd.fpx": {
			"source": "iana",
			"extensions": [
				"fpx"
			]
		},
		"image/vnd.fst": {
			"source": "iana",
			"extensions": [
				"fst"
			]
		},
		"image/vnd.fujixerox.edmics-mmr": {
			"source": "iana",
			"extensions": [
				"mmr"
			]
		},
		"image/vnd.fujixerox.edmics-rlc": {
			"source": "iana",
			"extensions": [
				"rlc"
			]
		},
		"image/vnd.globalgraphics.pgb": {
			"source": "iana"
		},
		"image/vnd.microsoft.icon": {
			"source": "iana"
		},
		"image/vnd.mix": {
			"source": "iana"
		},
		"image/vnd.mozilla.apng": {
			"source": "iana"
		},
		"image/vnd.ms-modi": {
			"source": "iana",
			"extensions": [
				"mdi"
			]
		},
		"image/vnd.ms-photo": {
			"source": "apache",
			"extensions": [
				"wdp"
			]
		},
		"image/vnd.net-fpx": {
			"source": "iana",
			"extensions": [
				"npx"
			]
		},
		"image/vnd.radiance": {
			"source": "iana"
		},
		"image/vnd.sealed.png": {
			"source": "iana"
		},
		"image/vnd.sealedmedia.softseal.gif": {
			"source": "iana"
		},
		"image/vnd.sealedmedia.softseal.jpg": {
			"source": "iana"
		},
		"image/vnd.svf": {
			"source": "iana"
		},
		"image/vnd.tencent.tap": {
			"source": "iana"
		},
		"image/vnd.valve.source.texture": {
			"source": "iana"
		},
		"image/vnd.wap.wbmp": {
			"source": "iana",
			"extensions": [
				"wbmp"
			]
		},
		"image/vnd.xiff": {
			"source": "iana",
			"extensions": [
				"xif"
			]
		},
		"image/vnd.zbrush.pcx": {
			"source": "iana"
		},
		"image/webp": {
			"source": "apache",
			"extensions": [
				"webp"
			]
		},
		"image/x-3ds": {
			"source": "apache",
			"extensions": [
				"3ds"
			]
		},
		"image/x-cmu-raster": {
			"source": "apache",
			"extensions": [
				"ras"
			]
		},
		"image/x-cmx": {
			"source": "apache",
			"extensions": [
				"cmx"
			]
		},
		"image/x-freehand": {
			"source": "apache",
			"extensions": [
				"fh",
				"fhc",
				"fh4",
				"fh5",
				"fh7"
			]
		},
		"image/x-icon": {
			"source": "apache",
			"compressible": true,
			"extensions": [
				"ico"
			]
		},
		"image/x-jng": {
			"source": "nginx",
			"extensions": [
				"jng"
			]
		},
		"image/x-mrsid-image": {
			"source": "apache",
			"extensions": [
				"sid"
			]
		},
		"image/x-ms-bmp": {
			"source": "nginx",
			"compressible": true,
			"extensions": [
				"bmp"
			]
		},
		"image/x-pcx": {
			"source": "apache",
			"extensions": [
				"pcx"
			]
		},
		"image/x-pict": {
			"source": "apache",
			"extensions": [
				"pic",
				"pct"
			]
		},
		"image/x-portable-anymap": {
			"source": "apache",
			"extensions": [
				"pnm"
			]
		},
		"image/x-portable-bitmap": {
			"source": "apache",
			"extensions": [
				"pbm"
			]
		},
		"image/x-portable-graymap": {
			"source": "apache",
			"extensions": [
				"pgm"
			]
		},
		"image/x-portable-pixmap": {
			"source": "apache",
			"extensions": [
				"ppm"
			]
		},
		"image/x-rgb": {
			"source": "apache",
			"extensions": [
				"rgb"
			]
		},
		"image/x-tga": {
			"source": "apache",
			"extensions": [
				"tga"
			]
		},
		"image/x-xbitmap": {
			"source": "apache",
			"extensions": [
				"xbm"
			]
		},
		"image/x-xcf": {
			"compressible": false
		},
		"image/x-xpixmap": {
			"source": "apache",
			"extensions": [
				"xpm"
			]
		},
		"image/x-xwindowdump": {
			"source": "apache",
			"extensions": [
				"xwd"
			]
		},
		"message/cpim": {
			"source": "iana"
		},
		"message/delivery-status": {
			"source": "iana"
		},
		"message/disposition-notification": {
			"source": "iana"
		},
		"message/external-body": {
			"source": "iana"
		},
		"message/feedback-report": {
			"source": "iana"
		},
		"message/global": {
			"source": "iana"
		},
		"message/global-delivery-status": {
			"source": "iana"
		},
		"message/global-disposition-notification": {
			"source": "iana"
		},
		"message/global-headers": {
			"source": "iana"
		},
		"message/http": {
			"source": "iana",
			"compressible": false
		},
		"message/imdn+xml": {
			"source": "iana",
			"compressible": true
		},
		"message/news": {
			"source": "iana"
		},
		"message/partial": {
			"source": "iana",
			"compressible": false
		},
		"message/rfc822": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"eml",
				"mime"
			]
		},
		"message/s-http": {
			"source": "iana"
		},
		"message/sip": {
			"source": "iana"
		},
		"message/sipfrag": {
			"source": "iana"
		},
		"message/tracking-status": {
			"source": "iana"
		},
		"message/vnd.si.simp": {
			"source": "iana"
		},
		"message/vnd.wfa.wsc": {
			"source": "iana"
		},
		"model/iges": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"igs",
				"iges"
			]
		},
		"model/mesh": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"msh",
				"mesh",
				"silo"
			]
		},
		"model/vnd.collada+xml": {
			"source": "iana",
			"extensions": [
				"dae"
			]
		},
		"model/vnd.dwf": {
			"source": "iana",
			"extensions": [
				"dwf"
			]
		},
		"model/vnd.flatland.3dml": {
			"source": "iana"
		},
		"model/vnd.gdl": {
			"source": "iana",
			"extensions": [
				"gdl"
			]
		},
		"model/vnd.gs-gdl": {
			"source": "apache"
		},
		"model/vnd.gs.gdl": {
			"source": "iana"
		},
		"model/vnd.gtw": {
			"source": "iana",
			"extensions": [
				"gtw"
			]
		},
		"model/vnd.moml+xml": {
			"source": "iana"
		},
		"model/vnd.mts": {
			"source": "iana",
			"extensions": [
				"mts"
			]
		},
		"model/vnd.opengex": {
			"source": "iana"
		},
		"model/vnd.parasolid.transmit.binary": {
			"source": "iana"
		},
		"model/vnd.parasolid.transmit.text": {
			"source": "iana"
		},
		"model/vnd.rosette.annotated-data-model": {
			"source": "iana"
		},
		"model/vnd.valve.source.compiled-map": {
			"source": "iana"
		},
		"model/vnd.vtu": {
			"source": "iana",
			"extensions": [
				"vtu"
			]
		},
		"model/vrml": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"wrl",
				"vrml"
			]
		},
		"model/x3d+binary": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"x3db",
				"x3dbz"
			]
		},
		"model/x3d+fastinfoset": {
			"source": "iana"
		},
		"model/x3d+vrml": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"x3dv",
				"x3dvz"
			]
		},
		"model/x3d+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"x3d",
				"x3dz"
			]
		},
		"model/x3d-vrml": {
			"source": "iana"
		},
		"multipart/alternative": {
			"source": "iana",
			"compressible": false
		},
		"multipart/appledouble": {
			"source": "iana"
		},
		"multipart/byteranges": {
			"source": "iana"
		},
		"multipart/digest": {
			"source": "iana"
		},
		"multipart/encrypted": {
			"source": "iana",
			"compressible": false
		},
		"multipart/form-data": {
			"source": "iana",
			"compressible": false
		},
		"multipart/header-set": {
			"source": "iana"
		},
		"multipart/mixed": {
			"source": "iana",
			"compressible": false
		},
		"multipart/parallel": {
			"source": "iana"
		},
		"multipart/related": {
			"source": "iana",
			"compressible": false
		},
		"multipart/report": {
			"source": "iana"
		},
		"multipart/signed": {
			"source": "iana",
			"compressible": false
		},
		"multipart/voice-message": {
			"source": "iana"
		},
		"multipart/x-mixed-replace": {
			"source": "iana"
		},
		"text/1d-interleaved-parityfec": {
			"source": "iana"
		},
		"text/cache-manifest": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"appcache",
				"manifest"
			]
		},
		"text/calendar": {
			"source": "iana",
			"extensions": [
				"ics",
				"ifb"
			]
		},
		"text/calender": {
			"compressible": true
		},
		"text/cmd": {
			"compressible": true
		},
		"text/coffeescript": {
			"extensions": [
				"coffee",
				"litcoffee"
			]
		},
		"text/css": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"css"
			]
		},
		"text/csv": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"csv"
			]
		},
		"text/csv-schema": {
			"source": "iana"
		},
		"text/directory": {
			"source": "iana"
		},
		"text/dns": {
			"source": "iana"
		},
		"text/ecmascript": {
			"source": "iana"
		},
		"text/encaprtp": {
			"source": "iana"
		},
		"text/enriched": {
			"source": "iana"
		},
		"text/fwdred": {
			"source": "iana"
		},
		"text/grammar-ref-list": {
			"source": "iana"
		},
		"text/hjson": {
			"extensions": [
				"hjson"
			]
		},
		"text/html": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"html",
				"htm",
				"shtml"
			]
		},
		"text/jade": {
			"extensions": [
				"jade"
			]
		},
		"text/javascript": {
			"source": "iana",
			"compressible": true
		},
		"text/jcr-cnd": {
			"source": "iana"
		},
		"text/jsx": {
			"compressible": true,
			"extensions": [
				"jsx"
			]
		},
		"text/less": {
			"extensions": [
				"less"
			]
		},
		"text/markdown": {
			"source": "iana"
		},
		"text/mathml": {
			"source": "nginx",
			"extensions": [
				"mml"
			]
		},
		"text/mizar": {
			"source": "iana"
		},
		"text/n3": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"n3"
			]
		},
		"text/parameters": {
			"source": "iana"
		},
		"text/parityfec": {
			"source": "iana"
		},
		"text/plain": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"txt",
				"text",
				"conf",
				"def",
				"list",
				"log",
				"in",
				"ini"
			]
		},
		"text/provenance-notation": {
			"source": "iana"
		},
		"text/prs.fallenstein.rst": {
			"source": "iana"
		},
		"text/prs.lines.tag": {
			"source": "iana",
			"extensions": [
				"dsc"
			]
		},
		"text/prs.prop.logic": {
			"source": "iana"
		},
		"text/raptorfec": {
			"source": "iana"
		},
		"text/red": {
			"source": "iana"
		},
		"text/rfc822-headers": {
			"source": "iana"
		},
		"text/richtext": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"rtx"
			]
		},
		"text/rtf": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"rtf"
			]
		},
		"text/rtp-enc-aescm128": {
			"source": "iana"
		},
		"text/rtploopback": {
			"source": "iana"
		},
		"text/rtx": {
			"source": "iana"
		},
		"text/sgml": {
			"source": "iana",
			"extensions": [
				"sgml",
				"sgm"
			]
		},
		"text/slim": {
			"extensions": [
				"slim",
				"slm"
			]
		},
		"text/stylus": {
			"extensions": [
				"stylus",
				"styl"
			]
		},
		"text/t140": {
			"source": "iana"
		},
		"text/tab-separated-values": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"tsv"
			]
		},
		"text/troff": {
			"source": "iana",
			"extensions": [
				"t",
				"tr",
				"roff",
				"man",
				"me",
				"ms"
			]
		},
		"text/turtle": {
			"source": "iana",
			"extensions": [
				"ttl"
			]
		},
		"text/ulpfec": {
			"source": "iana"
		},
		"text/uri-list": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"uri",
				"uris",
				"urls"
			]
		},
		"text/vcard": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"vcard"
			]
		},
		"text/vnd.a": {
			"source": "iana"
		},
		"text/vnd.abc": {
			"source": "iana"
		},
		"text/vnd.curl": {
			"source": "iana",
			"extensions": [
				"curl"
			]
		},
		"text/vnd.curl.dcurl": {
			"source": "apache",
			"extensions": [
				"dcurl"
			]
		},
		"text/vnd.curl.mcurl": {
			"source": "apache",
			"extensions": [
				"mcurl"
			]
		},
		"text/vnd.curl.scurl": {
			"source": "apache",
			"extensions": [
				"scurl"
			]
		},
		"text/vnd.debian.copyright": {
			"source": "iana"
		},
		"text/vnd.dmclientscript": {
			"source": "iana"
		},
		"text/vnd.dvb.subtitle": {
			"source": "iana",
			"extensions": [
				"sub"
			]
		},
		"text/vnd.esmertec.theme-descriptor": {
			"source": "iana"
		},
		"text/vnd.fly": {
			"source": "iana",
			"extensions": [
				"fly"
			]
		},
		"text/vnd.fmi.flexstor": {
			"source": "iana",
			"extensions": [
				"flx"
			]
		},
		"text/vnd.graphviz": {
			"source": "iana",
			"extensions": [
				"gv"
			]
		},
		"text/vnd.in3d.3dml": {
			"source": "iana",
			"extensions": [
				"3dml"
			]
		},
		"text/vnd.in3d.spot": {
			"source": "iana",
			"extensions": [
				"spot"
			]
		},
		"text/vnd.iptc.newsml": {
			"source": "iana"
		},
		"text/vnd.iptc.nitf": {
			"source": "iana"
		},
		"text/vnd.latex-z": {
			"source": "iana"
		},
		"text/vnd.motorola.reflex": {
			"source": "iana"
		},
		"text/vnd.ms-mediapackage": {
			"source": "iana"
		},
		"text/vnd.net2phone.commcenter.command": {
			"source": "iana"
		},
		"text/vnd.radisys.msml-basic-layout": {
			"source": "iana"
		},
		"text/vnd.si.uricatalogue": {
			"source": "iana"
		},
		"text/vnd.sun.j2me.app-descriptor": {
			"source": "iana",
			"extensions": [
				"jad"
			]
		},
		"text/vnd.trolltech.linguist": {
			"source": "iana"
		},
		"text/vnd.wap.si": {
			"source": "iana"
		},
		"text/vnd.wap.sl": {
			"source": "iana"
		},
		"text/vnd.wap.wml": {
			"source": "iana",
			"extensions": [
				"wml"
			]
		},
		"text/vnd.wap.wmlscript": {
			"source": "iana",
			"extensions": [
				"wmls"
			]
		},
		"text/vtt": {
			"charset": "UTF-8",
			"compressible": true,
			"extensions": [
				"vtt"
			]
		},
		"text/x-asm": {
			"source": "apache",
			"extensions": [
				"s",
				"asm"
			]
		},
		"text/x-c": {
			"source": "apache",
			"extensions": [
				"c",
				"cc",
				"cxx",
				"cpp",
				"h",
				"hh",
				"dic"
			]
		},
		"text/x-component": {
			"source": "nginx",
			"extensions": [
				"htc"
			]
		},
		"text/x-fortran": {
			"source": "apache",
			"extensions": [
				"f",
				"for",
				"f77",
				"f90"
			]
		},
		"text/x-gwt-rpc": {
			"compressible": true
		},
		"text/x-handlebars-template": {
			"extensions": [
				"hbs"
			]
		},
		"text/x-java-source": {
			"source": "apache",
			"extensions": [
				"java"
			]
		},
		"text/x-jquery-tmpl": {
			"compressible": true
		},
		"text/x-lua": {
			"extensions": [
				"lua"
			]
		},
		"text/x-markdown": {
			"compressible": true,
			"extensions": [
				"markdown",
				"md",
				"mkd"
			]
		},
		"text/x-nfo": {
			"source": "apache",
			"extensions": [
				"nfo"
			]
		},
		"text/x-opml": {
			"source": "apache",
			"extensions": [
				"opml"
			]
		},
		"text/x-pascal": {
			"source": "apache",
			"extensions": [
				"p",
				"pas"
			]
		},
		"text/x-processing": {
			"compressible": true,
			"extensions": [
				"pde"
			]
		},
		"text/x-sass": {
			"extensions": [
				"sass"
			]
		},
		"text/x-scss": {
			"extensions": [
				"scss"
			]
		},
		"text/x-setext": {
			"source": "apache",
			"extensions": [
				"etx"
			]
		},
		"text/x-sfv": {
			"source": "apache",
			"extensions": [
				"sfv"
			]
		},
		"text/x-suse-ymp": {
			"compressible": true,
			"extensions": [
				"ymp"
			]
		},
		"text/x-uuencode": {
			"source": "apache",
			"extensions": [
				"uu"
			]
		},
		"text/x-vcalendar": {
			"source": "apache",
			"extensions": [
				"vcs"
			]
		},
		"text/x-vcard": {
			"source": "apache",
			"extensions": [
				"vcf"
			]
		},
		"text/xml": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"xml"
			]
		},
		"text/xml-external-parsed-entity": {
			"source": "iana"
		},
		"text/yaml": {
			"extensions": [
				"yaml",
				"yml"
			]
		},
		"video/1d-interleaved-parityfec": {
			"source": "apache"
		},
		"video/3gpp": {
			"source": "apache",
			"extensions": [
				"3gp",
				"3gpp"
			]
		},
		"video/3gpp-tt": {
			"source": "apache"
		},
		"video/3gpp2": {
			"source": "apache",
			"extensions": [
				"3g2"
			]
		},
		"video/bmpeg": {
			"source": "apache"
		},
		"video/bt656": {
			"source": "apache"
		},
		"video/celb": {
			"source": "apache"
		},
		"video/dv": {
			"source": "apache"
		},
		"video/encaprtp": {
			"source": "apache"
		},
		"video/h261": {
			"source": "apache",
			"extensions": [
				"h261"
			]
		},
		"video/h263": {
			"source": "apache",
			"extensions": [
				"h263"
			]
		},
		"video/h263-1998": {
			"source": "apache"
		},
		"video/h263-2000": {
			"source": "apache"
		},
		"video/h264": {
			"source": "apache",
			"extensions": [
				"h264"
			]
		},
		"video/h264-rcdo": {
			"source": "apache"
		},
		"video/h264-svc": {
			"source": "apache"
		},
		"video/h265": {
			"source": "apache"
		},
		"video/iso.segment": {
			"source": "apache"
		},
		"video/jpeg": {
			"source": "apache",
			"extensions": [
				"jpgv"
			]
		},
		"video/jpeg2000": {
			"source": "apache"
		},
		"video/jpm": {
			"source": "apache",
			"extensions": [
				"jpm",
				"jpgm"
			]
		},
		"video/mj2": {
			"source": "apache",
			"extensions": [
				"mj2",
				"mjp2"
			]
		},
		"video/mp1s": {
			"source": "apache"
		},
		"video/mp2p": {
			"source": "apache"
		},
		"video/mp2t": {
			"source": "apache",
			"extensions": [
				"ts"
			]
		},
		"video/mp4": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"mp4",
				"mp4v",
				"mpg4"
			]
		},
		"video/mp4v-es": {
			"source": "apache"
		},
		"video/mpeg": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"mpeg",
				"mpg",
				"mpe",
				"m1v",
				"m2v"
			]
		},
		"video/mpeg4-generic": {
			"source": "apache"
		},
		"video/mpv": {
			"source": "apache"
		},
		"video/nv": {
			"source": "apache"
		},
		"video/ogg": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"ogv"
			]
		},
		"video/parityfec": {
			"source": "apache"
		},
		"video/pointer": {
			"source": "apache"
		},
		"video/quicktime": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"qt",
				"mov"
			]
		},
		"video/raptorfec": {
			"source": "apache"
		},
		"video/raw": {
			"source": "apache"
		},
		"video/rtp-enc-aescm128": {
			"source": "apache"
		},
		"video/rtploopback": {
			"source": "apache"
		},
		"video/rtx": {
			"source": "apache"
		},
		"video/smpte292m": {
			"source": "apache"
		},
		"video/ulpfec": {
			"source": "apache"
		},
		"video/vc1": {
			"source": "apache"
		},
		"video/vnd.cctv": {
			"source": "apache"
		},
		"video/vnd.dece.hd": {
			"source": "apache",
			"extensions": [
				"uvh",
				"uvvh"
			]
		},
		"video/vnd.dece.mobile": {
			"source": "apache",
			"extensions": [
				"uvm",
				"uvvm"
			]
		},
		"video/vnd.dece.mp4": {
			"source": "apache"
		},
		"video/vnd.dece.pd": {
			"source": "apache",
			"extensions": [
				"uvp",
				"uvvp"
			]
		},
		"video/vnd.dece.sd": {
			"source": "apache",
			"extensions": [
				"uvs",
				"uvvs"
			]
		},
		"video/vnd.dece.video": {
			"source": "apache",
			"extensions": [
				"uvv",
				"uvvv"
			]
		},
		"video/vnd.directv.mpeg": {
			"source": "apache"
		},
		"video/vnd.directv.mpeg-tts": {
			"source": "apache"
		},
		"video/vnd.dlna.mpeg-tts": {
			"source": "apache"
		},
		"video/vnd.dvb.file": {
			"source": "apache",
			"extensions": [
				"dvb"
			]
		},
		"video/vnd.fvt": {
			"source": "apache",
			"extensions": [
				"fvt"
			]
		},
		"video/vnd.hns.video": {
			"source": "apache"
		},
		"video/vnd.iptvforum.1dparityfec-1010": {
			"source": "apache"
		},
		"video/vnd.iptvforum.1dparityfec-2005": {
			"source": "apache"
		},
		"video/vnd.iptvforum.2dparityfec-1010": {
			"source": "apache"
		},
		"video/vnd.iptvforum.2dparityfec-2005": {
			"source": "apache"
		},
		"video/vnd.iptvforum.ttsavc": {
			"source": "apache"
		},
		"video/vnd.iptvforum.ttsmpeg2": {
			"source": "apache"
		},
		"video/vnd.motorola.video": {
			"source": "apache"
		},
		"video/vnd.motorola.videop": {
			"source": "apache"
		},
		"video/vnd.mpegurl": {
			"source": "apache",
			"extensions": [
				"mxu",
				"m4u"
			]
		},
		"video/vnd.ms-playready.media.pyv": {
			"source": "apache",
			"extensions": [
				"pyv"
			]
		},
		"video/vnd.nokia.interleaved-multimedia": {
			"source": "apache"
		},
		"video/vnd.nokia.videovoip": {
			"source": "apache"
		},
		"video/vnd.objectvideo": {
			"source": "apache"
		},
		"video/vnd.radgamettools.bink": {
			"source": "apache"
		},
		"video/vnd.radgamettools.smacker": {
			"source": "apache"
		},
		"video/vnd.sealed.mpeg1": {
			"source": "apache"
		},
		"video/vnd.sealed.mpeg4": {
			"source": "apache"
		},
		"video/vnd.sealed.swf": {
			"source": "apache"
		},
		"video/vnd.sealedmedia.softseal.mov": {
			"source": "apache"
		},
		"video/vnd.uvvu.mp4": {
			"source": "apache",
			"extensions": [
				"uvu",
				"uvvu"
			]
		},
		"video/vnd.vivo": {
			"source": "apache",
			"extensions": [
				"viv"
			]
		},
		"video/vp8": {
			"source": "apache"
		},
		"video/webm": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"webm"
			]
		},
		"video/x-f4v": {
			"source": "apache",
			"extensions": [
				"f4v"
			]
		},
		"video/x-fli": {
			"source": "apache",
			"extensions": [
				"fli"
			]
		},
		"video/x-flv": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"flv"
			]
		},
		"video/x-m4v": {
			"source": "apache",
			"extensions": [
				"m4v"
			]
		},
		"video/x-matroska": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"mkv",
				"mk3d",
				"mks"
			]
		},
		"video/x-mng": {
			"source": "apache",
			"extensions": [
				"mng"
			]
		},
		"video/x-ms-asf": {
			"source": "apache",
			"extensions": [
				"asf",
				"asx"
			]
		},
		"video/x-ms-vob": {
			"source": "apache",
			"extensions": [
				"vob"
			]
		},
		"video/x-ms-wm": {
			"source": "apache",
			"extensions": [
				"wm"
			]
		},
		"video/x-ms-wmv": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"wmv"
			]
		},
		"video/x-ms-wmx": {
			"source": "apache",
			"extensions": [
				"wmx"
			]
		},
		"video/x-ms-wvx": {
			"source": "apache",
			"extensions": [
				"wvx"
			]
		},
		"video/x-msvideo": {
			"source": "apache",
			"extensions": [
				"avi"
			]
		},
		"video/x-sgi-movie": {
			"source": "apache",
			"extensions": [
				"movie"
			]
		},
		"video/x-smv": {
			"source": "apache",
			"extensions": [
				"smv"
			]
		},
		"x-conference/x-cooltalk": {
			"source": "apache",
			"extensions": [
				"ice"
			]
		},
		"x-shader/x-fragment": {
			"compressible": true
		},
		"x-shader/x-vertex": {
			"compressible": true
		}
	};

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * async
	 * https://github.com/caolan/async
	 *
	 * Copyright 2010-2014 Caolan McMahon
	 * Released under the MIT license
	 */
	(function () {

	    var async = {};
	    function noop() {}
	    function identity(v) {
	        return v;
	    }
	    function toBool(v) {
	        return !!v;
	    }
	    function notId(v) {
	        return !v;
	    }

	    // global on the server, window in the browser
	    var previous_async;

	    // Establish the root object, `window` (`self`) in the browser, `global`
	    // on the server, or `this` in some virtual machines. We use `self`
	    // instead of `window` for `WebWorker` support.
	    var root = typeof self === 'object' && self.self === self && self ||
	            typeof global === 'object' && global.global === global && global ||
	            this;

	    if (root != null) {
	        previous_async = root.async;
	    }

	    async.noConflict = function () {
	        root.async = previous_async;
	        return async;
	    };

	    function only_once(fn) {
	        return function() {
	            if (fn === null) throw new Error("Callback was already called.");
	            fn.apply(this, arguments);
	            fn = null;
	        };
	    }

	    function _once(fn) {
	        return function() {
	            if (fn === null) return;
	            fn.apply(this, arguments);
	            fn = null;
	        };
	    }

	    //// cross-browser compatiblity functions ////

	    var _toString = Object.prototype.toString;

	    var _isArray = Array.isArray || function (obj) {
	        return _toString.call(obj) === '[object Array]';
	    };

	    // Ported from underscore.js isObject
	    var _isObject = function(obj) {
	        var type = typeof obj;
	        return type === 'function' || type === 'object' && !!obj;
	    };

	    function _isArrayLike(arr) {
	        return _isArray(arr) || (
	            // has a positive integer length property
	            typeof arr.length === "number" &&
	            arr.length >= 0 &&
	            arr.length % 1 === 0
	        );
	    }

	    function _arrayEach(arr, iterator) {
	        var index = -1,
	            length = arr.length;

	        while (++index < length) {
	            iterator(arr[index], index, arr);
	        }
	    }

	    function _map(arr, iterator) {
	        var index = -1,
	            length = arr.length,
	            result = Array(length);

	        while (++index < length) {
	            result[index] = iterator(arr[index], index, arr);
	        }
	        return result;
	    }

	    function _range(count) {
	        return _map(Array(count), function (v, i) { return i; });
	    }

	    function _reduce(arr, iterator, memo) {
	        _arrayEach(arr, function (x, i, a) {
	            memo = iterator(memo, x, i, a);
	        });
	        return memo;
	    }

	    function _forEachOf(object, iterator) {
	        _arrayEach(_keys(object), function (key) {
	            iterator(object[key], key);
	        });
	    }

	    function _indexOf(arr, item) {
	        for (var i = 0; i < arr.length; i++) {
	            if (arr[i] === item) return i;
	        }
	        return -1;
	    }

	    var _keys = Object.keys || function (obj) {
	        var keys = [];
	        for (var k in obj) {
	            if (obj.hasOwnProperty(k)) {
	                keys.push(k);
	            }
	        }
	        return keys;
	    };

	    function _keyIterator(coll) {
	        var i = -1;
	        var len;
	        var keys;
	        if (_isArrayLike(coll)) {
	            len = coll.length;
	            return function next() {
	                i++;
	                return i < len ? i : null;
	            };
	        } else {
	            keys = _keys(coll);
	            len = keys.length;
	            return function next() {
	                i++;
	                return i < len ? keys[i] : null;
	            };
	        }
	    }

	    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
	    // This accumulates the arguments passed into an array, after a given index.
	    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
	    function _restParam(func, startIndex) {
	        startIndex = startIndex == null ? func.length - 1 : +startIndex;
	        return function() {
	            var length = Math.max(arguments.length - startIndex, 0);
	            var rest = Array(length);
	            for (var index = 0; index < length; index++) {
	                rest[index] = arguments[index + startIndex];
	            }
	            switch (startIndex) {
	                case 0: return func.call(this, rest);
	                case 1: return func.call(this, arguments[0], rest);
	            }
	            // Currently unused but handle cases outside of the switch statement:
	            // var args = Array(startIndex + 1);
	            // for (index = 0; index < startIndex; index++) {
	            //     args[index] = arguments[index];
	            // }
	            // args[startIndex] = rest;
	            // return func.apply(this, args);
	        };
	    }

	    function _withoutIndex(iterator) {
	        return function (value, index, callback) {
	            return iterator(value, callback);
	        };
	    }

	    //// exported async module functions ////

	    //// nextTick implementation with browser-compatible fallback ////

	    // capture the global reference to guard against fakeTimer mocks
	    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

	    var _delay = _setImmediate ? function(fn) {
	        // not a direct alias for IE10 compatibility
	        _setImmediate(fn);
	    } : function(fn) {
	        setTimeout(fn, 0);
	    };

	    if (typeof process === 'object' && typeof process.nextTick === 'function') {
	        async.nextTick = process.nextTick;
	    } else {
	        async.nextTick = _delay;
	    }
	    async.setImmediate = _setImmediate ? _delay : async.nextTick;


	    async.forEach =
	    async.each = function (arr, iterator, callback) {
	        return async.eachOf(arr, _withoutIndex(iterator), callback);
	    };

	    async.forEachSeries =
	    async.eachSeries = function (arr, iterator, callback) {
	        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
	    };


	    async.forEachLimit =
	    async.eachLimit = function (arr, limit, iterator, callback) {
	        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
	    };

	    async.forEachOf =
	    async.eachOf = function (object, iterator, callback) {
	        callback = _once(callback || noop);
	        object = object || [];

	        var iter = _keyIterator(object);
	        var key, completed = 0;

	        while ((key = iter()) != null) {
	            completed += 1;
	            iterator(object[key], key, only_once(done));
	        }

	        if (completed === 0) callback(null);

	        function done(err) {
	            completed--;
	            if (err) {
	                callback(err);
	            }
	            // Check key is null in case iterator isn't exhausted
	            // and done resolved synchronously.
	            else if (key === null && completed <= 0) {
	                callback(null);
	            }
	        }
	    };

	    async.forEachOfSeries =
	    async.eachOfSeries = function (obj, iterator, callback) {
	        callback = _once(callback || noop);
	        obj = obj || [];
	        var nextKey = _keyIterator(obj);
	        var key = nextKey();
	        function iterate() {
	            var sync = true;
	            if (key === null) {
	                return callback(null);
	            }
	            iterator(obj[key], key, only_once(function (err) {
	                if (err) {
	                    callback(err);
	                }
	                else {
	                    key = nextKey();
	                    if (key === null) {
	                        return callback(null);
	                    } else {
	                        if (sync) {
	                            async.setImmediate(iterate);
	                        } else {
	                            iterate();
	                        }
	                    }
	                }
	            }));
	            sync = false;
	        }
	        iterate();
	    };



	    async.forEachOfLimit =
	    async.eachOfLimit = function (obj, limit, iterator, callback) {
	        _eachOfLimit(limit)(obj, iterator, callback);
	    };

	    function _eachOfLimit(limit) {

	        return function (obj, iterator, callback) {
	            callback = _once(callback || noop);
	            obj = obj || [];
	            var nextKey = _keyIterator(obj);
	            if (limit <= 0) {
	                return callback(null);
	            }
	            var done = false;
	            var running = 0;
	            var errored = false;

	            (function replenish () {
	                if (done && running <= 0) {
	                    return callback(null);
	                }

	                while (running < limit && !errored) {
	                    var key = nextKey();
	                    if (key === null) {
	                        done = true;
	                        if (running <= 0) {
	                            callback(null);
	                        }
	                        return;
	                    }
	                    running += 1;
	                    iterator(obj[key], key, only_once(function (err) {
	                        running -= 1;
	                        if (err) {
	                            callback(err);
	                            errored = true;
	                        }
	                        else {
	                            replenish();
	                        }
	                    }));
	                }
	            })();
	        };
	    }


	    function doParallel(fn) {
	        return function (obj, iterator, callback) {
	            return fn(async.eachOf, obj, iterator, callback);
	        };
	    }
	    function doParallelLimit(fn) {
	        return function (obj, limit, iterator, callback) {
	            return fn(_eachOfLimit(limit), obj, iterator, callback);
	        };
	    }
	    function doSeries(fn) {
	        return function (obj, iterator, callback) {
	            return fn(async.eachOfSeries, obj, iterator, callback);
	        };
	    }

	    function _asyncMap(eachfn, arr, iterator, callback) {
	        callback = _once(callback || noop);
	        arr = arr || [];
	        var results = _isArrayLike(arr) ? [] : {};
	        eachfn(arr, function (value, index, callback) {
	            iterator(value, function (err, v) {
	                results[index] = v;
	                callback(err);
	            });
	        }, function (err) {
	            callback(err, results);
	        });
	    }

	    async.map = doParallel(_asyncMap);
	    async.mapSeries = doSeries(_asyncMap);
	    async.mapLimit = doParallelLimit(_asyncMap);

	    // reduce only has a series version, as doing reduce in parallel won't
	    // work in many situations.
	    async.inject =
	    async.foldl =
	    async.reduce = function (arr, memo, iterator, callback) {
	        async.eachOfSeries(arr, function (x, i, callback) {
	            iterator(memo, x, function (err, v) {
	                memo = v;
	                callback(err);
	            });
	        }, function (err) {
	            callback(err, memo);
	        });
	    };

	    async.foldr =
	    async.reduceRight = function (arr, memo, iterator, callback) {
	        var reversed = _map(arr, identity).reverse();
	        async.reduce(reversed, memo, iterator, callback);
	    };

	    async.transform = function (arr, memo, iterator, callback) {
	        if (arguments.length === 3) {
	            callback = iterator;
	            iterator = memo;
	            memo = _isArray(arr) ? [] : {};
	        }

	        async.eachOf(arr, function(v, k, cb) {
	            iterator(memo, v, k, cb);
	        }, function(err) {
	            callback(err, memo);
	        });
	    };

	    function _filter(eachfn, arr, iterator, callback) {
	        var results = [];
	        eachfn(arr, function (x, index, callback) {
	            iterator(x, function (v) {
	                if (v) {
	                    results.push({index: index, value: x});
	                }
	                callback();
	            });
	        }, function () {
	            callback(_map(results.sort(function (a, b) {
	                return a.index - b.index;
	            }), function (x) {
	                return x.value;
	            }));
	        });
	    }

	    async.select =
	    async.filter = doParallel(_filter);

	    async.selectLimit =
	    async.filterLimit = doParallelLimit(_filter);

	    async.selectSeries =
	    async.filterSeries = doSeries(_filter);

	    function _reject(eachfn, arr, iterator, callback) {
	        _filter(eachfn, arr, function(value, cb) {
	            iterator(value, function(v) {
	                cb(!v);
	            });
	        }, callback);
	    }
	    async.reject = doParallel(_reject);
	    async.rejectLimit = doParallelLimit(_reject);
	    async.rejectSeries = doSeries(_reject);

	    function _createTester(eachfn, check, getResult) {
	        return function(arr, limit, iterator, cb) {
	            function done() {
	                if (cb) cb(getResult(false, void 0));
	            }
	            function iteratee(x, _, callback) {
	                if (!cb) return callback();
	                iterator(x, function (v) {
	                    if (cb && check(v)) {
	                        cb(getResult(true, x));
	                        cb = iterator = false;
	                    }
	                    callback();
	                });
	            }
	            if (arguments.length > 3) {
	                eachfn(arr, limit, iteratee, done);
	            } else {
	                cb = iterator;
	                iterator = limit;
	                eachfn(arr, iteratee, done);
	            }
	        };
	    }

	    async.any =
	    async.some = _createTester(async.eachOf, toBool, identity);

	    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

	    async.all =
	    async.every = _createTester(async.eachOf, notId, notId);

	    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

	    function _findGetResult(v, x) {
	        return x;
	    }
	    async.detect = _createTester(async.eachOf, identity, _findGetResult);
	    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
	    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

	    async.sortBy = function (arr, iterator, callback) {
	        async.map(arr, function (x, callback) {
	            iterator(x, function (err, criteria) {
	                if (err) {
	                    callback(err);
	                }
	                else {
	                    callback(null, {value: x, criteria: criteria});
	                }
	            });
	        }, function (err, results) {
	            if (err) {
	                return callback(err);
	            }
	            else {
	                callback(null, _map(results.sort(comparator), function (x) {
	                    return x.value;
	                }));
	            }

	        });

	        function comparator(left, right) {
	            var a = left.criteria, b = right.criteria;
	            return a < b ? -1 : a > b ? 1 : 0;
	        }
	    };

	    async.auto = function (tasks, concurrency, callback) {
	        if (typeof arguments[1] === 'function') {
	            // concurrency is optional, shift the args.
	            callback = concurrency;
	            concurrency = null;
	        }
	        callback = _once(callback || noop);
	        var keys = _keys(tasks);
	        var remainingTasks = keys.length;
	        if (!remainingTasks) {
	            return callback(null);
	        }
	        if (!concurrency) {
	            concurrency = remainingTasks;
	        }

	        var results = {};
	        var runningTasks = 0;

	        var hasError = false;

	        var listeners = [];
	        function addListener(fn) {
	            listeners.unshift(fn);
	        }
	        function removeListener(fn) {
	            var idx = _indexOf(listeners, fn);
	            if (idx >= 0) listeners.splice(idx, 1);
	        }
	        function taskComplete() {
	            remainingTasks--;
	            _arrayEach(listeners.slice(0), function (fn) {
	                fn();
	            });
	        }

	        addListener(function () {
	            if (!remainingTasks) {
	                callback(null, results);
	            }
	        });

	        _arrayEach(keys, function (k) {
	            if (hasError) return;
	            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
	            var taskCallback = _restParam(function(err, args) {
	                runningTasks--;
	                if (args.length <= 1) {
	                    args = args[0];
	                }
	                if (err) {
	                    var safeResults = {};
	                    _forEachOf(results, function(val, rkey) {
	                        safeResults[rkey] = val;
	                    });
	                    safeResults[k] = args;
	                    hasError = true;

	                    callback(err, safeResults);
	                }
	                else {
	                    results[k] = args;
	                    async.setImmediate(taskComplete);
	                }
	            });
	            var requires = task.slice(0, task.length - 1);
	            // prevent dead-locks
	            var len = requires.length;
	            var dep;
	            while (len--) {
	                if (!(dep = tasks[requires[len]])) {
	                    throw new Error('Has nonexistent dependency in ' + requires.join(', '));
	                }
	                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
	                    throw new Error('Has cyclic dependencies');
	                }
	            }
	            function ready() {
	                return runningTasks < concurrency && _reduce(requires, function (a, x) {
	                    return (a && results.hasOwnProperty(x));
	                }, true) && !results.hasOwnProperty(k);
	            }
	            if (ready()) {
	                runningTasks++;
	                task[task.length - 1](taskCallback, results);
	            }
	            else {
	                addListener(listener);
	            }
	            function listener() {
	                if (ready()) {
	                    runningTasks++;
	                    removeListener(listener);
	                    task[task.length - 1](taskCallback, results);
	                }
	            }
	        });
	    };



	    async.retry = function(times, task, callback) {
	        var DEFAULT_TIMES = 5;
	        var DEFAULT_INTERVAL = 0;

	        var attempts = [];

	        var opts = {
	            times: DEFAULT_TIMES,
	            interval: DEFAULT_INTERVAL
	        };

	        function parseTimes(acc, t){
	            if(typeof t === 'number'){
	                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
	            } else if(typeof t === 'object'){
	                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
	                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
	            } else {
	                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
	            }
	        }

	        var length = arguments.length;
	        if (length < 1 || length > 3) {
	            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
	        } else if (length <= 2 && typeof times === 'function') {
	            callback = task;
	            task = times;
	        }
	        if (typeof times !== 'function') {
	            parseTimes(opts, times);
	        }
	        opts.callback = callback;
	        opts.task = task;

	        function wrappedTask(wrappedCallback, wrappedResults) {
	            function retryAttempt(task, finalAttempt) {
	                return function(seriesCallback) {
	                    task(function(err, result){
	                        seriesCallback(!err || finalAttempt, {err: err, result: result});
	                    }, wrappedResults);
	                };
	            }

	            function retryInterval(interval){
	                return function(seriesCallback){
	                    setTimeout(function(){
	                        seriesCallback(null);
	                    }, interval);
	                };
	            }

	            while (opts.times) {

	                var finalAttempt = !(opts.times-=1);
	                attempts.push(retryAttempt(opts.task, finalAttempt));
	                if(!finalAttempt && opts.interval > 0){
	                    attempts.push(retryInterval(opts.interval));
	                }
	            }

	            async.series(attempts, function(done, data){
	                data = data[data.length - 1];
	                (wrappedCallback || opts.callback)(data.err, data.result);
	            });
	        }

	        // If a callback is passed, run this as a controll flow
	        return opts.callback ? wrappedTask() : wrappedTask;
	    };

	    async.waterfall = function (tasks, callback) {
	        callback = _once(callback || noop);
	        if (!_isArray(tasks)) {
	            var err = new Error('First argument to waterfall must be an array of functions');
	            return callback(err);
	        }
	        if (!tasks.length) {
	            return callback();
	        }
	        function wrapIterator(iterator) {
	            return _restParam(function (err, args) {
	                if (err) {
	                    callback.apply(null, [err].concat(args));
	                }
	                else {
	                    var next = iterator.next();
	                    if (next) {
	                        args.push(wrapIterator(next));
	                    }
	                    else {
	                        args.push(callback);
	                    }
	                    ensureAsync(iterator).apply(null, args);
	                }
	            });
	        }
	        wrapIterator(async.iterator(tasks))();
	    };

	    function _parallel(eachfn, tasks, callback) {
	        callback = callback || noop;
	        var results = _isArrayLike(tasks) ? [] : {};

	        eachfn(tasks, function (task, key, callback) {
	            task(_restParam(function (err, args) {
	                if (args.length <= 1) {
	                    args = args[0];
	                }
	                results[key] = args;
	                callback(err);
	            }));
	        }, function (err) {
	            callback(err, results);
	        });
	    }

	    async.parallel = function (tasks, callback) {
	        _parallel(async.eachOf, tasks, callback);
	    };

	    async.parallelLimit = function(tasks, limit, callback) {
	        _parallel(_eachOfLimit(limit), tasks, callback);
	    };

	    async.series = function(tasks, callback) {
	        _parallel(async.eachOfSeries, tasks, callback);
	    };

	    async.iterator = function (tasks) {
	        function makeCallback(index) {
	            function fn() {
	                if (tasks.length) {
	                    tasks[index].apply(null, arguments);
	                }
	                return fn.next();
	            }
	            fn.next = function () {
	                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
	            };
	            return fn;
	        }
	        return makeCallback(0);
	    };

	    async.apply = _restParam(function (fn, args) {
	        return _restParam(function (callArgs) {
	            return fn.apply(
	                null, args.concat(callArgs)
	            );
	        });
	    });

	    function _concat(eachfn, arr, fn, callback) {
	        var result = [];
	        eachfn(arr, function (x, index, cb) {
	            fn(x, function (err, y) {
	                result = result.concat(y || []);
	                cb(err);
	            });
	        }, function (err) {
	            callback(err, result);
	        });
	    }
	    async.concat = doParallel(_concat);
	    async.concatSeries = doSeries(_concat);

	    async.whilst = function (test, iterator, callback) {
	        callback = callback || noop;
	        if (test()) {
	            var next = _restParam(function(err, args) {
	                if (err) {
	                    callback(err);
	                } else if (test.apply(this, args)) {
	                    iterator(next);
	                } else {
	                    callback.apply(null, [null].concat(args));
	                }
	            });
	            iterator(next);
	        } else {
	            callback(null);
	        }
	    };

	    async.doWhilst = function (iterator, test, callback) {
	        var calls = 0;
	        return async.whilst(function() {
	            return ++calls <= 1 || test.apply(this, arguments);
	        }, iterator, callback);
	    };

	    async.until = function (test, iterator, callback) {
	        return async.whilst(function() {
	            return !test.apply(this, arguments);
	        }, iterator, callback);
	    };

	    async.doUntil = function (iterator, test, callback) {
	        return async.doWhilst(iterator, function() {
	            return !test.apply(this, arguments);
	        }, callback);
	    };

	    async.during = function (test, iterator, callback) {
	        callback = callback || noop;

	        var next = _restParam(function(err, args) {
	            if (err) {
	                callback(err);
	            } else {
	                args.push(check);
	                test.apply(this, args);
	            }
	        });

	        var check = function(err, truth) {
	            if (err) {
	                callback(err);
	            } else if (truth) {
	                iterator(next);
	            } else {
	                callback(null);
	            }
	        };

	        test(check);
	    };

	    async.doDuring = function (iterator, test, callback) {
	        var calls = 0;
	        async.during(function(next) {
	            if (calls++ < 1) {
	                next(null, true);
	            } else {
	                test.apply(this, arguments);
	            }
	        }, iterator, callback);
	    };

	    function _queue(worker, concurrency, payload) {
	        if (concurrency == null) {
	            concurrency = 1;
	        }
	        else if(concurrency === 0) {
	            throw new Error('Concurrency must not be zero');
	        }
	        function _insert(q, data, pos, callback) {
	            if (callback != null && typeof callback !== "function") {
	                throw new Error("task callback must be a function");
	            }
	            q.started = true;
	            if (!_isArray(data)) {
	                data = [data];
	            }
	            if(data.length === 0 && q.idle()) {
	                // call drain immediately if there are no tasks
	                return async.setImmediate(function() {
	                    q.drain();
	                });
	            }
	            _arrayEach(data, function(task) {
	                var item = {
	                    data: task,
	                    callback: callback || noop
	                };

	                if (pos) {
	                    q.tasks.unshift(item);
	                } else {
	                    q.tasks.push(item);
	                }

	                if (q.tasks.length === q.concurrency) {
	                    q.saturated();
	                }
	            });
	            async.setImmediate(q.process);
	        }
	        function _next(q, tasks) {
	            return function(){
	                workers -= 1;

	                var removed = false;
	                var args = arguments;
	                _arrayEach(tasks, function (task) {
	                    _arrayEach(workersList, function (worker, index) {
	                        if (worker === task && !removed) {
	                            workersList.splice(index, 1);
	                            removed = true;
	                        }
	                    });

	                    task.callback.apply(task, args);
	                });
	                if (q.tasks.length + workers === 0) {
	                    q.drain();
	                }
	                q.process();
	            };
	        }

	        var workers = 0;
	        var workersList = [];
	        var q = {
	            tasks: [],
	            concurrency: concurrency,
	            payload: payload,
	            saturated: noop,
	            empty: noop,
	            drain: noop,
	            started: false,
	            paused: false,
	            push: function (data, callback) {
	                _insert(q, data, false, callback);
	            },
	            kill: function () {
	                q.drain = noop;
	                q.tasks = [];
	            },
	            unshift: function (data, callback) {
	                _insert(q, data, true, callback);
	            },
	            process: function () {
	                while(!q.paused && workers < q.concurrency && q.tasks.length){

	                    var tasks = q.payload ?
	                        q.tasks.splice(0, q.payload) :
	                        q.tasks.splice(0, q.tasks.length);

	                    var data = _map(tasks, function (task) {
	                        return task.data;
	                    });

	                    if (q.tasks.length === 0) {
	                        q.empty();
	                    }
	                    workers += 1;
	                    workersList.push(tasks[0]);
	                    var cb = only_once(_next(q, tasks));
	                    worker(data, cb);
	                }
	            },
	            length: function () {
	                return q.tasks.length;
	            },
	            running: function () {
	                return workers;
	            },
	            workersList: function () {
	                return workersList;
	            },
	            idle: function() {
	                return q.tasks.length + workers === 0;
	            },
	            pause: function () {
	                q.paused = true;
	            },
	            resume: function () {
	                if (q.paused === false) { return; }
	                q.paused = false;
	                var resumeCount = Math.min(q.concurrency, q.tasks.length);
	                // Need to call q.process once per concurrent
	                // worker to preserve full concurrency after pause
	                for (var w = 1; w <= resumeCount; w++) {
	                    async.setImmediate(q.process);
	                }
	            }
	        };
	        return q;
	    }

	    async.queue = function (worker, concurrency) {
	        var q = _queue(function (items, cb) {
	            worker(items[0], cb);
	        }, concurrency, 1);

	        return q;
	    };

	    async.priorityQueue = function (worker, concurrency) {

	        function _compareTasks(a, b){
	            return a.priority - b.priority;
	        }

	        function _binarySearch(sequence, item, compare) {
	            var beg = -1,
	                end = sequence.length - 1;
	            while (beg < end) {
	                var mid = beg + ((end - beg + 1) >>> 1);
	                if (compare(item, sequence[mid]) >= 0) {
	                    beg = mid;
	                } else {
	                    end = mid - 1;
	                }
	            }
	            return beg;
	        }

	        function _insert(q, data, priority, callback) {
	            if (callback != null && typeof callback !== "function") {
	                throw new Error("task callback must be a function");
	            }
	            q.started = true;
	            if (!_isArray(data)) {
	                data = [data];
	            }
	            if(data.length === 0) {
	                // call drain immediately if there are no tasks
	                return async.setImmediate(function() {
	                    q.drain();
	                });
	            }
	            _arrayEach(data, function(task) {
	                var item = {
	                    data: task,
	                    priority: priority,
	                    callback: typeof callback === 'function' ? callback : noop
	                };

	                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

	                if (q.tasks.length === q.concurrency) {
	                    q.saturated();
	                }
	                async.setImmediate(q.process);
	            });
	        }

	        // Start with a normal queue
	        var q = async.queue(worker, concurrency);

	        // Override push to accept second parameter representing priority
	        q.push = function (data, priority, callback) {
	            _insert(q, data, priority, callback);
	        };

	        // Remove unshift function
	        delete q.unshift;

	        return q;
	    };

	    async.cargo = function (worker, payload) {
	        return _queue(worker, 1, payload);
	    };

	    function _console_fn(name) {
	        return _restParam(function (fn, args) {
	            fn.apply(null, args.concat([_restParam(function (err, args) {
	                if (typeof console === 'object') {
	                    if (err) {
	                        if (console.error) {
	                            console.error(err);
	                        }
	                    }
	                    else if (console[name]) {
	                        _arrayEach(args, function (x) {
	                            console[name](x);
	                        });
	                    }
	                }
	            })]));
	        });
	    }
	    async.log = _console_fn('log');
	    async.dir = _console_fn('dir');
	    /*async.info = _console_fn('info');
	    async.warn = _console_fn('warn');
	    async.error = _console_fn('error');*/

	    async.memoize = function (fn, hasher) {
	        var memo = {};
	        var queues = {};
	        var has = Object.prototype.hasOwnProperty;
	        hasher = hasher || identity;
	        var memoized = _restParam(function memoized(args) {
	            var callback = args.pop();
	            var key = hasher.apply(null, args);
	            if (has.call(memo, key)) {   
	                async.setImmediate(function () {
	                    callback.apply(null, memo[key]);
	                });
	            }
	            else if (has.call(queues, key)) {
	                queues[key].push(callback);
	            }
	            else {
	                queues[key] = [callback];
	                fn.apply(null, args.concat([_restParam(function (args) {
	                    memo[key] = args;
	                    var q = queues[key];
	                    delete queues[key];
	                    for (var i = 0, l = q.length; i < l; i++) {
	                        q[i].apply(null, args);
	                    }
	                })]));
	            }
	        });
	        memoized.memo = memo;
	        memoized.unmemoized = fn;
	        return memoized;
	    };

	    async.unmemoize = function (fn) {
	        return function () {
	            return (fn.unmemoized || fn).apply(null, arguments);
	        };
	    };

	    function _times(mapper) {
	        return function (count, iterator, callback) {
	            mapper(_range(count), iterator, callback);
	        };
	    }

	    async.times = _times(async.map);
	    async.timesSeries = _times(async.mapSeries);
	    async.timesLimit = function (count, limit, iterator, callback) {
	        return async.mapLimit(_range(count), limit, iterator, callback);
	    };

	    async.seq = function (/* functions... */) {
	        var fns = arguments;
	        return _restParam(function (args) {
	            var that = this;

	            var callback = args[args.length - 1];
	            if (typeof callback == 'function') {
	                args.pop();
	            } else {
	                callback = noop;
	            }

	            async.reduce(fns, args, function (newargs, fn, cb) {
	                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
	                    cb(err, nextargs);
	                })]));
	            },
	            function (err, results) {
	                callback.apply(that, [err].concat(results));
	            });
	        });
	    };

	    async.compose = function (/* functions... */) {
	        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
	    };


	    function _applyEach(eachfn) {
	        return _restParam(function(fns, args) {
	            var go = _restParam(function(args) {
	                var that = this;
	                var callback = args.pop();
	                return eachfn(fns, function (fn, _, cb) {
	                    fn.apply(that, args.concat([cb]));
	                },
	                callback);
	            });
	            if (args.length) {
	                return go.apply(this, args);
	            }
	            else {
	                return go;
	            }
	        });
	    }

	    async.applyEach = _applyEach(async.eachOf);
	    async.applyEachSeries = _applyEach(async.eachOfSeries);


	    async.forever = function (fn, callback) {
	        var done = only_once(callback || noop);
	        var task = ensureAsync(fn);
	        function next(err) {
	            if (err) {
	                return done(err);
	            }
	            task(next);
	        }
	        next();
	    };

	    function ensureAsync(fn) {
	        return _restParam(function (args) {
	            var callback = args.pop();
	            args.push(function () {
	                var innerArgs = arguments;
	                if (sync) {
	                    async.setImmediate(function () {
	                        callback.apply(null, innerArgs);
	                    });
	                } else {
	                    callback.apply(null, innerArgs);
	                }
	            });
	            var sync = true;
	            fn.apply(this, args);
	            sync = false;
	        });
	    }

	    async.ensureAsync = ensureAsync;

	    async.constant = _restParam(function(values) {
	        var args = [null].concat(values);
	        return function (callback) {
	            return callback.apply(this, args);
	        };
	    });

	    async.wrapSync =
	    async.asyncify = function asyncify(func) {
	        return _restParam(function (args) {
	            var callback = args.pop();
	            var result;
	            try {
	                result = func.apply(this, args);
	            } catch (e) {
	                return callback(e);
	            }
	            // if result is Promise object
	            if (_isObject(result) && typeof result.then === "function") {
	                result.then(function(value) {
	                    callback(null, value);
	                })["catch"](function(err) {
	                    callback(err.message ? err : new Error(err));
	                });
	            } else {
	                callback(null, result);
	            }
	        });
	    };

	    // Node.js
	    if (typeof module === 'object' && module.exports) {
	        module.exports = async;
	    }
	    // AMD / RequireJS
	    else if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	            return async;
	        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    }
	    // included directly via <script> tag
	    else {
	        root.async = async;
	    }

	}());


/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var util = __webpack_require__(63);
	var utils = __webpack_require__(88);
	var Stream = __webpack_require__(11);

	/**
	 * Expose `Response`.
	 */

	module.exports = Response;

	/**
	 * Initialize a new `Response` with the given `xhr`.
	 *
	 *  - set flags (.ok, .error, etc)
	 *  - parse header
	 *
	 * @param {Request} req
	 * @param {Object} options
	 * @constructor
	 * @extends {Stream}
	 * @implements {ReadableStream}
	 * @api private
	 */

	function Response(req, options) {
	  Stream.call(this);
	  options = options || {};
	  var res = this.res = req.res;
	  this.request = req;
	  this.req = req.req;
	  this.links = {};
	  this.text = res.text;
	  this.body = res.body !== undefined ? res.body : {};
	  this.files = res.files || {};
	  this.buffered = 'string' == typeof this.text;
	  this.header = this.headers = res.headers;
	  this.setStatusProperties(res.statusCode);
	  this.setHeaderProperties(this.header);
	  this.setEncoding = res.setEncoding.bind(res);
	  res.on('data', this.emit.bind(this, 'data'));
	  res.on('end', this.emit.bind(this, 'end'));
	  res.on('close', this.emit.bind(this, 'close'));
	  res.on('error', this.emit.bind(this, 'error'));
	}

	/**
	 * Inherit from `Stream`.
	 */

	util.inherits(Response, Stream);

	/**
	 * Get case-insensitive `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	Response.prototype.get = function(field){
	  return this.header[field.toLowerCase()];
	};

	/**
	 * Implements methods of a `ReadableStream`
	 */

	Response.prototype.destroy = function(err){
	  this.res.destroy(err);
	};

	/**
	 * Pause.
	 */

	Response.prototype.pause = function(){
	  this.res.pause();
	};

	/**
	 * Resume.
	 */

	Response.prototype.resume = function(){
	  this.res.resume();
	};

	/**
	 * Return an `Error` representative of this response.
	 *
	 * @return {Error}
	 * @api public
	 */

	Response.prototype.toError = function(){
	  var req = this.req;
	  var method = req.method;
	  var path = req.path;

	  var msg = 'cannot ' + method + ' ' + path + ' (' + this.status + ')';
	  var err = new Error(msg);
	  err.status = this.status;
	  err.text = this.text;
	  err.method = method;
	  err.path = path;

	  return err;
	};

	/**
	 * Set header related properties:
	 *
	 *   - `.type` the content type without params
	 *
	 * A response of "Content-Type: text/plain; charset=utf-8"
	 * will provide you with a `.type` of "text/plain".
	 *
	 * @param {Object} header
	 * @api private
	 */

	Response.prototype.setHeaderProperties = function(header){
	  // TODO: moar!
	  // TODO: make this a util

	  // content-type
	  var ct = this.header['content-type'] || '';

	  // params
	  var params = utils.params(ct);
	  for (var key in params) this[key] = params[key];

	  this.type = utils.type(ct);

	  // links
	  try {
	    if (header.link) this.links = utils.parseLinks(header.link);
	  } catch (err) {
	    // ignore
	  }
	};

	/**
	 * Set flags such as `.ok` based on `status`.
	 *
	 * For example a 2xx response will give you a `.ok` of __true__
	 * whereas 5xx will be __false__ and `.error` will be __true__. The
	 * `.clientError` and `.serverError` are also available to be more
	 * specific, and `.statusType` is the class of error ranging from 1..5
	 * sometimes useful for mapping respond colors etc.
	 *
	 * "sugar" properties are also defined for common cases. Currently providing:
	 *
	 *   - .noContent
	 *   - .badRequest
	 *   - .unauthorized
	 *   - .notAcceptable
	 *   - .notFound
	 *
	 * @param {Number} status
	 * @api private
	 */

	Response.prototype.setStatusProperties = function(status){
	  var type = status / 100 | 0;

	  // status / class
	  this.status = this.statusCode = status;
	  this.statusType = type;

	  // basics
	  this.info = 1 == type;
	  this.ok = 2 == type;
	  this.redirect = 3 == type;
	  this.clientError = 4 == type;
	  this.serverError = 5 == type;
	  this.error = (4 == type || 5 == type)
	    ? this.toError()
	    : false;

	  // sugar
	  this.accepted = 202 == status;
	  this.noContent = 204 == status;
	  this.badRequest = 400 == status;
	  this.unauthorized = 401 == status;
	  this.notAcceptable = 406 == status;
	  this.forbidden = 403 == status;
	  this.notFound = 404 == status;
	};

	/**
	 * To json.
	 *
	 * @return {Object}
	 * @api public
	 */

	Response.prototype.toJSON = function(){
	  return {
	    req: this.request.toJSON(),
	    header: this.header,
	    status: this.status,
	    text: this.text
	  };
	};


/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var StringDecoder = __webpack_require__(78).StringDecoder;
	var Stream = __webpack_require__(11);
	var zlib;

	/**
	 * Require zlib module for Node 0.6+
	 */

	try {
	  zlib = __webpack_require__(89);
	} catch (e) { }

	/**
	 * Return the mime type for the given `str`.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */

	exports.type = function(str){
	  return str.split(/ *; */).shift();
	};

	/**
	 * Return header field parameters.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	exports.params = function(str){
	  return str.split(/ *; */).reduce(function(obj, str){
	    var parts = str.split(/ *= */);
	    var key = parts.shift();
	    var val = parts.shift();

	    if (key && val) obj[key] = val;
	    return obj;
	  }, {});
	};

	/**
	 * Parse Link header fields.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	exports.parseLinks = function(str){
	  return str.split(/ *, */).reduce(function(obj, str){
	    var parts = str.split(/ *; */);
	    var url = parts[0].slice(1, -1);
	    var rel = parts[1].split(/ *= */)[1].slice(1, -1);
	    obj[rel] = url;
	    return obj;
	  }, {});
	};

	/**
	 * Buffers response data events and re-emits when they're unzipped.
	 *
	 * @param {Request} req
	 * @param {Response} res
	 * @api private
	 */

	exports.unzip = function(req, res){
	  if (!zlib) return;

	  var unzip = zlib.createUnzip();
	  var stream = new Stream;
	  var decoder;

	  // make node responseOnEnd() happy
	  stream.req = req;

	  unzip.on('error', function(err){
	    stream.emit('error', err);
	  });

	  // pipe to unzip
	  res.pipe(unzip);

	  // override `setEncoding` to capture encoding
	  res.setEncoding = function(type){
	    decoder = new StringDecoder(type);
	  };

	  // decode upon decompressing with captured encoding
	  unzip.on('data', function(buf){
	    if (decoder) {
	      var str = decoder.write(buf);
	      if (str.length) stream.emit('data', str);
	    } else {
	      stream.emit('data', buf);
	    }
	  });

	  unzip.on('end', function(){
	    stream.emit('end');
	  });

	  // override `on` to capture data listeners
	  var _on = res.on;
	  res.on = function(type, fn){
	    if ('data' == type || 'end' == type) {
	      stream.on(type, fn);
	    } else if ('error' == type) {
	      stream.on(type, fn);
	      _on.call(res, type, fn);
	    } else {
	      _on.call(res, type, fn);
	    }
	  };
	};

	/**
	 * Strip content related fields from `header`.
	 *
	 * @param {Object} header
	 * @return {Object} header
	 * @api private
	 */

	exports.cleanHeader = function(header, shouldStripCookie){
	  delete header['content-type'];
	  delete header['content-length'];
	  delete header['transfer-encoding'];
	  delete header['host'];
	  if (shouldStripCookie) {
	    delete header['cookie'];
	  }
	  return header;
	};


/***/ },
/* 89 */
/***/ function(module, exports) {

	module.exports = require("zlib");

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * methods
	 * Copyright(c) 2013-2014 TJ Holowaychuk
	 * Copyright(c) 2015-2016 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	'use strict';

	/**
	 * Module dependencies.
	 * @private
	 */

	var http = __webpack_require__(5);

	/**
	 * Module exports.
	 * @public
	 */

	module.exports = getCurrentNodeMethods() || getBasicNodeMethods();

	/**
	 * Get the current Node.js methods.
	 * @private
	 */

	function getCurrentNodeMethods() {
	  return http.METHODS && http.METHODS.map(function lowerCaseMethod(method) {
	    return method.toLowerCase();
	  });
	}

	/**
	 * Get the "basic" Node.js methods, a snapshot from Node.js 0.10.
	 * @private
	 */

	function getBasicNodeMethods() {
	  return [
	    'get',
	    'post',
	    'put',
	    'head',
	    'delete',
	    'options',
	    'trace',
	    'copy',
	    'lock',
	    'mkcol',
	    'move',
	    'purge',
	    'propfind',
	    'proppatch',
	    'unlock',
	    'report',
	    'mkactivity',
	    'checkout',
	    'merge',
	    'm-search',
	    'notify',
	    'subscribe',
	    'unsubscribe',
	    'patch',
	    'search',
	    'connect'
	  ];
	}


/***/ },
/* 91 */
/***/ function(module, exports) {

	'use strict';

	var hasOwn = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;

	var isArray = function isArray(arr) {
		if (typeof Array.isArray === 'function') {
			return Array.isArray(arr);
		}

		return toStr.call(arr) === '[object Array]';
	};

	var isPlainObject = function isPlainObject(obj) {
		if (!obj || toStr.call(obj) !== '[object Object]') {
			return false;
		}

		var hasOwnConstructor = hasOwn.call(obj, 'constructor');
		var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
		// Not own constructor property must be Object
		if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		var key;
		for (key in obj) {/**/}

		return typeof key === 'undefined' || hasOwn.call(obj, key);
	};

	module.exports = function extend() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[0],
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if (typeof target === 'boolean') {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
			target = {};
		}

		for (; i < length; ++i) {
			options = arguments[i];
			// Only deal with non-null/undefined values
			if (options != null) {
				// Extend the base object
				for (name in options) {
					src = target[name];
					copy = options[name];

					// Prevent never-ending loop
					if (target !== copy) {
						// Recurse if we're merging plain objects or arrays
						if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
							if (copyIsArray) {
								copyIsArray = false;
								clone = src && isArray(src) ? src : [];
							} else {
								clone = src && isPlainObject(src) ? src : {};
							}

							// Never move original objects, clone them
							target[name] = extend(deep, clone, copy);

						// Don't bring in undefined values
						} else if (typeof copy !== 'undefined') {
							target[name] = copy;
						}
					}
				}
			}
		}

		// Return the modified object
		return target;
	};



/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var util = __webpack_require__(63);
	var mime = __webpack_require__(93);
	var FormData = __webpack_require__(80);
	var PassThrough = __webpack_require__(95);

	/**
	 * Initialize a new `Part` for the given `req`.
	 *
	 * @param {Request} req
	 * @api public
	 * @deprecated pass a readable stream in to `Request#attach()` instead
	 */

	var Part = function (req) {
	  PassThrough.call(this);
	  this._req = req;
	  this._attached = false;
	  this._name = null;
	  this._type = null;
	  this._header = null;
	  this._filename = null;

	  this.once('pipe', this._attach.bind(this));
	};
	Part = util.deprecate(Part, 'The `Part()` constructor is deprecated. ' +
	   'Pass a readable stream in to `Request#attach()` instead.');

	/**
	 * Inherit from `PassThrough`.
	 */

	util.inherits(Part, PassThrough);

	/**
	 * Expose `Part`.
	 */

	module.exports = Part;

	/**
	 * Set header `field` to `val`.
	 *
	 * @param {String} field
	 * @param {String} val
	 * @return {Part} for chaining
	 * @api public
	 */

	Part.prototype.set = function(field, val){
	  //if (!this._header) this._header = {};
	  //this._header[field] = val;
	  //return this;
	  throw new TypeError('setting custom form-data part headers is unsupported');
	};

	/**
	 * Set _Content-Type_ response header passed through `mime.lookup()`.
	 *
	 * Examples:
	 *
	 *     res.type('html');
	 *     res.type('.html');
	 *
	 * @param {String} type
	 * @return {Part} for chaining
	 * @api public
	 */

	Part.prototype.type = function(type){
	  var lookup = mime.lookup(type);
	  this._type = lookup;
	  //this.set('Content-Type', lookup);
	  return this;
	};

	/**
	 * Set the "name" portion for the _Content-Disposition_ header field.
	 *
	 * @param {String} name
	 * @return {Part} for chaining
	 * @api public
	 */

	Part.prototype.name = function(name){
	  this._name = name;
	  return this;
	};

	/**
	 * Set _Content-Disposition_ header field to _attachment_ with `filename`
	 * and field `name`.
	 *
	 * @param {String} name
	 * @param {String} filename
	 * @return {Part} for chaining
	 * @api public
	 */

	Part.prototype.attachment = function(name, filename){
	  this.name(name);
	  if (filename) {
	    this.type(filename);
	    this._filename = filename;
	  }
	  return this;
	};

	/**
	 * Calls `FormData#append()` on the Request instance's FormData object.
	 *
	 * Gets called implicitly upon the first `write()` call, or the "pipe" event.
	 *
	 * @api private
	 */

	Part.prototype._attach = function(){
	  if (this._attached) return;
	  this._attached = true;

	  if (!this._name) throw new Error('must call `Part#name()` first!');

	  // add `this` Stream's readable side as a stream for this Part
	  this._req._getFormData().append(this._name, this, {
	    contentType: this._type,
	    filename: this._filename
	  });

	  // restore PassThrough's default `write()` function now that we're setup
	  this.write = PassThrough.prototype.write;
	};

	/**
	 * Write `data` with `encoding`.
	 *
	 * @param {Buffer|String} data
	 * @param {String} encoding
	 * @return {Boolean}
	 * @api public
	 */

	Part.prototype.write = function(){
	  this._attach();
	  return this.write.apply(this, arguments);
	};


/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var path = __webpack_require__(70);
	var fs = __webpack_require__(66);

	function Mime() {
	  // Map of extension -> mime type
	  this.types = Object.create(null);

	  // Map of mime type -> extension
	  this.extensions = Object.create(null);
	}

	/**
	 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
	 * to an array of extensions associated with the type.  The first extension is
	 * used as the default extension for the type.
	 *
	 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
	 *
	 * @param map (Object) type definitions
	 */
	Mime.prototype.define = function (map) {
	  for (var type in map) {
	    var exts = map[type];
	    for (var i = 0; i < exts.length; i++) {
	      if (process.env.DEBUG_MIME && this.types[exts]) {
	        console.warn(this._loading.replace(/.*\//, ''), 'changes "' + exts[i] + '" extension type from ' +
	          this.types[exts] + ' to ' + type);
	      }

	      this.types[exts[i]] = type;
	    }

	    // Default extension is the first one we encounter
	    if (!this.extensions[type]) {
	      this.extensions[type] = exts[0];
	    }
	  }
	};

	/**
	 * Load an Apache2-style ".types" file
	 *
	 * This may be called multiple times (it's expected).  Where files declare
	 * overlapping types/extensions, the last file wins.
	 *
	 * @param file (String) path of file to load.
	 */
	Mime.prototype.load = function(file) {
	  this._loading = file;
	  // Read file and split into lines
	  var map = {},
	      content = fs.readFileSync(file, 'ascii'),
	      lines = content.split(/[\r\n]+/);

	  lines.forEach(function(line) {
	    // Clean up whitespace/comments, and split into fields
	    var fields = line.replace(/\s*#.*|^\s*|\s*$/g, '').split(/\s+/);
	    map[fields.shift()] = fields;
	  });

	  this.define(map);

	  this._loading = null;
	};

	/**
	 * Lookup a mime type based on extension
	 */
	Mime.prototype.lookup = function(path, fallback) {
	  var ext = path.replace(/.*[\.\/\\]/, '').toLowerCase();

	  return this.types[ext] || fallback || this.default_type;
	};

	/**
	 * Return file extension associated with a mime type
	 */
	Mime.prototype.extension = function(mimeType) {
	  var type = mimeType.match(/^\s*([^;\s]*)(?:;|\s|$)/)[1].toLowerCase();
	  return this.extensions[type];
	};

	// Default instance
	var mime = new Mime();

	// Define built-in types
	mime.define(__webpack_require__(94));

	// Default type
	mime.default_type = mime.lookup('bin');

	//
	// Additional API specific to the default instance
	//

	mime.Mime = Mime;

	/**
	 * Lookup a charset based on mime type.
	 */
	mime.charsets = {
	  lookup: function(mimeType, fallback) {
	    // Assume text types are utf8
	    return (/^text\//).test(mimeType) ? 'UTF-8' : fallback;
	  }
	};

	module.exports = mime;


/***/ },
/* 94 */
/***/ function(module, exports) {

	module.exports = {
		"application/andrew-inset": [
			"ez"
		],
		"application/applixware": [
			"aw"
		],
		"application/atom+xml": [
			"atom"
		],
		"application/atomcat+xml": [
			"atomcat"
		],
		"application/atomsvc+xml": [
			"atomsvc"
		],
		"application/ccxml+xml": [
			"ccxml"
		],
		"application/cdmi-capability": [
			"cdmia"
		],
		"application/cdmi-container": [
			"cdmic"
		],
		"application/cdmi-domain": [
			"cdmid"
		],
		"application/cdmi-object": [
			"cdmio"
		],
		"application/cdmi-queue": [
			"cdmiq"
		],
		"application/cu-seeme": [
			"cu"
		],
		"application/dash+xml": [
			"mdp"
		],
		"application/davmount+xml": [
			"davmount"
		],
		"application/docbook+xml": [
			"dbk"
		],
		"application/dssc+der": [
			"dssc"
		],
		"application/dssc+xml": [
			"xdssc"
		],
		"application/ecmascript": [
			"ecma"
		],
		"application/emma+xml": [
			"emma"
		],
		"application/epub+zip": [
			"epub"
		],
		"application/exi": [
			"exi"
		],
		"application/font-tdpfr": [
			"pfr"
		],
		"application/font-woff": [
			"woff"
		],
		"application/font-woff2": [
			"woff2"
		],
		"application/gml+xml": [
			"gml"
		],
		"application/gpx+xml": [
			"gpx"
		],
		"application/gxf": [
			"gxf"
		],
		"application/hyperstudio": [
			"stk"
		],
		"application/inkml+xml": [
			"ink",
			"inkml"
		],
		"application/ipfix": [
			"ipfix"
		],
		"application/java-archive": [
			"jar"
		],
		"application/java-serialized-object": [
			"ser"
		],
		"application/java-vm": [
			"class"
		],
		"application/javascript": [
			"js"
		],
		"application/json": [
			"json",
			"map"
		],
		"application/json5": [
			"json5"
		],
		"application/jsonml+json": [
			"jsonml"
		],
		"application/lost+xml": [
			"lostxml"
		],
		"application/mac-binhex40": [
			"hqx"
		],
		"application/mac-compactpro": [
			"cpt"
		],
		"application/mads+xml": [
			"mads"
		],
		"application/marc": [
			"mrc"
		],
		"application/marcxml+xml": [
			"mrcx"
		],
		"application/mathematica": [
			"ma",
			"nb",
			"mb"
		],
		"application/mathml+xml": [
			"mathml"
		],
		"application/mbox": [
			"mbox"
		],
		"application/mediaservercontrol+xml": [
			"mscml"
		],
		"application/metalink+xml": [
			"metalink"
		],
		"application/metalink4+xml": [
			"meta4"
		],
		"application/mets+xml": [
			"mets"
		],
		"application/mods+xml": [
			"mods"
		],
		"application/mp21": [
			"m21",
			"mp21"
		],
		"application/mp4": [
			"mp4s",
			"m4p"
		],
		"application/msword": [
			"doc",
			"dot"
		],
		"application/mxf": [
			"mxf"
		],
		"application/octet-stream": [
			"bin",
			"dms",
			"lrf",
			"mar",
			"so",
			"dist",
			"distz",
			"pkg",
			"bpk",
			"dump",
			"elc",
			"deploy",
			"buffer"
		],
		"application/oda": [
			"oda"
		],
		"application/oebps-package+xml": [
			"opf"
		],
		"application/ogg": [
			"ogx"
		],
		"application/omdoc+xml": [
			"omdoc"
		],
		"application/onenote": [
			"onetoc",
			"onetoc2",
			"onetmp",
			"onepkg"
		],
		"application/oxps": [
			"oxps"
		],
		"application/patch-ops-error+xml": [
			"xer"
		],
		"application/pdf": [
			"pdf"
		],
		"application/pgp-encrypted": [
			"pgp"
		],
		"application/pgp-signature": [
			"asc",
			"sig"
		],
		"application/pics-rules": [
			"prf"
		],
		"application/pkcs10": [
			"p10"
		],
		"application/pkcs7-mime": [
			"p7m",
			"p7c"
		],
		"application/pkcs7-signature": [
			"p7s"
		],
		"application/pkcs8": [
			"p8"
		],
		"application/pkix-attr-cert": [
			"ac"
		],
		"application/pkix-cert": [
			"cer"
		],
		"application/pkix-crl": [
			"crl"
		],
		"application/pkix-pkipath": [
			"pkipath"
		],
		"application/pkixcmp": [
			"pki"
		],
		"application/pls+xml": [
			"pls"
		],
		"application/postscript": [
			"ai",
			"eps",
			"ps"
		],
		"application/prs.cww": [
			"cww"
		],
		"application/pskc+xml": [
			"pskcxml"
		],
		"application/rdf+xml": [
			"rdf"
		],
		"application/reginfo+xml": [
			"rif"
		],
		"application/relax-ng-compact-syntax": [
			"rnc"
		],
		"application/resource-lists+xml": [
			"rl"
		],
		"application/resource-lists-diff+xml": [
			"rld"
		],
		"application/rls-services+xml": [
			"rs"
		],
		"application/rpki-ghostbusters": [
			"gbr"
		],
		"application/rpki-manifest": [
			"mft"
		],
		"application/rpki-roa": [
			"roa"
		],
		"application/rsd+xml": [
			"rsd"
		],
		"application/rss+xml": [
			"rss"
		],
		"application/rtf": [
			"rtf"
		],
		"application/sbml+xml": [
			"sbml"
		],
		"application/scvp-cv-request": [
			"scq"
		],
		"application/scvp-cv-response": [
			"scs"
		],
		"application/scvp-vp-request": [
			"spq"
		],
		"application/scvp-vp-response": [
			"spp"
		],
		"application/sdp": [
			"sdp"
		],
		"application/set-payment-initiation": [
			"setpay"
		],
		"application/set-registration-initiation": [
			"setreg"
		],
		"application/shf+xml": [
			"shf"
		],
		"application/smil+xml": [
			"smi",
			"smil"
		],
		"application/sparql-query": [
			"rq"
		],
		"application/sparql-results+xml": [
			"srx"
		],
		"application/srgs": [
			"gram"
		],
		"application/srgs+xml": [
			"grxml"
		],
		"application/sru+xml": [
			"sru"
		],
		"application/ssdl+xml": [
			"ssdl"
		],
		"application/ssml+xml": [
			"ssml"
		],
		"application/tei+xml": [
			"tei",
			"teicorpus"
		],
		"application/thraud+xml": [
			"tfi"
		],
		"application/timestamped-data": [
			"tsd"
		],
		"application/vnd.3gpp.pic-bw-large": [
			"plb"
		],
		"application/vnd.3gpp.pic-bw-small": [
			"psb"
		],
		"application/vnd.3gpp.pic-bw-var": [
			"pvb"
		],
		"application/vnd.3gpp2.tcap": [
			"tcap"
		],
		"application/vnd.3m.post-it-notes": [
			"pwn"
		],
		"application/vnd.accpac.simply.aso": [
			"aso"
		],
		"application/vnd.accpac.simply.imp": [
			"imp"
		],
		"application/vnd.acucobol": [
			"acu"
		],
		"application/vnd.acucorp": [
			"atc",
			"acutc"
		],
		"application/vnd.adobe.air-application-installer-package+zip": [
			"air"
		],
		"application/vnd.adobe.formscentral.fcdt": [
			"fcdt"
		],
		"application/vnd.adobe.fxp": [
			"fxp",
			"fxpl"
		],
		"application/vnd.adobe.xdp+xml": [
			"xdp"
		],
		"application/vnd.adobe.xfdf": [
			"xfdf"
		],
		"application/vnd.ahead.space": [
			"ahead"
		],
		"application/vnd.airzip.filesecure.azf": [
			"azf"
		],
		"application/vnd.airzip.filesecure.azs": [
			"azs"
		],
		"application/vnd.amazon.ebook": [
			"azw"
		],
		"application/vnd.americandynamics.acc": [
			"acc"
		],
		"application/vnd.amiga.ami": [
			"ami"
		],
		"application/vnd.android.package-archive": [
			"apk"
		],
		"application/vnd.anser-web-certificate-issue-initiation": [
			"cii"
		],
		"application/vnd.anser-web-funds-transfer-initiation": [
			"fti"
		],
		"application/vnd.antix.game-component": [
			"atx"
		],
		"application/vnd.apple.installer+xml": [
			"mpkg"
		],
		"application/vnd.apple.mpegurl": [
			"m3u8"
		],
		"application/vnd.aristanetworks.swi": [
			"swi"
		],
		"application/vnd.astraea-software.iota": [
			"iota"
		],
		"application/vnd.audiograph": [
			"aep"
		],
		"application/vnd.blueice.multipass": [
			"mpm"
		],
		"application/vnd.bmi": [
			"bmi"
		],
		"application/vnd.businessobjects": [
			"rep"
		],
		"application/vnd.chemdraw+xml": [
			"cdxml"
		],
		"application/vnd.chipnuts.karaoke-mmd": [
			"mmd"
		],
		"application/vnd.cinderella": [
			"cdy"
		],
		"application/vnd.claymore": [
			"cla"
		],
		"application/vnd.cloanto.rp9": [
			"rp9"
		],
		"application/vnd.clonk.c4group": [
			"c4g",
			"c4d",
			"c4f",
			"c4p",
			"c4u"
		],
		"application/vnd.cluetrust.cartomobile-config": [
			"c11amc"
		],
		"application/vnd.cluetrust.cartomobile-config-pkg": [
			"c11amz"
		],
		"application/vnd.commonspace": [
			"csp"
		],
		"application/vnd.contact.cmsg": [
			"cdbcmsg"
		],
		"application/vnd.cosmocaller": [
			"cmc"
		],
		"application/vnd.crick.clicker": [
			"clkx"
		],
		"application/vnd.crick.clicker.keyboard": [
			"clkk"
		],
		"application/vnd.crick.clicker.palette": [
			"clkp"
		],
		"application/vnd.crick.clicker.template": [
			"clkt"
		],
		"application/vnd.crick.clicker.wordbank": [
			"clkw"
		],
		"application/vnd.criticaltools.wbs+xml": [
			"wbs"
		],
		"application/vnd.ctc-posml": [
			"pml"
		],
		"application/vnd.cups-ppd": [
			"ppd"
		],
		"application/vnd.curl.car": [
			"car"
		],
		"application/vnd.curl.pcurl": [
			"pcurl"
		],
		"application/vnd.dart": [
			"dart"
		],
		"application/vnd.data-vision.rdz": [
			"rdz"
		],
		"application/vnd.dece.data": [
			"uvf",
			"uvvf",
			"uvd",
			"uvvd"
		],
		"application/vnd.dece.ttml+xml": [
			"uvt",
			"uvvt"
		],
		"application/vnd.dece.unspecified": [
			"uvx",
			"uvvx"
		],
		"application/vnd.dece.zip": [
			"uvz",
			"uvvz"
		],
		"application/vnd.denovo.fcselayout-link": [
			"fe_launch"
		],
		"application/vnd.dna": [
			"dna"
		],
		"application/vnd.dolby.mlp": [
			"mlp"
		],
		"application/vnd.dpgraph": [
			"dpg"
		],
		"application/vnd.dreamfactory": [
			"dfac"
		],
		"application/vnd.ds-keypoint": [
			"kpxx"
		],
		"application/vnd.dvb.ait": [
			"ait"
		],
		"application/vnd.dvb.service": [
			"svc"
		],
		"application/vnd.dynageo": [
			"geo"
		],
		"application/vnd.ecowin.chart": [
			"mag"
		],
		"application/vnd.enliven": [
			"nml"
		],
		"application/vnd.epson.esf": [
			"esf"
		],
		"application/vnd.epson.msf": [
			"msf"
		],
		"application/vnd.epson.quickanime": [
			"qam"
		],
		"application/vnd.epson.salt": [
			"slt"
		],
		"application/vnd.epson.ssf": [
			"ssf"
		],
		"application/vnd.eszigno3+xml": [
			"es3",
			"et3"
		],
		"application/vnd.ezpix-album": [
			"ez2"
		],
		"application/vnd.ezpix-package": [
			"ez3"
		],
		"application/vnd.fdf": [
			"fdf"
		],
		"application/vnd.fdsn.mseed": [
			"mseed"
		],
		"application/vnd.fdsn.seed": [
			"seed",
			"dataless"
		],
		"application/vnd.flographit": [
			"gph"
		],
		"application/vnd.fluxtime.clip": [
			"ftc"
		],
		"application/vnd.framemaker": [
			"fm",
			"frame",
			"maker",
			"book"
		],
		"application/vnd.frogans.fnc": [
			"fnc"
		],
		"application/vnd.frogans.ltf": [
			"ltf"
		],
		"application/vnd.fsc.weblaunch": [
			"fsc"
		],
		"application/vnd.fujitsu.oasys": [
			"oas"
		],
		"application/vnd.fujitsu.oasys2": [
			"oa2"
		],
		"application/vnd.fujitsu.oasys3": [
			"oa3"
		],
		"application/vnd.fujitsu.oasysgp": [
			"fg5"
		],
		"application/vnd.fujitsu.oasysprs": [
			"bh2"
		],
		"application/vnd.fujixerox.ddd": [
			"ddd"
		],
		"application/vnd.fujixerox.docuworks": [
			"xdw"
		],
		"application/vnd.fujixerox.docuworks.binder": [
			"xbd"
		],
		"application/vnd.fuzzysheet": [
			"fzs"
		],
		"application/vnd.genomatix.tuxedo": [
			"txd"
		],
		"application/vnd.geogebra.file": [
			"ggb"
		],
		"application/vnd.geogebra.tool": [
			"ggt"
		],
		"application/vnd.geometry-explorer": [
			"gex",
			"gre"
		],
		"application/vnd.geonext": [
			"gxt"
		],
		"application/vnd.geoplan": [
			"g2w"
		],
		"application/vnd.geospace": [
			"g3w"
		],
		"application/vnd.gmx": [
			"gmx"
		],
		"application/vnd.google-earth.kml+xml": [
			"kml"
		],
		"application/vnd.google-earth.kmz": [
			"kmz"
		],
		"application/vnd.grafeq": [
			"gqf",
			"gqs"
		],
		"application/vnd.groove-account": [
			"gac"
		],
		"application/vnd.groove-help": [
			"ghf"
		],
		"application/vnd.groove-identity-message": [
			"gim"
		],
		"application/vnd.groove-injector": [
			"grv"
		],
		"application/vnd.groove-tool-message": [
			"gtm"
		],
		"application/vnd.groove-tool-template": [
			"tpl"
		],
		"application/vnd.groove-vcard": [
			"vcg"
		],
		"application/vnd.hal+xml": [
			"hal"
		],
		"application/vnd.handheld-entertainment+xml": [
			"zmm"
		],
		"application/vnd.hbci": [
			"hbci"
		],
		"application/vnd.hhe.lesson-player": [
			"les"
		],
		"application/vnd.hp-hpgl": [
			"hpgl"
		],
		"application/vnd.hp-hpid": [
			"hpid"
		],
		"application/vnd.hp-hps": [
			"hps"
		],
		"application/vnd.hp-jlyt": [
			"jlt"
		],
		"application/vnd.hp-pcl": [
			"pcl"
		],
		"application/vnd.hp-pclxl": [
			"pclxl"
		],
		"application/vnd.ibm.minipay": [
			"mpy"
		],
		"application/vnd.ibm.modcap": [
			"afp",
			"listafp",
			"list3820"
		],
		"application/vnd.ibm.rights-management": [
			"irm"
		],
		"application/vnd.ibm.secure-container": [
			"sc"
		],
		"application/vnd.iccprofile": [
			"icc",
			"icm"
		],
		"application/vnd.igloader": [
			"igl"
		],
		"application/vnd.immervision-ivp": [
			"ivp"
		],
		"application/vnd.immervision-ivu": [
			"ivu"
		],
		"application/vnd.insors.igm": [
			"igm"
		],
		"application/vnd.intercon.formnet": [
			"xpw",
			"xpx"
		],
		"application/vnd.intergeo": [
			"i2g"
		],
		"application/vnd.intu.qbo": [
			"qbo"
		],
		"application/vnd.intu.qfx": [
			"qfx"
		],
		"application/vnd.ipunplugged.rcprofile": [
			"rcprofile"
		],
		"application/vnd.irepository.package+xml": [
			"irp"
		],
		"application/vnd.is-xpr": [
			"xpr"
		],
		"application/vnd.isac.fcs": [
			"fcs"
		],
		"application/vnd.jam": [
			"jam"
		],
		"application/vnd.jcp.javame.midlet-rms": [
			"rms"
		],
		"application/vnd.jisp": [
			"jisp"
		],
		"application/vnd.joost.joda-archive": [
			"joda"
		],
		"application/vnd.kahootz": [
			"ktz",
			"ktr"
		],
		"application/vnd.kde.karbon": [
			"karbon"
		],
		"application/vnd.kde.kchart": [
			"chrt"
		],
		"application/vnd.kde.kformula": [
			"kfo"
		],
		"application/vnd.kde.kivio": [
			"flw"
		],
		"application/vnd.kde.kontour": [
			"kon"
		],
		"application/vnd.kde.kpresenter": [
			"kpr",
			"kpt"
		],
		"application/vnd.kde.kspread": [
			"ksp"
		],
		"application/vnd.kde.kword": [
			"kwd",
			"kwt"
		],
		"application/vnd.kenameaapp": [
			"htke"
		],
		"application/vnd.kidspiration": [
			"kia"
		],
		"application/vnd.kinar": [
			"kne",
			"knp"
		],
		"application/vnd.koan": [
			"skp",
			"skd",
			"skt",
			"skm"
		],
		"application/vnd.kodak-descriptor": [
			"sse"
		],
		"application/vnd.las.las+xml": [
			"lasxml"
		],
		"application/vnd.llamagraphics.life-balance.desktop": [
			"lbd"
		],
		"application/vnd.llamagraphics.life-balance.exchange+xml": [
			"lbe"
		],
		"application/vnd.lotus-1-2-3": [
			"123"
		],
		"application/vnd.lotus-approach": [
			"apr"
		],
		"application/vnd.lotus-freelance": [
			"pre"
		],
		"application/vnd.lotus-notes": [
			"nsf"
		],
		"application/vnd.lotus-organizer": [
			"org"
		],
		"application/vnd.lotus-screencam": [
			"scm"
		],
		"application/vnd.lotus-wordpro": [
			"lwp"
		],
		"application/vnd.macports.portpkg": [
			"portpkg"
		],
		"application/vnd.mcd": [
			"mcd"
		],
		"application/vnd.medcalcdata": [
			"mc1"
		],
		"application/vnd.mediastation.cdkey": [
			"cdkey"
		],
		"application/vnd.mfer": [
			"mwf"
		],
		"application/vnd.mfmp": [
			"mfm"
		],
		"application/vnd.micrografx.flo": [
			"flo"
		],
		"application/vnd.micrografx.igx": [
			"igx"
		],
		"application/vnd.mif": [
			"mif"
		],
		"application/vnd.mobius.daf": [
			"daf"
		],
		"application/vnd.mobius.dis": [
			"dis"
		],
		"application/vnd.mobius.mbk": [
			"mbk"
		],
		"application/vnd.mobius.mqy": [
			"mqy"
		],
		"application/vnd.mobius.msl": [
			"msl"
		],
		"application/vnd.mobius.plc": [
			"plc"
		],
		"application/vnd.mobius.txf": [
			"txf"
		],
		"application/vnd.mophun.application": [
			"mpn"
		],
		"application/vnd.mophun.certificate": [
			"mpc"
		],
		"application/vnd.mozilla.xul+xml": [
			"xul"
		],
		"application/vnd.ms-artgalry": [
			"cil"
		],
		"application/vnd.ms-cab-compressed": [
			"cab"
		],
		"application/vnd.ms-excel": [
			"xls",
			"xlm",
			"xla",
			"xlc",
			"xlt",
			"xlw"
		],
		"application/vnd.ms-excel.addin.macroenabled.12": [
			"xlam"
		],
		"application/vnd.ms-excel.sheet.binary.macroenabled.12": [
			"xlsb"
		],
		"application/vnd.ms-excel.sheet.macroenabled.12": [
			"xlsm"
		],
		"application/vnd.ms-excel.template.macroenabled.12": [
			"xltm"
		],
		"application/vnd.ms-fontobject": [
			"eot"
		],
		"application/vnd.ms-htmlhelp": [
			"chm"
		],
		"application/vnd.ms-ims": [
			"ims"
		],
		"application/vnd.ms-lrm": [
			"lrm"
		],
		"application/vnd.ms-officetheme": [
			"thmx"
		],
		"application/vnd.ms-pki.seccat": [
			"cat"
		],
		"application/vnd.ms-pki.stl": [
			"stl"
		],
		"application/vnd.ms-powerpoint": [
			"ppt",
			"pps",
			"pot"
		],
		"application/vnd.ms-powerpoint.addin.macroenabled.12": [
			"ppam"
		],
		"application/vnd.ms-powerpoint.presentation.macroenabled.12": [
			"pptm"
		],
		"application/vnd.ms-powerpoint.slide.macroenabled.12": [
			"sldm"
		],
		"application/vnd.ms-powerpoint.slideshow.macroenabled.12": [
			"ppsm"
		],
		"application/vnd.ms-powerpoint.template.macroenabled.12": [
			"potm"
		],
		"application/vnd.ms-project": [
			"mpp",
			"mpt"
		],
		"application/vnd.ms-word.document.macroenabled.12": [
			"docm"
		],
		"application/vnd.ms-word.template.macroenabled.12": [
			"dotm"
		],
		"application/vnd.ms-works": [
			"wps",
			"wks",
			"wcm",
			"wdb"
		],
		"application/vnd.ms-wpl": [
			"wpl"
		],
		"application/vnd.ms-xpsdocument": [
			"xps"
		],
		"application/vnd.mseq": [
			"mseq"
		],
		"application/vnd.musician": [
			"mus"
		],
		"application/vnd.muvee.style": [
			"msty"
		],
		"application/vnd.mynfc": [
			"taglet"
		],
		"application/vnd.neurolanguage.nlu": [
			"nlu"
		],
		"application/vnd.nitf": [
			"ntf",
			"nitf"
		],
		"application/vnd.noblenet-directory": [
			"nnd"
		],
		"application/vnd.noblenet-sealer": [
			"nns"
		],
		"application/vnd.noblenet-web": [
			"nnw"
		],
		"application/vnd.nokia.n-gage.data": [
			"ngdat"
		],
		"application/vnd.nokia.radio-preset": [
			"rpst"
		],
		"application/vnd.nokia.radio-presets": [
			"rpss"
		],
		"application/vnd.novadigm.edm": [
			"edm"
		],
		"application/vnd.novadigm.edx": [
			"edx"
		],
		"application/vnd.novadigm.ext": [
			"ext"
		],
		"application/vnd.oasis.opendocument.chart": [
			"odc"
		],
		"application/vnd.oasis.opendocument.chart-template": [
			"otc"
		],
		"application/vnd.oasis.opendocument.database": [
			"odb"
		],
		"application/vnd.oasis.opendocument.formula": [
			"odf"
		],
		"application/vnd.oasis.opendocument.formula-template": [
			"odft"
		],
		"application/vnd.oasis.opendocument.graphics": [
			"odg"
		],
		"application/vnd.oasis.opendocument.graphics-template": [
			"otg"
		],
		"application/vnd.oasis.opendocument.image": [
			"odi"
		],
		"application/vnd.oasis.opendocument.image-template": [
			"oti"
		],
		"application/vnd.oasis.opendocument.presentation": [
			"odp"
		],
		"application/vnd.oasis.opendocument.presentation-template": [
			"otp"
		],
		"application/vnd.oasis.opendocument.spreadsheet": [
			"ods"
		],
		"application/vnd.oasis.opendocument.spreadsheet-template": [
			"ots"
		],
		"application/vnd.oasis.opendocument.text": [
			"odt"
		],
		"application/vnd.oasis.opendocument.text-master": [
			"odm"
		],
		"application/vnd.oasis.opendocument.text-template": [
			"ott"
		],
		"application/vnd.oasis.opendocument.text-web": [
			"oth"
		],
		"application/vnd.olpc-sugar": [
			"xo"
		],
		"application/vnd.oma.dd2+xml": [
			"dd2"
		],
		"application/vnd.openofficeorg.extension": [
			"oxt"
		],
		"application/vnd.openxmlformats-officedocument.presentationml.presentation": [
			"pptx"
		],
		"application/vnd.openxmlformats-officedocument.presentationml.slide": [
			"sldx"
		],
		"application/vnd.openxmlformats-officedocument.presentationml.slideshow": [
			"ppsx"
		],
		"application/vnd.openxmlformats-officedocument.presentationml.template": [
			"potx"
		],
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
			"xlsx"
		],
		"application/vnd.openxmlformats-officedocument.spreadsheetml.template": [
			"xltx"
		],
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
			"docx"
		],
		"application/vnd.openxmlformats-officedocument.wordprocessingml.template": [
			"dotx"
		],
		"application/vnd.osgeo.mapguide.package": [
			"mgp"
		],
		"application/vnd.osgi.dp": [
			"dp"
		],
		"application/vnd.osgi.subsystem": [
			"esa"
		],
		"application/vnd.palm": [
			"pdb",
			"pqa",
			"oprc"
		],
		"application/vnd.pawaafile": [
			"paw"
		],
		"application/vnd.pg.format": [
			"str"
		],
		"application/vnd.pg.osasli": [
			"ei6"
		],
		"application/vnd.picsel": [
			"efif"
		],
		"application/vnd.pmi.widget": [
			"wg"
		],
		"application/vnd.pocketlearn": [
			"plf"
		],
		"application/vnd.powerbuilder6": [
			"pbd"
		],
		"application/vnd.previewsystems.box": [
			"box"
		],
		"application/vnd.proteus.magazine": [
			"mgz"
		],
		"application/vnd.publishare-delta-tree": [
			"qps"
		],
		"application/vnd.pvi.ptid1": [
			"ptid"
		],
		"application/vnd.quark.quarkxpress": [
			"qxd",
			"qxt",
			"qwd",
			"qwt",
			"qxl",
			"qxb"
		],
		"application/vnd.realvnc.bed": [
			"bed"
		],
		"application/vnd.recordare.musicxml": [
			"mxl"
		],
		"application/vnd.recordare.musicxml+xml": [
			"musicxml"
		],
		"application/vnd.rig.cryptonote": [
			"cryptonote"
		],
		"application/vnd.rim.cod": [
			"cod"
		],
		"application/vnd.rn-realmedia": [
			"rm"
		],
		"application/vnd.rn-realmedia-vbr": [
			"rmvb"
		],
		"application/vnd.route66.link66+xml": [
			"link66"
		],
		"application/vnd.sailingtracker.track": [
			"st"
		],
		"application/vnd.seemail": [
			"see"
		],
		"application/vnd.sema": [
			"sema"
		],
		"application/vnd.semd": [
			"semd"
		],
		"application/vnd.semf": [
			"semf"
		],
		"application/vnd.shana.informed.formdata": [
			"ifm"
		],
		"application/vnd.shana.informed.formtemplate": [
			"itp"
		],
		"application/vnd.shana.informed.interchange": [
			"iif"
		],
		"application/vnd.shana.informed.package": [
			"ipk"
		],
		"application/vnd.simtech-mindmapper": [
			"twd",
			"twds"
		],
		"application/vnd.smaf": [
			"mmf"
		],
		"application/vnd.smart.teacher": [
			"teacher"
		],
		"application/vnd.solent.sdkm+xml": [
			"sdkm",
			"sdkd"
		],
		"application/vnd.spotfire.dxp": [
			"dxp"
		],
		"application/vnd.spotfire.sfs": [
			"sfs"
		],
		"application/vnd.stardivision.calc": [
			"sdc"
		],
		"application/vnd.stardivision.draw": [
			"sda"
		],
		"application/vnd.stardivision.impress": [
			"sdd"
		],
		"application/vnd.stardivision.math": [
			"smf"
		],
		"application/vnd.stardivision.writer": [
			"sdw",
			"vor"
		],
		"application/vnd.stardivision.writer-global": [
			"sgl"
		],
		"application/vnd.stepmania.package": [
			"smzip"
		],
		"application/vnd.stepmania.stepchart": [
			"sm"
		],
		"application/vnd.sun.xml.calc": [
			"sxc"
		],
		"application/vnd.sun.xml.calc.template": [
			"stc"
		],
		"application/vnd.sun.xml.draw": [
			"sxd"
		],
		"application/vnd.sun.xml.draw.template": [
			"std"
		],
		"application/vnd.sun.xml.impress": [
			"sxi"
		],
		"application/vnd.sun.xml.impress.template": [
			"sti"
		],
		"application/vnd.sun.xml.math": [
			"sxm"
		],
		"application/vnd.sun.xml.writer": [
			"sxw"
		],
		"application/vnd.sun.xml.writer.global": [
			"sxg"
		],
		"application/vnd.sun.xml.writer.template": [
			"stw"
		],
		"application/vnd.sus-calendar": [
			"sus",
			"susp"
		],
		"application/vnd.svd": [
			"svd"
		],
		"application/vnd.symbian.install": [
			"sis",
			"sisx"
		],
		"application/vnd.syncml+xml": [
			"xsm"
		],
		"application/vnd.syncml.dm+wbxml": [
			"bdm"
		],
		"application/vnd.syncml.dm+xml": [
			"xdm"
		],
		"application/vnd.tao.intent-module-archive": [
			"tao"
		],
		"application/vnd.tcpdump.pcap": [
			"pcap",
			"cap",
			"dmp"
		],
		"application/vnd.tmobile-livetv": [
			"tmo"
		],
		"application/vnd.trid.tpt": [
			"tpt"
		],
		"application/vnd.triscape.mxs": [
			"mxs"
		],
		"application/vnd.trueapp": [
			"tra"
		],
		"application/vnd.ufdl": [
			"ufd",
			"ufdl"
		],
		"application/vnd.uiq.theme": [
			"utz"
		],
		"application/vnd.umajin": [
			"umj"
		],
		"application/vnd.unity": [
			"unityweb"
		],
		"application/vnd.uoml+xml": [
			"uoml"
		],
		"application/vnd.vcx": [
			"vcx"
		],
		"application/vnd.visio": [
			"vsd",
			"vst",
			"vss",
			"vsw"
		],
		"application/vnd.visionary": [
			"vis"
		],
		"application/vnd.vsf": [
			"vsf"
		],
		"application/vnd.wap.wbxml": [
			"wbxml"
		],
		"application/vnd.wap.wmlc": [
			"wmlc"
		],
		"application/vnd.wap.wmlscriptc": [
			"wmlsc"
		],
		"application/vnd.webturbo": [
			"wtb"
		],
		"application/vnd.wolfram.player": [
			"nbp"
		],
		"application/vnd.wordperfect": [
			"wpd"
		],
		"application/vnd.wqd": [
			"wqd"
		],
		"application/vnd.wt.stf": [
			"stf"
		],
		"application/vnd.xara": [
			"xar"
		],
		"application/vnd.xfdl": [
			"xfdl"
		],
		"application/vnd.yamaha.hv-dic": [
			"hvd"
		],
		"application/vnd.yamaha.hv-script": [
			"hvs"
		],
		"application/vnd.yamaha.hv-voice": [
			"hvp"
		],
		"application/vnd.yamaha.openscoreformat": [
			"osf"
		],
		"application/vnd.yamaha.openscoreformat.osfpvg+xml": [
			"osfpvg"
		],
		"application/vnd.yamaha.smaf-audio": [
			"saf"
		],
		"application/vnd.yamaha.smaf-phrase": [
			"spf"
		],
		"application/vnd.yellowriver-custom-menu": [
			"cmp"
		],
		"application/vnd.zul": [
			"zir",
			"zirz"
		],
		"application/vnd.zzazz.deck+xml": [
			"zaz"
		],
		"application/voicexml+xml": [
			"vxml"
		],
		"application/widget": [
			"wgt"
		],
		"application/winhlp": [
			"hlp"
		],
		"application/wsdl+xml": [
			"wsdl"
		],
		"application/wspolicy+xml": [
			"wspolicy"
		],
		"application/x-7z-compressed": [
			"7z"
		],
		"application/x-abiword": [
			"abw"
		],
		"application/x-ace-compressed": [
			"ace"
		],
		"application/x-apple-diskimage": [
			"dmg"
		],
		"application/x-authorware-bin": [
			"aab",
			"x32",
			"u32",
			"vox"
		],
		"application/x-authorware-map": [
			"aam"
		],
		"application/x-authorware-seg": [
			"aas"
		],
		"application/x-bcpio": [
			"bcpio"
		],
		"application/x-bittorrent": [
			"torrent"
		],
		"application/x-blorb": [
			"blb",
			"blorb"
		],
		"application/x-bzip": [
			"bz"
		],
		"application/x-bzip2": [
			"bz2",
			"boz"
		],
		"application/x-cbr": [
			"cbr",
			"cba",
			"cbt",
			"cbz",
			"cb7"
		],
		"application/x-cdlink": [
			"vcd"
		],
		"application/x-cfs-compressed": [
			"cfs"
		],
		"application/x-chat": [
			"chat"
		],
		"application/x-chess-pgn": [
			"pgn"
		],
		"application/x-chrome-extension": [
			"crx"
		],
		"application/x-conference": [
			"nsc"
		],
		"application/x-cpio": [
			"cpio"
		],
		"application/x-csh": [
			"csh"
		],
		"application/x-debian-package": [
			"deb",
			"udeb"
		],
		"application/x-dgc-compressed": [
			"dgc"
		],
		"application/x-director": [
			"dir",
			"dcr",
			"dxr",
			"cst",
			"cct",
			"cxt",
			"w3d",
			"fgd",
			"swa"
		],
		"application/x-doom": [
			"wad"
		],
		"application/x-dtbncx+xml": [
			"ncx"
		],
		"application/x-dtbook+xml": [
			"dtb"
		],
		"application/x-dtbresource+xml": [
			"res"
		],
		"application/x-dvi": [
			"dvi"
		],
		"application/x-envoy": [
			"evy"
		],
		"application/x-eva": [
			"eva"
		],
		"application/x-font-bdf": [
			"bdf"
		],
		"application/x-font-ghostscript": [
			"gsf"
		],
		"application/x-font-linux-psf": [
			"psf"
		],
		"application/x-font-otf": [
			"otf"
		],
		"application/x-font-pcf": [
			"pcf"
		],
		"application/x-font-snf": [
			"snf"
		],
		"application/x-font-ttf": [
			"ttf",
			"ttc"
		],
		"application/x-font-type1": [
			"pfa",
			"pfb",
			"pfm",
			"afm"
		],
		"application/x-freearc": [
			"arc"
		],
		"application/x-futuresplash": [
			"spl"
		],
		"application/x-gca-compressed": [
			"gca"
		],
		"application/x-glulx": [
			"ulx"
		],
		"application/x-gnumeric": [
			"gnumeric"
		],
		"application/x-gramps-xml": [
			"gramps"
		],
		"application/x-gtar": [
			"gtar"
		],
		"application/x-hdf": [
			"hdf"
		],
		"application/x-install-instructions": [
			"install"
		],
		"application/x-iso9660-image": [
			"iso"
		],
		"application/x-java-jnlp-file": [
			"jnlp"
		],
		"application/x-latex": [
			"latex"
		],
		"application/x-lua-bytecode": [
			"luac"
		],
		"application/x-lzh-compressed": [
			"lzh",
			"lha"
		],
		"application/x-mie": [
			"mie"
		],
		"application/x-mobipocket-ebook": [
			"prc",
			"mobi"
		],
		"application/x-ms-application": [
			"application"
		],
		"application/x-ms-shortcut": [
			"lnk"
		],
		"application/x-ms-wmd": [
			"wmd"
		],
		"application/x-ms-wmz": [
			"wmz"
		],
		"application/x-ms-xbap": [
			"xbap"
		],
		"application/x-msaccess": [
			"mdb"
		],
		"application/x-msbinder": [
			"obd"
		],
		"application/x-mscardfile": [
			"crd"
		],
		"application/x-msclip": [
			"clp"
		],
		"application/x-msdownload": [
			"exe",
			"dll",
			"com",
			"bat",
			"msi"
		],
		"application/x-msmediaview": [
			"mvb",
			"m13",
			"m14"
		],
		"application/x-msmetafile": [
			"wmf",
			"wmz",
			"emf",
			"emz"
		],
		"application/x-msmoney": [
			"mny"
		],
		"application/x-mspublisher": [
			"pub"
		],
		"application/x-msschedule": [
			"scd"
		],
		"application/x-msterminal": [
			"trm"
		],
		"application/x-mswrite": [
			"wri"
		],
		"application/x-netcdf": [
			"nc",
			"cdf"
		],
		"application/x-nzb": [
			"nzb"
		],
		"application/x-pkcs12": [
			"p12",
			"pfx"
		],
		"application/x-pkcs7-certificates": [
			"p7b",
			"spc"
		],
		"application/x-pkcs7-certreqresp": [
			"p7r"
		],
		"application/x-rar-compressed": [
			"rar"
		],
		"application/x-research-info-systems": [
			"ris"
		],
		"application/x-sh": [
			"sh"
		],
		"application/x-shar": [
			"shar"
		],
		"application/x-shockwave-flash": [
			"swf"
		],
		"application/x-silverlight-app": [
			"xap"
		],
		"application/x-sql": [
			"sql"
		],
		"application/x-stuffit": [
			"sit"
		],
		"application/x-stuffitx": [
			"sitx"
		],
		"application/x-subrip": [
			"srt"
		],
		"application/x-sv4cpio": [
			"sv4cpio"
		],
		"application/x-sv4crc": [
			"sv4crc"
		],
		"application/x-t3vm-image": [
			"t3"
		],
		"application/x-tads": [
			"gam"
		],
		"application/x-tar": [
			"tar"
		],
		"application/x-tcl": [
			"tcl"
		],
		"application/x-tex": [
			"tex"
		],
		"application/x-tex-tfm": [
			"tfm"
		],
		"application/x-texinfo": [
			"texinfo",
			"texi"
		],
		"application/x-tgif": [
			"obj"
		],
		"application/x-ustar": [
			"ustar"
		],
		"application/x-wais-source": [
			"src"
		],
		"application/x-web-app-manifest+json": [
			"webapp"
		],
		"application/x-x509-ca-cert": [
			"der",
			"crt"
		],
		"application/x-xfig": [
			"fig"
		],
		"application/x-xliff+xml": [
			"xlf"
		],
		"application/x-xpinstall": [
			"xpi"
		],
		"application/x-xz": [
			"xz"
		],
		"application/x-zmachine": [
			"z1",
			"z2",
			"z3",
			"z4",
			"z5",
			"z6",
			"z7",
			"z8"
		],
		"application/xaml+xml": [
			"xaml"
		],
		"application/xcap-diff+xml": [
			"xdf"
		],
		"application/xenc+xml": [
			"xenc"
		],
		"application/xhtml+xml": [
			"xhtml",
			"xht"
		],
		"application/xml": [
			"xml",
			"xsl",
			"xsd"
		],
		"application/xml-dtd": [
			"dtd"
		],
		"application/xop+xml": [
			"xop"
		],
		"application/xproc+xml": [
			"xpl"
		],
		"application/xslt+xml": [
			"xslt"
		],
		"application/xspf+xml": [
			"xspf"
		],
		"application/xv+xml": [
			"mxml",
			"xhvml",
			"xvml",
			"xvm"
		],
		"application/yang": [
			"yang"
		],
		"application/yin+xml": [
			"yin"
		],
		"application/zip": [
			"zip"
		],
		"audio/adpcm": [
			"adp"
		],
		"audio/basic": [
			"au",
			"snd"
		],
		"audio/midi": [
			"mid",
			"midi",
			"kar",
			"rmi"
		],
		"audio/mp4": [
			"mp4a",
			"m4a"
		],
		"audio/mpeg": [
			"mpga",
			"mp2",
			"mp2a",
			"mp3",
			"m2a",
			"m3a"
		],
		"audio/ogg": [
			"oga",
			"ogg",
			"spx"
		],
		"audio/s3m": [
			"s3m"
		],
		"audio/silk": [
			"sil"
		],
		"audio/vnd.dece.audio": [
			"uva",
			"uvva"
		],
		"audio/vnd.digital-winds": [
			"eol"
		],
		"audio/vnd.dra": [
			"dra"
		],
		"audio/vnd.dts": [
			"dts"
		],
		"audio/vnd.dts.hd": [
			"dtshd"
		],
		"audio/vnd.lucent.voice": [
			"lvp"
		],
		"audio/vnd.ms-playready.media.pya": [
			"pya"
		],
		"audio/vnd.nuera.ecelp4800": [
			"ecelp4800"
		],
		"audio/vnd.nuera.ecelp7470": [
			"ecelp7470"
		],
		"audio/vnd.nuera.ecelp9600": [
			"ecelp9600"
		],
		"audio/vnd.rip": [
			"rip"
		],
		"audio/webm": [
			"weba"
		],
		"audio/x-aac": [
			"aac"
		],
		"audio/x-aiff": [
			"aif",
			"aiff",
			"aifc"
		],
		"audio/x-caf": [
			"caf"
		],
		"audio/x-flac": [
			"flac"
		],
		"audio/x-matroska": [
			"mka"
		],
		"audio/x-mpegurl": [
			"m3u"
		],
		"audio/x-ms-wax": [
			"wax"
		],
		"audio/x-ms-wma": [
			"wma"
		],
		"audio/x-pn-realaudio": [
			"ram",
			"ra"
		],
		"audio/x-pn-realaudio-plugin": [
			"rmp"
		],
		"audio/x-wav": [
			"wav"
		],
		"audio/xm": [
			"xm"
		],
		"chemical/x-cdx": [
			"cdx"
		],
		"chemical/x-cif": [
			"cif"
		],
		"chemical/x-cmdf": [
			"cmdf"
		],
		"chemical/x-cml": [
			"cml"
		],
		"chemical/x-csml": [
			"csml"
		],
		"chemical/x-xyz": [
			"xyz"
		],
		"font/opentype": [
			"otf"
		],
		"image/bmp": [
			"bmp"
		],
		"image/cgm": [
			"cgm"
		],
		"image/g3fax": [
			"g3"
		],
		"image/gif": [
			"gif"
		],
		"image/ief": [
			"ief"
		],
		"image/jpeg": [
			"jpeg",
			"jpg",
			"jpe"
		],
		"image/ktx": [
			"ktx"
		],
		"image/png": [
			"png"
		],
		"image/prs.btif": [
			"btif"
		],
		"image/sgi": [
			"sgi"
		],
		"image/svg+xml": [
			"svg",
			"svgz"
		],
		"image/tiff": [
			"tiff",
			"tif"
		],
		"image/vnd.adobe.photoshop": [
			"psd"
		],
		"image/vnd.dece.graphic": [
			"uvi",
			"uvvi",
			"uvg",
			"uvvg"
		],
		"image/vnd.djvu": [
			"djvu",
			"djv"
		],
		"image/vnd.dvb.subtitle": [
			"sub"
		],
		"image/vnd.dwg": [
			"dwg"
		],
		"image/vnd.dxf": [
			"dxf"
		],
		"image/vnd.fastbidsheet": [
			"fbs"
		],
		"image/vnd.fpx": [
			"fpx"
		],
		"image/vnd.fst": [
			"fst"
		],
		"image/vnd.fujixerox.edmics-mmr": [
			"mmr"
		],
		"image/vnd.fujixerox.edmics-rlc": [
			"rlc"
		],
		"image/vnd.ms-modi": [
			"mdi"
		],
		"image/vnd.ms-photo": [
			"wdp"
		],
		"image/vnd.net-fpx": [
			"npx"
		],
		"image/vnd.wap.wbmp": [
			"wbmp"
		],
		"image/vnd.xiff": [
			"xif"
		],
		"image/webp": [
			"webp"
		],
		"image/x-3ds": [
			"3ds"
		],
		"image/x-cmu-raster": [
			"ras"
		],
		"image/x-cmx": [
			"cmx"
		],
		"image/x-freehand": [
			"fh",
			"fhc",
			"fh4",
			"fh5",
			"fh7"
		],
		"image/x-icon": [
			"ico"
		],
		"image/x-mrsid-image": [
			"sid"
		],
		"image/x-pcx": [
			"pcx"
		],
		"image/x-pict": [
			"pic",
			"pct"
		],
		"image/x-portable-anymap": [
			"pnm"
		],
		"image/x-portable-bitmap": [
			"pbm"
		],
		"image/x-portable-graymap": [
			"pgm"
		],
		"image/x-portable-pixmap": [
			"ppm"
		],
		"image/x-rgb": [
			"rgb"
		],
		"image/x-tga": [
			"tga"
		],
		"image/x-xbitmap": [
			"xbm"
		],
		"image/x-xpixmap": [
			"xpm"
		],
		"image/x-xwindowdump": [
			"xwd"
		],
		"message/rfc822": [
			"eml",
			"mime"
		],
		"model/iges": [
			"igs",
			"iges"
		],
		"model/mesh": [
			"msh",
			"mesh",
			"silo"
		],
		"model/vnd.collada+xml": [
			"dae"
		],
		"model/vnd.dwf": [
			"dwf"
		],
		"model/vnd.gdl": [
			"gdl"
		],
		"model/vnd.gtw": [
			"gtw"
		],
		"model/vnd.mts": [
			"mts"
		],
		"model/vnd.vtu": [
			"vtu"
		],
		"model/vrml": [
			"wrl",
			"vrml"
		],
		"model/x3d+binary": [
			"x3db",
			"x3dbz"
		],
		"model/x3d+vrml": [
			"x3dv",
			"x3dvz"
		],
		"model/x3d+xml": [
			"x3d",
			"x3dz"
		],
		"text/cache-manifest": [
			"appcache",
			"manifest"
		],
		"text/calendar": [
			"ics",
			"ifb"
		],
		"text/coffeescript": [
			"coffee"
		],
		"text/css": [
			"css"
		],
		"text/csv": [
			"csv"
		],
		"text/hjson": [
			"hjson"
		],
		"text/html": [
			"html",
			"htm"
		],
		"text/jade": [
			"jade"
		],
		"text/jsx": [
			"jsx"
		],
		"text/less": [
			"less"
		],
		"text/n3": [
			"n3"
		],
		"text/plain": [
			"txt",
			"text",
			"conf",
			"def",
			"list",
			"log",
			"in",
			"ini"
		],
		"text/prs.lines.tag": [
			"dsc"
		],
		"text/richtext": [
			"rtx"
		],
		"text/sgml": [
			"sgml",
			"sgm"
		],
		"text/stylus": [
			"stylus",
			"styl"
		],
		"text/tab-separated-values": [
			"tsv"
		],
		"text/troff": [
			"t",
			"tr",
			"roff",
			"man",
			"me",
			"ms"
		],
		"text/turtle": [
			"ttl"
		],
		"text/uri-list": [
			"uri",
			"uris",
			"urls"
		],
		"text/vcard": [
			"vcard"
		],
		"text/vnd.curl": [
			"curl"
		],
		"text/vnd.curl.dcurl": [
			"dcurl"
		],
		"text/vnd.curl.mcurl": [
			"mcurl"
		],
		"text/vnd.curl.scurl": [
			"scurl"
		],
		"text/vnd.dvb.subtitle": [
			"sub"
		],
		"text/vnd.fly": [
			"fly"
		],
		"text/vnd.fmi.flexstor": [
			"flx"
		],
		"text/vnd.graphviz": [
			"gv"
		],
		"text/vnd.in3d.3dml": [
			"3dml"
		],
		"text/vnd.in3d.spot": [
			"spot"
		],
		"text/vnd.sun.j2me.app-descriptor": [
			"jad"
		],
		"text/vnd.wap.wml": [
			"wml"
		],
		"text/vnd.wap.wmlscript": [
			"wmls"
		],
		"text/vtt": [
			"vtt"
		],
		"text/x-asm": [
			"s",
			"asm"
		],
		"text/x-c": [
			"c",
			"cc",
			"cxx",
			"cpp",
			"h",
			"hh",
			"dic"
		],
		"text/x-component": [
			"htc"
		],
		"text/x-fortran": [
			"f",
			"for",
			"f77",
			"f90"
		],
		"text/x-handlebars-template": [
			"hbs"
		],
		"text/x-java-source": [
			"java"
		],
		"text/x-lua": [
			"lua"
		],
		"text/x-markdown": [
			"markdown",
			"md",
			"mkd"
		],
		"text/x-nfo": [
			"nfo"
		],
		"text/x-opml": [
			"opml"
		],
		"text/x-pascal": [
			"p",
			"pas"
		],
		"text/x-sass": [
			"sass"
		],
		"text/x-scss": [
			"scss"
		],
		"text/x-setext": [
			"etx"
		],
		"text/x-sfv": [
			"sfv"
		],
		"text/x-uuencode": [
			"uu"
		],
		"text/x-vcalendar": [
			"vcs"
		],
		"text/x-vcard": [
			"vcf"
		],
		"text/yaml": [
			"yaml",
			"yml"
		],
		"video/3gpp": [
			"3gp"
		],
		"video/3gpp2": [
			"3g2"
		],
		"video/h261": [
			"h261"
		],
		"video/h263": [
			"h263"
		],
		"video/h264": [
			"h264"
		],
		"video/jpeg": [
			"jpgv"
		],
		"video/jpm": [
			"jpm",
			"jpgm"
		],
		"video/mj2": [
			"mj2",
			"mjp2"
		],
		"video/mp2t": [
			"ts"
		],
		"video/mp4": [
			"mp4",
			"mp4v",
			"mpg4"
		],
		"video/mpeg": [
			"mpeg",
			"mpg",
			"mpe",
			"m1v",
			"m2v"
		],
		"video/ogg": [
			"ogv"
		],
		"video/quicktime": [
			"qt",
			"mov"
		],
		"video/vnd.dece.hd": [
			"uvh",
			"uvvh"
		],
		"video/vnd.dece.mobile": [
			"uvm",
			"uvvm"
		],
		"video/vnd.dece.pd": [
			"uvp",
			"uvvp"
		],
		"video/vnd.dece.sd": [
			"uvs",
			"uvvs"
		],
		"video/vnd.dece.video": [
			"uvv",
			"uvvv"
		],
		"video/vnd.dvb.file": [
			"dvb"
		],
		"video/vnd.fvt": [
			"fvt"
		],
		"video/vnd.mpegurl": [
			"mxu",
			"m4u"
		],
		"video/vnd.ms-playready.media.pyv": [
			"pyv"
		],
		"video/vnd.uvvu.mp4": [
			"uvu",
			"uvvu"
		],
		"video/vnd.vivo": [
			"viv"
		],
		"video/webm": [
			"webm"
		],
		"video/x-f4v": [
			"f4v"
		],
		"video/x-fli": [
			"fli"
		],
		"video/x-flv": [
			"flv"
		],
		"video/x-m4v": [
			"m4v"
		],
		"video/x-matroska": [
			"mkv",
			"mk3d",
			"mks"
		],
		"video/x-mng": [
			"mng"
		],
		"video/x-ms-asf": [
			"asf",
			"asx"
		],
		"video/x-ms-vob": [
			"vob"
		],
		"video/x-ms-wm": [
			"wm"
		],
		"video/x-ms-wmv": [
			"wmv"
		],
		"video/x-ms-wmx": [
			"wmx"
		],
		"video/x-ms-wvx": [
			"wvx"
		],
		"video/x-msvideo": [
			"avi"
		],
		"video/x-sgi-movie": [
			"movie"
		],
		"video/x-smv": [
			"smv"
		],
		"x-conference/x-cooltalk": [
			"ice"
		]
	};

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(96)


/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a passthrough stream.
	// basically just the most minimal sort of Transform stream.
	// Every written chunk gets output as-is.

	module.exports = PassThrough;

	var Transform = __webpack_require__(97);

	/*<replacement>*/
	var util = __webpack_require__(99);
	util.inherits = __webpack_require__(100);
	/*</replacement>*/

	util.inherits(PassThrough, Transform);

	function PassThrough(options) {
	  if (!(this instanceof PassThrough))
	    return new PassThrough(options);

	  Transform.call(this, options);
	}

	PassThrough.prototype._transform = function(chunk, encoding, cb) {
	  cb(null, chunk);
	};


/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.


	// a transform stream is a readable/writable stream where you do
	// something with the data.  Sometimes it's called a "filter",
	// but that's not a great name for it, since that implies a thing where
	// some bits pass through, and others are simply ignored.  (That would
	// be a valid example of a transform, of course.)
	//
	// While the output is causally related to the input, it's not a
	// necessarily symmetric or synchronous transformation.  For example,
	// a zlib stream might take multiple plain-text writes(), and then
	// emit a single compressed chunk some time in the future.
	//
	// Here's how this works:
	//
	// The Transform stream has all the aspects of the readable and writable
	// stream classes.  When you write(chunk), that calls _write(chunk,cb)
	// internally, and returns false if there's a lot of pending writes
	// buffered up.  When you call read(), that calls _read(n) until
	// there's enough pending readable data buffered up.
	//
	// In a transform stream, the written data is placed in a buffer.  When
	// _read(n) is called, it transforms the queued up data, calling the
	// buffered _write cb's as it consumes chunks.  If consuming a single
	// written chunk would result in multiple output chunks, then the first
	// outputted bit calls the readcb, and subsequent chunks just go into
	// the read buffer, and will cause it to emit 'readable' if necessary.
	//
	// This way, back-pressure is actually determined by the reading side,
	// since _read has to be called to start processing a new chunk.  However,
	// a pathological inflate type of transform can cause excessive buffering
	// here.  For example, imagine a stream where every byte of input is
	// interpreted as an integer from 0-255, and then results in that many
	// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
	// 1kb of data being output.  In this case, you could write a very small
	// amount of input, and end up with a very large amount of output.  In
	// such a pathological inflating mechanism, there'd be no way to tell
	// the system to stop doing the transform.  A single 4MB write could
	// cause the system to run out of memory.
	//
	// However, even in such a pathological case, only a single written chunk
	// would be consumed, and then the rest would wait (un-transformed) until
	// the results of the previous transformed chunk were consumed.

	module.exports = Transform;

	var Duplex = __webpack_require__(98);

	/*<replacement>*/
	var util = __webpack_require__(99);
	util.inherits = __webpack_require__(100);
	/*</replacement>*/

	util.inherits(Transform, Duplex);


	function TransformState(options, stream) {
	  this.afterTransform = function(er, data) {
	    return afterTransform(stream, er, data);
	  };

	  this.needTransform = false;
	  this.transforming = false;
	  this.writecb = null;
	  this.writechunk = null;
	}

	function afterTransform(stream, er, data) {
	  var ts = stream._transformState;
	  ts.transforming = false;

	  var cb = ts.writecb;

	  if (!cb)
	    return stream.emit('error', new Error('no writecb in Transform class'));

	  ts.writechunk = null;
	  ts.writecb = null;

	  if (data !== null && data !== undefined)
	    stream.push(data);

	  if (cb)
	    cb(er);

	  var rs = stream._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    stream._read(rs.highWaterMark);
	  }
	}


	function Transform(options) {
	  if (!(this instanceof Transform))
	    return new Transform(options);

	  Duplex.call(this, options);

	  var ts = this._transformState = new TransformState(options, this);

	  // when the writable side finishes, then flush out anything remaining.
	  var stream = this;

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;

	  this.once('finish', function() {
	    if ('function' === typeof this._flush)
	      this._flush(function(er) {
	        done(stream, er);
	      });
	    else
	      done(stream);
	  });
	}

	Transform.prototype.push = function(chunk, encoding) {
	  this._transformState.needTransform = false;
	  return Duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function(chunk, encoding, cb) {
	  throw new Error('not implemented');
	};

	Transform.prototype._write = function(chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform ||
	        rs.needReadable ||
	        rs.length < rs.highWaterMark)
	      this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function(n) {
	  var ts = this._transformState;

	  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};


	function done(stream, er) {
	  if (er)
	    return stream.emit('error', er);

	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  var ws = stream._writableState;
	  var rs = stream._readableState;
	  var ts = stream._transformState;

	  if (ws.length)
	    throw new Error('calling transform done when ws.length != 0');

	  if (ts.transforming)
	    throw new Error('calling transform done when still transforming');

	  return stream.push(null);
	}


/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a duplex stream is just a stream that is both readable and writable.
	// Since JS doesn't have multiple prototypal inheritance, this class
	// prototypally inherits from Readable, and then parasitically from
	// Writable.

	module.exports = Duplex;

	/*<replacement>*/
	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) keys.push(key);
	  return keys;
	}
	/*</replacement>*/


	/*<replacement>*/
	var util = __webpack_require__(99);
	util.inherits = __webpack_require__(100);
	/*</replacement>*/

	var Readable = __webpack_require__(101);
	var Writable = __webpack_require__(104);

	util.inherits(Duplex, Readable);

	forEach(objectKeys(Writable.prototype), function(method) {
	  if (!Duplex.prototype[method])
	    Duplex.prototype[method] = Writable.prototype[method];
	});

	function Duplex(options) {
	  if (!(this instanceof Duplex))
	    return new Duplex(options);

	  Readable.call(this, options);
	  Writable.call(this, options);

	  if (options && options.readable === false)
	    this.readable = false;

	  if (options && options.writable === false)
	    this.writable = false;

	  this.allowHalfOpen = true;
	  if (options && options.allowHalfOpen === false)
	    this.allowHalfOpen = false;

	  this.once('end', onend);
	}

	// the no-half-open enforcer
	function onend() {
	  // if we allow half-open state, or if the writable side ended,
	  // then we're ok.
	  if (this.allowHalfOpen || this._writableState.ended)
	    return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  process.nextTick(this.end.bind(this));
	}

	function forEach (xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}


/***/ },
/* 99 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.

	function isArray(arg) {
	  if (Array.isArray) {
	    return Array.isArray(arg);
	  }
	  return objectToString(arg) === '[object Array]';
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = Buffer.isBuffer;

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(63).inherits


/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	module.exports = Readable;

	/*<replacement>*/
	var isArray = __webpack_require__(102);
	/*</replacement>*/


	/*<replacement>*/
	var Buffer = __webpack_require__(73).Buffer;
	/*</replacement>*/

	Readable.ReadableState = ReadableState;

	var EE = __webpack_require__(9).EventEmitter;

	/*<replacement>*/
	if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
	  return emitter.listeners(type).length;
	};
	/*</replacement>*/

	var Stream = __webpack_require__(11);

	/*<replacement>*/
	var util = __webpack_require__(99);
	util.inherits = __webpack_require__(100);
	/*</replacement>*/

	var StringDecoder;

	util.inherits(Readable, Stream);

	function ReadableState(options, stream) {
	  options = options || {};

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  var hwm = options.highWaterMark;
	  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

	  // cast to ints.
	  this.highWaterMark = ~~this.highWaterMark;

	  this.buffer = [];
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = false;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // In streams that never have any data, and do push(null) right away,
	  // the consumer can miss the 'end' event if they do some I/O before
	  // consuming the stream.  So, we don't emit('end') until some reading
	  // happens.
	  this.calledRead = false;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, becuase any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;


	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // when piping, we only care about 'readable' events that happen
	  // after read()ing all the bytes and not getting any pushback.
	  this.ranOut = false;

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;

	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    if (!StringDecoder)
	      StringDecoder = __webpack_require__(103).StringDecoder;
	    this.decoder = new StringDecoder(options.encoding);
	    this.encoding = options.encoding;
	  }
	}

	function Readable(options) {
	  if (!(this instanceof Readable))
	    return new Readable(options);

	  this._readableState = new ReadableState(options, this);

	  // legacy
	  this.readable = true;

	  Stream.call(this);
	}

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function(chunk, encoding) {
	  var state = this._readableState;

	  if (typeof chunk === 'string' && !state.objectMode) {
	    encoding = encoding || state.defaultEncoding;
	    if (encoding !== state.encoding) {
	      chunk = new Buffer(chunk, encoding);
	      encoding = '';
	    }
	  }

	  return readableAddChunk(this, state, chunk, encoding, false);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function(chunk) {
	  var state = this._readableState;
	  return readableAddChunk(this, state, chunk, '', true);
	};

	function readableAddChunk(stream, state, chunk, encoding, addToFront) {
	  var er = chunkInvalid(state, chunk);
	  if (er) {
	    stream.emit('error', er);
	  } else if (chunk === null || chunk === undefined) {
	    state.reading = false;
	    if (!state.ended)
	      onEofChunk(stream, state);
	  } else if (state.objectMode || chunk && chunk.length > 0) {
	    if (state.ended && !addToFront) {
	      var e = new Error('stream.push() after EOF');
	      stream.emit('error', e);
	    } else if (state.endEmitted && addToFront) {
	      var e = new Error('stream.unshift() after end event');
	      stream.emit('error', e);
	    } else {
	      if (state.decoder && !addToFront && !encoding)
	        chunk = state.decoder.write(chunk);

	      // update the buffer info.
	      state.length += state.objectMode ? 1 : chunk.length;
	      if (addToFront) {
	        state.buffer.unshift(chunk);
	      } else {
	        state.reading = false;
	        state.buffer.push(chunk);
	      }

	      if (state.needReadable)
	        emitReadable(stream);

	      maybeReadMore(stream, state);
	    }
	  } else if (!addToFront) {
	    state.reading = false;
	  }

	  return needMoreData(state);
	}



	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData(state) {
	  return !state.ended &&
	         (state.needReadable ||
	          state.length < state.highWaterMark ||
	          state.length === 0);
	}

	// backwards compatibility.
	Readable.prototype.setEncoding = function(enc) {
	  if (!StringDecoder)
	    StringDecoder = __webpack_require__(103).StringDecoder;
	  this._readableState.decoder = new StringDecoder(enc);
	  this._readableState.encoding = enc;
	};

	// Don't raise the hwm > 128MB
	var MAX_HWM = 0x800000;
	function roundUpToNextPowerOf2(n) {
	  if (n >= MAX_HWM) {
	    n = MAX_HWM;
	  } else {
	    // Get the next highest power of 2
	    n--;
	    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
	    n++;
	  }
	  return n;
	}

	function howMuchToRead(n, state) {
	  if (state.length === 0 && state.ended)
	    return 0;

	  if (state.objectMode)
	    return n === 0 ? 0 : 1;

	  if (isNaN(n) || n === null) {
	    // only flow one buffer at a time
	    if (state.flowing && state.buffer.length)
	      return state.buffer[0].length;
	    else
	      return state.length;
	  }

	  if (n <= 0)
	    return 0;

	  // If we're asking for more than the target buffer level,
	  // then raise the water mark.  Bump up to the next highest
	  // power of 2, to prevent increasing it excessively in tiny
	  // amounts.
	  if (n > state.highWaterMark)
	    state.highWaterMark = roundUpToNextPowerOf2(n);

	  // don't have that much.  return null, unless we've ended.
	  if (n > state.length) {
	    if (!state.ended) {
	      state.needReadable = true;
	      return 0;
	    } else
	      return state.length;
	  }

	  return n;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function(n) {
	  var state = this._readableState;
	  state.calledRead = true;
	  var nOrig = n;

	  if (typeof n !== 'number' || n > 0)
	    state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 &&
	      state.needReadable &&
	      (state.length >= state.highWaterMark || state.ended)) {
	    emitReadable(this);
	    return null;
	  }

	  n = howMuchToRead(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0)
	      endReadable(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length - n <= state.highWaterMark)
	    doRead = true;

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading)
	    doRead = false;

	  if (doRead) {
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0)
	      state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	  }

	  // If _read called its callback synchronously, then `reading`
	  // will be false, and we need to re-evaluate how much data we
	  // can return to the user.
	  if (doRead && !state.reading)
	    n = howMuchToRead(nOrig, state);

	  var ret;
	  if (n > 0)
	    ret = fromList(n, state);
	  else
	    ret = null;

	  if (ret === null) {
	    state.needReadable = true;
	    n = 0;
	  }

	  state.length -= n;

	  // If we have nothing in the buffer, then we want to know
	  // as soon as we *do* get something into the buffer.
	  if (state.length === 0 && !state.ended)
	    state.needReadable = true;

	  // If we happened to read() exactly the remaining amount in the
	  // buffer, and the EOF has been seen at this point, then make sure
	  // that we emit 'end' on the very next tick.
	  if (state.ended && !state.endEmitted && state.length === 0)
	    endReadable(this);

	  return ret;
	};

	function chunkInvalid(state, chunk) {
	  var er = null;
	  if (!Buffer.isBuffer(chunk) &&
	      'string' !== typeof chunk &&
	      chunk !== null &&
	      chunk !== undefined &&
	      !state.objectMode &&
	      !er) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  return er;
	}


	function onEofChunk(stream, state) {
	  if (state.decoder && !state.ended) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;

	  // if we've ended and we have some data left, then emit
	  // 'readable' now to make sure it gets picked up.
	  if (state.length > 0)
	    emitReadable(stream);
	  else
	    endReadable(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  var state = stream._readableState;
	  state.needReadable = false;
	  if (state.emittedReadable)
	    return;

	  state.emittedReadable = true;
	  if (state.sync)
	    process.nextTick(function() {
	      emitReadable_(stream);
	    });
	  else
	    emitReadable_(stream);
	}

	function emitReadable_(stream) {
	  stream.emit('readable');
	}


	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    process.nextTick(function() {
	      maybeReadMore_(stream, state);
	    });
	  }
	}

	function maybeReadMore_(stream, state) {
	  var len = state.length;
	  while (!state.reading && !state.flowing && !state.ended &&
	         state.length < state.highWaterMark) {
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;
	    else
	      len = state.length;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function(n) {
	  this.emit('error', new Error('not implemented'));
	};

	Readable.prototype.pipe = function(dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;

	  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
	              dest !== process.stdout &&
	              dest !== process.stderr;

	  var endFn = doEnd ? onend : cleanup;
	  if (state.endEmitted)
	    process.nextTick(endFn);
	  else
	    src.once('end', endFn);

	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable) {
	    if (readable !== src) return;
	    cleanup();
	  }

	  function onend() {
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain(src);
	  dest.on('drain', ondrain);

	  function cleanup() {
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', cleanup);

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (!dest._writableState || dest._writableState.needDrain)
	      ondrain();
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (EE.listenerCount(dest, 'error') === 0)
	      dest.emit('error', er);
	  }
	  // This is a brutally ugly hack to make sure that our error handler
	  // is attached before any userland ones.  NEVER DO THIS.
	  if (!dest._events || !dest._events.error)
	    dest.on('error', onerror);
	  else if (isArray(dest._events.error))
	    dest._events.error.unshift(onerror);
	  else
	    dest._events.error = [onerror, dest._events.error];



	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);

	  function unpipe() {
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    // the handler that waits for readable events after all
	    // the data gets sucked out in flow.
	    // This would be easier to follow with a .once() handler
	    // in flow(), but that is too slow.
	    this.on('readable', pipeOnReadable);

	    state.flowing = true;
	    process.nextTick(function() {
	      flow(src);
	    });
	  }

	  return dest;
	};

	function pipeOnDrain(src) {
	  return function() {
	    var dest = this;
	    var state = src._readableState;
	    state.awaitDrain--;
	    if (state.awaitDrain === 0)
	      flow(src);
	  };
	}

	function flow(src) {
	  var state = src._readableState;
	  var chunk;
	  state.awaitDrain = 0;

	  function write(dest, i, list) {
	    var written = dest.write(chunk);
	    if (false === written) {
	      state.awaitDrain++;
	    }
	  }

	  while (state.pipesCount && null !== (chunk = src.read())) {

	    if (state.pipesCount === 1)
	      write(state.pipes, 0, null);
	    else
	      forEach(state.pipes, write);

	    src.emit('data', chunk);

	    // if anyone needs a drain, then we have to wait for that.
	    if (state.awaitDrain > 0)
	      return;
	  }

	  // if every destination was unpiped, either before entering this
	  // function, or in the while loop, then stop flowing.
	  //
	  // NB: This is a pretty rare edge case.
	  if (state.pipesCount === 0) {
	    state.flowing = false;

	    // if there were data event listeners added, then switch to old mode.
	    if (EE.listenerCount(src, 'data') > 0)
	      emitDataEvents(src);
	    return;
	  }

	  // at this point, no one needed a drain, so we just ran out of data
	  // on the next readable event, start it over again.
	  state.ranOut = true;
	}

	function pipeOnReadable() {
	  if (this._readableState.ranOut) {
	    this._readableState.ranOut = false;
	    flow(this);
	  }
	}


	Readable.prototype.unpipe = function(dest) {
	  var state = this._readableState;

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0)
	    return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes)
	      return this;

	    if (!dest)
	      dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    this.removeListener('readable', pipeOnReadable);
	    state.flowing = false;
	    if (dest)
	      dest.emit('unpipe', this);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    this.removeListener('readable', pipeOnReadable);
	    state.flowing = false;

	    for (var i = 0; i < len; i++)
	      dests[i].emit('unpipe', this);
	    return this;
	  }

	  // try to find the right one.
	  var i = indexOf(state.pipes, dest);
	  if (i === -1)
	    return this;

	  state.pipes.splice(i, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1)
	    state.pipes = state.pipes[0];

	  dest.emit('unpipe', this);

	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function(ev, fn) {
	  var res = Stream.prototype.on.call(this, ev, fn);

	  if (ev === 'data' && !this._readableState.flowing)
	    emitDataEvents(this);

	  if (ev === 'readable' && this.readable) {
	    var state = this._readableState;
	    if (!state.readableListening) {
	      state.readableListening = true;
	      state.emittedReadable = false;
	      state.needReadable = true;
	      if (!state.reading) {
	        this.read(0);
	      } else if (state.length) {
	        emitReadable(this, state);
	      }
	    }
	  }

	  return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function() {
	  emitDataEvents(this);
	  this.read(0);
	  this.emit('resume');
	};

	Readable.prototype.pause = function() {
	  emitDataEvents(this, true);
	  this.emit('pause');
	};

	function emitDataEvents(stream, startPaused) {
	  var state = stream._readableState;

	  if (state.flowing) {
	    // https://github.com/isaacs/readable-stream/issues/16
	    throw new Error('Cannot switch to old mode now.');
	  }

	  var paused = startPaused || false;
	  var readable = false;

	  // convert to an old-style stream.
	  stream.readable = true;
	  stream.pipe = Stream.prototype.pipe;
	  stream.on = stream.addListener = Stream.prototype.on;

	  stream.on('readable', function() {
	    readable = true;

	    var c;
	    while (!paused && (null !== (c = stream.read())))
	      stream.emit('data', c);

	    if (c === null) {
	      readable = false;
	      stream._readableState.needReadable = true;
	    }
	  });

	  stream.pause = function() {
	    paused = true;
	    this.emit('pause');
	  };

	  stream.resume = function() {
	    paused = false;
	    if (readable)
	      process.nextTick(function() {
	        stream.emit('readable');
	      });
	    else
	      this.read(0);
	    this.emit('resume');
	  };

	  // now make it start, just in case it hadn't already.
	  stream.emit('readable');
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function(stream) {
	  var state = this._readableState;
	  var paused = false;

	  var self = this;
	  stream.on('end', function() {
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length)
	        self.push(chunk);
	    }

	    self.push(null);
	  });

	  stream.on('data', function(chunk) {
	    if (state.decoder)
	      chunk = state.decoder.write(chunk);
	    if (!chunk || !state.objectMode && !chunk.length)
	      return;

	    var ret = self.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (typeof stream[i] === 'function' &&
	        typeof this[i] === 'undefined') {
	      this[i] = function(method) { return function() {
	        return stream[method].apply(stream, arguments);
	      }}(i);
	    }
	  }

	  // proxy certain important events.
	  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
	  forEach(events, function(ev) {
	    stream.on(ev, self.emit.bind(self, ev));
	  });

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  self._read = function(n) {
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  return self;
	};



	// exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	function fromList(n, state) {
	  var list = state.buffer;
	  var length = state.length;
	  var stringMode = !!state.decoder;
	  var objectMode = !!state.objectMode;
	  var ret;

	  // nothing in the list, definitely empty.
	  if (list.length === 0)
	    return null;

	  if (length === 0)
	    ret = null;
	  else if (objectMode)
	    ret = list.shift();
	  else if (!n || n >= length) {
	    // read it all, truncate the array.
	    if (stringMode)
	      ret = list.join('');
	    else
	      ret = Buffer.concat(list, length);
	    list.length = 0;
	  } else {
	    // read just some of it.
	    if (n < list[0].length) {
	      // just take a part of the first list item.
	      // slice is the same for buffers and strings.
	      var buf = list[0];
	      ret = buf.slice(0, n);
	      list[0] = buf.slice(n);
	    } else if (n === list[0].length) {
	      // first list is a perfect match
	      ret = list.shift();
	    } else {
	      // complex case.
	      // we have enough to cover it, but it spans past the first buffer.
	      if (stringMode)
	        ret = '';
	      else
	        ret = new Buffer(n);

	      var c = 0;
	      for (var i = 0, l = list.length; i < l && c < n; i++) {
	        var buf = list[0];
	        var cpy = Math.min(n - c, buf.length);

	        if (stringMode)
	          ret += buf.slice(0, cpy);
	        else
	          buf.copy(ret, c, 0, cpy);

	        if (cpy < buf.length)
	          list[0] = buf.slice(cpy);
	        else
	          list.shift();

	        c += cpy;
	      }
	    }
	  }

	  return ret;
	}

	function endReadable(stream) {
	  var state = stream._readableState;

	  // If we get here before consuming all the bytes, then that is a
	  // bug in node.  Should never happen.
	  if (state.length > 0)
	    throw new Error('endReadable called on non-empty stream');

	  if (!state.endEmitted && state.calledRead) {
	    state.ended = true;
	    process.nextTick(function() {
	      // Check that we didn't get one last unshift.
	      if (!state.endEmitted && state.length === 0) {
	        state.endEmitted = true;
	        stream.readable = false;
	        stream.emit('end');
	      }
	    });
	  }
	}

	function forEach (xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	function indexOf (xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}


/***/ },
/* 102 */
/***/ function(module, exports) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var Buffer = __webpack_require__(73).Buffer;

	var isBufferEncoding = Buffer.isEncoding
	  || function(encoding) {
	       switch (encoding && encoding.toLowerCase()) {
	         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
	         default: return false;
	       }
	     }


	function assertEncoding(encoding) {
	  if (encoding && !isBufferEncoding(encoding)) {
	    throw new Error('Unknown encoding: ' + encoding);
	  }
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters. CESU-8 is handled as part of the UTF-8 encoding.
	//
	// @TODO Handling all encodings inside a single object makes it very difficult
	// to reason about this code, so it should be split up in the future.
	// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
	// points as used by CESU-8.
	var StringDecoder = exports.StringDecoder = function(encoding) {
	  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
	  assertEncoding(encoding);
	  switch (this.encoding) {
	    case 'utf8':
	      // CESU-8 represents each of Surrogate Pair by 3-bytes
	      this.surrogateSize = 3;
	      break;
	    case 'ucs2':
	    case 'utf16le':
	      // UTF-16 represents each of Surrogate Pair by 2-bytes
	      this.surrogateSize = 2;
	      this.detectIncompleteChar = utf16DetectIncompleteChar;
	      break;
	    case 'base64':
	      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
	      this.surrogateSize = 3;
	      this.detectIncompleteChar = base64DetectIncompleteChar;
	      break;
	    default:
	      this.write = passThroughWrite;
	      return;
	  }

	  // Enough space to store all bytes of a single character. UTF-8 needs 4
	  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
	  this.charBuffer = new Buffer(6);
	  // Number of bytes received for the current incomplete multi-byte character.
	  this.charReceived = 0;
	  // Number of bytes expected for the current incomplete multi-byte character.
	  this.charLength = 0;
	};


	// write decodes the given buffer and returns it as JS string that is
	// guaranteed to not contain any partial multi-byte characters. Any partial
	// character found at the end of the buffer is buffered up, and will be
	// returned when calling write again with the remaining bytes.
	//
	// Note: Converting a Buffer containing an orphan surrogate to a String
	// currently works, but converting a String to a Buffer (via `new Buffer`, or
	// Buffer#write) will replace incomplete surrogates with the unicode
	// replacement character. See https://codereview.chromium.org/121173009/ .
	StringDecoder.prototype.write = function(buffer) {
	  var charStr = '';
	  // if our last write ended with an incomplete multibyte character
	  while (this.charLength) {
	    // determine how many remaining bytes this buffer has to offer for this char
	    var available = (buffer.length >= this.charLength - this.charReceived) ?
	        this.charLength - this.charReceived :
	        buffer.length;

	    // add the new bytes to the char buffer
	    buffer.copy(this.charBuffer, this.charReceived, 0, available);
	    this.charReceived += available;

	    if (this.charReceived < this.charLength) {
	      // still not enough chars in this buffer? wait for more ...
	      return '';
	    }

	    // remove bytes belonging to the current character from the buffer
	    buffer = buffer.slice(available, buffer.length);

	    // get the character that was split
	    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

	    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	    var charCode = charStr.charCodeAt(charStr.length - 1);
	    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	      this.charLength += this.surrogateSize;
	      charStr = '';
	      continue;
	    }
	    this.charReceived = this.charLength = 0;

	    // if there are no more bytes in this buffer, just emit our char
	    if (buffer.length === 0) {
	      return charStr;
	    }
	    break;
	  }

	  // determine and set charLength / charReceived
	  this.detectIncompleteChar(buffer);

	  var end = buffer.length;
	  if (this.charLength) {
	    // buffer the incomplete character bytes we got
	    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
	    end -= this.charReceived;
	  }

	  charStr += buffer.toString(this.encoding, 0, end);

	  var end = charStr.length - 1;
	  var charCode = charStr.charCodeAt(end);
	  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	    var size = this.surrogateSize;
	    this.charLength += size;
	    this.charReceived += size;
	    this.charBuffer.copy(this.charBuffer, size, 0, size);
	    buffer.copy(this.charBuffer, 0, 0, size);
	    return charStr.substring(0, end);
	  }

	  // or just emit the charStr
	  return charStr;
	};

	// detectIncompleteChar determines if there is an incomplete UTF-8 character at
	// the end of the given buffer. If so, it sets this.charLength to the byte
	// length that character, and sets this.charReceived to the number of bytes
	// that are available for this character.
	StringDecoder.prototype.detectIncompleteChar = function(buffer) {
	  // determine how many bytes we have to check at the end of this buffer
	  var i = (buffer.length >= 3) ? 3 : buffer.length;

	  // Figure out if one of the last i bytes of our buffer announces an
	  // incomplete char.
	  for (; i > 0; i--) {
	    var c = buffer[buffer.length - i];

	    // See http://en.wikipedia.org/wiki/UTF-8#Description

	    // 110XXXXX
	    if (i == 1 && c >> 5 == 0x06) {
	      this.charLength = 2;
	      break;
	    }

	    // 1110XXXX
	    if (i <= 2 && c >> 4 == 0x0E) {
	      this.charLength = 3;
	      break;
	    }

	    // 11110XXX
	    if (i <= 3 && c >> 3 == 0x1E) {
	      this.charLength = 4;
	      break;
	    }
	  }
	  this.charReceived = i;
	};

	StringDecoder.prototype.end = function(buffer) {
	  var res = '';
	  if (buffer && buffer.length)
	    res = this.write(buffer);

	  if (this.charReceived) {
	    var cr = this.charReceived;
	    var buf = this.charBuffer;
	    var enc = this.encoding;
	    res += buf.slice(0, cr).toString(enc);
	  }

	  return res;
	};

	function passThroughWrite(buffer) {
	  return buffer.toString(this.encoding);
	}

	function utf16DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 2;
	  this.charLength = this.charReceived ? 2 : 0;
	}

	function base64DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 3;
	  this.charLength = this.charReceived ? 3 : 0;
	}


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// A bit simpler than readable streams.
	// Implement an async ._write(chunk, cb), and it'll handle all
	// the drain event emission and buffering.

	module.exports = Writable;

	/*<replacement>*/
	var Buffer = __webpack_require__(73).Buffer;
	/*</replacement>*/

	Writable.WritableState = WritableState;


	/*<replacement>*/
	var util = __webpack_require__(99);
	util.inherits = __webpack_require__(100);
	/*</replacement>*/


	var Stream = __webpack_require__(11);

	util.inherits(Writable, Stream);

	function WriteReq(chunk, encoding, cb) {
	  this.chunk = chunk;
	  this.encoding = encoding;
	  this.callback = cb;
	}

	function WritableState(options, stream) {
	  options = options || {};

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  var hwm = options.highWaterMark;
	  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;

	  // cast to ints.
	  this.highWaterMark = ~~this.highWaterMark;

	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, becuase any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function(er) {
	    onwrite(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;

	  this.buffer = [];

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;
	}

	function Writable(options) {
	  var Duplex = __webpack_require__(98);

	  // Writable ctor is applied to Duplexes, though they're not
	  // instanceof Writable, they're instanceof Readable.
	  if (!(this instanceof Writable) && !(this instanceof Duplex))
	    return new Writable(options);

	  this._writableState = new WritableState(options, this);

	  // legacy.
	  this.writable = true;

	  Stream.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function() {
	  this.emit('error', new Error('Cannot pipe. Not readable.'));
	};


	function writeAfterEnd(stream, state, cb) {
	  var er = new Error('write after end');
	  // TODO: defer error events consistently everywhere, not just the cb
	  stream.emit('error', er);
	  process.nextTick(function() {
	    cb(er);
	  });
	}

	// If we get something that is not a buffer, string, null, or undefined,
	// and we're not in objectMode, then that's an error.
	// Otherwise stream chunks are all considered to be of length=1, and the
	// watermarks determine how many objects to keep in the buffer, rather than
	// how many bytes or characters.
	function validChunk(stream, state, chunk, cb) {
	  var valid = true;
	  if (!Buffer.isBuffer(chunk) &&
	      'string' !== typeof chunk &&
	      chunk !== null &&
	      chunk !== undefined &&
	      !state.objectMode) {
	    var er = new TypeError('Invalid non-string/buffer chunk');
	    stream.emit('error', er);
	    process.nextTick(function() {
	      cb(er);
	    });
	    valid = false;
	  }
	  return valid;
	}

	Writable.prototype.write = function(chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;

	  if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (Buffer.isBuffer(chunk))
	    encoding = 'buffer';
	  else if (!encoding)
	    encoding = state.defaultEncoding;

	  if (typeof cb !== 'function')
	    cb = function() {};

	  if (state.ended)
	    writeAfterEnd(this, state, cb);
	  else if (validChunk(this, state, chunk, cb))
	    ret = writeOrBuffer(this, state, chunk, encoding, cb);

	  return ret;
	};

	function decodeChunk(state, chunk, encoding) {
	  if (!state.objectMode &&
	      state.decodeStrings !== false &&
	      typeof chunk === 'string') {
	    chunk = new Buffer(chunk, encoding);
	  }
	  return chunk;
	}

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, chunk, encoding, cb) {
	  chunk = decodeChunk(state, chunk, encoding);
	  if (Buffer.isBuffer(chunk))
	    encoding = 'buffer';
	  var len = state.objectMode ? 1 : chunk.length;

	  state.length += len;

	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret)
	    state.needDrain = true;

	  if (state.writing)
	    state.buffer.push(new WriteReq(chunk, encoding, cb));
	  else
	    doWrite(stream, state, len, chunk, encoding, cb);

	  return ret;
	}

	function doWrite(stream, state, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError(stream, state, sync, er, cb) {
	  if (sync)
	    process.nextTick(function() {
	      cb(er);
	    });
	  else
	    cb(er);

	  stream._writableState.errorEmitted = true;
	  stream.emit('error', er);
	}

	function onwriteStateUpdate(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;

	  onwriteStateUpdate(state);

	  if (er)
	    onwriteError(stream, state, sync, er, cb);
	  else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish(stream, state);

	    if (!finished && !state.bufferProcessing && state.buffer.length)
	      clearBuffer(stream, state);

	    if (sync) {
	      process.nextTick(function() {
	        afterWrite(stream, state, finished, cb);
	      });
	    } else {
	      afterWrite(stream, state, finished, cb);
	    }
	  }
	}

	function afterWrite(stream, state, finished, cb) {
	  if (!finished)
	    onwriteDrain(stream, state);
	  cb();
	  if (finished)
	    finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}


	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	  state.bufferProcessing = true;

	  for (var c = 0; c < state.buffer.length; c++) {
	    var entry = state.buffer[c];
	    var chunk = entry.chunk;
	    var encoding = entry.encoding;
	    var cb = entry.callback;
	    var len = state.objectMode ? 1 : chunk.length;

	    doWrite(stream, state, len, chunk, encoding, cb);

	    // if we didn't call the onwrite immediately, then
	    // it means that we need to wait until it does.
	    // also, that means that the chunk and cb are currently
	    // being processed, so move the buffer counter past them.
	    if (state.writing) {
	      c++;
	      break;
	    }
	  }

	  state.bufferProcessing = false;
	  if (c < state.buffer.length)
	    state.buffer = state.buffer.slice(c);
	  else
	    state.buffer.length = 0;
	}

	Writable.prototype._write = function(chunk, encoding, cb) {
	  cb(new Error('not implemented'));
	};

	Writable.prototype.end = function(chunk, encoding, cb) {
	  var state = this._writableState;

	  if (typeof chunk === 'function') {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (typeof chunk !== 'undefined' && chunk !== null)
	    this.write(chunk, encoding);

	  // ignore unnecessary end() calls.
	  if (!state.ending && !state.finished)
	    endWritable(this, state, cb);
	};


	function needFinish(stream, state) {
	  return (state.ending &&
	          state.length === 0 &&
	          !state.finished &&
	          !state.writing);
	}

	function finishMaybe(stream, state) {
	  var need = needFinish(stream, state);
	  if (need) {
	    state.finished = true;
	    stream.emit('finish');
	  }
	  return need;
	}

	function endWritable(stream, state, cb) {
	  state.ending = true;
	  finishMaybe(stream, state);
	  if (cb) {
	    if (state.finished)
	      process.nextTick(cb);
	    else
	      stream.once('finish', cb);
	  }
	  state.ended = true;
	}


/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(106);


/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	// Load modules

	var Stringify = __webpack_require__(107);
	var Parse = __webpack_require__(109);


	// Declare internals

	var internals = {};


	module.exports = {
	    stringify: Stringify,
	    parse: Parse
	};


/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	// Load modules

	var Utils = __webpack_require__(108);


	// Declare internals

	var internals = {
	    delimiter: '&',
	    indices: true
	};


	internals.stringify = function (obj, prefix, options) {

	    if (Utils.isBuffer(obj)) {
	        obj = obj.toString();
	    }
	    else if (obj instanceof Date) {
	        obj = obj.toISOString();
	    }
	    else if (obj === null) {
	        obj = '';
	    }

	    if (typeof obj === 'string' ||
	        typeof obj === 'number' ||
	        typeof obj === 'boolean') {

	        return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];
	    }

	    var values = [];

	    if (typeof obj === 'undefined') {
	        return values;
	    }

	    var objKeys = Object.keys(obj);
	    for (var i = 0, il = objKeys.length; i < il; ++i) {
	        var key = objKeys[i];
	        if (!options.indices &&
	            Array.isArray(obj)) {

	            values = values.concat(internals.stringify(obj[key], prefix, options));
	        }
	        else {
	            values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']', options));
	        }
	    }

	    return values;
	};


	module.exports = function (obj, options) {

	    options = options || {};
	    var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;
	    options.indices = typeof options.indices === 'boolean' ? options.indices : internals.indices;

	    var keys = [];

	    if (typeof obj !== 'object' ||
	        obj === null) {

	        return '';
	    }

	    var objKeys = Object.keys(obj);
	    for (var i = 0, il = objKeys.length; i < il; ++i) {
	        var key = objKeys[i];
	        keys = keys.concat(internals.stringify(obj[key], key, options));
	    }

	    return keys.join(delimiter);
	};


/***/ },
/* 108 */
/***/ function(module, exports) {

	// Load modules


	// Declare internals

	var internals = {};


	exports.arrayToObject = function (source) {

	    var obj = {};
	    for (var i = 0, il = source.length; i < il; ++i) {
	        if (typeof source[i] !== 'undefined') {

	            obj[i] = source[i];
	        }
	    }

	    return obj;
	};


	exports.merge = function (target, source) {

	    if (!source) {
	        return target;
	    }

	    if (typeof source !== 'object') {
	        if (Array.isArray(target)) {
	            target.push(source);
	        }
	        else {
	            target[source] = true;
	        }

	        return target;
	    }

	    if (typeof target !== 'object') {
	        target = [target].concat(source);
	        return target;
	    }

	    if (Array.isArray(target) &&
	        !Array.isArray(source)) {

	        target = exports.arrayToObject(target);
	    }

	    var keys = Object.keys(source);
	    for (var k = 0, kl = keys.length; k < kl; ++k) {
	        var key = keys[k];
	        var value = source[key];

	        if (!target[key]) {
	            target[key] = value;
	        }
	        else {
	            target[key] = exports.merge(target[key], value);
	        }
	    }

	    return target;
	};


	exports.decode = function (str) {

	    try {
	        return decodeURIComponent(str.replace(/\+/g, ' '));
	    } catch (e) {
	        return str;
	    }
	};


	exports.compact = function (obj, refs) {

	    if (typeof obj !== 'object' ||
	        obj === null) {

	        return obj;
	    }

	    refs = refs || [];
	    var lookup = refs.indexOf(obj);
	    if (lookup !== -1) {
	        return refs[lookup];
	    }

	    refs.push(obj);

	    if (Array.isArray(obj)) {
	        var compacted = [];

	        for (var i = 0, il = obj.length; i < il; ++i) {
	            if (typeof obj[i] !== 'undefined') {
	                compacted.push(obj[i]);
	            }
	        }

	        return compacted;
	    }

	    var keys = Object.keys(obj);
	    for (i = 0, il = keys.length; i < il; ++i) {
	        var key = keys[i];
	        obj[key] = exports.compact(obj[key], refs);
	    }

	    return obj;
	};


	exports.isRegExp = function (obj) {
	    return Object.prototype.toString.call(obj) === '[object RegExp]';
	};


	exports.isBuffer = function (obj) {

	    if (obj === null ||
	        typeof obj === 'undefined') {

	        return false;
	    }

	    return !!(obj.constructor &&
	        obj.constructor.isBuffer &&
	        obj.constructor.isBuffer(obj));
	};


/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	// Load modules

	var Utils = __webpack_require__(108);


	// Declare internals

	var internals = {
	    delimiter: '&',
	    depth: 5,
	    arrayLimit: 20,
	    parameterLimit: 1000
	};


	internals.parseValues = function (str, options) {

	    var obj = {};
	    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

	    for (var i = 0, il = parts.length; i < il; ++i) {
	        var part = parts[i];
	        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

	        if (pos === -1) {
	            obj[Utils.decode(part)] = '';
	        }
	        else {
	            var key = Utils.decode(part.slice(0, pos));
	            var val = Utils.decode(part.slice(pos + 1));

	            if (!obj.hasOwnProperty(key)) {
	                obj[key] = val;
	            }
	            else {
	                obj[key] = [].concat(obj[key]).concat(val);
	            }
	        }
	    }

	    return obj;
	};


	internals.parseObject = function (chain, val, options) {

	    if (!chain.length) {
	        return val;
	    }

	    var root = chain.shift();

	    var obj = {};
	    if (root === '[]') {
	        obj = [];
	        obj = obj.concat(internals.parseObject(chain, val, options));
	    }
	    else {
	        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
	        var index = parseInt(cleanRoot, 10);
	        var indexString = '' + index;
	        if (!isNaN(index) &&
	            root !== cleanRoot &&
	            indexString === cleanRoot &&
	            index >= 0 &&
	            index <= options.arrayLimit) {

	            obj = [];
	            obj[index] = internals.parseObject(chain, val, options);
	        }
	        else {
	            obj[cleanRoot] = internals.parseObject(chain, val, options);
	        }
	    }

	    return obj;
	};


	internals.parseKeys = function (key, val, options) {

	    if (!key) {
	        return;
	    }

	    // The regex chunks

	    var parent = /^([^\[\]]*)/;
	    var child = /(\[[^\[\]]*\])/g;

	    // Get the parent

	    var segment = parent.exec(key);

	    // Don't allow them to overwrite object prototype properties

	    if (Object.prototype.hasOwnProperty(segment[1])) {
	        return;
	    }

	    // Stash the parent if it exists

	    var keys = [];
	    if (segment[1]) {
	        keys.push(segment[1]);
	    }

	    // Loop through children appending to the array until we hit depth

	    var i = 0;
	    while ((segment = child.exec(key)) !== null && i < options.depth) {

	        ++i;
	        if (!Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g, ''))) {
	            keys.push(segment[1]);
	        }
	    }

	    // If there's a remainder, just add whatever is left

	    if (segment) {
	        keys.push('[' + key.slice(segment.index) + ']');
	    }

	    return internals.parseObject(keys, val, options);
	};


	module.exports = function (str, options) {

	    if (str === '' ||
	        str === null ||
	        typeof str === 'undefined') {

	        return {};
	    }

	    options = options || {};
	    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;
	    options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;
	    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;
	    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;

	    var tempObj = typeof str === 'string' ? internals.parseValues(str, options) : str;
	    var obj = {};

	    // Iterate over the keys and setup the new object

	    var keys = Object.keys(tempObj);
	    for (var i = 0, il = keys.length; i < il; ++i) {
	        var key = keys[i];
	        var newObj = internals.parseKeys(key, tempObj[key], options);
	        obj = Utils.merge(obj, newObj);
	    }

	    return Utils.compact(obj);
	};


/***/ },
/* 110 */
/***/ function(module, exports) {

	module.exports = {
		"_args": [
			[
				"superagent@1.8.3",
				"/Users/tarcio/dev/projects/pact-js/pact-interceptor"
			]
		],
		"_from": "superagent@1.8.3",
		"_id": "superagent@1.8.3",
		"_inCache": true,
		"_installable": true,
		"_location": "/superagent",
		"_nodeVersion": "5.6.0",
		"_npmOperationalInternal": {
			"host": "packages-12-west.internal.npmjs.com",
			"tmp": "tmp/superagent-1.8.3.tgz_1458840247188_0.5249448795802891"
		},
		"_npmUser": {
			"email": "pornel@pornel.net",
			"name": "kornel"
		},
		"_npmVersion": "3.7.5",
		"_phantomChildren": {},
		"_requested": {
			"name": "superagent",
			"raw": "superagent@1.8.3",
			"rawSpec": "1.8.3",
			"scope": null,
			"spec": "1.8.3",
			"type": "version"
		},
		"_requiredBy": [
			"/"
		],
		"_resolved": "http://registry.npmjs.org/superagent/-/superagent-1.8.3.tgz",
		"_shasum": "2b7d70fcc870eda4f2a61e619dd54009b86547c3",
		"_shrinkwrap": null,
		"_spec": "superagent@1.8.3",
		"_where": "/Users/tarcio/dev/projects/pact-js/pact-interceptor",
		"author": {
			"email": "tj@vision-media.ca",
			"name": "TJ Holowaychuk"
		},
		"browser": {
			"./lib/node/index.js": "./lib/client.js",
			"./test/support/server.js": "./test/support/blank.js",
			"emitter": "component-emitter",
			"reduce": "reduce-component"
		},
		"bugs": {
			"url": "https://github.com/visionmedia/superagent/issues"
		},
		"component": {
			"scripts": {
				"superagent": "lib/client.js"
			}
		},
		"contributors": [
			{
				"email": "kornel@geekhood.net",
				"name": "Kornel Lesiński"
			},
			{
				"email": "pete@peterlyons.com",
				"name": "Peter Lyons"
			},
			{
				"email": "hunter@hunterloftis.com",
				"name": "Hunter Loftis"
			}
		],
		"dependencies": {
			"component-emitter": "~1.2.0",
			"cookiejar": "2.0.6",
			"debug": "2",
			"extend": "3.0.0",
			"form-data": "1.0.0-rc3",
			"formidable": "~1.0.14",
			"methods": "~1.1.1",
			"mime": "1.3.4",
			"qs": "2.3.3",
			"readable-stream": "1.0.27-1",
			"reduce-component": "1.0.1"
		},
		"description": "elegant & feature rich browser / node HTTP with a fluent API",
		"devDependencies": {
			"Base64": "~0.3.0",
			"basic-auth-connect": "~1.0.0",
			"better-assert": "~1.0.1",
			"body-parser": "~1.9.2",
			"browserify": "~6.3.2",
			"cookie-parser": "~1.3.3",
			"express": "~4.9.8",
			"express-session": "~1.9.1",
			"marked": "0.3.5",
			"mocha": "~2.0.1",
			"should": "~3.1.3",
			"zuul": "~1.19.0"
		},
		"directories": {},
		"dist": {
			"shasum": "2b7d70fcc870eda4f2a61e619dd54009b86547c3",
			"tarball": "https://registry.npmjs.org/superagent/-/superagent-1.8.3.tgz"
		},
		"engines": {
			"node": ">= 0.8"
		},
		"gitHead": "4d986d7f0c1efd8d0690c95a9276a6c818b758f7",
		"homepage": "https://github.com/visionmedia/superagent#readme",
		"keywords": [
			"http",
			"ajax",
			"request",
			"agent"
		],
		"license": "MIT",
		"main": "./lib/node/index.js",
		"maintainers": [
			{
				"email": "shtylman@gmail.com",
				"name": "defunctzombie"
			},
			{
				"email": "oleg008@gmail.com",
				"name": "kof"
			},
			{
				"email": "pornel@pornel.net",
				"name": "kornel"
			},
			{
				"email": "naman34@gmail.com",
				"name": "naman34"
			},
			{
				"email": "nw@nwhite.net",
				"name": "nw"
			},
			{
				"email": "rauchg@gmail.com",
				"name": "rauchg"
			},
			{
				"email": "superjoe30@gmail.com",
				"name": "superjoe"
			},
			{
				"email": "tj@vision-media.ca",
				"name": "tjholowaychuk"
			},
			{
				"email": "tj@travisjeffery.com",
				"name": "travisjeffery"
			},
			{
				"email": "yields@icloud.com",
				"name": "yields"
			}
		],
		"name": "superagent",
		"optionalDependencies": {},
		"readme": "ERROR: No README data found!",
		"repository": {
			"type": "git",
			"url": "git://github.com/visionmedia/superagent.git"
		},
		"scripts": {
			"prepublish": "make all",
			"test": "make test"
		},
		"version": "1.8.3"
	};

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module of mixed-in functions shared between node and client code
	 */
	var isObject = __webpack_require__(112);

	/**
	 * Clear previous timeout.
	 *
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.clearTimeout = function _clearTimeout(){
	  this._timeout = 0;
	  clearTimeout(this._timer);
	  return this;
	};

	/**
	 * Force given parser
	 *
	 * Sets the body parser no matter type.
	 *
	 * @param {Function}
	 * @api public
	 */

	exports.parse = function parse(fn){
	  this._parser = fn;
	  return this;
	};

	/**
	 * Set timeout to `ms`.
	 *
	 * @param {Number} ms
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.timeout = function timeout(ms){
	  this._timeout = ms;
	  return this;
	};

	/**
	 * Faux promise support
	 *
	 * @param {Function} fulfill
	 * @param {Function} reject
	 * @return {Request}
	 */

	exports.then = function then(fulfill, reject) {
	  return this.end(function(err, res) {
	    err ? reject(err) : fulfill(res);
	  });
	}

	/**
	 * Allow for extension
	 */

	exports.use = function use(fn) {
	  fn(this);
	  return this;
	}


	/**
	 * Get request header `field`.
	 * Case-insensitive.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	exports.get = function(field){
	  return this._header[field.toLowerCase()];
	};

	/**
	 * Get case-insensitive header `field` value.
	 * This is a deprecated internal API. Use `.get(field)` instead.
	 *
	 * (getHeader is no longer used internally by the superagent code base)
	 *
	 * @param {String} field
	 * @return {String}
	 * @api private
	 * @deprecated
	 */

	exports.getHeader = exports.get;

	/**
	 * Set header `field` to `val`, or multiple fields with one object.
	 * Case-insensitive.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .set('Accept', 'application/json')
	 *        .set('X-API-Key', 'foobar')
	 *        .end(callback);
	 *
	 *      req.get('/')
	 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
	 *        .end(callback);
	 *
	 * @param {String|Object} field
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.set = function(field, val){
	  if (isObject(field)) {
	    for (var key in field) {
	      this.set(key, field[key]);
	    }
	    return this;
	  }
	  this._header[field.toLowerCase()] = val;
	  this.header[field] = val;
	  return this;
	};

	/**
	 * Remove header `field`.
	 * Case-insensitive.
	 *
	 * Example:
	 *
	 *      req.get('/')
	 *        .unset('User-Agent')
	 *        .end(callback);
	 *
	 * @param {String} field
	 */
	exports.unset = function(field){
	  delete this._header[field.toLowerCase()];
	  delete this.header[field];
	  return this;
	};

	/**
	 * Write the field `name` and `val` for "multipart/form-data"
	 * request bodies.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .field('foo', 'bar')
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} name
	 * @param {String|Blob|File|Buffer|fs.ReadStream} val
	 * @return {Request} for chaining
	 * @api public
	 */
	exports.field = function(name, val) {
	  this._getFormData().append(name, val);
	  return this;
	};


/***/ },
/* 112 */
/***/ function(module, exports) {

	/**
	 * Check if `obj` is an object.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */

	function isObject(obj) {
	  return null != obj && 'object' == typeof obj;
	}

	module.exports = isObject;


/***/ },
/* 113 */
/***/ function(module, exports) {

	// The node and browser modules expose versions of this with the
	// appropriate constructor function bound as first argument
	/**
	 * Issue a request:
	 *
	 * Examples:
	 *
	 *    request('GET', '/users').end(callback)
	 *    request('/users').end(callback)
	 *    request('/users', callback)
	 *
	 * @param {String} method
	 * @param {String|Function} url or callback
	 * @return {Request}
	 * @api public
	 */

	function request(RequestConstructor, method, url) {
	  // callback
	  if ('function' == typeof url) {
	    return new RequestConstructor('GET', method).end(url);
	  }

	  // url first
	  if (2 == arguments.length) {
	    return new RequestConstructor('GET', method);
	  }

	  return new RequestConstructor(method, url);
	}

	module.exports = request;


/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var CookieJar = __webpack_require__(115).CookieJar;
	var CookieAccess = __webpack_require__(115).CookieAccessInfo;
	var parse = __webpack_require__(13).parse;
	var request = __webpack_require__(60);
	var methods = __webpack_require__(90);

	/**
	 * Expose `Agent`.
	 */

	module.exports = Agent;

	/**
	 * Initialize a new `Agent`.
	 *
	 * @api public
	 */

	function Agent(options) {
	  if (!(this instanceof Agent)) return new Agent(options);
	  if (options) this._ca = options.ca;
	  this.jar = new CookieJar;
	}

	/**
	 * Save the cookies in the given `res` to
	 * the agent's cookie jar for persistence.
	 *
	 * @param {Response} res
	 * @api private
	 */

	Agent.prototype.saveCookies = function(res){
	  var cookies = res.headers['set-cookie'];
	  if (cookies) this.jar.setCookies(cookies);
	};

	/**
	 * Attach cookies when available to the given `req`.
	 *
	 * @param {Request} req
	 * @api private
	 */

	Agent.prototype.attachCookies = function(req){
	  var url = parse(req.url);
	  var access = CookieAccess(url.hostname, url.pathname, 'https:' == url.protocol);
	  var cookies = this.jar.getCookies(access).toValueString();
	  req.cookies = cookies;
	};

	// generate HTTP verb methods
	if (methods.indexOf('del') == -1) {
	  // create a copy so we don't cause conflicts with
	  // other packages using the methods package and
	  // npm 3.x
	  methods = methods.slice(0);
	  methods.push('del');
	}
	methods.forEach(function(method){
	  var name = method;
	  method = 'del' == method ? 'delete' : method;

	  method = method.toUpperCase();
	  Agent.prototype[name] = function(url, fn){
	    var req = request(method, url);
	    req.ca(this._ca);

	    req.on('response', this.saveCookies.bind(this));
	    req.on('redirect', this.saveCookies.bind(this));
	    req.on('redirect', this.attachCookies.bind(this, req));
	    this.attachCookies(req);

	    fn && req.end(fn);
	    return req;
	  };
	});


/***/ },
/* 115 */
/***/ function(module, exports) {

	/* jshint node: true */
	(function () {
	    "use strict";

	    function CookieAccessInfo(domain, path, secure, script) {
	        if (this instanceof CookieAccessInfo) {
	            this.domain = domain || undefined;
	            this.path = path || "/";
	            this.secure = !!secure;
	            this.script = !!script;
	            return this;
	        }
	        return new CookieAccessInfo(domain, path, secure, script);
	    }
	    exports.CookieAccessInfo = CookieAccessInfo;

	    function Cookie(cookiestr, request_domain, request_path) {
	        if (cookiestr instanceof Cookie) {
	            return cookiestr;
	        }
	        if (this instanceof Cookie) {
	            this.name = null;
	            this.value = null;
	            this.expiration_date = Infinity;
	            this.path = String(request_path || "/");
	            this.explicit_path = false;
	            this.domain = request_domain || null;
	            this.explicit_domain = false;
	            this.secure = false; //how to define default?
	            this.noscript = false; //httponly
	            if (cookiestr) {
	                this.parse(cookiestr, request_domain, request_path);
	            }
	            return this;
	        }
	        return new Cookie(cookiestr, request_domain, request_path);
	    }
	    exports.Cookie = Cookie;

	    Cookie.prototype.toString = function toString() {
	        var str = [this.name + "=" + this.value];
	        if (this.expiration_date !== Infinity) {
	            str.push("expires=" + (new Date(this.expiration_date)).toGMTString());
	        }
	        if (this.domain) {
	            str.push("domain=" + this.domain);
	        }
	        if (this.path) {
	            str.push("path=" + this.path);
	        }
	        if (this.secure) {
	            str.push("secure");
	        }
	        if (this.noscript) {
	            str.push("httponly");
	        }
	        return str.join("; ");
	    };

	    Cookie.prototype.toValueString = function toValueString() {
	        return this.name + "=" + this.value;
	    };

	    var cookie_str_splitter = /[:](?=\s*[a-zA-Z0-9_\-]+\s*[=])/g;
	    Cookie.prototype.parse = function parse(str, request_domain, request_path) {
	        if (this instanceof Cookie) {
	            var parts = str.split(";").filter(function (value) {
	                    return !!value;
	                }),
	                pair = parts[0].match(/([^=]+)=([\s\S]*)/),
	                key = pair[1],
	                value = pair[2],
	                i;
	            this.name = key;
	            this.value = value;

	            for (i = 1; i < parts.length; i += 1) {
	                pair = parts[i].match(/([^=]+)(?:=([\s\S]*))?/);
	                key = pair[1].trim().toLowerCase();
	                value = pair[2];
	                switch (key) {
	                case "httponly":
	                    this.noscript = true;
	                    break;
	                case "expires":
	                    this.expiration_date = value ?
	                            Number(Date.parse(value)) :
	                            Infinity;
	                    break;
	                case "path":
	                    this.path = value ?
	                            value.trim() :
	                            "";
	                    this.explicit_path = true;
	                    break;
	                case "domain":
	                    this.domain = value ?
	                            value.trim() :
	                            "";
	                    this.explicit_domain = !!this.domain;
	                    break;
	                case "secure":
	                    this.secure = true;
	                    break;
	                }
	            }

	            if (!this.explicit_path) {
	               this.path = request_path || "/";
	            }
	            if (!this.explicit_domain) {
	               this.domain = request_domain;
	            }

	            return this;
	        }
	        return new Cookie().parse(str, request_domain, request_path);
	    };

	    Cookie.prototype.matches = function matches(access_info) {
	        if (this.noscript && access_info.script ||
	                this.secure && !access_info.secure ||
	                !this.collidesWith(access_info)) {
	            return false;
	        }
	        return true;
	    };

	    Cookie.prototype.collidesWith = function collidesWith(access_info) {
	        if ((this.path && !access_info.path) || (this.domain && !access_info.domain)) {
	            return false;
	        }
	        if (this.path && access_info.path.indexOf(this.path) !== 0) {
	            return false;
	        }
	        if (this.explicit_path && access_info.path.indexOf( this.path ) !== 0) {
	           return false;
	        }
	        var access_domain = access_info.domain && access_info.domain.replace(/^[\.]/,'');
	        var cookie_domain = this.domain && this.domain.replace(/^[\.]/,'');
	        if (cookie_domain === access_domain) {
	            return true;
	        }
	        if (cookie_domain) {
	            if (!this.explicit_domain) {
	                return false; // we already checked if the domains were exactly the same
	            }
	            var wildcard = access_domain.indexOf(cookie_domain);
	            if (wildcard === -1 || wildcard !== access_domain.length - cookie_domain.length) {
	                return false;
	            }
	            return true;
	        }
	        return true;
	    };

	    function CookieJar() {
	        var cookies, cookies_list, collidable_cookie;
	        if (this instanceof CookieJar) {
	            cookies = Object.create(null); //name: [Cookie]

	            this.setCookie = function setCookie(cookie, request_domain, request_path) {
	                var remove, i;
	                cookie = new Cookie(cookie, request_domain, request_path);
	                //Delete the cookie if the set is past the current time
	                remove = cookie.expiration_date <= Date.now();
	                if (cookies[cookie.name] !== undefined) {
	                    cookies_list = cookies[cookie.name];
	                    for (i = 0; i < cookies_list.length; i += 1) {
	                        collidable_cookie = cookies_list[i];
	                        if (collidable_cookie.collidesWith(cookie)) {
	                            if (remove) {
	                                cookies_list.splice(i, 1);
	                                if (cookies_list.length === 0) {
	                                    delete cookies[cookie.name];
	                                }
	                                return false;
	                            }
	                            cookies_list[i] = cookie;
	                            return cookie;
	                        }
	                    }
	                    if (remove) {
	                        return false;
	                    }
	                    cookies_list.push(cookie);
	                    return cookie;
	                }
	                if (remove) {
	                    return false;
	                }
	                cookies[cookie.name] = [cookie];
	                return cookies[cookie.name];
	            };
	            //returns a cookie
	            this.getCookie = function getCookie(cookie_name, access_info) {
	                var cookie, i;
	                cookies_list = cookies[cookie_name];
	                if (!cookies_list) {
	                    return;
	                }
	                for (i = 0; i < cookies_list.length; i += 1) {
	                    cookie = cookies_list[i];
	                    if (cookie.expiration_date <= Date.now()) {
	                        if (cookies_list.length === 0) {
	                            delete cookies[cookie.name];
	                        }
	                        continue;
	                    }

	                    if (cookie.matches(access_info)) {
	                        return cookie;
	                    }
	                }
	            };
	            //returns a list of cookies
	            this.getCookies = function getCookies(access_info) {
	                var matches = [], cookie_name, cookie;
	                for (cookie_name in cookies) {
	                    cookie = this.getCookie(cookie_name, access_info);
	                    if (cookie) {
	                        matches.push(cookie);
	                    }
	                }
	                matches.toString = function toString() {
	                    return matches.join(":");
	                };
	                matches.toValueString = function toValueString() {
	                    return matches.map(function (c) {
	                        return c.toValueString();
	                    }).join(';');
	                };
	                return matches;
	            };

	            return this;
	        }
	        return new CookieJar();
	    }
	    exports.CookieJar = CookieJar;

	    //returns list of cookies that were set correctly. Cookies that are expired and removed are not returned.
	    CookieJar.prototype.setCookies = function setCookies(cookies, request_domain, request_path) {
	        cookies = Array.isArray(cookies) ?
	                cookies :
	                cookies.split(cookie_str_splitter);
	        var successful = [],
	            i,
	            cookie;
	        cookies = cookies.map(function(item){
	            return new Cookie(item, request_domain, request_path);
	        });
	        for (i = 0; i < cookies.length; i += 1) {
	            cookie = cookies[i];
	            if (this.setCookie(cookie, request_domain, request_path)) {
	                successful.push(cookie);
	            }
	        }
	        return successful;
	    };
	}());


/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	
	exports['application/x-www-form-urlencoded'] = __webpack_require__(117);
	exports['application/json'] = __webpack_require__(118);
	exports.text = __webpack_require__(119);
	exports.image = __webpack_require__(120);


/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var qs = __webpack_require__(105);

	module.exports = function(res, fn){
	  res.text = '';
	  res.setEncoding('ascii');
	  res.on('data', function(chunk){ res.text += chunk; });
	  res.on('end', function(){
	    try {
	      fn(null, qs.parse(res.text));
	    } catch (err) {
	      fn(err);
	    }
	  });
	};

/***/ },
/* 118 */
/***/ function(module, exports) {

	
	module.exports = function parseJSON(res, fn){
	  res.text = '';
	  res.setEncoding('utf8');
	  res.on('data', function(chunk){ res.text += chunk;});
	  res.on('end', function(){
	    try {
	      var body = res.text && JSON.parse(res.text);
	    } catch (e) {
	      var err = e;
	      // issue #675: return the raw response if the response parsing fails
	      err.rawResponse = res.text || null;
	      // issue #876: return the http status code if the response parsing fails
	      err.statusCode = res.statusCode;
	    } finally {
	      fn(err, body);
	    }
	  });
	};


/***/ },
/* 119 */
/***/ function(module, exports) {

	
	module.exports = function(res, fn){
	  res.text = '';
	  res.setEncoding('utf8');
	  res.on('data', function(chunk){ res.text += chunk; });
	  res.on('end', fn);
	};

/***/ },
/* 120 */
/***/ function(module, exports) {

	module.exports = function(res, fn){
	  var data = []; // Binary data needs binary storage

	  res.on('data', function(chunk){
	      data.push(chunk);
	  });
	  res.on('end', function () {
	      fn(null, Buffer.concat(data));
	  });
	};

/***/ },
/* 121 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var SHOULD_LOG = process.env.LOGGING ? process.env.LOGGING : 'false';

	var logger = exports.logger = {
	  info: function info(msg) {
	    if (SHOULD_LOG === 'true') {
	      console.log(msg);
	    }
	  }
	};

/***/ }
/******/ ]);