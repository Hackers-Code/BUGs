'use strict';
const ServerInstructions = require( './ServerInstructions' );
class PacketEncoder {
	constructor()
	{
		this.instructions = ServerInstructions;
	}

	encode( object )
	{
		console.log( object );
		if( typeof object.opcode !== 'number' )
		{
			return false;
		}

		let instruction = this.instructions[ object.opcode ];

		if( typeof instruction === 'undefined' )
		{
			return false;
		}

		let buffer = Buffer.alloc( 1 );
		buffer.writeUInt8( object.opcode );

		let keys = Object.keys( instruction.params );
		for( let i = 0 ; i < keys.length ; i++ )
		{
			let value = instruction.params[ keys[ i ] ];
			if( Buffer.isBuffer( object[ keys[ i ] ] ) )
			{
				let expectedLength = 0;
				if( typeof value === 'number' )
				{
					expectedLength = value;
				}
				else if( typeof value === 'string' )
				{
					expectedLength = object[ value ].readUInt8( 0 );
				}
				if( object[ keys[ i ] ].length !== expectedLength )
				{
					return false;
				}
				buffer = Buffer.concat( [
					buffer,
					object[ keys[ i ] ]
				] );
			}
			else if( object[ keys[ i ] ] instanceof Array )
			{
				if( typeof value === 'object' && object[ keys[ i ] ].length === object[ "count" ].readUInt32BE( 0 ) )
				{
					for( let j = 0 ; j < object[ keys[ i ] ].length ; j++ )
					{
						let subKeys = Object.keys( value );
						for( let k = 0 ; k < subKeys.length ; k++ )
						{
							if( typeof value[ subKeys[ k ] ] === 'number' )
							{
								if( object[ keys[ i ] ][ j ][ subKeys[ k ] ].length !== value[ subKeys[ k ] ] )
								{
									return false;
								}
								buffer = Buffer.concat( [
									buffer,
									object[ keys[ i ] ][ j ][ subKeys[ k ] ]
								] );
							}
							else
							{
								return false;
							}
						}
					}
				}
				else
				{
					return false;
				}
			}
			else
			{
				return false;
			}
		}
		return buffer;
	}
}
module.exports = PacketEncoder;
