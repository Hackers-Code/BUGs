'use strict';
const ClientInstructions = require( './ClientInstructionSet' );
const Types = require( './Types' ).Attributes;
module.exports = ( buffer, type ) =>
{
	if( Buffer.isBuffer( buffer ) === false || buffer.length === 0 )
	{
		return false;
	}
	let instruction = ClientInstructions[ buffer[ 0 ] ];

	if( typeof instruction === 'undefined' )
	{
		throw new Error( 0xe0 );
	}
	if( type !== instruction.socket )
	{
		return false;
	}

	let object = {};
	let keys = Object.keys( instruction.params );
	let offset = 1;
	let errorFlag = false;
	keys.forEach( ( element ) =>
	{
		let rule = instruction.params[ element ];
		if( rule.type === Types.buffer )
		{
			let result = parseBuffer( rule, buffer, offset );
			offset += result.readBytes;
			object[ element ] = result.value;
		}
		else
		{
			errorFlag = true;
		}
	} );
	if( offset <= buffer.length && errorFlag === false )
	{
		return {
			instruction,
			object,
			offset
		};
	}
	return false;
};

function parseBuffer( rule, buffer, offset )
{
	if( typeof rule.length === 'undefined' )
	{
		return false;
	}
	if( buffer.length < offset + rule.length )
	{
		return false;
	}
	let result = {};
	result.value = buffer.slice( offset, offset + rule.length );
	result.readBytes = rule.length;
	return result;
}
