'user strict';

// Private properties 
let video1 = Symbol(); 
let video2 = Symbol();

class Preloader 
{
	/*
     * @param {String} ID of div element that wraps all preloader elements
     * @param {String} ID of div where percentage info will be shown
     * @param {Function} Function to call when everything is ready to play
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
	 * Method that updates loading progress percentage. 
	 * NOTE: Because it's based on Vimeo's buffer (this value changes for each video) it's not precise, hence the forced 100% value... Sorry about that.
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