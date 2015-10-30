'user strict';

// Private properties 
let video1 = Symbol(); 
let video2 = Symbol();

class Preloader 
{
	/*
     * @param {String} ID of div element that wraps all preloader elements
     * @param {String} ID of div where percentage info will be shown
	 */
	constructor(id,infoID,startCallback)
	{
		this.element = document.getElementById(id);
		this.status = document.getElementById(infoID);
		this.callback = startCallback;

		this['video1'] = 0;
		this['video2'] = 0;
	}
	/*
	 * Method that hides the whole preloader
	 */
	fadeout(){
		this.element.className = "fadeout";
	}
	/*
	 * Method that updates loading progress percentage
	 */
	setProgress(percent,target){
		this[target] = percent;
		let value = Math.floor((this['video1'] + this['video2']) * 0.5);
		this.status.innerHTML = value + "%";

		if(value >= 100){
			this.callback();
			this.fadeout();
			this.status.innerHTML = 100 + "%";
		}

	}

}

module.exports = Preloader;