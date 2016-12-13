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
		} while( !this.keyExists( key ) );
		this.generatedKeys.push( key );
		return key;
	}

	keyExists( key )
	{
		for( let i = 0 ; i < this.generatedKeys.length ; i++ )
		{
			if( this.generatedKeys[ i ].compare( key ) === 0 )
			{
				return false;
			}
		}
		return true;
	}
}

module.exports = UniqueKeyGenerator;
