'use strict'

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
		this.player.addEvent('ready',callback);
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
}

module.exports = VideoItem;