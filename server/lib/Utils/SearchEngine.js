'use strict';
const SearchEngine = {
	findByUniqueID : ( id, array ) =>
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
	},
	findByNumericId : ( id, array ) =>
	{
		for( let i = 0 ; i < array.length ; i++ )
		{
			if( id === array[ i ].id )
			{
				return i;
			}
		}
		return -1;
	}
};
module.exports = SearchEngine;
