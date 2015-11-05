'use strict';

const BUFFER_PRELOAD_THRESHOLD =  0.075; // Vimeo's doesn't haves a way to know how much buffer is needed to start the reproduction. Hence the force values. Keep in mind this value is different for each video.
let utils = require('./utils');
let lastElapsedTime = 0;

let STATE = {
	'BUFFERING':-2,
	'STOPPED':-1,
	'PAUSED':0,
	'PLAYING':1
}

class VideoItem
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
		this.isBuffering = false;
		this.state = null;
		this.elapsed = 0;

		// This is called when vimeo player is ready
		function _onReady(item){
			this.player.removeEvent('ready');
			this.player.api('setLoop',true);
			this.preload(preloader);
			this.player.addEvent('playProgress',_onPlayback.bind(this));
		}

		function _onPlayback(e){
			this.elapsed = e.seconds;
			// console.log(this.id,e.seconds);
		}
	}
	/*
	 * A simple method to call play to Vimeo's player
	 */
	play(){
		this.player.api('play');
	}
	/*
	 * Method to update the video state check. 
	 */
	update(){
		if(this.elapsed - lastElapsedTime !== 0 && this.state !== STATE.PLAYING)
			this.state = STATE.PLAYING;
		else if(this.state !== STATE.BUFFERING && !== STATE.PAUSED && !== STATE.STOPPED) {
			this.state = STATE.BUFFERING;
		}

		console.log(this.id,this.elapsed - lastElapsedTime, this.state);
		lastElapsedTime = this.elapsed;
	}
	/*
	 * @param value {Number} Volume value for video normalized (from 0 to 1)
	 */
	setVolume(value){
		this.player.api('setVolume',utils.limitNormalizedValue(value / 100));
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
			let percent = e.percent * 100 / BUFFER_PRELOAD_THRESHOLD;
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
			if(typeof progressCallback === 'function')
				progressCallback(e);

			if(e.percent > BUFFER_PRELOAD_THRESHOLD)
			{
				this.player.removeEvent('loadProgress');
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
		this.player.api('pause');
		this.player.api('seekTo',value);
		this.elapsed = value;
		this.isReady = false;

		this.buffer(function(){
			console.log("READY TO PLAY AGAIN");
		}.bind(this));
	}
}

module.exports = VideoItem;