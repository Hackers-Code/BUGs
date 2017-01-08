'use strict';
const dgram = require( 'dgram' );
const net = require( 'net' );
const tcp = net.connect( 31337, '185.84.136.151' );
tcp.on( 'data', ( data ) =>
{
	console.log( data );
	let c = dgram.createSocket( 'udp4' );
	c.on( 'message', ( msg, rinfo ) =>
	{
		console.log( msg );
		console.log( rinfo );
	} );
	c.on( 'listening', () =>
	{
		console.log( c.address() );
		let buffer = Buffer.concat( [
			Buffer.from( [ 0x06 ] ),
			data.slice( 1, 5 )
		] );
		console.log( buffer );
		c.send( buffer, 31337, '185.84.136.151' );
	} );
	c.bind();
} );
