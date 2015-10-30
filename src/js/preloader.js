'user strict';

class Preloader 
{
	constructor(id,infoID)
	{
		this.element = document.getElementById(id);
		this.status = document.getElementById(infoID);
		this.setProgress(0);
	}

	fadeout(){
		this.element.className = "fadeout";
	}

	setProgress(percent){
		this.status.innerText = percent + "%";
	}

}

module.exports = Preloader;