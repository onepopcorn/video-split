'use strict';

const BUFFER_PRELOAD_THRESHOLD =  10/*0.075;*/ // Vimeo's doesn't haves a way to know how much buffer is needed to start the reproduction. Hence the force values. Keep in mind this value is different for each video.
const BUFFER_DIFF_THRESHOLD = 0; // Threshold difference between elapsed time & previous time to consider it's buffering
let normalize = require('./utils').normalize;
let lastElapsedTime = Symbol();

const STATE = {
	'BUFFERING':'buffering',
	'PAUSED':'paused',
	'STOPPED':'stopped',
	'PLAYING':'playing'
}

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
		this.isReady = false;
		this.state = STATE.STOPPED;
		this.elapsed = 0;
		this['lastElapsedTime'] = 0;

		// This is called when vimeo player is ready
		function _onReady(item){
			this.player.removeEvent('ready');
			this.player.api('setLoop',true);
			this.preload(preloader);
			this.player.addEvent('playProgress',_onPlayback.bind(this));
		}

		function _onPlayback(e){
			this.elapsed = e.seconds;
		}
	}
	/*
	 * A simple method to call play to Vimeo's player
	 */
	play(){
		this.player.api('play');
		this.state = STATE.PLAYING;
	}
	/*
	 * Method to pause reproduction
	 */
	pause(){
		this.player.api('pause');
		this.state = STATE.PAUSED;
	}
	/*
	 * Method to update the video state check. 
	 */
	update(){	
		if(this.elapsed - this['lastElapsedTime'] > BUFFER_DIFF_THRESHOLD)
		{
			this.state = STATE.PLAYING;
			this.isReady = true;
		} else if(this.state !== STATE.PAUSED && this.state !== STATE.STOPPED){
			this.state = STATE.BUFFERING;
			this.isReady = false;
		}

		this['lastElapsedTime'] = this.elapsed;
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
	 * @param preloader {Class} Method to force Vimeo's videos to buffer before activate user interaction. This is to start videos in sync as much as possible
	 */
	preload(preloader){
		// This forces players to start buffering
		function _onPlayProgress(){
			this.player.api('pause');
			this.player.api('seekTo',0);
			this.player.removeEvent('play');
		}
		this.player.addEvent('play',_onPlayProgress.bind(this));
		this.player.api('play');

		// This hold preloader 'til videos have enough loaded buffer to play in sync
		function _onBufferFinish(){
			this.isReady = true;
		}

		function _onBufferProgress(e){
			let percent = e.seconds * 100 / BUFFER_PRELOAD_THRESHOLD;
			preloader.setProgress(percent,this.id);
		}
		this.buffer(_onBufferFinish.bind(this),_onBufferProgress.bind(this));
	}
	/*
	 * This method handles the buffering progress and state
	 * @param callback {Function} Function to be called when 
	 * @param progressCallback {Function}
	 */
	buffer(callback,progressCallback){

		function _onLoadProgress(e){
			// for preloading
			if(typeof progressCallback === 'function')
				progressCallback(e);

			console.log("buffered",e.seconds - this.elapsed);
			if(e.seconds >  BUFFER_PRELOAD_THRESHOLD - this.elapsed)
			{
				// this.player.removeEvent('loadProgress');
				if(typeof callback === 'function')
					callback();
			}
		}
		this.player.addEvent('loadProgress',_onLoadProgress.bind(this));
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
	setTime(value){
		this.player.api('seekTo',value);
		this.elapsed = value;
	}
	/*
	 * This method is used to buffer enough video before trying to resync both videos.
	 * @param time {Number} Value where the playhead must go in seconds
	 * @param callback {Function} Callback function to call when video is ready to play again
	 */
	resync(time,callback){
		this.pause();
		this.setTime(time);

		this.buffer(function(){
			this.isReady = true;
			callback();
		}.bind(this));

	}
}