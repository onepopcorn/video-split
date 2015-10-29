'use strict';

require('vimeo-froogaloop');
let Video = require('./videoitem');

let container = document.getElementsByTagName('body')[0];
let overlay = document.getElementById('overlay');
let preloader = document.getElementById('preloader');
let message = document.getElementById('message');

let readyCount = 0;
let isDown = false;
let isPlaying = false;
let pointerOffset = 0;

let videoRight = new Video('video-wrapper-right',loaded);
let videoLeft = new Video('video-wrapper-left',loaded);

function init(){		
	moveTo(50);
	document.getElementById('container').className = "fadein";
	preloader.className = "fadeout";
}

function play(){
	videoRight.play();
	videoLeft.play();
	message.className = "fadeout";
}

function loaded(itm){
	readyCount++;
	preloader.innerHTML = "Loading video " + readyCount;
	if(readyCount == 2)
		buffer();
}

function buffer(target){
	videoRight.preload(onBufferReady);
	videoLeft.preload(onBufferReady);
	
}

function onBufferReady(target)
{
	preloader.innerHTML = "Buffering videos";
	if(videoRight.isReady && videoLeft.isReady)
		init();
}

function moveTo(percent)
{
	videoLeft.setWidth(percent + "%");
	overlay.style.left = percent + "%";

	videoLeft.setVolume(percent/100);
	videoRight.setVolume(1 - percent/100);
}

overlay.addEventListener('mousedown',function(event){
	isDown = true
	
	// This is used to move the soverlay keeping the offset mouse position and preventing a quick jump when mousemove.
	let overlayOffset = overlay.style.left.substr(0,overlay.style.left.length -1);
	pointerOffset = 100 * event.pageX / window.innerWidth - overlayOffset;
	
	if(!isPlaying)
		play();
});

overlay.addEventListener('mouseup',function(){
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

