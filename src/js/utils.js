'use strict';

function normalize(value)
{
	return Math.min(1,Math.max(0,value))
}

module.exports = {
	normalize:normalize
}