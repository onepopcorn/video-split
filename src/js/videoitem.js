'use strict';

const BUFFER_LOADED_THRESHOLD =  10 // Seconds - Vimeo's doesn't haves a way to know how much buffer is needed to start the reproduction. Hence the forced values.
const BUFFER_ENTER_THRESHOLD = 2;
const BUFFER_DIFF_THRESHOLD = 0; // Threshold difference between elapsed time & previous time to consider it's buffering
let normalize = require('./utils').normalize;
let percent = require('./utils').percent;

const STATE = {
	'UNLOADED' :'unloaded',
	'LOADED'   :'loaded',
	'BUFFERING':'buffering',
	'PAUSED'   :'paused',
	'STOPPED'  :'stopped',
	'PLAYING'  :'playing',
	'SEEKING'  :'seeking',
	'FINISHED' :'finished'
}

let bufferInitEvent;
let bufferEndEvent;
let videoFinishEvent;


export default class VideoItem
{
	/*
	 * @param id {String} ID of div element that holds Vimeo's iframe
	 * @param preloader {Class} Preloader class to handle video loading process
	 */
	constructor(id,preloader)
	{
		this.wrapper = document.getElementById(id);
		this.id = this.wrapper.getAttribute("data-id");
		this.iframe = this.wrapper.getElementsByTagName('iframe')[0];
		this.player = $f(this.iframe);
		this.player.addEvent('ready',_onReady.bind(this));
		this.state = STATE.UNLOADED;
		this.elapsed = 0;

		// EVENTS
		bufferInitEvent = new CustomEvent('buffering',{detail:{id:this.id},bubbles:true,cancelable:true});
		bufferEndEvent = new CustomEvent('bufferEnd',{detail:{id:this.id},bubbles:true,cancelable:true});
		videoFinishEvent = new CustomEvent('finish',{detail:{id:this.id},bubbles:true,cancelable:true});

		
		// PRIVATE METHODS
		// This is called when vimeo player is ready
		function _onReady(item){
			this.player.removeEvent('ready');
			this.player.addEvent('playProgress',_onPlayback.bind(this));
			this.player.addEvent('loadProgress',_onPreload.bind(this));
			this.player.addEvent('finish',_onFinish.bind(this));
			this.player.api('setLoop',true);
			
			// Force initial buffering for video preload
			this.player.api('play');
			this.player.api('seekTo',0);
			this.player.api('pause');
		}

		function _onPlayback(e){
			if(this.state === STATE.UNLOADED)
			{
				this.player.api('pause');
				this.player.api('seekTo',0);
				this.state = STATE.LOADED;
			}

			this.elapsed = e.seconds;
		}

		function _onLoadProgress(e){
			let bufferLength = e.seconds - this.elapsed;

			if(this.state === STATE.BUFFERING)
			{
				if(bufferLength > BUFFER_LOADED_THRESHOLD)
				{
					this.state = STATE.PAUSED;
					this.wrapper.dispatchEvent(bufferEndEvent);
				}
				// Buffer progress when state is buffering
				console.log(this.id,bufferLength);

			} else if(bufferLength <= BUFFER_ENTER_THRESHOLD) {
				this.player.api('pause');
				this.state = STATE.BUFFERING;
				this.wrapper.dispatchEvent(bufferInitEvent);
			}
		}

		function _onPreload(e){
			let percentLoaded = percent(e.seconds,BUFFER_LOADED_THRESHOLD);
			if(percentLoaded >= 100){
				preloader.setProgress(100,this.id);
				this.player.removeEvent('loadProgress',_onPreload);
				this.player.addEvent('loadProgress',_onLoadProgress.bind(this));
				this.state = STATE.STOPPED;
			} else {
				preloader.setProgress(percentLoaded,this.id);
			}
		}

		function _onFinish(e){
			this.state = STATE.FINISHED;
			this.wrapper.dispatchEvent(videoFinishEvent);
		}
	}
	/*
	 * A simple method to call play to Vimeo's player and update video item state
	 */
	play(){
		this.player.api('play');
		this.state = STATE.PLAYING;
	}
	/*
	 * Method to pause reproduction and update video item state
	 */
	pause(){
		this.player.api('pause');
		this.state = STATE.PAUSED;
	}
	/*
	 * Attach an event to the video item
	 * @param name {String} Event name to be attached
	 * @param callback {Function} Callback to call when event is fired
	 */
	addEventListener(name,callback){
		this.wrapper.addEventListener(name,callback);
	}
	/*
	 * Remove previously attached events
	 * @param name {String} Event name
	 * @param callback {Funciton} Callback attached previously
	 */ 
	removeEventListener(name,callback)
	{
		this.wrapper.removeEventListener(name,callback);
	}
	/*
	 * @param value {Number} Volume value for video normalized (from 0 to 1)
	 */
	setVolume(value){
		this.player.api('setVolume',normalize(value / 100));
	}
	/*
	 * @param value {String} Method to set the iframe width value. Value must be suplied with units in a String format (for instance "40px" pr "40%")
	 */
	setWidth(value){
		this.wrapper.style.width = value;
	}
	/*
	 * This methods returns elapsed time
	 */
	getTime(){
		return this.elapsed;
	}
	/*
	 * This method moves playhead to specified value.
	 * @param value {Number} Value where the playhead must go in seconds
	 */
	seek(value){
		this.player.api('seekTo',value);
	}
}