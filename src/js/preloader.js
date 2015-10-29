'user strict';

class Preloader 
{
	constructor(id)
	{
		this.element = document.getElementById(id);
	}

	fadeout(){
		this.element.className = "fadeout";
	}

	setMessage(msg){
		this.element.innerHTML = msg;
	}

}

module.exports = Preloader;