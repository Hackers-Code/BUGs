'use strict';
const ClientInstructions = require( './ClientInstructionSet' );
const Types = require( './Types' ).Attributes;
const Encodings = require( './Types' ).Encoding;
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
		else if( rule.type === Types.string )
		{
			let result = parseString( rule, buffer, offset );
			offset += result.readBytes;
			object[ element ] = result.value;
		}
		else if( rule.type === Types.unsigned )
		{
			let result = parseUnsigned( rule, buffer, offset );
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

function parseString( rule, buffer, offset )
{
	if( typeof rule.metadata === 'undefined' || typeof rule.metadata.length === 'undefined' )
	{
		return false;
	}
	let length = buffer.readUInt8( offset );
	if( buffer.length < offset + length + 1 )
	{
		return false;
	}
	let result = {};
	result.value = buffer.slice( offset + 1, offset + length + 1 ).toString();
	result.readBytes = length + 1;
	return result;
}

function parseUnsigned( rule, buffer, offset )
{
	if( typeof rule.length === 'undefined' || rule.encoding === Encodings.le )
	{
		return false;
	}
	let length = rule.length;
	if( length === 2 )
	{
		let result = {};
		result.value = buffer.readUInt16BE( offset );
		result.readBytes = 2;
		return result;
	}
	return false;
}

function parseSigned( rule, buffer, offset )
{
	if( typeof rule.length === 'undefined' || rule.encoding === Encodings.le )
	{
		return false;
	}
	let length = rule.length;
	if( length === 2 )
	{
		let result = {};
		result.value = buffer.readInt16BE( offset );
		result.readBytes = 2;
		return result;
	}
	return false;
}
