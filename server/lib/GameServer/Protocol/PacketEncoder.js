'use strict';
const ServerInstructions = require( './ServerInstructionSet' );
const Types = require( './Types' ).Attributes;
const Errors = [];
module.exports = ( object, type ) =>
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
	if( type !== instruction.socket )
	{
		return false;
	}
	let buffer = Buffer.alloc( 1 );
	buffer.writeUInt8( object.opcode, 0 );
	let result = parseParams( instruction.params, object );
	return result === false ? false : Buffer.concat( [
		buffer,
		result
	] );
};

module.exports.getLastError = () =>
{
	return Errors.length > 0 ? Errors[ Errors.length - 1 ] : `No errors yer`;
};

function parseParams( rules, values )
{
	let requiredProperties = Object.keys( rules );
	let buffer = Buffer.alloc( 0 );
	for( let i = 0 ; i < requiredProperties.length ; i++ )
	{
		let requiredProperty = requiredProperties[ i ];
		let result = parseParam( rules[ requiredProperty ], values[ requiredProperty ] );
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
}

function parseParam( rule, value )
{
	if( typeof value === 'undefined' )
	{
		Errors.push( `Value to parse is undefined` );
		return false;
	}
	if( rule.type === Types.boolean )
	{
		return Buffer.from( [ !!value ] );
	}
	else if( rule.type === Types.unsigned )
	{
		return parseUnsigned( rule, value );
	}
	else if( rule.type === Types.signed )
	{
		return parseSigned( rule, value );
	}
	else if( rule.type === Types.string )
	{
		return parseString( rule, value );
	}
	else if( rule.type === Types.buffer )
	{
		return parseBuffer( rule, value );
	}
	else if( rule.type === Types.array )
	{
		return parseArray( rule, value );
	}
	Errors.push( `Rule has unknown or unsupported type` );
	return false;
}

function parseUnsigned( rule, value )
{
	if( typeof rule.length === 'undefined' || typeof value !== 'number' )
	{
		Errors.push( `[UNSIGNED] Required number size not set or value is not number` );
		return false;
	}
	let length = rule.length;
	let buffer = Buffer.alloc( length );
	if( length === 1 )
	{
		buffer.writeUInt8( value, 0 );
	}
	else if( length === 2 )
	{
		buffer.writeUInt16BE( value, 0 );
	}
	else if( length === 4 )
	{
		buffer.writeUInt32BE( value, 0 );
	}
	else
	{
		Errors.push( `[UNSIGNED] Only 1,2,4 bytes integers are supported` );
		return false;
	}
	return buffer;
}

function parseSigned( rule, value )
{
	if( typeof rule.length === 'undefined' || typeof value !== 'number' )
	{
		Errors.push( `[SIGNED] Required number size not set or value is not number` );
		return false;
	}
	let length = rule.length;
	let buffer = Buffer.alloc( length );
	if( length === 1 )
	{
		buffer.writeInt8( value, 0 );
	}
	else if( length === 2 )
	{
		buffer.writeInt16BE( value, 0 );
	}
	else if( length === 4 )
	{
		buffer.writeInt32BE( value, 0 );
	}
	else
	{
		Errors.push( `[SIGNED] Only 1,2,4 bytes integers are supported` );
		return false;
	}
	return buffer;
}

function parseString( rule, value )
{
	if( typeof rule.metadata === 'undefined' || typeof rule.metadata.length === 'undefined' || typeof value !== 'string' )
	{
		Errors.push( `[STRING] Required string length not set or value is not string` );
		return false;
	}
	let length = rule.metadata.length;
	if( length === 1 )
	{
		if( value.length > 255 )
		{
			Errors.push( `[STRING] String length does not match length field` );
			return false;
		}
		let buffer = Buffer.alloc( length + value.length );
		buffer.writeUInt8( value.length, 0 );
		buffer.write( value, 1 );
		return buffer;
	}
	Errors.push( `[STRING] Only 1 byte string length is supported` );
	return false;
}

function parseBuffer( rule, value )
{
	if( typeof rule.length === 'undefined' || Buffer.isBuffer( value ) === false || value.length !== rule.length )
	{
		Errors.push( `[BUFFER] Required length not set or value is not buffer with correct size` );
		return false;
	}
	return value;
}

function parseArray( rule, value )
{
	if( typeof rule.metadata === 'undefined' || typeof rule.metadata.size === 'undefined' || typeof rule.item !== 'object' || value instanceof Array === false )
	{
		Errors.push( `[ARRAY] Rule is broken or value is not an array` );
		return false;
	}
	let size = rule.metadata.size;
	if( size === 4 )
	{
		if( value.length > Math.pow( 2, 32 ) )
		{
			Errors.push( `[ARRAY] Maximum array size is 2^32` );
			return false;
		}
		let buffer = Buffer.alloc( 4 );
		buffer.writeUInt32BE( value.length, 0 );
		let subBuffers = [];
		subBuffers.push( buffer );
		for( let i = 0 ; i < value.length ; i++ )
		{
			let result = parseParams( rule.item, value[ i ] );
			if( result === false )
			{
				Errors.push( `[ARRAY] Could not parse single param` );
				return false;
			}
			subBuffers.push( result );
		}
		return Buffer.concat( subBuffers );
	}
	Errors.push( `[ARRAY] Only 4 bytes size array are supported` );
	return false;
}
