'use strict';
class Collection {
	constructor()
	{
		this.items = [];
	}
}

class UniqueKeyCollection extends Collection {
	find( key )
	{
		if( Buffer.isBuffer( key ) === false )
		{
			return -1;
		}
		for( let i = 0 ; i < this.items.length ; i++ )
		{
			if( Buffer.compare( id, this.items[ i ].getUniqueKey() ) === 0 )
			{
				return i;
			}
		}
		return -1;
	}
}

class NumericIdCollection extends Collection {
	find( id )
	{
		for( let i = 0 ; i < this.items.length ; i++ )
		{
			if( id === this.items[ i ].id )
			{
				return i;
			}
		}
		return -1;
	}
}

module.exports.UniqueKeyCollection = UniqueKeyCollection;
module.exports.NumericIdCollection = NumericIdCollection;
