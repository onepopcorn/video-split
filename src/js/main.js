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
let mouseOffset;

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
	if(readyCount == 2)
		buffer();
}

function buffer(target){
	videoRight.preload(onBufferReady);
	videoLeft.preload(onBufferReady);
	
}

function onBufferReady(target)
{
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
	mouseOffset = event.pageX;
	
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
		moveTo(percent);
	}
}
container.addEventListener('mousemove',onmousemove);

