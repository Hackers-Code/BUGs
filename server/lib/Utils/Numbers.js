'use strict';
const Numbers = {
	isUInt32 : function( variable )
	{
		return typeof variable === 'number' && variable >= 0 && variable < 4294967296;
	}
};

module.exports = Numbers;
