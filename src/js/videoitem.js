'use strict'

const BUFFER_THRESHOLD =  0.030;

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
	
	play(){
		this.player.api('play');
	};

	setVolume(value){
		this.player.api('setVolume',value);
	};

	setWidth(value){
		this.wrapper.style.width = value;
	}

	preload(callback){
		let self = this;
		// This forces players to start buffer
		this.player.addEvent('play',function(){
			self.player.api('pause');
			self.player.seekTo(0);
			self.player.removeEvent('play');
		});
		this.player.api('play');

		// This hold preloader 'til videos have enough loaded buffer to play in sync
		this.player.addEvent('loadProgress',function(e){
			if(e.percent > BUFFER_THRESHOLD)
			{
				self.isReady = true;
				self.player.removeEvent('loadProgress');
				callback(self);
			}	
		});
	}
}

module.exports = VideoItem;