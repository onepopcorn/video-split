'use strict';

class Overlay {
	constructor(overlayID,messageID)
	{
		this.element = document.getElementById(overlayID);
		this.message = document.getElementById(messageID);
		this.position = 0;
	}

	setPosition(value){
		this.position = value;
		this.element.style.left = value + "%";
	}

	hideMessage(){
		this.message.className = 'fadeout';
	}

	showMessage(){
		this.message.className = '';
	}

	setMessage(msg){
		this.message.innerHTML = msg;
	}
}

module.exports = Overlay;