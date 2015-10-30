'use strict';

class Overlay {
	/*
	 * @param {String} ID of div where overlay elements are
	 * @param {String} ID of div where all messages are gona be
	 */
	constructor(overlayID,messageID)
	{
		this.element = document.getElementById(overlayID);
		this.message = document.getElementById(messageID);
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
	 *  This method just hides the message div
	 */
	hideMessage(){
		this.message.className = 'fadeout';
	}
	/*
	 * This methods just shows previous hidded message div
	 */
	showMessage(){
		this.message.className = '';
	}
	/*
	 * @param {String} Message to show on message div
	 */
	setMessage(msg){
		this.message.innerHTML = msg;
	}
}

module.exports = Overlay;