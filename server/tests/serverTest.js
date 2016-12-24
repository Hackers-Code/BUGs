'use strict';
const chai = require( 'chai' );
const expect = chai.expect;

describe( 'TCP Server', function()
{
	it( 'server should respond for 0x01 in correct format', function( done )
	{
		let client = require( 'net' ).createConnection( 31337, '185.84.136.151' );
		client.write( '014142434445464748494A00000000000000000000', 'hex' );
		client.on( 'data', ( data ) =>
		{
			if( /^\x02(\x00|\x01)$/.test( data.toString() ) )
			{
				done();
			}
			else
			{
				done( new Error() );
			}
		} );
	} );
	it( 'server should respond for 0x10 in correct format', function( done )
	{
		let client = require( 'net' ).createConnection( 31337, '185.84.136.151' );
		client.write( '10', 'hex' );
		client.on( 'data', ( data ) =>
		{
			let count = data.readInt32BE( 1 );
			let regexp = new RegExp( `^\x11.{4}(.{24}){${count}}$` );
			if( regexp.test( data.toString() ) )
			{
				done();
			}
			else
			{
				done( new Error() );
			}
		} );
	} );
} );

describe( 'UDP Server', function()
{
	it( 'server should respond for 0x01 in correct format', function( done )
	{
		let client = require( 'dgram' ).createSocket( 'udp4' );
		client.bind( 31337 );
		client.send( Buffer.from( '01', 'hex' ), 31337, '185.84.136.151' );
		client.on( 'message', ( data ) =>
		{
			console.log( data );
			done();
		} );
	} );
} );
