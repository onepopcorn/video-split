'user strict';

// Private properties 
let video1 = Symbol(); 
let video2 = Symbol();

class Preloader 
{
	/*
     * @param id {String} ID of div element that wraps all preloader elements
     * @param infoID {String} ID of div where percentage info will be shown
     * @param startCallback {Function} Function to call when everything is ready to play
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
	 * Method that updates loading progress percentage. Percentage is divided by 2 because there's 2 videos.
	 * NOTE: Because it's based on Vimeo's buffer (this value changes for each video) it's not precise, hence the forced 100% value... Sorry about that.
	 * @param percent {Number} Value that represents percent of buffered against max buffer value (See note above)
	 * @param target {String} ID of video item calling this method.
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