'use strict';

// NOTE: Some graphics card with Chrome's hardware accelerated graphics gets poor quality. More info here: https://vimeo.com/forums/topic:109071

import Froogaloop from 'vimeo-froogaloop';
import Video from './videoitem';
import Preloader from './preloader';
import Overlay from './overlay';

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
	overlay.hideMessage();
	hasStarted = true;

	videoLeft.addEventListener('buffering',resync);
	videoRight.addEventListener('buffering',resync);
	videoLeft.addEventListener('finish',loop);
	videoRight.addEventListener('finish',loop);

	videoLeft.play();
	videoRight.play();
}

function loop(e)
{
	videoLeft.player.api('paused');
	videoRight.player.api('paused');

	videoLeft.seek(0);
	videoRight.seek(0);

	videoRight.play();
	videoLeft.play();
}

function resync(e)
{
	// Pausing videos
	videoLeft.player.api('paused');
	videoRight.player.api('paused');
	
	// Get lower elapsed time
	let lower = Math.min(videoLeft.elapsed,videoRight.elapsed);

	videoLeft.seek(lower);
	videoRight.seek(lower);

	videoLeft.play();
	videoRight.play();
	// videoLeft.addEventListener('bufferEnd',bufferEndHandler);
	// videoRight.addEventListener('bufferEnd',bufferEndHandler);
}

function bufferEndHandler(e){
	if(videoLeft.state === 'paused' && videoRight.state === 'paused')
	{		
		console.log("playing resynced videos");
		
		videoLeft.addEventListener('bufferEnd',bufferEndHandler);
		videoRight.addEventListener('bufferEnd',bufferEndHandler);
		
		videoLeft.play();
		videoRight.play();
	}
}

function moveTo(percent)
{
	videoLeft.setWidth(percent + "%");
	overlay.setPosition(percent);

	videoLeft.setVolume(percent + pointerOffset);
	videoRight.setVolume(100 - percent + pointerOffset);
}


overlay.element.addEventListener('mousedown',function(event){
	event.stopPropagation();
	event.preventDefault();

	isDown = true
	// This is used to move the overlay keeping the offset mouse position and preventing a quick jump when mousemove event is fired.
	pointerOffset = 100 * event.pageX / window.innerWidth - overlay.position;
	if(!hasStarted)
		play();
});

overlay.element.addEventListener('mouseup',function(event){
	event.stopPropagation();
	event.preventDefault();
	isDown = false;
});

function onmousemove (event){
	event.stopPropagation();
	event.preventDefault();

	if(isDown)
	{
		let percent = 100 * event.pageX / window.innerWidth;	
		moveTo(percent - pointerOffset);
	}
}
container.addEventListener('mousemove',onmousemove);

window.onblur = function(){
	videoLeft.pause();
	videoRight.pause();
}

window.onfocus = function(){
	resync();
}