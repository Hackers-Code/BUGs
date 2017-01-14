'use strict';
const SearchEngine = {
	findByUniqueID : function( array, id )
	{
		if( !(id instanceof Buffer) )
		{
			return false;
		}
		for( let i = 0 ; i < array.length ; i++ )
		{
			if( id.compare( array[ i ].id ) === 0 )
			{
				return i;
			}
		}
		return -1;
	}
};
module.exports = SearchEngine;
