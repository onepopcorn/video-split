/*
 * This code is licensed under GPL. For more details look LICENSE.txt
 */

'user strict';

// Private properties 

let targets = {video1:0,video2:0};

export default class Preloader 
{
	/*
     * @param id {String} ID of div element that wraps all preloader elements
     * @param infoID {String} ID of div where percentage info will be shown
     * @param startCallback {Function} Function to call when everything is ready to play
	 */
	constructor(id,startCallback)
	{
		this.element = document.getElementById(id);
		this.callback = startCallback;
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
		targets[target] = percent;
		let value = Math.floor((targets['video1'] + targets['video2']) * 0.5);
		this.element.innerHTML = value + "%";

		if(value >= 100){
			this.callback();
			this.fadeout();
			this.element.innerHTML = 100 + "%";
		}

	}

}