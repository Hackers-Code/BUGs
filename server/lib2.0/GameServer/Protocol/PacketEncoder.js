'use strict';
const ServerInstructions = require( './ServerInstructionSet' );
const Types = require( './Types' ).Attributes;
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
	buffer.writeUInt8( object.opcode, 0 );

	let requiredProperties = Object.keys( instruction.params );
	for( let i = 0 ; i < requiredProperties.length ; i++ )
	{
		let requiredProperty = requiredProperties[ i ];
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
	if( rule.type === Types.string )
	{
		return parseString( rule, value );
	}
	if( rule.type === Types.buffer )
	{
		return parseBuffer( rule, value );
	}
	return false;
}

function parseString( rule, value )
{
	if( typeof rule.metadata === 'undefined' || typeof rule.metadata.length === 'undefined' || value !== 'string' )
	{
		return false;
	}
	let length = rule.metadata.length;
	if( length === 1 )
	{
		if( value.length > 255 )
		{
			return false;
		}
		let buffer = Buffer.alloc( length + value.length );
		buffer.writeUInt8( value.length, 0 );
		buffer.write( value, 1 );
		return buffer;
	}
	return false;
}

function parseBuffer( rule, value )
{
	if( typeof rule.length === 'undefined' || Buffer.isBuffer( value ) === false || value.length !== rule.length )
	{
		return false;
	}
	return value;
}
