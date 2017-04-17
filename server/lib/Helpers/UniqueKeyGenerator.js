'use strict';
class UniqueKeyGenerator {
	constructor( length )
	{
		this.keyLength = length;
		this.generatedKeys = [];
	}

	generateKey()
	{
		let key = Buffer.alloc( this.keyLength );
		do {
			for( let i = 0 ; i < this.keyLength ; i++ )
			{
				key[ i ] = Math.floor( Math.random() * 256 );
			}
		} while( this.keyExists( key ) );
		this.generatedKeys.push( key );
		return key;
	}

	freeKey( key )
	{
		for( let i = 0 ; i < this.generatedKeys.length ; i++ )
		{
			if( key.compare( this.generatedKeys[ i ] ) === 0 )
			{
				this.generatedKeys.splice( i, 1 );
				break;
			}
		}
	}

	keyExists( key )
	{
		for( let i = 0 ; i < this.generatedKeys.length ; i++ )
		{
			if( key.compare( this.generatedKeys[ i ] ) === 0 )
			{
				return true;
			}
		}
		return false;
	}
}
module.exports = UniqueKeyGenerator;
