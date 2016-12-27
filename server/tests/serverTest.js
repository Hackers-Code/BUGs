'use strict';
const chai = require( 'chai' );

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
			client.close();
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
			client.close();
		} );
	} );
	it( 'server should respond for 0x20 in correct format', function( done )
	{
		let client = require( 'net' ).createConnection( 31337, '185.84.136.151' );
		client.write( '2041414141414141414141414141414141414141410141', 'hex' );
		client.on( 'data', ( data ) =>
		{
			let regexp = new RegExp( `^\x21(\x00|\x01)$` );
			if( regexp.test( data.toString() ) )
			{
				done();
			}
			else
			{
				done( new Error() );
			}
			client.close();
		} );
	} );
	it( 'server should respond for 0x22 in correct format', function( done )
	{
		let client = require( 'net' ).createConnection( 31337, '185.84.136.151' );
		client.write( '2200ff00ff00ff00ff', 'hex' );
		client.on( 'data', ( data ) =>
		{
			let regexp = new RegExp( `^\x23(\x00|\x01)$` );
			if( regexp.test( data.toString() ) )
			{
				done();
			}
			else
			{
				done( new Error() );
			}
			client.close();
		} );
	} );
	it( 'server should respond for 0x24 in correct format', function( done )
	{
		let client = require( 'net' ).createConnection( 31337, '185.84.136.151' );
		client.write( '240000000102', 'hex' );
		client.on( 'data', ( data ) =>
		{
			let regexp = new RegExp( `^\x25(\x00|\x01)$` );
			if( regexp.test( data.toString() ) )
			{
				done();
			}
			else
			{
				done( new Error() );
			}
			client.close();
		} );
	} );
	it( 'server should respond for 0x26 in correct format', function( done )
	{
		let client = require( 'net' ).createConnection( 31337, '185.84.136.151' );
		client.write( '26b2b2b2b20141', 'hex' );
		client.on( 'data', ( data ) =>
		{
			let regexp = new RegExp( `^\x27(\x00|\x01)$` );
			if( regexp.test( data.toString() ) )
			{
				done();
			}
			else
			{
				done( new Error() );
			}
			client.close();
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
		client.on( 'message', () =>
		{
			done();
		} );
	} );
} );
