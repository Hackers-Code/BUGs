'use strict';
const ServerInstructions = require( './ServerInstructionSet' );
module.exports = ( object ) =>
{
	if( typeof object.opcode !== 'number' )
	{
		return false;
	}

	let instruction = ServerInstructions[ object.opcode ];

	if( typeof instruction === 'undefined' )
	{
		return false;
	}

	let buffer = Buffer.alloc( 1 );
	buffer.writeUInt8( object.opcode );

	let requiredProperties = Object.keys( instruction.params );
	for( let i = 0 ; i < requiredProperties.length ; i++ )
	{
		let requiredProperty = requiredProperties[ i ];
		console.log( requiredProperty );
		console.log( object );
		let result = parseParam( instruction.params[ requiredProperty ], object[ requiredProperty ] );
		if( result === false )
		{
			return false;
		}
		else
		{
			buffer = Buffer.concat( [
				buffer,
				result
			] );
		}
	}
	return buffer;
};

function parseParam( rule, value )
{
	if( typeof value === 'undefined' )
	{
		return false;
	}
	if( typeof rule.metadata !== 'undefined' )
	{
		let metadata = rule.metadata;
		if( typeof metadata.length !== 'undefined' )
		{
			let length = metadata.length;
			if( typeof value !== 'string' )
			{
				return false;
			}
			if( length === 1 )
			{
				if( value.length > 255 )
				{
					return false;
				}
				let buffer = Buffer.alloc( length + value.length );
				buffer.writeUInt8( value.length );
				buffer.write( value, 1 );
				return buffer;
			}
			else
			{
				return false;
			}
		}
	}
}
