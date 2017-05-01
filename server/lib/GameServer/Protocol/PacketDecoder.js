'use strict';
const ClientInstructions = require( './ClientInstructionSet' );
const Types = require( './Types' ).Attributes;
const Encodings = require( './Types' ).Encoding;
const Errors = [];
function getErrors()
{
	return Errors.join( "\n" );
}
module.exports = ( buffer, type ) =>
{
	if( Buffer.isBuffer( buffer ) === false || buffer.length === 0 )
	{
		return {
			success : false,
			error : `Buffer is not valid buffer or has 0 length`,
			result : null
		};
	}
	let opcode = buffer[ 0 ];
	let instruction = ClientInstructions[ opcode ];
	if( typeof instruction === 'undefined' )
	{
		return {
			success : false,
			error : `0xe0`,
			result : null
		};
	}
	if( type !== instruction.socket )
	{
		return {
			success : false,
			error : `Invalid socket type for: ${opcode}`,
			result : null
		};
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
			return {
				success : false,
				error : `Unknown rule type`,
				result : null
			};
		}
		if( result === false )
		{
			return {
				success : false,
				error : getErrors(),
				result : null
			};
		}
		offset += result.readBytes;
		object[ key ] = result.value;
	}
	if( offset <= buffer.length )
	{
		return {
			success : true,
			error : null,
			result : {
				opcode,
				instruction,
				object,
				offset
			}
		};
	}
	else
	{
		return {
			success : false,
			error : `Message too short`,
			result : null
		};
	}
};

function parseBuffer( rule, buffer, offset )
{
	if( typeof rule.length === 'undefined' )
	{
		Errors.push( `Undefined length of data` );
		return false;
	}
	if( buffer.length < offset + rule.length )
	{
		Errors.push( `Buffer too short to read data` );
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
		Errors.push( `[STRING] Invalid metadata` );
		return false;
	}
	let length = buffer.readUInt8( offset );
	if( buffer.length < offset + length + 1 )
	{
		Errors.push( `[STRING] Buffer too short to read data` );
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
		Errors.push( `[UNSIGNED] Invalid metadata` );
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
		Errors.push( `[UNSIGNED] Not supported uint size` );
		return false;
	}
	result.readBytes = length;
	return result;
}

function parseSigned( rule, buffer, offset )
{
	if( typeof rule.length === 'undefined' || rule.encoding === Encodings.le )
	{
		Errors.push( `[SIGNED] Invalid metadata` );
		return false;
	}
	let length = rule.length;
	let result = {};
	if( length === 1 )
	{
		result.value = buffer.readInt8( offset );
	}
	if( length === 2 )
	{
		result.value = buffer.readInt16BE( offset );
	}
	if( length === 4 )
	{
		result.value = buffer.readInt32BE( offset );
	}
	else
	{
		Errors.push( `[SIGNED] Not supported int size` );
		return false;
	}
	result.readBytes = length;
	return result;
}
