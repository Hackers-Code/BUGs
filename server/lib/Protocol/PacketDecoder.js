'use strict';
class PacketDecoder {
	constructor( instructions )
	{
		this.instructions = instructions;
	}

	decode( buffer )
	{
		if( buffer instanceof Buffer && buffer.length !== 0 )
		{
			let instruction = this.instructions[ buffer[ 0 ] ];
			if( typeof instruction !== 'undefined' )
			{
				let object = {};
				let keys = Object.keys( instruction.params );
				let offset = 1;
				keys.forEach( ( element ) =>
				{
					let value = instruction.params[ element ];
					if( typeof value === 'number' )
					{
						object[ element ] = buffer.slice( offset, offset += instruction.params[ element ] );
					}
					else if( typeof value === 'string' )
					{
						object[ element ] = buffer.slice( offset, offset += object[ value ].readUInt8( 0 ) );
					}
				} );
				if( offset <= buffer.length )
				{
					return {
						object,
						offset
					};
				}
			}
			else
			{
				throw new Error( 0xe0 );
			}
		}
		return false;
	}
}
module.exports = PacketDecoder;
