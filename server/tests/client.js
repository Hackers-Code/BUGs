const net = require( 'net' );

const client = net.createConnection( { port : 31337, host : '185.84.136.151' }, () =>
{
	console.log( 'connected to server!' );
	console.log( String.fromCharCode( 3, 0x44, 0xf0, 0x72, 0x24 ) + '12345678901234567890' );
	client.write( String.fromCharCode( 3, 0x44, 0xf0, 0x72, 0x24 ) + '12345678901234567890' );
} );

client.on( 'data', ( data ) =>
{
	console.log( data );
} );
client.on( 'end', () =>
{
	console.log( 'disconnected from server' );
} );