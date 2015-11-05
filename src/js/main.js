'use strict';

require('vimeo-froogaloop');
require('./rAF');
let Video = require('./videoitem');
let Preloader = require('./preloader');
let Overlay = require('./overlay');

let preloader = new Preloader('preloader','status',init);
let videoRight = new Video('video-wrapper-right',preloader);
let videoLeft = new Video('video-wrapper-left',preloader);
let overlay = new Overlay('overlay','message');
let container = document.getElementById('container');

let isDown = false;
let syncing = false;
let hasStarted = false;
let pointerOffset = 0;

function init(){		
	moveTo(50);
	document.getElementById('container').className = "fadein";
}

function play(){
	videoLeft.play();
	videoRight.play();
	overlay.hideMessage();
	hasStarted = true;
}

let prevTimes = {'video1':0,'video2':0};
setInterval(function(){
	videoLeft.update();
	videoRight.update();

},250);

function syncVideos(){
	let targetTime = Math.min(videoLeft.elapsed,videoRight.elapsed);
	
	// videoLeft.setTime(targetTime);
	// videoRight.setTime(targetTime);
	// syncing = false;
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
	// This is used to move the overlay keeping the offset mouse position and preventing a quick jump when mousemove event is fired.
	pointerOffset = 100 * event.pageX / window.innerWidth - overlay.position;
	if(!hasStarted)
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