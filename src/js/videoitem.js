'use strict';

const BUFFER_PRELOAD_THRESHOLD =  0.075; // Vimeo's doesn't haves a way to know how much buffer is needed to start the reproduction. Hence the force values. Keep in mind this value is different for each video.
let utils = require('./utils');

class VideoItem
{
	/*
	 * @param {String} ID of div element that holds Vimeo's iframe
	 * @param {Class} Preloader class to handle video loading process
	 */
	constructor(id,preloader)
	{
		this.wrapper = document.getElementById(id);
		this.id = this.wrapper.getAttribute("data-id");
		this.iframe = this.wrapper.getElementsByTagName('iframe')[0];
		this.player = $f(this.iframe);
		this.player.addEvent('ready',_onReady);
		this.isReady = false;

		let self = this;
		// This is called when vimeo player is ready
		function _onReady(item){
			self.player.removeEvent('ready');
			self.player.api('setLoop',true);
			self.preload(preloader);
		}
	}
	/*
	 * A simple method to call play to Vimeo's player
	 */
	play(){
		this.player.api('play');
	};

	/*
	 * @param {Number} Volume value for video normalized (from 0 to 1)
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
	preload(preloader){
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
			if(!self.isReady)
			{
				
				let percent = e.percent * 100 / BUFFER_PRELOAD_THRESHOLD;
				preloader.setProgress(percent,self.id);	

				if(e.percent > BUFFER_PRELOAD_THRESHOLD)
					self.isReady = true;
			}
			console.log(e);
		});
	}
}

module.exports = VideoItem;