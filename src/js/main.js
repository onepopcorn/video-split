'use strict';

require('vimeo-froogaloop');
let Video = require('./videoitem');
let Preloader = require('./preloader');
let Overlay = require('./overlay');

let preloader = new Preloader('preloader','status',init);
let videoRight = new Video('video-wrapper-right',preloader);
let videoLeft = new Video('video-wrapper-left',preloader);
let overlay = new Overlay('overlay','message');

let container = document.getElementById('container');

let isDown = false;
let isPlaying = false;
let pointerOffset = 0;

function init(){		
	moveTo(50);
	document.getElementById('container').className = "fadein";
}

function play(){
	videoRight.play();
	videoLeft.play();
	overlay.hideMessage();
}

function onBufferReady(target)
{
	if(videoRight.isReady && videoLeft.isReady)
		init();
}

function moveTo(percent)
{
	videoLeft.setWidth(percent + "%");
	overlay.setPosition(percent);

	videoLeft.setVolume(percent + pointerOffset);
	videoRight.setVolume(100 - percent + pointerOffset);
}


overlay.element.addEventListener('mousedown',function(event){
	isDown = true
	// This is used to move the soverlay keeping the offset mouse position and preventing a quick jump when mousemove.
	pointerOffset = 100 * event.pageX / window.innerWidth - overlay.position;
	if(!isPlaying)
		play();
});

overlay.element.addEventListener('mouseup',function(){
	isDown = false;
});

function onmousemove (event){
	if(isDown)
	{
		let percent = 100 * event.pageX / window.innerWidth;	
		moveTo(percent - pointerOffset);
	}
}
container.addEventListener('mousemove',onmousemove);