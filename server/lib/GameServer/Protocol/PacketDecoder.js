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
	let opcode = buffer[ 0 ];
	let instruction = ClientInstructions[ opcode ];
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
	for( let i = 0 ; i < keys.length ; i++ )
	{
		let key = keys[ i ];
		let rule = instruction.params[ key ];
		let result;
		if( rule.type === Types.buffer )
		{
			result = parseBuffer( rule, buffer, offset );
		}
		else if( rule.type === Types.string )
		{
			result = parseString( rule, buffer, offset );
		}
		else if( rule.type === Types.unsigned )
		{
			result = parseUnsigned( rule, buffer, offset );
		}
		else if( rule.type === Types.signed )
		{
			result = parseSigned( rule, buffer, offset );
		}
		else
		{
			return false;
		}
		if( result === false )
		{
			return false;
		}
		offset += result.readBytes;
		object[ key ] = result.value;
	}
	if( offset <= buffer.length )
	{
		return {
			opcode,
			instruction,
			object,
			offset
		};
	}
	else
	{
		return false;
	}
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
	let result = {};
	if( length === 1 )
	{
		result.value = buffer.readUInt8( offset );
	}
	else if( length === 2 )
	{
		result.value = buffer.readUInt16BE( offset );
	}
	else if( length === 4 )
	{
		result.value = buffer.readUInt32BE( offset );
	}
	else
	{
		return false;
	}
	result.readBytes = length;
	return result;
}

function parseSigned( rule, buffer, offset )
{
	if( typeof rule.length === 'undefined' || rule.encoding === Encodings.le )
	{
		return false;
	}
	let length = rule.length;
	let result = {};
	if( length === 2 )
	{
		result.value = buffer.readInt16BE( offset );
	}
	else
	{
		return false;
	}
	result.readBytes = length;
	return result;
}
