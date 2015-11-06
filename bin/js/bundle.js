(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Init style shamelessly stolen from jQuery http://jquery.com
'use strict';

var Froogaloop = (function () {
    // Define a local copy of Froogaloop
    function Froogaloop(iframe) {
        // The Froogaloop object is actually just the init constructor
        return new Froogaloop.fn.init(iframe);
    }

    var eventCallbacks = {},
        hasWindowEvent = false,
        isReady = false,
        slice = Array.prototype.slice,
        playerDomain = '';

    Froogaloop.fn = Froogaloop.prototype = {
        element: null,

        init: function init(iframe) {
            if (typeof iframe === "string") {
                iframe = document.getElementById(iframe);
            }

            this.element = iframe;

            // Register message event listeners
            playerDomain = getDomainFromUrl(this.element.getAttribute('src'));

            return this;
        },

        /*
         * Calls a function to act upon the player.
         *
         * @param {string} method The name of the Javascript API method to call. Eg: 'play'.
         * @param {Array|Function} valueOrCallback params Array of parameters to pass when calling an API method
         *                                or callback function when the method returns a value.
         */
        api: function api(method, valueOrCallback) {
            if (!this.element || !method) {
                return false;
            }

            var self = this,
                element = self.element,
                target_id = element.id !== '' ? element.id : null,
                params = !isFunction(valueOrCallback) ? valueOrCallback : null,
                callback = isFunction(valueOrCallback) ? valueOrCallback : null;

            // Store the callback for get functions
            if (callback) {
                storeCallback(method, callback, target_id);
            }

            postMessage(method, params, element);
            return self;
        },

        /*
         * Registers an event listener and a callback function that gets called when the event fires.
         *
         * @param eventName (String): Name of the event to listen for.
         * @param callback (Function): Function that should be called when the event fires.
         */
        addEvent: function addEvent(eventName, callback) {
            if (!this.element) {
                return false;
            }

            var self = this,
                element = self.element,
                target_id = element.id !== '' ? element.id : null;

            storeCallback(eventName, callback, target_id);

            // The ready event is not registered via postMessage. It fires regardless.
            if (eventName != 'ready') {
                postMessage('addEventListener', eventName, element);
            } else if (eventName == 'ready' && isReady) {
                callback.call(null, target_id);
            }

            return self;
        },

        /*
         * Unregisters an event listener that gets called when the event fires.
         *
         * @param eventName (String): Name of the event to stop listening for.
         */
        removeEvent: function removeEvent(eventName) {
            if (!this.element) {
                return false;
            }

            var self = this,
                element = self.element,
                target_id = element.id !== '' ? element.id : null,
                removed = removeCallback(eventName, target_id);

            // The ready event is not registered
            if (eventName != 'ready' && removed) {
                postMessage('removeEventListener', eventName, element);
            }
        }
    };

    /**
     * Handles posting a message to the parent window.
     *
     * @param method (String): name of the method to call inside the player. For api calls
     * this is the name of the api method (api_play or api_pause) while for events this method
     * is api_addEventListener.
     * @param params (Object or Array): List of parameters to submit to the method. Can be either
     * a single param or an array list of parameters.
     * @param target (HTMLElement): Target iframe to post the message to.
     */
    function postMessage(method, params, target) {
        if (!target.contentWindow.postMessage) {
            return false;
        }

        var url = target.getAttribute('src').split('?')[0],
            data = JSON.stringify({
            method: method,
            value: params
        });

        if (url.substr(0, 2) === '//') {
            url = window.location.protocol + url;
        }

        target.contentWindow.postMessage(data, url);
    }

    /**
     * Event that fires whenever the window receives a message from its parent
     * via window.postMessage.
     */
    function onMessageReceived(event) {
        var data, method;

        try {
            data = JSON.parse(event.data);
            method = data.event || data.method;
        } catch (e) {
            //fail silently... like a ninja!
        }

        if (method == 'ready' && !isReady) {
            isReady = true;
        }

        // Handles messages from moogaloop only
        if (event.origin != playerDomain) {
            return false;
        }

        var value = data.value,
            eventData = data.data,
            target_id = target_id === '' ? null : data.player_id,
            callback = getCallback(method, target_id),
            params = [];

        if (!callback) {
            return false;
        }

        if (value !== undefined) {
            params.push(value);
        }

        if (eventData) {
            params.push(eventData);
        }

        if (target_id) {
            params.push(target_id);
        }

        return params.length > 0 ? callback.apply(null, params) : callback.call();
    }

    /**
     * Stores submitted callbacks for each iframe being tracked and each
     * event for that iframe.
     *
     * @param eventName (String): Name of the event. Eg. api_onPlay
     * @param callback (Function): Function that should get executed when the
     * event is fired.
     * @param target_id (String) [Optional]: If handling more than one iframe then
     * it stores the different callbacks for different iframes based on the iframe's
     * id.
     */
    function storeCallback(eventName, callback, target_id) {
        if (target_id) {
            if (!eventCallbacks[target_id]) {
                eventCallbacks[target_id] = {};
            }
            eventCallbacks[target_id][eventName] = callback;
        } else {
            eventCallbacks[eventName] = callback;
        }
    }

    /**
     * Retrieves stored callbacks.
     */
    function getCallback(eventName, target_id) {
        if (target_id) {
            return eventCallbacks[target_id][eventName];
        } else {
            return eventCallbacks[eventName];
        }
    }

    function removeCallback(eventName, target_id) {
        if (target_id && eventCallbacks[target_id]) {
            if (!eventCallbacks[target_id][eventName]) {
                return false;
            }
            eventCallbacks[target_id][eventName] = null;
        } else {
            if (!eventCallbacks[eventName]) {
                return false;
            }
            eventCallbacks[eventName] = null;
        }

        return true;
    }

    /**
     * Returns a domain's root domain.
     * Eg. returns http://vimeo.com when http://vimeo.com/channels is sbumitted
     *
     * @param url (String): Url to test against.
     * @return url (String): Root domain of submitted url
     */
    function getDomainFromUrl(url) {
        if (url.substr(0, 2) === '//') {
            url = window.location.protocol + url;
        }

        var url_pieces = url.split('/'),
            domain_str = '';

        for (var i = 0, length = url_pieces.length; i < length; i++) {
            if (i < 3) {
                domain_str += url_pieces[i];
            } else {
                break;
            }
            if (i < 2) {
                domain_str += '/';
            }
        }

        return domain_str;
    }

    function isFunction(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    }

    function isArray(obj) {
        return toString.call(obj) === '[object Array]';
    }

    // Give the init function the Froogaloop prototype for later instantiation
    Froogaloop.fn.init.prototype = Froogaloop.fn;

    // Listens for the message event.
    // W3C
    if (window.addEventListener) {
        window.addEventListener('message', onMessageReceived, false);
    }
    // IE
    else {
            window.attachEvent('onmessage', onMessageReceived);
        }

    // Expose froogaloop to the global object
    return window.Froogaloop = window.$f = Froogaloop;
})();

},{}],2:[function(require,module,exports){
'use strict';

// require('vimeo-froogaloop');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _vimeoFroogaloop = require('vimeo-froogaloop');

var _vimeoFroogaloop2 = _interopRequireDefault(_vimeoFroogaloop);

var _videoitem = require('./videoitem');

var _videoitem2 = _interopRequireDefault(_videoitem);

var _preloader = require('./preloader');

var _preloader2 = _interopRequireDefault(_preloader);

var _overlay = require('./overlay');

var _overlay2 = _interopRequireDefault(_overlay);

var preloader = new _preloader2['default']('preloader', 'status', init);
var videoRight = new _videoitem2['default']('video-wrapper-right', preloader);
var videoLeft = new _videoitem2['default']('video-wrapper-left', preloader);
var overlay = new _overlay2['default']('overlay', 'message');
var container = document.getElementById('container');

var isDown = false;
var syncing = false;
var hasStarted = false;
var pointerOffset = 0;

function init() {
	moveTo(50);
	document.getElementById('container').className = "fadein";
}

function play() {
	videoLeft.play();
	videoRight.play();
	overlay.hideMessage();
	hasStarted = true;
}

setInterval(function () {
	videoLeft.update();
	videoRight.update();
	console.log(videoLeft.state, "|", videoRight.state);
}, 250);

function syncVideos() {
	var targetTime = Math.min(videoLeft.elapsed, videoRight.elapsed);

	// videoLeft.setTime(targetTime);
	// videoRight.setTime(targetTime);
	// syncing = false;
}

function moveTo(percent) {
	videoLeft.setWidth(percent + "%");
	overlay.setPosition(percent);

	videoLeft.setVolume(percent + pointerOffset);
	videoRight.setVolume(100 - percent + pointerOffset);
}

overlay.element.addEventListener('mousedown', function (event) {
	isDown = true;
	// This is used to move the overlay keeping the offset mouse position and preventing a quick jump when mousemove event is fired.
	pointerOffset = 100 * event.pageX / window.innerWidth - overlay.position;
	if (!hasStarted) play();
});

overlay.element.addEventListener('mouseup', function () {
	isDown = false;
});

function onmousemove(event) {
	if (isDown) {
		var percent = 100 * event.pageX / window.innerWidth;
		moveTo(percent - pointerOffset);
	}
}
container.addEventListener('mousemove', onmousemove);

},{"./overlay":3,"./preloader":4,"./videoitem":6,"vimeo-froogaloop":1}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Overlay = (function () {
	/*
  * @param {String} ID of div where overlay elements are
  * @param {String} ID of div where all messages are gona be
  */

	function Overlay(overlayID, messageID) {
		_classCallCheck(this, Overlay);

		this.element = document.getElementById(overlayID);
		this.message = document.getElementById(messageID);
		this.position = 0;
	}

	/*
  * @param {Number} Percent where split indicator must be
  */

	_createClass(Overlay, [{
		key: 'setPosition',
		value: function setPosition(value) {
			this.position = value;
			this.element.style.left = value + "%";
		}

		/*
   *  This method just hides the message div
   */
	}, {
		key: 'hideMessage',
		value: function hideMessage() {
			this.message.className = 'fadeout';
		}

		/*
   * This methods just shows previous hidded message div
   */
	}, {
		key: 'showMessage',
		value: function showMessage() {
			this.message.className = '';
		}

		/*
   * @param {String} Message to show on message div
   */
	}, {
		key: 'setMessage',
		value: function setMessage(msg) {
			this.message.innerHTML = msg;
		}
	}]);

	return Overlay;
})();

exports['default'] = Overlay;
module.exports = exports['default'];

},{}],4:[function(require,module,exports){
'use strict';

'user strict';

// Private properties
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var video1 = Symbol();
var video2 = Symbol();

var Preloader = (function () {
	/*
     * @param id {String} ID of div element that wraps all preloader elements
     * @param infoID {String} ID of div where percentage info will be shown
     * @param startCallback {Function} Function to call when everything is ready to play
  */

	function Preloader(id, infoID, startCallback) {
		_classCallCheck(this, Preloader);

		this.element = document.getElementById(id);
		this.status = document.getElementById(infoID);
		this.callback = startCallback;

		this['video1'] = 0;
		this['video2'] = 0;
	}

	/*
  * Method that hides the whole preloader
  */

	_createClass(Preloader, [{
		key: 'fadeout',
		value: function fadeout() {
			this.element.className = "fadeout";
		}

		/*
   * Method that updates loading progress percentage. Percentage is divided by 2 because there's 2 videos.
   * NOTE: Because it's based on Vimeo's buffer (this value changes for each video) it's not precise, hence the forced 100% value... Sorry about that.
   * @param percent {Number} Value that represents percent of buffered against max buffer value (See note above)
   * @param target {String} ID of video item calling this method.
   */
	}, {
		key: 'setProgress',
		value: function setProgress(percent, target) {
			this[target] = percent;
			var value = Math.floor((this['video1'] + this['video2']) * 0.5);
			this.status.innerHTML = value + "%";

			if (value >= 100) {
				this.callback();
				this.fadeout();
				this.status.innerHTML = 100 + "%";
			}
		}
	}]);

	return Preloader;
})();

exports['default'] = Preloader;
module.exports = exports['default'];

},{}],5:[function(require,module,exports){
'use strict';

function limitNormalizedValue(value) {
	if (value < 0) {
		value = 0;
	} else if (value > 1) {
		value = 1;
	}
	return value;
}

module.exports = {
	limitNormalizedValue: limitNormalizedValue
};

// export default class Utils
// {
// 	constructor(){}
// 	static limitNormalizedValue(value)
// 	{
// 		if (value < 0){
// 			value = 0;
// 		} else if(value > 1){
// 			value = 1;
// 		}
// 		return value;
// 	}

// 	static testFunc()
// 	{
// 		console.log("testFunc");
// 	}
// }

// module.exports = Utils;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var BUFFER_PRELOAD_THRESHOLD = 0.075; // Vimeo's doesn't haves a way to know how much buffer is needed to start the reproduction. Hence the force values. Keep in mind this value is different for each video.
var limitNormalizedValue = require('./utils').limitNormalizedValue;
var lastElapsedTime = 0;

var STATE = {
	'BUFFERING': 'buffering',
	'PAUSED': 'paused',
	'STOPPED': 'stopped',
	'PLAYING': 'playing'
};

var VideoItem = (function () {
	/*
  * @param id {String} ID of div element that holds Vimeo's iframe
  * @param preloader {Class} Preloader class to handle video loading process
  */

	function VideoItem(id, preloader) {
		_classCallCheck(this, VideoItem);

		this.wrapper = document.getElementById(id);
		this.id = this.wrapper.getAttribute("data-id");
		this.iframe = this.wrapper.getElementsByTagName('iframe')[0];
		this.player = $f(this.iframe);
		this.player.addEvent('ready', _onReady.bind(this));
		this.isReady = false;
		this.state = STATE.STOPPED;
		this.elapsed = 0;

		// This is called when vimeo player is ready
		function _onReady(item) {
			this.player.removeEvent('ready');
			this.player.api('setLoop', true);
			this.preload(preloader);
			this.player.addEvent('playProgress', _onPlayback.bind(this));
		}

		function _onPlayback(e) {
			this.elapsed = e.seconds;
		}
	}

	/*
  * A simple method to call play to Vimeo's player
  */

	_createClass(VideoItem, [{
		key: 'play',
		value: function play() {
			this.player.api('play');
			this.state = STATE.PLAYING;
		}

		/*
   * Method to update the video state check. 
   */
	}, {
		key: 'update',
		value: function update() {
			if (this.elapsed - lastElapsedTime !== 0) this.state = STATE.PLAYING;else if (this.state === STATE.PLAYING) {
				this.state = STATE.BUFFERING;
			}

			// console.log(this.id,this.elapsed - lastElapsedTime, this.state);
			lastElapsedTime = this.elapsed;
		}

		/*
   * @param value {Number} Volume value for video normalized (from 0 to 1)
   */
	}, {
		key: 'setVolume',
		value: function setVolume(value) {
			this.player.api('setVolume', limitNormalizedValue(value / 100));
		}

		/*
   * @param value {String} Method to set the iframe width value. Value must be suplied with units in a String format (for instance "40px" pr "40%")
   */
	}, {
		key: 'setWidth',
		value: function setWidth(value) {
			this.wrapper.style.width = value;
		}

		/*
   * @param preloader {Class} Method to force Vimeo's videos to buffer before activate user interaction. This is to start videos in sync as much as possible
   */
	}, {
		key: 'preload',
		value: function preload(preloader) {
			// This forces players to start buffering
			function _onPlayProgress() {
				this.player.api('pause');
				this.player.api('seekTo', 0);
				this.player.removeEvent('play');
			}
			this.player.addEvent('play', _onPlayProgress.bind(this));
			this.player.api('play');

			// This hold preloader 'til videos have enough loaded buffer to play in sync
			function _onBufferFinish() {
				this.isReady = true;
			}

			function _onBufferProgress(e) {
				var percent = e.percent * 100 / BUFFER_PRELOAD_THRESHOLD;
				preloader.setProgress(percent, this.id);
			}
			this.buffer(_onBufferFinish.bind(this), _onBufferProgress.bind(this));
		}

		/*
   * This method handles the buffering progress and state
   * @param callback {Function} Function to be called when 
   * @param progressCallback {Function}
   */
	}, {
		key: 'buffer',
		value: function buffer(callback, progressCallback) {
			function _onLoadProgress(e) {
				if (typeof progressCallback === 'function') progressCallback(e);

				if (e.percent > BUFFER_PRELOAD_THRESHOLD) {
					this.player.removeEvent('loadProgress');
					if (typeof callback === 'function') callback();
				}
			}
			this.player.addEvent('loadProgress', _onLoadProgress.bind(this));
		}

		/*
   * This methods returns elapsed time
   */
	}, {
		key: 'getTime',
		value: function getTime() {
			return this.elapsed;
		}

		/*
   * This method moves playhead to specified value.
   * @param value {Number} Value where the playhead must go in seconds
   */
	}, {
		key: 'setTime',
		value: function setTime(value) {
			this.player.api('pause');
			this.player.api('seekTo', value);
			this.elapsed = value;
			this.isReady = false;

			this.buffer((function () {
				console.log("READY TO PLAY AGAIN");
			}).bind(this));
		}
	}]);

	return VideoItem;
})();

exports['default'] = VideoItem;
module.exports = exports['default'];

},{"./utils":5}]},{},[2])