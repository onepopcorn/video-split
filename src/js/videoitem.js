'use strict';

const BUFFER_THRESHOLD =  0.030;
let utils = require('./utils');

class VideoItem
{
	/* 
	 * @param {String} ID of div element that holds Vimeo's iframe
	 * @param {Function} Callback to call when Vimeo's player is ready
	 */
	constructor(id,callback)
	{
		this.id = id;
		this.wrapper = document.getElementById(id);
		this.iframe = this.wrapper.getElementsByTagName('iframe')[0];
		this.player = $f(this.iframe);
		this.player.addEvent('ready',_callback);
		this.callback = callback;
		this.isReady = false;

		let self = this;
		function _callback(item){
			self.player.removeEvent('ready');
			self.callback(item);
		}
	}
	/*
	 * A simple method to call play to Vimeo's player
	 */
	play(){
		this.player.api('play');
	};

	/*
	 * @param {Number} Volume value for video normalize to 0 (from 0 to 1)
	 */
	setVolume(value){
		this.player.api('setVolume',utils.limitNormalizedValue(value / 100));
	};

	/*
	 * @param {String} Method to set the iframe width value. Value must be suplied with units in a String format (for instance "40px" pr "40%")
	 */
	setWidth(value){
		this.wrapper.style.width = value;
	}
	/*
	 * @param {Function} Method to force Vimeo's videos to buffer before activate user interaction. This is to start videos in sync as much as possible
	 */
	preload(callback){
		let self = this;
		// This forces players to start buffer
		this.player.addEvent('play',function(){
			self.player.api('pause');
			self.player.api('seekTo',0);
			self.player.removeEvent('play');
		});
		this.player.api('play');

		// This hold preloader 'til videos have enough loaded buffer to play in sync
		this.player.addEvent('loadProgress',function(e){
			// console.log(e);
			if(e.percent > BUFFER_THRESHOLD && !self.isReady)
			{
				self.isReady = true;
				// self.player.removeEvent('loadProgress');
				callback(self);
			}	
		});
	}
}

module.exports = VideoItem;