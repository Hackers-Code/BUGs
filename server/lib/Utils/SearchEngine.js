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
			if( id == array[ i ].id )
			{
				return i;
			}
		}
		return -1;
	},
	findByRinfo : ( rinfo, array ) =>
	{
		for( let i = 0 ; i < array.length ; i++ )
		{
			if( rinfo.port === array[ i ].rinfo.port && rinfo.address === array[ i ].rinfo.address )
			{
				return i;
			}
		}
		return -1;
	}
};
module.exports = SearchEngine;
