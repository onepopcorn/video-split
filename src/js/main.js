'use strict';

require('vimeo-froogaloop');
let Video = require('./videoitem');

let container = document.getElementsByTagName('body')[0];
let overlay = document.getElementById('overlay');
let preloader = document.getElementById('preloader');

let readyCount = 0;
let isDown = false;

let videoRight = new Video('video-wrapper-right',ready);
let videoLeft = new Video('video-wrapper-left',ready);

function init(){
		
	moveTo(50);
	play();
	document.getElementById('container').className = "fadein";
	preloader.className = "fadeout";
}

function play(){
	videoRight.play();
	videoLeft.play();
}

function ready(itm){
	console.log(itm + " ready");
	
	readyCount++;
	if(readyCount == 2)
		init();
}

function moveTo(percent)
{
	videoLeft.setWidth(percent + "%");
	overlay.style.left = percent + "%";

	videoLeft.setVolume(percent/100);
	videoRight.setVolume(1 - percent/100);
}

overlay.addEventListener('mousedown',function(){
	isDown = true
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

