'use strict';
class Collection {
	constructor( array, property )
	{
		this.collectionArrayName = array;
		this.collectionProperty = property;
	}
}

class UniqueKeyCollection extends Collection {
	find( key )
	{
		let array = this[ this.collectionArrayName ];
		let property = this.collectionProperty;
		if( Buffer.isBuffer( key ) === false )
		{
			return -1;
		}
		for( let i = 0 ; i < array.length ; i++ )
		{
			if( Buffer.compare( id, array[ i ][ property ] ) === 0 )
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
		let array = this[ this.collectionArrayName ];
		let property = this.collectionProperty;
		for( let i = 0 ; i < array.length ; i++ )
		{
			if( id === array[ i ][ property ] )
			{
				return i;
			}
		}
		return -1;
	}
}

module.exports.UniqueKeyCollection = UniqueKeyCollection;
module.exports.NumericIdCollection = NumericIdCollection;
