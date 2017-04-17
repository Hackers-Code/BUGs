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
	let result = parseParams( instruction.params, object );
	if( result === false )
	{
		return false;
	}
	return Buffer.concat( [
		buffer,
		result
	] );
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
		return false;
	}
	if( rule.type === Types.boolean )
	{
		return Buffer.from( [ !!value ] );
	}
	if( rule.type === Types.unsigned )
	{
		return parseUnsigned( rule, value );
	}
	if( rule.type === Types.string )
	{
		return parseString( rule, value );
	}
	if( rule.type === Types.buffer )
	{
		return parseBuffer( rule, value );
	}
	if( rule.type === Types.array )
	{
		return parseArray( rule, value );
	}
	return false;
}

function parseUnsigned( rule, value )
{
	if( typeof rule.length === 'undefined' || typeof value !== 'number' )
	{
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
		return false;
	}
	return buffer;
}

function parseString( rule, value )
{
	if( typeof rule.metadata === 'undefined' || typeof rule.metadata.length === 'undefined' || typeof value !== 'string' )
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

function parseArray( rule, value )
{
	if( typeof rule.metadata === 'undefined' || typeof rule.metadata.size === 'undefined' || typeof rule.item !== 'object' || value instanceof Array === false )
	{
		return false;
	}
	let size = rule.metadata.size;
	if( size === 4 )
	{
		if( value.length > Math.pow( 2, 32 ) )
		{
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
				return false;
			}
			subBuffers.push( result );
		}
		return Buffer.concat( subBuffers );
	}
	return false;
}
