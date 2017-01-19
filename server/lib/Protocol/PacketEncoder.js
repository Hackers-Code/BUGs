'use strict';
class PacketEncoder {
	constructor( instructions )
	{
		this.instructions = instructions;
	}

	encode( object )
	{
		if( typeof object.opcode === 'number' )
		{
			let instruction = this.instructions[ object.opcode ];
			if( typeof instruction !== 'undefined' )
			{
				let buffer = Buffer.alloc( 1 );
				buffer.writeUInt8( object.opcode );
				let keys = Object.keys( instruction.params );
				keys.forEach( ( element ) =>
				{
					let value = instruction.params[ element ];
					if( Buffer.isBuffer( object[ element ] ) )
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
						if( object[ element ].length !== expectedLength )
						{
							throw new Error( 0xe2 );
						}
						buffer = Buffer.concat( [
							buffer,
							object[ element ]
						] );
					}
					else if( object[ element ] instanceof Array )
					{
						if( typeof value === 'object' && object[ element ].length === object[ "count" ].readUInt32BE(
								0 ) )
						{
							for( let i = 0 ; i < object[ element ].length ; i++ )
							{
								let keys = Object.keys( value );
								keys.forEach( ( el ) =>
								{
									if( typeof value[ el ] === 'number' )
									{
										if( object[ element ][ i ][ el ].length !== value[ el ] )
										{
											throw new Error( 0xe2 );
										}
										buffer = Buffer.concat( [
											buffer,
											object[ element ][ i ][ el ]
										] );
									}
									else
									{
										throw new Error( 0xe2 );
									}
								} );
							}
						}
						else
						{
							throw new Error( 0xe2 );
						}
					}
					else
					{
						throw new Error( 0xe2 );
					}
				} );
				return buffer;
			}
			else
			{
				throw new Error( 0xe2 );
			}
		}
		throw new Error( 0xe2 );
	}
}
module.exports = PacketEncoder;
