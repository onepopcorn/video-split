(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";var Froogaloop=function(){function t(n){return new t.fn.init(n)}function n(t,n,e){if(!e.contentWindow.postMessage)return!1;var r=e.getAttribute("src").split("?")[0],i=JSON.stringify({method:t,value:n});"//"===r.substr(0,2)&&(r=window.location.protocol+r),e.contentWindow.postMessage(i,r)}function e(t){var n,e;try{n=JSON.parse(t.data),e=n.event||n.method}catch(r){}if("ready"!=e||s||(s=!0),t.origin!=d)return!1;var o=n.value,l=n.data,u=""===u?null:n.player_id,a=i(e,u),c=[];return a?(void 0!==o&&c.push(o),l&&c.push(l),u&&c.push(u),c.length>0?a.apply(null,c):a.call()):!1}function r(t,n,e){e?(a[e]||(a[e]={}),a[e][t]=n):a[t]=n}function i(t,n){return n?a[n][t]:a[t]}function o(t,n){if(n&&a[n]){if(!a[n][t])return!1;a[n][t]=null}else{if(!a[t])return!1;a[t]=null}return!0}function l(t){"//"===t.substr(0,2)&&(t=window.location.protocol+t);for(var n=t.split("/"),e="",r=0,i=n.length;i>r&&3>r;r++)e+=n[r],2>r&&(e+="/");return e}function u(t){return!!(t&&t.constructor&&t.call&&t.apply)}var a={},s=!1,d=(Array.prototype.slice,"");return t.fn=t.prototype={element:null,init:function(t){return"string"==typeof t&&(t=document.getElementById(t)),this.element=t,d=l(this.element.getAttribute("src")),this},api:function(t,e){if(!this.element||!t)return!1;var i=this,o=i.element,l=""!==o.id?o.id:null,a=u(e)?null:e,s=u(e)?e:null;return s&&r(t,s,l),n(t,a,o),i},addEvent:function(t,e){if(!this.element)return!1;var i=this,o=i.element,l=""!==o.id?o.id:null;return r(t,e,l),"ready"!=t?n("addEventListener",t,o):"ready"==t&&s&&e.call(null,l),i},removeEvent:function(t){if(!this.element)return!1;var e=this,r=e.element,i=""!==r.id?r.id:null,l=o(t,i);"ready"!=t&&l&&n("removeEventListener",t,r)}},t.fn.init.prototype=t.fn,window.addEventListener?window.addEventListener("message",e,!1):window.attachEvent("onmessage",e),window.Froogaloop=window.$f=t}();


},{}],2:[function(require,module,exports){
"use strict";function init(){moveTo(50),document.getElementById("container").className="fadein",preloader.fadeout()}function play(){videoRight.play(),videoLeft.play(),overlay.hideMessage()}function loaded(e){readyCount++,loadedPercent+=25,preloader.setProgress(loadedPercent),2==readyCount&&buffer()}function buffer(e){videoRight.preload(onBufferReady),videoLeft.preload(onBufferReady)}function onBufferReady(e){loadedPercent+=25,preloader.setProgress(loadedPercent),videoRight.isReady&&videoLeft.isReady&&init()}function moveTo(e){videoLeft.setWidth(e+"%"),overlay.setPosition(e),videoLeft.setVolume(e+pointerOffset),videoRight.setVolume(100-e+pointerOffset)}function onmousemove(e){if(isDown){var o=100*e.pageX/window.innerWidth;moveTo(o-pointerOffset)}}require("vimeo-froogaloop");var Video=require("./videoitem"),Preloader=require("./preloader"),Overlay=require("./overlay"),preloader=new Preloader("preloader","status"),videoRight=new Video("video-wrapper-right",loaded),videoLeft=new Video("video-wrapper-left",loaded),overlay=new Overlay("overlay","message"),container=document.getElementById("container"),readyCount=0,isDown=!1,isPlaying=!1,pointerOffset=0,loadedPercent=0;overlay.element.addEventListener("mousedown",function(e){isDown=!0,pointerOffset=100*e.pageX/window.innerWidth-overlay.position,isPlaying||play()}),overlay.element.addEventListener("mouseup",function(){isDown=!1}),container.addEventListener("mousemove",onmousemove);


},{"./overlay":3,"./preloader":4,"./videoitem":6,"vimeo-froogaloop":1}],3:[function(require,module,exports){
"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var s=0;s<t.length;s++){var n=t[s];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,s,n){return s&&e(t.prototype,s),n&&e(t,n),t}}(),Overlay=function(){function e(t,s){_classCallCheck(this,e),this.element=document.getElementById(t),this.message=document.getElementById(s),this.position=0}return _createClass(e,[{key:"setPosition",value:function(e){this.position=e,this.element.style.left=e+"%"}},{key:"hideMessage",value:function(){this.message.className="fadeout"}},{key:"showMessage",value:function(){this.message.className=""}},{key:"setMessage",value:function(e){this.message.innerHTML=e}}]),e}();module.exports=Overlay;


},{}],4:[function(require,module,exports){
"use strict";"user strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),Preloader=function(){function e(t,n){_classCallCheck(this,e),this.element=document.getElementById(t),this.status=document.getElementById(n),this.setProgress(0)}return _createClass(e,[{key:"fadeout",value:function(){this.element.className="fadeout"}},{key:"setProgress",value:function(e){this.status.innerText=e+"%"}}]),e}();module.exports=Preloader;


},{}],5:[function(require,module,exports){
"use strict";function _classCallCheck(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,n){for(var t=0;t<n.length;t++){var r=n[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(n,t,r){return t&&e(n.prototype,t),r&&e(n,r),n}}(),Utils=function(){function e(){_classCallCheck(this,e)}return _createClass(e,null,[{key:"limitNormalizedValue",value:function(e){return 0>e?e=0:e>1&&(e=1),e}}]),e}();module.exports=Utils;


},{}],6:[function(require,module,exports){
"use strict";function _classCallCheck(e,a){if(!(e instanceof a))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,a){for(var t=0;t<a.length;t++){var i=a[t];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(a,t,i){return t&&e(a.prototype,t),i&&e(a,i),a}}(),BUFFER_THRESHOLD=.03,utils=require("./utils"),VideoItem=function(){function e(a,t){function i(e){r.player.removeEvent("ready"),r.callback(e),r.player.addEvent("finish",function(){console.log("video finished")})}_classCallCheck(this,e),this.id=a,this.wrapper=document.getElementById(a),this.iframe=this.wrapper.getElementsByTagName("iframe")[0],this.player=$f(this.iframe),this.player.addEvent("ready",i),this.callback=t,this.isReady=!1;var r=this}return _createClass(e,[{key:"play",value:function(){this.player.api("play")}},{key:"setVolume",value:function(e){this.player.api("setVolume",utils.limitNormalizedValue(e/100))}},{key:"setWidth",value:function(e){this.wrapper.style.width=e}},{key:"preload",value:function(e){var a=this;this.player.addEvent("play",function(){a.player.api("pause"),a.player.api("seekTo",0),a.player.removeEvent("play")}),this.player.api("play"),this.player.addEvent("loadProgress",function(t){t.percent>BUFFER_THRESHOLD&&!a.isReady&&(a.isReady=!0,e(a))})}}]),e}();module.exports=VideoItem;


},{"./utils":5}]},{},[2])