/*
 * This code is licensed under GPL. For more details look LICENSE.txt
 */

'use strict';

import Froogaloop from 'vimeo-froogaloop';
import TWEEN from 'tween.js';
import Video from './videoitem';
import Preloader from './preloader';
import Overlay from './overlay';
import raf from 'raf';

let preloader = new Preloader('preloader',init);
let videoRight = new Video('video-wrapper-right',preloader);
let videoLeft = new Video('video-wrapper-left',preloader);
let overlay = new Overlay('overlay');
let container = document.getElementById('container');

let isDown = false;
let syncing = false;
let hasStarted = false;
let pointerOffset = 0;

const texts = ['It\'s amazing the difference','a bit of sky can make.','- Shel Silverstein -'] 

function init(){

	let tween4 = new TWEEN.Tween({percent:100})
				 .to({percent:50},2500)
				 .delay(1000)
				 .easing(TWEEN.Easing.Cubic.InOut)
				 .onUpdate(moveTo)
				 .onStart(function(){
				 	videoLeft.setText("");
				 	videoRight.setText("");
				 })
				 .onComplete(function(){
				 	overlay.showArrows();
				 	document.getElementById('container').className = "fadein";
				 	videoLeft.setText('drag the arrows');
				 	videoRight.setText('drag the arrows');
				 	setInteractivity();
				 });

	let tween3 = new TWEEN.Tween({percent:0})
				 .to({percent:100},2500)
				 .easing(TWEEN.Easing.Cubic.InOut)
				 .onUpdate(moveTo)
				 .chain(tween4);

	let tween2 = new TWEEN.Tween({percent:100})
				 .to({percent:0},2500)
				 .easing(TWEEN.Easing.Cubic.InOut)
				 .onUpdate(moveTo)
				 .chain(tween3)
				 .onComplete(function(){
				 	videoLeft.setText(texts[2]);
				 });

	let tween1 = new TWEEN.Tween({percent:0})
				 .to({percent:100},2500)
				 .easing(TWEEN.Easing.Cubic.InOut)
				 .onUpdate(moveTo)
				 .chain(tween2)
				 .onStart(function(){
				 	videoLeft.setText(texts[0]);
				 })
				 .onComplete(function(){
				 	videoRight.setText(texts[1]);
				 })
				 .start();

}

function render(){
	TWEEN.update();
	raf(render);
}
raf(render);

function setInteractivity(){
	container.addEventListener('mousemove',onmousemove);
	overlay.element.addEventListener('mouseup',onmouseup);
	overlay.element.addEventListener('mousedown',onmousedown);
	window.onblur = onblurCallback;
	window.onfocus = onfocusCallback;
}

function play(){
	hasStarted = true;

	videoLeft.hideText();
	videoRight.hideText();

	videoLeft.addEventListener('buffering',onBuffer);
	videoRight.addEventListener('buffering',onBuffer);
	videoLeft.addEventListener('finish',loop);
	videoRight.addEventListener('finish',loop);

	videoLeft.play();
	videoRight.play();
}

function loop(e){
	videoLeft.player.api('paused');
	videoRight.player.api('paused');

	videoLeft.seek(0);
	videoRight.seek(0);

	videoRight.play();
	videoLeft.play();
}

function resync(e){
	// Pausing videos
	videoLeft.player.api('paused');
	videoRight.player.api('paused');
	
	// Get lower elapsed time
	let lower = Math.min(videoLeft.elapsed,videoRight.elapsed);

	videoLeft.seek(lower);
	videoRight.seek(lower);
}

function onBuffer(e){}

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

function moveTo(){
	videoLeft.setWidth(this.percent + "%");
	overlay.setPosition(this.percent);

	videoLeft.setVolume(this.percent + pointerOffset);
	videoRight.setVolume(100 - this.percent + pointerOffset);
}

function onmousedown(event){
	event.stopPropagation();
	event.preventDefault();

	isDown = true
	/* 
	 * This is used to move the overlay keeping the offset mouse position and
	 * preventing a quick jump when mousemove event is fired.
	 */
	pointerOffset = 100 * event.pageX / window.innerWidth - overlay.position;
	if(!hasStarted)
		play();
}


function onmouseup(event){
	event.stopPropagation();
	event.preventDefault();
	isDown = false;
}

function onmousemove (event){
	event.stopPropagation();
	event.preventDefault();

	if(isDown)
	{
		this.percent = (100 * event.pageX / window.innerWidth) - pointerOffset;	
		moveTo.call(this);
	}
}

function onblurCallback(){
	videoLeft.pause();
	videoRight.pause();
	resync()
}

function onfocusCallback(){
	videoLeft.play();
	videoRight.play();
}