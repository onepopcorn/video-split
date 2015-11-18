'use strict';

export default class Overlay {
	/*
	 * @param {String} ID of div where overlay elements are
	 * @param {String} ID of div where all messages are gona be
	 */
	constructor(overlayID)
	{
		this.element  = document.getElementById(overlayID);
		this.arrows   = document.getElementsByClassName('arrow');
		this.position = 0;
	}
	/*
	 * @param {Number} Percent where split indicator must be
	 */
	setPosition(value){
		this.position = value;
		this.element.style.left = value + "%";
	}
	/*
	 * Show arrows around separator bar
	 */
	showArrows(){
		this.arrows[0].className = this.arrows[0].className + " show";
		this.arrows[1].className = this.arrows[1].className + " show";
	}
	/*
	 * Hide arrows around separator bar
	 */
	hideArrows(){
		this.arrows[0].className = this.arrows[0].className.split(' show').join("");
		this.arrows[1].className = this.arrows[1].className.split(' show').join("");
	}
}