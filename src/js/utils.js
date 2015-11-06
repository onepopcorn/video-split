'use strict';

function limitNormalizedValue(value)
{
	if (value < 0){
		value = 0;
	} else if(value > 1){
		value = 1;
	}
	return value;
}

module.exports = {
	limitNormalizedValue:limitNormalizedValue
}

// export default class Utils 
// {
// 	constructor(){}
// 	static limitNormalizedValue(value)
// 	{
// 		if (value < 0){
// 			value = 0;
// 		} else if(value > 1){
// 			value = 1;
// 		}
// 		return value;
// 	}

// 	static testFunc()
// 	{
// 		console.log("testFunc");
// 	}
// }

// module.exports = Utils;