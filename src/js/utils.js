/*
 * This code is licensed under GPL. For more details look LICENSE.txt
 */

'use strict';

function normalize(value)
{
	return Math.min(1,Math.max(0,value))
}

function percent(value,total)
{
	return value * 100 / total;
}


module.exports = {
	normalize:normalize,
	percent:percent
}